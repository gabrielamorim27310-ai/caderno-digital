#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   envios.mjs — Lê os resumos enviados pelos alunos (Supabase)
   Usado nas sessões de junção. Precisa de SUPABASE_URL e
   SUPABASE_SECRET_KEY no ambiente. Não é publicado no site.

     node ferramentas/envios.mjs listar [pagina]
     node ferramentas/envios.mjs baixar <pagina>
     node ferramentas/envios.mjs marcar <incorporado|descartado|pendente> <id> [id...]
     node ferramentas/envios.mjs apagar-arquivos <id> [id...]

   "baixar" grava os pendentes em envios-baixados/<pagina>/<id>/
   (pasta ignorada pelo git): resumo.md + anexos.
   ═══════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';

const URL_BASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SECRET_KEY;
if (!URL_BASE || !KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente.');
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const RAIZ = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'envios-baixados');

async function pedir(url, opcoes = {}) {
  const r = await fetch(URL_BASE + url, { ...opcoes, headers: { ...H, ...opcoes.headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}: ${(await r.text()).slice(0, 300)}`);
  return r;
}

const caminhoUrl = c => c.split('/').map(encodeURIComponent).join('/');

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

async function baixar(pagina) {
  if (!pagina) throw new Error('Informe a página, ex.: historia-2tri');
  const lista = await pendentes(pagina);
  for (const e of lista) {
    const pasta = path.join(RAIZ, pagina, e.id);
    fs.mkdirSync(pasta, { recursive: true });
    fs.writeFileSync(path.join(pasta, 'resumo.md'), [
      '---',
      `id: ${e.id}`,
      `pagina: ${e.pagina}`,
      `enviado_em: ${e.criado_em}`,
      `nome: ${JSON.stringify(e.nome || 'anônimo')}`,
      `assunto: ${JSON.stringify(e.assunto)}`,
      `arquivos: ${JSON.stringify(e.arquivos.map(a => a.nome))}`,
      '---',
      '',
      e.texto || '_(sem texto; ver arquivos anexos)_',
      '',
    ].join('\n'));
    for (const a of e.arquivos) {
      const r = await pedir(`/storage/v1/object/envios/${caminhoUrl(`${e.pagina}/${e.id}/${a.nome}`)}`);
      fs.writeFileSync(path.join(pasta, a.nome), Buffer.from(await r.arrayBuffer()));
    }
    console.log(pasta);
  }
  console.log(`${lista.length} envio(s) pendente(s) baixado(s).`);
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
  baixar: () => baixar(args[0]),
  marcar: () => marcar(args[0], args.slice(1)),
  'apagar-arquivos': () => apagarArquivos(args),
};

if (!comandos[cmd]) {
  console.error('Comandos: listar [pagina] | baixar <pagina> | marcar <status> <id...> | apagar-arquivos <id...>');
  process.exit(1);
}
comandos[cmd]().catch(err => { console.error(err.message); process.exit(1); });
