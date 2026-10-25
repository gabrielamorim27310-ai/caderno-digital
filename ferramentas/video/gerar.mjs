#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   gerar.mjs — vídeo de um resumo a partir de um roteiro
   Playwright desenha cada cena (PNG) no visual do site e o ffmpeg
   monta o vídeo com transições e, se houver, a narração.

   Uso (na pasta ferramentas/video, depois de npm install):
     node gerar.mjs roteiros/sociologia-3tri.json [--horizontal] [--previa]

   Narração (obrigatória): audio/<pagina>/<NN>.wav ou .mp3, um arquivo
   por tela (NN = número da cena com 2 dígitos, começando em 01; a tela
   da resposta de uma "pergunta" é <NN>b). Gere com narrar.py. Cada tela
   dura o tempo da sua fala. Sem todos os áudios, o vídeo não é montado.

   Saída: videos-gerados/<pagina>.mp4 na raiz do repositório
   (fora do git) e as cenas em videos-gerados/<pagina>/cenas/.
   --previa só desenha as cenas, sem montar o vídeo.
   ═══════════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { chromium } from 'playwright';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const RAIZ = path.resolve(AQUI, '..', '..');
const args = process.argv.slice(2);
const arqRoteiro = args.find(a => !a.startsWith('--'));
if (!arqRoteiro) {
  console.error('Uso: node gerar.mjs roteiros/<pagina>.json [--horizontal] [--previa]');
  process.exit(1);
}
const roteiro = JSON.parse(fs.readFileSync(path.resolve(arqRoteiro), 'utf8'));
const HORIZONTAL = args.includes('--horizontal') || roteiro.formato === 'horizontal';
const PREVIA = args.includes('--previa');
const [W, H] = HORIZONTAL ? [1920, 1080] : [1080, 1920];
const FPS = 30;
const FADE = 0.5;            // segundos de transição entre cenas

// mesmas cores de styles/ios.css (modo claro)
const CORES = {
  historia: '#4f46e5', geografia: '#0e7c59', portugues: '#c2185b', matematica: '#0a6bd4',
  biologia: '#297c34', fisica: '#ae5400', quimica: '#cf2c2c', ingles: '#0a778f',
  filosofia: '#906400', sociologia: '#7e3fb2',
};
const COR = CORES[roteiro.materia] || '#0a6bd4';

const SAIDA = path.join(RAIZ, 'videos-gerados', roteiro.pagina);
const DIR_CENAS = path.join(SAIDA, 'cenas');
fs.mkdirSync(DIR_CENAS, { recursive: true });
fs.readdirSync(DIR_CENAS).forEach(f => fs.unlinkSync(path.join(DIR_CENAS, f)));

/* ── Cenas ── */
// "pergunta" vira duas telas: a pergunta e depois a resposta revelada
const telas = [];
roteiro.cenas.forEach((c, i) => {
  const n = i + 1;
  if (c.tipo === 'pergunta') {
    telas.push({ ...c, n, revelar: false, fala: c.fala });
    telas.push({ ...c, n, revelar: true, fala: c.falaResposta, sufixo: 'b' });
  } else telas.push({ ...c, n });
});

const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
// **negrito** no roteiro vira destaque na cor da matéria
const rico = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const TIPOS = { '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp' };
const img = src => {
  if (!src) return '';
  const f = path.join(RAIZ, src);
  if (!fs.existsSync(f)) throw new Error('Imagem não encontrada: ' + src);
  return `data:image/${TIPOS[path.extname(f).toLowerCase()] || 'jpeg'};base64,` + fs.readFileSync(f).toString('base64');
};

