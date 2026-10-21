#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   envios.mjs — Lê os resumos enviados pelos alunos (Supabase)
   Usado nas sessões de junção. A chave vem de SUPABASE_SECRET_KEY ou
   de um network secret do ambiente da nuvem. Não é publicado no site.

     node ferramentas/envios.mjs listar [pagina]
     node ferramentas/envios.mjs topicos [pagina]
     node ferramentas/envios.mjs baixar <pagina>
     node ferramentas/envios.mjs marcar <incorporado|descartado|pendente> <id> [id...]
     node ferramentas/envios.mjs apagar-arquivos <id> [id...]

   "baixar" grava os pendentes em envios-baixados/<pagina>/<tópico>/<id>/
   (pasta ignorada pelo git): resumo.md + anexos, e um TOPICOS.md com
   os grupos. Envios do mesmo tópico são juntados numa versão só
   (regra em ferramentas/COMO-JUNTAR.md).
   ═══════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const URL_BASE = (process.env.SUPABASE_URL || 'https://xkwbektxxmonqlpkewcq.supabase.co').replace(/\/+$/, '');
// Sem SUPABASE_SECRET_KEY, a chave vem de um "network secret" do ambiente
// da nuvem do Claude, que acrescenta os cabeçalhos apikey/Authorization.
const KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET;
const H = KEY ? { apikey: KEY, Authorization: `Bearer ${KEY}` } : {};
const RAIZ = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'envios-baixados');

async function pedir(url, opcoes = {}) {
  const r = await fetch(URL_BASE + url, { ...opcoes, headers: { ...H, ...opcoes.headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}: ${(await r.text()).slice(0, 300)}`);
  return r;
}

const caminhoUrl = c => c.split('/').map(encodeURIComponent).join('/');

// O formulário grava "Capítulo · detalhe"; o tópico é o capítulo. Envios antigos
// (assunto livre) caem no próprio texto, normalizado.
const VARIOS = 'Vários tópicos / outro';
function topico(e) {
  const t = (e.assunto || '').split(' · ')[0].trim();
  return t || VARIOS;
}
const pasta = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'outro';

function agrupar(lista) {
  const grupos = new Map();
  for (const e of lista) {
    // tópicos digitados (matérias sem página) agrupam sem diferenciar maiúsculas e acentos
    const chave = `${e.pagina} | ${pasta(topico(e))}`;
    if (!grupos.has(chave)) grupos.set(chave, { pagina: e.pagina, topico: topico(e), envios: [] });
    grupos.get(chave).envios.push(e);
  }
  // primeiro os tópicos com mais envios (são os que precisam ser juntados)
  return [...grupos.values()].sort((a, b) => b.envios.length - a.envios.length || a.pagina.localeCompare(b.pagina));
}

async function pendentes(pagina) {
  const filtro = pagina ? `&pagina=eq.${encodeURIComponent(pagina)}` : '';
  const r = await pedir(`/rest/v1/envios?status=eq.pendente${filtro}&order=criado_em.asc&select=*`);
  return r.json();
}

async function listar(pagina) {
  const lista = await pendentes(pagina);
  if (!lista.length) return console.log('Nenhum envio pendente.');
  for (const e of lista) {
    const anexos = e.arquivos.map(a => a.nome).join(', ') || 'sem anexos';
    console.log(`${e.id}  ${e.pagina}  ${e.criado_em.slice(0, 16)}  ${e.nome || 'anônimo'}  ${e.assunto || '(sem assunto)'}  [${anexos}]  ${e.texto.length} caracteres`);
  }
}

async function topicos(pagina) {
  const grupos = agrupar(await pendentes(pagina));
  if (!grupos.length) return console.log('Nenhum envio pendente.');
  for (const g of grupos) {
    const marca = g.envios.length > 1 && g.topico !== VARIOS ? `JUNTAR ${g.envios.length}` : `${g.envios.length} envio`;
    console.log(`${marca.padEnd(10)} ${g.pagina}  ${g.topico}  (${g.envios.map(e => e.nome || 'anônimo').join(', ')})`);
  }
}

async function baixar(pagina) {
  if (!pagina) throw new Error('Informe a página, ex.: historia-2tri');
  const lista = await pendentes(pagina);
  const indice = [`# Envios pendentes de ${pagina}, por tópico`, '',
    'Tópicos com 2 ou mais envios: juntar todos numa versão só (ferramentas/COMO-JUNTAR.md).', ''];
  for (const g of agrupar(lista)) {
    indice.push(`## ${g.topico}: ${g.envios.length} envio(s)${g.envios.length > 1 && g.topico !== VARIOS ? ' · JUNTAR' : ''}`);
    for (const e of g.envios) indice.push(`- ${pasta(g.topico)}/${e.id}  ${e.nome || 'anônimo'}  ${e.assunto || ''}`);
    indice.push('');
  }
  for (const e of lista) {
    const dir = path.join(RAIZ, pagina, pasta(topico(e)), e.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'resumo.md'), [
      '---',
      `id: ${e.id}`,
      `pagina: ${e.pagina}`,
      `enviado_em: ${e.criado_em}`,
      `nome: ${JSON.stringify(e.nome || 'anônimo')}`,
      `topico: ${JSON.stringify(topico(e))}`,
      `assunto: ${JSON.stringify(e.assunto)}`,
      `arquivos: ${JSON.stringify(e.arquivos.map(a => a.nome))}`,
      '---',
      '',
      e.texto || '_(sem texto; ver arquivos anexos)_',
      '',
    ].join('\n'));
    for (const a of e.arquivos) {
      const r = await pedir(`/storage/v1/object/envios/${caminhoUrl(`${e.pagina}/${e.id}/${a.nome}`)}`);
      fs.writeFileSync(path.join(dir, a.nome), Buffer.from(await r.arrayBuffer()));
    }
    console.log(dir);
  }
  if (lista.length) fs.writeFileSync(path.join(RAIZ, pagina, 'TOPICOS.md'), indice.join('\n'));
  console.log(`${lista.length} envio(s) pendente(s) baixado(s). Grupos em ${path.join(RAIZ, pagina, 'TOPICOS.md')}`);
}

