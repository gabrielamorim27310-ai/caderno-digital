/* ═══════════════════════════════════════════════════════════
   enviar-resumo.js — Recebe resumos enviados pelos alunos
   Guarda no Supabase (tabela e bucket privados "envios") para
   depois serem revisados e incorporados ao resumo da página.
   Esquema em supabase/schema.sql; acesso em api/_supabase.js.

   Protocolo:
     1. { acao: 'iniciar', pagina, texto, nome, assunto, arquivos: [{ nome, tamanho }] }
        cria o envio com status "enviando" e devolve uma URL de upload
        por arquivo; o navegador manda cada arquivo direto ao Supabase
     2. { acao: 'concluir', id }
        confere os arquivos recebidos e muda o status para "pendente"
   ═══════════════════════════════════════════════════════════ */

import crypto from 'crypto';
import * as db from './_supabase.js';

const MAX_TEXTO = 50000;                // caracteres
const MAX_ARQUIVO = 20 * 1024 * 1024;   // bytes; o bucket também impõe esse limite
const MAX_ARQUIVOS = 10;
const LIMITE_IP_HORA = 10;              // uso em casa/4G; no 4G (CGNAT) o IP é dividido com desconhecidos
const LIMITE_DIA = 300;                 // teto geral contra enxurrada de lixo

const TIPOS = {
  pdf:  'pdf',
  docx: 'zip',
  odt:  'zip',
  txt:  'texto',
  md:   'texto',
  jpg:  'jpeg',
  jpeg: 'jpeg',
  png:  'png',
  webp: 'webp',
};

const RE_PAGINA = /^[a-z]+-\dtri(-[a-z]+)?$/;
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function limpar(s, max) {
  return String(s || '').replace(/\u0000/g, '').trim().slice(0, max);
}

function nomeSeguro(nome) {
  return nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'arquivo';
}

function conteudoConfere(buf, categoria) {
  if (categoria === 'pdf')  return buf.subarray(0, 5).toString('latin1') === '%PDF-';
  if (categoria === 'zip')  return buf[0] === 0x50 && buf[1] === 0x4b; // "PK"
  if (categoria === 'jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (categoria === 'png')  return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (categoria === 'webp') return buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP';
  return !buf.includes(0); // texto: sem bytes nulos
}

function hashIp(req) {
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  return crypto.createHash('sha256').update(process.env.SUPABASE_SECRET_KEY + ip).digest('hex').slice(0, 32);
}

async function iniciar(req, body) {
  const pagina = limpar(body.pagina, 60);
  if (!RE_PAGINA.test(pagina)) return [400, { error: 'Página inválida.' }];

  const texto = limpar(body.texto, MAX_TEXTO + 1);
  if (texto.length > MAX_TEXTO) return [400, { error: `O texto passou de ${MAX_TEXTO.toLocaleString('pt-BR')} caracteres.` }];

  const lista = Array.isArray(body.arquivos) ? body.arquivos : [];
  if (lista.length > MAX_ARQUIVOS) return [400, { error: `No máximo ${MAX_ARQUIVOS} arquivos por envio.` }];

  const arquivos = [];
  for (let i = 0; i < lista.length; i++) {
    const original = limpar(lista[i] && lista[i].nome, 120);
    const ext = (original.split('.').pop() || '').toLowerCase();
    if (!TIPOS[ext]) return [400, { error: `Formato não aceito: "${original}". Use foto (JPG, PNG, WEBP), PDF, DOCX, ODT, TXT ou MD.` }];
    const tamanho = Number(lista[i].tamanho);
    if (!(tamanho > 0)) return [400, { error: `"${original}" está vazio.` }];
    if (tamanho > MAX_ARQUIVO) return [400, { error: `"${original}" passa de 20 MB.` }];
    arquivos.push({ nome: `${String(i + 1).padStart(2, '0')}-${nomeSeguro(original)}`, original, tamanho });
  }

  if (!texto && !arquivos.length) return [400, { error: 'Cole um texto ou anexe um arquivo.' }];

  const ipHash = hashIp(req);
  const umaHora = new Date(Date.now() - 3600e3).toISOString();
  const umDia = new Date(Date.now() - 86400e3).toISOString();
  if (await db.contar('envios', `ip_hash=eq.${ipHash}&criado_em=gte.${umaHora}`) >= LIMITE_IP_HORA ||
      await db.contar('envios', `criado_em=gte.${umDia}`) >= LIMITE_DIA) {
    return [429, { error: 'Muitos envios agora. Tente de novo mais tarde.' }];
  }

  const envio = await db.inserir('envios', {
    pagina,
    texto,
    nome: limpar(body.nome, 80).replace(/[\r\n]+/g, ' '),
    assunto: limpar(body.assunto, 120).replace(/[\r\n]+/g, ' '),
    arquivos,
    ip_hash: ipHash,
  });

  const uploads = [];
  for (const a of arquivos) {
    uploads.push({ nome: a.nome, url: await db.urlDeEnvio(`${pagina}/${envio.id}/${a.nome}`) });
  }
  return [200, { ok: true, id: envio.id, uploads }];
}

async function concluir(body) {
  const id = limpar(body.id, 40);
  if (!RE_UUID.test(id)) return [400, { error: 'Envio inválido.' }];

  const [envio] = await db.selecionar('envios', `id=eq.${id}&status=eq.enviando&select=pagina,arquivos`);
  if (!envio) return [404, { error: 'Envio não encontrado.' }];

  const pasta = `${envio.pagina}/${id}`;
  const recebidos = new Map((await db.listar(pasta)).map(o => [o.name, o]));

  for (const a of envio.arquivos) {
    const obj = recebidos.get(a.nome);
    if (!obj) return [400, { error: `"${a.original}" não chegou. Tente enviar de novo.` }];
    const categoria = TIPOS[a.nome.split('.').pop()];
    if (!conteudoConfere(await db.inicio(`${pasta}/${a.nome}`), categoria)) {
      await db.remover([...recebidos.keys()].map(n => `${pasta}/${n}`));
      await db.atualizar('envios', `id=eq.${id}`, { status: 'descartado' });
      return [400, { error: `O conteúdo de "${a.original}" não confere com a extensão.` }];
    }
  }

  const feitos = await db.atualizar('envios', `id=eq.${id}&status=eq.enviando`, { status: 'pendente' });
  if (!feitos.length) return [409, { error: 'Envio já finalizado.' }];
  return [200, { ok: true }];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!db.configurado()) return res.status(500).json({ error: 'Envio de resumos ainda não configurado.' });

  const body = req.body || {};

  // Honeypot: campo invisível que só robôs preenchem. Finge sucesso.
  if (body.site) return res.status(200).json({ ok: true, id: null, uploads: [] });

  try {
    let resposta;
    if (body.acao === 'iniciar') resposta = await iniciar(req, body);
    else if (body.acao === 'concluir') resposta = await concluir(body);
    else resposta = [400, { error: 'Requisição inválida.' }];
    res.status(resposta[0]).json(resposta[1]);
  } catch (err) {
    console.error('enviar-resumo:', err.message);
    res.status(502).json({ error: 'Não foi possível salvar o envio agora. Tente de novo mais tarde.' });
  }
}
