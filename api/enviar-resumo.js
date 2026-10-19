/* ═══════════════════════════════════════════════════════════
   enviar-resumo.js — Recebe resumos enviados pelos alunos
   Grava cada envio num repositório GitHub PRIVADO (ENVIOS_REPO)
   para depois ser revisado e incorporado ao resumo da página.

   Variáveis de ambiente (Vercel):
     ENVIOS_TOKEN  token fine-grained com Contents: Read and write
                   APENAS no repositório de envios
     ENVIOS_REPO   "dono/repositorio", ex.: gabrielamorim27310-ai/caderno-envios

   Protocolo (o corpo de uma função da Vercel tem no máximo 4,5 MB):
     1. { tipo: 'parte', pagina, id, arquivo: { indice, nome, parte, total, base64 } }
        uma requisição por pedaço de até 2,5 MB de cada arquivo
     2. { tipo: 'final', pagina, id, texto, nome, assunto, arquivos: [nomes] }
        grava resumo.md, que marca o envio como completo
   ═══════════════════════════════════════════════════════════ */

const MAX_TEXTO = 50000;                 // caracteres
const MAX_PEDACO = 2.5 * 1024 * 1024;    // bytes por requisição
const MAX_PARTES = 8;                    // 8 × 2,5 MB = 20 MB por arquivo
const MAX_ARQUIVOS = 10;

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
const RE_ID = /^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}-[a-z0-9]{6}$/;

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

function nomeArquivo(indice, nome) {
  return `${String(indice + 1).padStart(2, '0')}-${nomeSeguro(nome)}`;
}

function conteudoConfere(buf, categoria) {
  if (categoria === 'pdf')  return buf.slice(0, 5).toString('latin1') === '%PDF-';
  if (categoria === 'zip')  return buf[0] === 0x50 && buf[1] === 0x4b; // "PK"
  if (categoria === 'jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (categoria === 'png')  return buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (categoria === 'webp') return buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP';
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

function validarParte(a) {
  const indice = Number(a.indice), parte = Number(a.parte), total = Number(a.total);
  if (!Number.isInteger(indice) || indice < 0 || indice >= MAX_ARQUIVOS) return { erro: `No máximo ${MAX_ARQUIVOS} arquivos por envio.` };
  if (!Number.isInteger(total) || total < 1 || total > MAX_PARTES) return { erro: 'Arquivo maior que 20 MB.' };
  if (!Number.isInteger(parte) || parte < 0 || parte >= total) return { erro: 'Parte inválida.' };

  const original = limpar(a.nome, 120);
  const ext = (original.split('.').pop() || '').toLowerCase();
  const categoria = TIPOS[ext];
  if (!categoria) return { erro: 'Formato não aceito. Use foto (JPG, PNG, WEBP), PDF, DOCX, ODT, TXT ou MD.' };

  const buf = Buffer.from(String(a.base64 || ''), 'base64');
  if (!buf.length) return { erro: 'Arquivo vazio.' };
  if (buf.length > MAX_PEDACO) return { erro: 'Parte grande demais.' };
  if (parte === 0 && !conteudoConfere(buf, categoria)) return { erro: `O conteúdo de "${original}" não confere com a extensão.` };

  let caminho = nomeArquivo(indice, original);
  if (total > 1) caminho += `.part${String(parte + 1).padStart(3, '0')}`;
  return { caminho, base64: buf.toString('base64') };
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
  if (!RE_PAGINA.test(pagina)) return res.status(400).json({ error: 'Página inválida.' });
  const id = limpar(body.id, 40);
  if (!RE_ID.test(id)) return res.status(400).json({ error: 'Envio inválido.' });
  const pasta = `envios/${pagina}/${id}`;

  try {
    if (body.tipo === 'parte') {
      const p = validarParte(body.arquivo || {});
      if (p.erro) return res.status(400).json({ error: p.erro });
      await gravar(repo, token, `${pasta}/${p.caminho}`, p.base64, `envio ${pagina}: ${p.caminho} (${id})`);
      return res.status(200).json({ ok: true });
    }

    if (body.tipo !== 'final') return res.status(400).json({ error: 'Requisição inválida.' });

    const texto = limpar(body.texto, MAX_TEXTO + 1);
    if (texto.length > MAX_TEXTO) return res.status(400).json({ error: `O texto passou de ${MAX_TEXTO.toLocaleString('pt-BR')} caracteres.` });

    const nome = limpar(body.nome, 80).replace(/[\r\n]+/g, ' ');
    const assunto = limpar(body.assunto, 120).replace(/[\r\n]+/g, ' ');
    const arquivos = (Array.isArray(body.arquivos) ? body.arquivos : [])
      .slice(0, MAX_ARQUIVOS)
      .map((n, i) => nomeArquivo(i, limpar(n, 120)));

    if (!texto && !arquivos.length) return res.status(400).json({ error: 'Cole um texto ou anexe um arquivo.' });

    const md = [
      '---',
      `pagina: ${pagina}`,
      `enviado_em: ${new Date().toISOString()}`,
      `nome: ${JSON.stringify(nome || 'anônimo')}`,
      `assunto: ${JSON.stringify(assunto)}`,
      `arquivos: ${JSON.stringify(arquivos)}`,
      'status: pendente',
      '---',
      '',
      texto || '_(sem texto; ver arquivos anexos)_',
      '',
    ].join('\n');

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
