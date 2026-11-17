// gestos.mjs — desenha as ilustrações de linguagem corporal (Inglês 3º tri, Unit 6)
// Uso: node ferramentas/ingles/gestos.mjs   → grava ing-imgs/3tri/<gesto>.svg
// Cada SVG é um "cartão" claro (funciona no tema escuro e no vídeo).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = join(RAIZ, 'ing-imgs', '3tri');
mkdirSync(SAIDA, { recursive: true });

const PELE = '#f4c9a1', PELE2 = '#e3ad80', CABELO = '#3d2a1f', CAMISA = '#0a778f', CAMISA2 = '#075d70',
  TRACO = '#2b1d15', DESTAQUE = '#e8590c', FUNDO = '#eef8f9', CALCA = '#36415a';

const linha = (d, c = TRACO, w = 3) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const mov = d => linha(d, DESTAQUE, 3.2);            // traços de movimento (laranja)

// ── Rosto ──────────────────────────────────────────────
function rosto(o = {}) {
  const sobr = {
    normal: linha('M98 80 q8 -6 16 -1') + linha('M126 79 q8 -5 16 1'),
    franzida: linha('M97 76 l17 8') + linha('M143 76 l-17 8') + linha('M117 70 v9', DESTAQUE, 2.6) + linha('M123 70 v9', DESTAQUE, 2.6),
    erguida: linha('M98 74 q8 -8 16 -2') + linha('M126 72 q8 -8 16 2'),
  }[o.sobr || 'normal'];
  const olhos = o.olhos === 'apertados'
    ? linha('M100 92 q6 -4 12 0') + linha('M128 92 q6 -4 12 0')
    : o.olhos === 'fechados'
      ? linha('M100 93 q6 4 12 0') + linha('M128 93 q6 4 12 0')
      : `<circle cx="106" cy="92" r="4.2" fill="${TRACO}"/><circle cx="134" cy="92" r="4.2" fill="${TRACO}"/>`;
  const nariz = o.nariz === 'enrugado'
    ? linha('M120 96 v12 q-3 3 -6 1') + linha('M113 100 q7 -4 14 0', DESTAQUE, 2.4) + linha('M114 105 q6 -3 12 0', DESTAQUE, 2.4)
    : linha('M120 96 v12 q-3 3 -6 1', PELE2, 2.6);
  const boca = {
    sorriso: linha('M108 121 q12 10 24 0'),
    neutra: linha('M110 123 h20'),
    franzida: `<ellipse cx="120" cy="123" rx="6.5" ry="5" fill="#c4545a" stroke="${TRACO}" stroke-width="2.4"/>` +
      linha('M111 118 l-3 -3', DESTAQUE, 2.2) + linha('M129 118 l3 -3', DESTAQUE, 2.2) + linha('M110 128 l-3 3', DESTAQUE, 2.2) + linha('M130 128 l3 3', DESTAQUE, 2.2),
    mordida: `<path d="M106 120 q14 -4 28 0" fill="none" stroke="${TRACO}" stroke-width="2.4"/>` +
      `<path d="M106 122 q14 16 28 0 q-14 4 -28 0z" fill="#d0606a" stroke="${TRACO}" stroke-width="2.4"/>` +
      `<rect x="113" y="117" width="6.5" height="9" rx="1.5" fill="#fff" stroke="${TRACO}" stroke-width="1.6"/><rect x="120.5" y="117" width="6.5" height="9" rx="1.5" fill="#fff" stroke="${TRACO}" stroke-width="1.6"/>`,
    dentes: `<rect x="106" y="116" width="28" height="12" rx="3" fill="#fff" stroke="${TRACO}" stroke-width="2.4"/>` + linha('M106 122 h28', TRACO, 2) +
      linha('M113 116 v12', TRACO, 1.4) + linha('M120 116 v12', TRACO, 1.4) + linha('M127 116 v12', TRACO, 1.4) +
      linha('M92 118 l-6 -2', DESTAQUE, 2.4) + linha('M92 124 l-7 1', DESTAQUE, 2.4) + linha('M148 118 l6 -2', DESTAQUE, 2.4) + linha('M148 124 l7 1', DESTAQUE, 2.4),
    aberta: `<ellipse cx="120" cy="123" rx="7" ry="6" fill="#7a2c33" stroke="${TRACO}" stroke-width="2.4"/>`,
  }[o.boca || 'sorriso'];
  return `<g class="sobr">${sobr}</g>${olhos}<g class="nariz">${nariz}</g><g class="boca">${boca}</g>`;
}

