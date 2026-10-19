/* ═══════════════════════════════════════════════════════════
   enviar-resumo.js — Recebe resumos enviados pelos alunos
   Grava cada envio num repositório GitHub PRIVADO (ENVIOS_REPO)
   para depois ser revisado e incorporado ao resumo da página.

   Variáveis de ambiente (Vercel):
     ENVIOS_TOKEN  token fine-grained com Contents: Read and write
                   APENAS no repositório de envios
     ENVIOS_REPO   "dono/repositorio", ex.: gabrielamorim27310-ai/caderno-envios
   ═══════════════════════════════════════════════════════════ */

const MAX_TEXTO = 50000;              // caracteres
const MAX_ARQUIVO = 3 * 1024 * 1024;  // bytes (limite de corpo da Vercel é 4,5 MB e base64 infla ~33%)

const TIPOS = {
  pdf:  'pdf',
  docx: 'zip',
  odt:  'zip',
  txt:  'texto',
  md:   'texto',
};

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
  if (categoria === 'pdf') return buf.slice(0, 5).toString('latin1') === '%PDF-';
  if (categoria === 'zip') return buf[0] === 0x50 && buf[1] === 0x4b; // "PK"
  return !buf.includes(0); // texto: sem bytes nulos
}

async function gravar(repo, token, caminho, base64, mensagem) {
  const url = `https://api.github.com/repos/${repo}/contents/${caminho.split('/').map(encodeURIComponent).join('/')}`;
  const r = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'caderno-digital',
    },
    body: JSON.stringify({ message: mensagem, content: base64 }),
  });
  if (!r.ok) {
    const corpo = await r.text();
    throw new Error(`GitHub ${r.status}: ${corpo.slice(0, 200)}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.ENVIOS_TOKEN;
  const repo = process.env.ENVIOS_REPO;
  if (!token || !repo) return res.status(500).json({ error: 'Envio de resumos ainda não configurado.' });

  const body = req.body || {};

  // Honeypot: campo invisível que só robôs preenchem. Finge sucesso.
  if (body.site) return res.status(200).json({ ok: true });

  const pagina = limpar(body.pagina, 60);
  if (!/^[a-z]+-\dtri(-[a-z]+)?$/.test(pagina)) return res.status(400).json({ error: 'Página inválida.' });

  const texto = limpar(body.texto, MAX_TEXTO + 1);
  if (texto.length > MAX_TEXTO) return res.status(400).json({ error: `O texto passou de ${MAX_TEXTO.toLocaleString('pt-BR')} caracteres.` });

  const nome = limpar(body.nome, 80).replace(/[\r\n]+/g, ' ');
  const assunto = limpar(body.assunto, 120).replace(/[\r\n]+/g, ' ');

  let arquivo = null;
  if (body.arquivo && body.arquivo.base64) {
    const original = limpar(body.arquivo.nome, 120);
    const ext = (original.split('.').pop() || '').toLowerCase();
    const categoria = TIPOS[ext];
    if (!categoria) return res.status(400).json({ error: 'Formato não aceito. Use PDF, DOCX, ODT, TXT ou MD.' });

    const buf = Buffer.from(String(body.arquivo.base64), 'base64');
    if (!buf.length) return res.status(400).json({ error: 'Arquivo vazio.' });
    if (buf.length > MAX_ARQUIVO) return res.status(400).json({ error: 'Arquivo maior que 3 MB.' });
    if (!conteudoConfere(buf, categoria)) return res.status(400).json({ error: 'O conteúdo do arquivo não confere com a extensão.' });

    arquivo = { nome: nomeSeguro(original), original, base64: buf.toString('base64'), tamanho: buf.length };
  }

  if (!texto && !arquivo) return res.status(400).json({ error: 'Cole um texto ou anexe um arquivo.' });

  const agora = new Date();
  const id = `${agora.toISOString().slice(0, 19).replace(/[:T]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
  const pasta = `envios/${pagina}/${id}`;

  const md = [
    '---',
    `pagina: ${pagina}`,
    `enviado_em: ${agora.toISOString()}`,
    `nome: ${JSON.stringify(nome || 'anônimo')}`,
    `assunto: ${JSON.stringify(assunto)}`,
    `arquivo: ${arquivo ? JSON.stringify(`${arquivo.nome} (original: ${arquivo.original}, ${arquivo.tamanho} bytes)`) : 'nenhum'}`,
    'status: pendente',
    '---',
    '',
    texto || '_(sem texto; ver arquivo anexo)_',
    '',
  ].join('\n');

  try {
    if (arquivo) {
      await gravar(repo, token, `${pasta}/${arquivo.nome}`, arquivo.base64, `envio ${pagina}: anexo ${id}`);
    }
    await gravar(repo, token, `${pasta}/resumo.md`, Buffer.from(md, 'utf8').toString('base64'), `envio ${pagina}: ${id}`);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('enviar-resumo:', err.message);
    res.status(502).json({ error: 'Não foi possível salvar o envio agora. Tente de novo mais tarde.' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '4.5mb' } },
};