async function marcar(status, ids) {
  if (!['incorporado', 'descartado', 'pendente'].includes(status) || !ids.length) {
    throw new Error('Uso: marcar <incorporado|descartado|pendente> <id> [id...]');
  }
  const r = await pedir(`/rest/v1/envios?id=in.(${ids.join(',')})`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ status }),
  });
  console.log(`${(await r.json()).length} envio(s) marcado(s) como ${status}.`);
}

// Libera espaço no bucket; o registro (texto, nome, status) continua no banco.
async function apagarArquivos(ids) {
  if (!ids.length) throw new Error('Uso: apagar-arquivos <id> [id...]');
  const r = await pedir(`/rest/v1/envios?id=in.(${ids.join(',')})&select=id,pagina,arquivos`);
  const caminhos = (await r.json()).flatMap(e => e.arquivos.map(a => `${e.pagina}/${e.id}/${a.nome}`));
  if (caminhos.length) {
    await pedir('/storage/v1/object/envios', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: caminhos }),
    });
  }
  console.log(`${caminhos.length} arquivo(s) apagado(s).`);
}

const [cmd, ...args] = process.argv.slice(2);
const comandos = {
  listar: () => listar(args[0]),
  topicos: () => topicos(args[0]),
  baixar: () => baixar(args[0]),
  marcar: () => marcar(args[0], args.slice(1)),
  'apagar-arquivos': () => apagarArquivos(args),
};

if (!comandos[cmd]) {
  console.error('Comandos: listar [pagina] | topicos [pagina] | baixar <pagina> | marcar <status> <id...> | apagar-arquivos <id...>');
  process.exit(1);
}
comandos[cmd]().catch(err => { console.error(err.message); process.exit(1); });