function cabeca(o = {}) {
  const giro = o.giro || 0;
  return `<g class="cab"><g transform="rotate(${giro} 120 140)">
    <rect x="110" y="128" width="20" height="22" fill="${PELE2}"/>
    <ellipse cx="72" cy="98" rx="0" ry="0"/>
    <circle cx="74" cy="98" r="8" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
    <circle cx="166" cy="98" r="8" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
    <ellipse cx="120" cy="96" rx="46" ry="50" fill="${PELE}" stroke="${TRACO}" stroke-width="2.4"/>
    <path d="M74 92 q-4 -50 46 -52 q50 2 46 52 q-6 -26 -30 -30 q-22 10 -56 2 q-4 10 -6 28z" fill="${CABELO}"/>
    ${o.cabelo || ''}
    ${rosto(o)}
  </g></g>`;
}

// tronco: ombros normais ou erguidos (shrug)
function tronco(erguido = false) {
  const y = erguido ? 150 : 162;
  return `<path d="M36 240 q2 -${240 - y - 8} 44 -${240 - y} h80 q42 ${0} 44 ${240 - y} z" fill="${CAMISA}" stroke="${TRACO}" stroke-width="2.4"/>
    <path d="M106 ${y} l14 16 l14 -16" fill="${PELE2}" stroke="${TRACO}" stroke-width="2"/>`;
}

// mão "luva": palma arredondada + dedos como cápsulas
function mao(x, y, giro = 0, dedos = 4, esc = 1) {
  let d = '';
  for (let i = 0; i < dedos; i++) d += `<rect x="${-11 + i * 6}" y="-22" width="6" height="16" rx="3" fill="${PELE}" stroke="${TRACO}" stroke-width="1.8"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${giro}) scale(${esc})">${d}
    <rect x="-13" y="-10" width="26" height="22" rx="9" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
    <rect x="9" y="-6" width="12" height="7" rx="3.5" transform="rotate(-30 9 -2)" fill="${PELE}" stroke="${TRACO}" stroke-width="1.8"/></g>`;
}
const braco = (d) => `<path d="${d}" fill="none" stroke="${CAMISA2}" stroke-width="20" stroke-linecap="round"/>`;