function corpo(t) {
  const rodape = `<div class="rodape"><span>Caderno Digital</span><span>${esc(roteiro.titulo)}</span></div>`;
  const imagem = t.imagem ? `<div class="foto${t.retrato ? ' retrato' : ''}"><img src="${img(t.imagem)}">${t.legenda ? `<p>${esc(t.legenda)}</p>` : ''}</div>` : '';
  switch (t.tipo) {
    case 'capa':
      return `<div class="capa">
        ${t.imagem ? `<img class="fundo" src="${img(t.imagem)}">` : ''}
        <div class="selo">${esc(t.selo || roteiro.titulo)}</div>
        <h1>${rico(t.titulo)}</h1>
        ${t.subtitulo ? `<p class="sub">${rico(t.subtitulo)}</p>` : ''}
      </div>${rodape}`;
    case 'capitulo':
      return `<div class="capitulo"><div class="tag">${esc(t.capitulo)}</div><h1>${rico(t.titulo)}</h1>
        ${t.subtitulo ? `<p class="sub">${rico(t.subtitulo)}</p>` : ''}</div>${rodape}`;
    case 'topicos':
      return `<div class="pagina">${t.capitulo ? `<div class="tag">${esc(t.capitulo)}</div>` : ''}
        <h2>${rico(t.titulo)}</h2>${imagem}
        <ul>${(t.itens || []).map(x => `<li>${rico(x)}</li>`).join('')}</ul></div>${rodape}`;
    case 'destaque':
      return `<div class="pagina">${t.capitulo ? `<div class="tag">${esc(t.capitulo)}</div>` : ''}
        <h2>${rico(t.titulo)}</h2>${imagem}
        <div class="caixa">${rico(t.texto)}</div></div>${rodape}`;
    case 'comparacao':
      return `<div class="pagina"><h2>${rico(t.titulo)}</h2><div class="comp">
        ${(t.colunas || []).map(c => `<div class="col"><h3>${rico(c.titulo)}</h3><ul>${c.itens.map(x => `<li>${rico(x)}</li>`).join('')}</ul></div>`).join('')}
        </div></div>${rodape}`;
    case 'pergunta':
      return `<div class="pagina"><div class="tag">Teste rápido</div><h2 class="perg">${rico(t.pergunta)}</h2>
        <ol class="alts">${t.alternativas.map((a, i) => {
          const l = 'abcde'[i];
          const cls = t.revelar ? (l === t.certa ? 'certa' : 'apagada') : '';
          return `<li class="${cls}"><span>${l}</span>${rico(a)}</li>`;
        }).join('')}</ol>
        ${t.revelar && t.explicacao ? `<div class="caixa">${rico(t.explicacao)}</div>` : ''}</div>${rodape}`;
    case 'fim':
      return `<div class="capitulo"><h1>${rico(t.titulo || 'Bons estudos!')}</h1>
        <p class="sub">${rico(t.texto || 'Resumo completo e quiz no Caderno Digital')}</p></div>${rodape}`;
    default:
      throw new Error('Tipo de cena desconhecido: ' + t.tipo);
  }
}

