/* ═══════════════════════════════════════════════════════════
   _supabase.js — Acesso ao Supabase pelo servidor (REST, sem SDK)
   Variáveis de ambiente (Vercel):
     SUPABASE_URL         https://<ref>.supabase.co
     SUPABASE_SECRET_KEY  chave secreta (sb_secret_…) ou service_role.
                          Ignora RLS: nunca pode ir para o navegador.
   ═══════════════════════════════════════════════════════════ */

export const BUCKET = 'envios';

export function configurado() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

function base() {
  return process.env.SUPABASE_URL.replace(/\/+$/, '');
}

function cabecalhos(extra) {
  const key = process.env.SUPABASE_SECRET_KEY;
  return Object.assign({ apikey: key, Authorization: `Bearer ${key}` }, extra);
}

function caminhoUrl(caminho) {
  return caminho.split('/').map(encodeURIComponent).join('/');
}

async function pedir(url, opcoes) {
  const r = await fetch(url, opcoes);
  if (!r.ok) {
    const corpo = await r.text();
    throw new Error(`Supabase ${r.status} ${url.replace(base(), '')}: ${corpo.slice(0, 200)}`);
  }
  return r;
}

/* ── Banco (PostgREST) ── */

export async function inserir(tabela, linha) {
  const r = await pedir(`${base()}/rest/v1/${tabela}`, {
    method: 'POST',
    headers: cabecalhos({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(linha),
  });
  return (await r.json())[0];
}

export async function selecionar(tabela, filtro) {
  const r = await pedir(`${base()}/rest/v1/${tabela}?${filtro}`, { headers: cabecalhos() });
  return r.json();
}

export async function contar(tabela, filtro) {
  const r = await pedir(`${base()}/rest/v1/${tabela}?select=id&limit=1&${filtro}`, {
    headers: cabecalhos({ Prefer: 'count=exact' }),
  });
  return Number((r.headers.get('content-range') || '').split('/')[1]) || 0;
}

export async function atualizar(tabela, filtro, campos) {
  const r = await pedir(`${base()}/rest/v1/${tabela}?${filtro}`, {
    method: 'PATCH',
    headers: cabecalhos({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(campos),
  });
  return r.json();
}

export async function apagar(tabela, filtro) {
  await pedir(`${base()}/rest/v1/${tabela}?${filtro}`, { method: 'DELETE', headers: cabecalhos() });
}

/* ── Storage ── */

// URL para o navegador enviar o arquivo direto ao Supabase (vale 2 h, não sobrescreve).
export async function urlDeEnvio(caminho) {
  const r = await pedir(`${base()}/storage/v1/object/upload/sign/${BUCKET}/${caminhoUrl(caminho)}`, {
    method: 'POST',
    headers: cabecalhos({ 'Content-Type': 'application/json' }),
    body: '{}',
  });
  const d = await r.json();
  return `${base()}/storage/v1${d.url}`;
}

export async function listar(pasta) {
  const r = await pedir(`${base()}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: cabecalhos({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefix: pasta, limit: 100, offset: 0 }),
  });
  return r.json();
}

// Primeiros bytes do arquivo, para conferir o tipo real.
export async function inicio(caminho) {
  const r = await pedir(`${base()}/storage/v1/object/${BUCKET}/${caminhoUrl(caminho)}`, {
    headers: cabecalhos({ Range: 'bytes=0-15' }),
  });
  const leitor = r.body.getReader();
  const { value } = await leitor.read();
  leitor.cancel().catch(() => {});
  return Buffer.from(value || []).subarray(0, 16);
}

export async function remover(caminhos) {
  if (!caminhos.length) return;
  await pedir(`${base()}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers: cabecalhos({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prefixes: caminhos }),
  });
}