// css: animações do gesto. Cada SVG anima sozinho (funciona até dentro de <img>).
// .cab = cabeça, .boca, .sobr, .nariz; .m/.m2/.fx = grupos marcados em cada gesto.
function cartao(corpo, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <style>.cab,.boca,.sobr,.nariz,.m,.m2,.fx{transform-box:fill-box;transform-origin:center}
  ${css}
  @media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
  <rect width="240" height="240" rx="28" fill="${FUNDO}"/>
  <clipPath id="c"><rect width="240" height="240" rx="28"/></clipPath>
  <g clip-path="url(#c)">${corpo}</g></svg>`;
}

const G = {};
const kf = (nome, passos) => `@keyframes ${nome}{${passos}}`;
const anima = (sel, nome, dur, extra = '') => `${sel}{animation:${nome} ${dur} ease-in-out infinite ${extra}}`;
const m = (x, c = 'm') => `<g class="${c}">${x}</g>`;

G['fold-your-arms'] = cartao(tronco() + cabeca({ boca: 'neutra', sobr: 'franzida' }) + m(
  `<path d="M44 236 q-6 -30 12 -48" fill="none" stroke="${CAMISA2}" stroke-width="22" stroke-linecap="round"/>` +
  `<path d="M196 236 q6 -30 -12 -48" fill="none" stroke="${CAMISA2}" stroke-width="22" stroke-linecap="round"/>` +
  mao(176, 186, 100, 4, 0.75) +
  `<path d="M56 190 L182 214" stroke="${CAMISA2}" stroke-width="24" stroke-linecap="round"/>` +
  `<path d="M184 190 L58 214" stroke="#0b6f84" stroke-width="24" stroke-linecap="round"/>` +
  mao(64, 186, -100, 4, 0.75)),
  kf('dobra', '0%,20%{transform:translateY(46px)}50%,100%{transform:translateY(0)}') + anima('.m', 'dobra', '2.6s') +
  kf('bufa', '0%,45%{transform:none}60%{transform:translateY(-3px)}75%,100%{transform:none}') + anima('.cab', 'bufa', '2.6s'));

G['purse-your-lips'] = cartao(tronco() + cabeca({ boca: 'franzida', sobr: 'erguida' }),
  kf('aperta', '0%,100%{transform:scale(1)}50%{transform:scale(0.55,0.75)}') + anima('.boca', 'aperta', '1.6s'));

G['furrow-your-brow'] = cartao(tronco() + cabeca({ sobr: 'franzida', boca: 'neutra' }) +
  m(`<text x="196" y="60" font-family="Arial" font-weight="700" font-size="34" fill="${DESTAQUE}">?</text>`, 'fx'),
  kf('testa', '0%,100%{transform:translateY(-4px)}40%,70%{transform:translateY(2px)}') + anima('.sobr', 'testa', '2s') +
  kf('duvida', '0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(12deg)}') + anima('.fx', 'duvida', '2s'));

G['drum-your-fingers'] = cartao(tronco() + cabeca({ boca: 'neutra', olhos: 'apertados' }) +
  `<rect x="0" y="206" width="240" height="40" fill="#b07a4a" stroke="${TRACO}" stroke-width="2"/>` +
  braco('M180 240 q4 -30 -10 -44') + m(mao(160, 196, 0, 4)) +
  m(mov('M140 168 v-10') + mov('M152 164 v-12') + mov('M164 164 v-12') + mov('M176 168 v-10'), 'fx'),
  kf('tambor', '0%,50%,100%{transform:translateY(0)}25%,75%{transform:translateY(-6px)}') + anima('.m', 'tambor', '0.5s') +
  kf('pisca', '0%,100%{opacity:1}50%{opacity:0.2}') + anima('.fx', 'pisca', '0.5s'));

G['rub-your-hands-together'] = cartao(tronco() + cabeca({ boca: 'sorriso', olhos: 'apertados' }) +
  braco('M50 240 q20 -40 58 -46') + braco('M190 240 q-20 -40 -58 -46') +
  m(mao(112, 196, 10)) + m(mao(128, 196, -10), 'm2') +
  m(mov('M86 176 q-8 6 0 14') + mov('M154 176 q8 6 0 14') + mov('M78 170 q-12 12 0 26') + mov('M162 170 q12 12 0 26'), 'fx'),
  kf('esfrega1', '0%,100%{transform:translate(-4px,3px)}50%{transform:translate(4px,-3px)}') + anima('.m', 'esfrega1', '0.45s') +
  kf('esfrega2', '0%,100%{transform:translate(4px,-3px)}50%{transform:translate(-4px,3px)}') + anima('.m2', 'esfrega2', '0.45s') +
  kf('pisca', '0%,100%{opacity:1}50%{opacity:0.3}') + anima('.fx', 'pisca', '0.45s'));

G['tilt-your-head'] = cartao(tronco() + cabeca({ boca: 'sorriso', sobr: 'erguida' }) + m(mov('M178 40 q22 20 14 48'), 'fx'),
  `.cab{transform-box:view-box;transform-origin:120px 150px}` +
  kf('inclina', '0%,15%,100%{transform:rotate(0)}40%,75%{transform:rotate(-18deg)}') + anima('.cab', 'inclina', '2.8s') +
  kf('pisca', '0%,30%,100%{opacity:0}45%,75%{opacity:1}') + anima('.fx', 'pisca', '2.8s'));

G['cross-your-ankles'] = cartao(
  `<rect x="20" y="40" width="200" height="22" rx="8" fill="#8a5a3a"/><rect x="34" y="62" width="10" height="60" fill="#6d4630"/><rect x="196" y="62" width="10" height="60" fill="#6d4630"/>` +
  `<path d="M70 20 h100 v42 h-100z" fill="${CALCA}"/>` +
  `<path d="M92 60 l32 120" stroke="${CALCA}" stroke-width="28" stroke-linecap="round"/><ellipse cx="140" cy="196" rx="24" ry="11" fill="#333"/>` +
  m(`<path d="M148 60 l-32 120" stroke="#46526e" stroke-width="28" stroke-linecap="round"/><ellipse cx="102" cy="196" rx="24" ry="11" fill="#222"/>`) +
  m(`<circle cx="120" cy="170" r="20" fill="none" stroke="${DESTAQUE}" stroke-width="3.5" stroke-dasharray="6 5"/>`, 'fx'),
  `.m{transform-box:view-box;transform-origin:148px 60px}` +
  kf('cruza', '0%,20%{transform:rotate(-22deg)}50%,100%{transform:rotate(0)}') + anima('.m', 'cruza', '2.6s') +
  kf('aparece', '0%,45%{opacity:0;transform:scale(0.6)}60%,100%{opacity:1;transform:scale(1)}') + anima('.fx', 'aparece', '2.6s'));

G['steeple-your-hands'] = cartao(tronco() + cabeca({ boca: 'neutra', sobr: 'erguida' }) +
  braco('M52 240 q12 -36 52 -40') + braco('M188 240 q-12 -36 -52 -40') + m(
  `<path d="M100 206 L120 160 L140 206" fill="none" stroke="${PELE}" stroke-width="14" stroke-linejoin="round"/>` +
  `<path d="M100 206 L120 160 L140 206" fill="none" stroke="${TRACO}" stroke-width="2" stroke-linejoin="round"/>` +
  `<path d="M110 206 L120 176 L130 206" fill="none" stroke="${TRACO}" stroke-width="1.6"/>` +
  `<rect x="94" y="200" width="20" height="18" rx="7" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/><rect x="126" y="200" width="20" height="18" rx="7" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>`),
  `.m{transform-box:view-box;transform-origin:120px 212px}` +
  kf('junta', '0%,20%{transform:scaleX(1.5) scaleY(0.8)}50%,100%{transform:none}') + anima('.m', 'junta', '2.4s'));

G['wrinkle-your-nose'] = cartao(tronco() + cabeca({ nariz: 'enrugado', olhos: 'apertados', boca: 'neutra', sobr: 'franzida' }) +
  m(mov('M186 70 q10 -8 4 -18') + mov('M196 86 q12 -6 8 -18') + `<text x="20" y="62" font-family="Arial" font-size="26" fill="${DESTAQUE}">~</text>`, 'fx'),
  kf('torce', '0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-3px) scaleY(0.75)}') + anima('.nariz', 'torce', '1.2s') +
  kf('cheiro', '0%{opacity:0;transform:translateY(8px)}50%{opacity:1}100%{opacity:0;transform:translateY(-8px)}') + anima('.fx', 'cheiro', '1.8s'));

G['stroke-your-chin'] = cartao(tronco() + cabeca({ boca: 'neutra', sobr: 'erguida', olhos: 'apertados' }) +
  braco('M196 240 q8 -44 -40 -88') + m(mao(140, 150, -20, 4, 0.95)) + mov('M108 160 q12 10 24 0'),
  kf('alisa', '0%,100%{transform:translate(0,-4px)}50%{transform:translate(-6px,8px)}') + anima('.m', 'alisa', '1.4s'));

G['give-a-thumbs-up'] = cartao(tronco() + cabeca({ boca: 'sorriso' }) +
  braco('M190 240 q10 -40 2 -64') + m(
  `<g transform="translate(192 170)"><rect x="-14" y="-6" width="28" height="30" rx="9" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
   <rect x="-7" y="-36" width="13" height="34" rx="6.5" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
   ${linha('M-12 4 h22', TRACO, 1.6)}${linha('M-12 12 h22', TRACO, 1.6)}</g>`) + m(mov('M214 120 l10 -10') + mov('M170 120 l-10 -10'), 'fx'),
  kf('joinha', '0%,10%{transform:translateY(30px) scale(0.7)}35%{transform:translateY(-6px) scale(1.12)}50%,100%{transform:none}') + anima('.m', 'joinha', '2.2s') +
  kf('aparece', '0%,30%{opacity:0}45%,100%{opacity:1}') + anima('.fx', 'aparece', '2.2s'));

G['cross-your-fingers'] = cartao(tronco() + cabeca({ boca: 'sorriso', olhos: 'fechados' }) +
  braco('M188 240 q10 -36 2 -60') + m(
  `<g transform="translate(190 176)"><rect x="-14" y="-6" width="28" height="28" rx="9" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
   <rect x="-11" y="-40" width="10" height="38" rx="5" transform="rotate(22 -6 -4)" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
   <rect x="1" y="-42" width="10" height="40" rx="5" transform="rotate(-22 6 -4)" fill="${PELE}" stroke="${TRACO}" stroke-width="2"/>
   <path d="M-9 -2 a4 4 0 0 1 8 0" fill="${PELE}" stroke="${TRACO}" stroke-width="1.6"/></g>`) +
  m(`<text x="24" y="70" font-family="Arial" font-size="30" fill="${DESTAQUE}">✦</text>`, 'fx'),
  `.m{transform-box:view-box;transform-origin:190px 200px}` +
  kf('torce', '0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}') + anima('.m', 'torce', '0.9s') +
  kf('brilha', '0%,100%{transform:scale(0.6) rotate(0);opacity:.4}50%{transform:scale(1.2) rotate(45deg);opacity:1}') + anima('.fx', 'brilha', '1.8s'));

G['clear-your-throat'] = cartao(tronco() + cabeca({ boca: 'aberta', olhos: 'fechados' }) +
  braco('M60 240 q-6 -50 46 -96') + mao(110, 136, 90, 4, 0.9) +
  m(`<text x="158" y="140" font-family="Arial" font-weight="700" font-size="22" fill="${DESTAQUE}">ahem!</text>`, 'fx'),
  kf('tosse', '0%,30%,60%,100%{transform:translateY(0)}15%,45%{transform:translateY(5px)}') + anima('.cab', 'tosse', '1.8s') +
  kf('ahem', '0%,10%{opacity:0;transform:scale(0.5)}25%,70%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.1)}') + anima('.fx', 'ahem', '1.8s'));

G['shrug-your-shoulders'] = cartao(m(tronco(true) +
  braco('M56 168 q-22 20 -14 46') + braco('M184 168 q22 20 14 46') +
  mao(40, 214, 200) + mao(200, 214, 160)) + cabeca({ boca: 'neutra', sobr: 'erguida' }) +
  m(mov('M50 140 l0 -14 m-6 6 l6 -6 l6 6') + mov('M190 140 l0 -14 m-6 6 l6 -6 l6 6'), 'fx'),
  kf('ombro', '0%,30%,100%{transform:translateY(14px)}50%,70%{transform:translateY(0)}') + anima('.m', 'ombro', '2s') +
  kf('seta', '0%,30%,100%{opacity:0}50%,70%{opacity:1}') + anima('.fx', 'seta', '2s'));

G['grind-your-teeth'] = cartao(tronco() + cabeca({ boca: 'dentes', sobr: 'franzida', olhos: 'apertados' }),
  kf('range', '0%,100%{transform:translateX(-2px)}50%{transform:translateX(2px)}') + anima('.boca', 'range', '0.18s') +
  kf('treme', '0%,100%{transform:translateX(0)}50%{transform:translateX(1px)}') + anima('.cab', 'treme', '0.3s'));

G['twirl-your-hair'] = cartao(tronco() +
  cabeca({ boca: 'sorriso', olhos: 'normal', cabelo: `<path d="M160 70 q30 30 14 80" fill="none" stroke="${CABELO}" stroke-width="10" stroke-linecap="round"/>` }) +
  braco('M200 240 q20 -50 -8 -88') + m(mao(184, 150, -30, 3, 0.9)) + m(mov('M196 124 a10 10 0 1 1 -2 18 a7 7 0 1 1 0 -12'), 'fx'),
  kf('gira', '0%{transform:translate(0,-5px)}25%{transform:translate(5px,0)}50%{transform:translate(0,5px)}75%{transform:translate(-5px,0)}100%{transform:translate(0,-5px)}') + anima('.m', 'gira', '1s', '') +
  kf('espiral', 'from{transform:rotate(0)}to{transform:rotate(360deg)}') + `.fx{animation:espiral 1s linear infinite}`);

G['flick-your-hair-back'] = cartao(tronco() +
  cabeca({ boca: 'sorriso', giro: 8, cabelo: `<path d="M78 70 q-40 10 -40 70" fill="none" stroke="${CABELO}" stroke-width="12" stroke-linecap="round"/>` }) +
  m(braco('M48 240 q-20 -60 8 -110') + mao(60, 120, 20, 4, 0.9)) + m(mov('M30 100 q-6 -40 30 -60') + mov('M22 120 q-14 -56 30 -84'), 'fx'),
  `.m{transform-box:view-box;transform-origin:48px 240px}` +
  kf('joga', '0%,30%,100%{transform:rotate(0)}12%{transform:rotate(14deg)}') + anima('.m', 'joga', '2.2s') +
  kf('rastro', '0%,8%{opacity:0}14%,30%{opacity:1}45%,100%{opacity:0}') + anima('.fx', 'rastro', '2.2s'));

G['bite-your-lip'] = cartao(tronco() + cabeca({ boca: 'mordida', sobr: 'erguida' }) + m(mov('M180 62 q14 6 12 22'), 'fx'),
  kf('morde', '0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.8) translateY(1px)}') + anima('.boca', 'morde', '1.3s') +
  kf('pisca', '0%,100%{opacity:.2}50%{opacity:1}') + anima('.fx', 'pisca', '1.3s'));

const nomes = Object.keys(G);
for (const n of nomes) writeFileSync(join(SAIDA, n + '.svg'), G[n]);
console.log(nomes.length + ' ilustrações em ' + SAIDA);