const k = HORIZONTAL ? 0.85 : 1.2;   // vertical é visto no celular: letra maior
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
  body { font-family: "Inter", "Noto Sans", "DejaVu Sans", Arial, sans-serif; color: #111;
         background: linear-gradient(160deg, #ffffff 0%, #f2f2f7 70%); position: relative; }
  body::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 18px; background: ${COR}; }
  b { color: ${COR}; }
  .rodape { position: absolute; left: 80px; right: 80px; bottom: 60px; display: flex; justify-content: space-between;
            font-size: ${30 * k}px; color: rgba(60,60,67,.75); font-weight: 600; }
  .tag { align-self: flex-start; display: inline-block; background: ${COR}; color: #fff; font-weight: 700; font-size: ${34 * k}px;
         padding: 10px 26px; border-radius: 999px; margin-bottom: 36px; }
  .capa, .capitulo { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 90px; }
  .capa .fundo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .14; }
  .capa > *:not(.fundo) { position: relative; }
  .selo { font-size: ${40 * k}px; font-weight: 700; color: ${COR}; margin-bottom: 30px; }
  h1 { font-size: ${104 * k}px; line-height: 1.08; font-weight: 800; letter-spacing: -1px; }
  .sub { font-size: ${46 * k}px; line-height: 1.3; color: rgba(60,60,67,.85); margin-top: 36px; }
  .pagina { position: absolute; inset: 120px 72px 150px 72px; display: flex; flex-direction: column; justify-content: center; }
  h2 { font-size: ${76 * k}px; line-height: 1.12; font-weight: 800; letter-spacing: -.5px; margin-bottom: 40px; }
  h2.perg { font-size: ${60 * k}px; }
  ul { list-style: none; display: flex; flex-direction: column; gap: ${30 * k}px; }
  ul li { font-size: ${46 * k}px; line-height: 1.32; padding-left: 46px; position: relative; }
  ul li::before { content: ""; position: absolute; left: 0; top: .5em; width: 20px; height: 20px; border-radius: 50%; background: ${COR}; }
  .caixa { font-size: ${48 * k}px; line-height: 1.35; background: #fff; border-left: 14px solid ${COR};
           border-radius: 28px; padding: 44px 48px; box-shadow: 0 10px 40px rgba(0,0,0,.08); }
  .foto { margin-bottom: 40px; text-align: center; }
  /* altura fixa: imagens pequenas (retratos antigos) também ficam grandes */
  .foto img { height: ${HORIZONTAL ? 400 : 640}px; width: auto; max-width: 100%; border-radius: 28px; object-fit: contain; box-shadow: 0 10px 40px rgba(0,0,0,.12); }
  .foto.retrato img { height: ${HORIZONTAL ? 360 : 560}px; }
  .foto p { font-size: ${32 * k}px; color: rgba(60,60,67,.8); margin-top: 14px; }
  .comp { display: grid; grid-template-columns: ${HORIZONTAL ? '1fr 1fr' : '1fr'}; gap: 36px; }
  .col { background: #fff; border-radius: 28px; padding: 40px 44px; box-shadow: 0 10px 40px rgba(0,0,0,.08); border-top: 12px solid ${COR}; }
  .col h3 { font-size: ${50 * k}px; margin-bottom: 24px; }
  .col li { font-size: ${40 * k}px; }
  .alts { list-style: none; display: flex; flex-direction: column; gap: 22px; margin-bottom: 36px; }
  .alts li { font-size: ${40 * k}px; line-height: 1.3; background: #fff; border-radius: 22px; padding: 24px 30px;
             display: flex; gap: 22px; align-items: baseline; box-shadow: 0 6px 24px rgba(0,0,0,.06); }
  .alts li span { font-weight: 800; color: ${COR}; text-transform: uppercase; }
  .alts li.certa { background: #e4f7e8; outline: 5px solid #1f9d45; }
  .alts li.certa span { color: #1f9d45; }
  .alts li.apagada { opacity: .35; }
`;

const ESPERA = process.env.PW_CHROMIUM || [
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].find(p => fs.existsSync(p));
const navegador = await chromium.launch(ESPERA ? { executablePath: ESPERA } : {});
const pagina = await navegador.newPage({ viewport: { width: W, height: H } });
const nomes = [];
for (const t of telas) {
  await pagina.setContent(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${corpo(t)}</body></html>`, { waitUntil: 'load' });
  // texto que não coube: avisa para encurtar o roteiro em vez de cortar
  const estourou = await pagina.evaluate(() => {
    const p = document.querySelector('.pagina'); if (!p) return false;
    return [...p.children].some(el => el.getBoundingClientRect().bottom > p.getBoundingClientRect().bottom + 2);
  });
  if (estourou) console.warn(`⚠ Cena ${t.n}${t.sufixo || ''} não coube na tela: encurte o texto ou tire a imagem.`);
  const nome = path.join(DIR_CENAS, String(t.n).padStart(2, '0') + (t.sufixo || '') + '.png');
  await pagina.screenshot({ path: nome });
  nomes.push(nome);
}
await navegador.close();
console.log(`${nomes.length} telas em ${path.relative(RAIZ, DIR_CENAS)}`);
if (PREVIA) process.exit(0);

/* ── Durações ── */
function duracaoAudio(f) {
  return parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
}
const DIR_AUDIO = path.join(AQUI, 'audio', roteiro.pagina);
const audios = telas.map(t => {
  const base = path.join(DIR_AUDIO, String(t.n).padStart(2, '0') + (t.sufixo || ''));
  return ['.wav', '.mp3'].map(e => base + e).find(f => fs.existsSync(f)) || null;
});
const faltando = telas.filter((t, i) => !audios[i]).map(t => String(t.n).padStart(2, '0') + (t.sufixo || ''));
if (faltando.length) {
  console.error(`Todo vídeo tem narração. Faltam os áudios: ${faltando.join(', ')}.\nRode: python3 narrar.py ${arqRoteiro}`);
  process.exit(1);
}
// a fala manda no tempo; as telas de pergunta ganham uma pausa para pensar
const dur = telas.map((t, i) => duracaoAudio(audios[i]) + 0.8 + (t.tipo === 'pergunta' && !t.revelar ? 3 : 0));

/* ── Montagem com ffmpeg ── */
const entrada = [];
nomes.forEach((f, i) => entrada.push('-loop', '1', '-framerate', String(FPS), '-t', dur[i].toFixed(2), '-i', f));
const filtros = [];
nomes.forEach((_, i) => filtros.push(`[${i}:v]scale=${W}:${H},format=yuv420p,setsar=1,fps=${FPS}[v${i}]`));
let anterior = 'v0', fim = dur[0];
const inicio = [0];
for (let i = 1; i < nomes.length; i++) {
  const offset = fim - FADE;
  inicio.push(offset);
  filtros.push(`[${anterior}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${offset.toFixed(2)}[x${i}]`);
  anterior = `x${i}`;
  fim = offset + dur[i];
}
let mapaAudio = [];
{
  const idx = [];
  audios.forEach((a, i) => {
    if (!a) return;
    entrada.push('-i', a);
    const n = nomes.length + idx.length;
    const atraso = Math.round((inicio[i] + 0.3) * 1000);
    filtros.push(`[${n}:a]aresample=44100,adelay=${atraso}|${atraso}[a${idx.length}]`);
    idx.push(`[a${idx.length}]`);
  });
  filtros.push(`${idx.join('')}amix=inputs=${idx.length}:normalize=0:dropout_transition=0,apad[aout]`);
  mapaAudio = ['-map', '[aout]', '-c:a', 'aac', '-b:a', '160k'];
}
const mp4 = path.join(RAIZ, 'videos-gerados', roteiro.pagina + (HORIZONTAL ? '-horizontal' : '') + '.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...entrada,
  '-filter_complex', filtros.join(';'), '-map', `[${anterior}]`, ...mapaAudio,
  '-t', fim.toFixed(2), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', mp4], { stdio: 'inherit' });
const m = Math.floor(fim / 60), s = Math.round(fim % 60);
console.log(`Vídeo: ${path.relative(RAIZ, mp4)} (${m}min${String(s).padStart(2, '0')}s)`);
