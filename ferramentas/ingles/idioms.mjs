// idioms.mjs — ilustrações animadas dos idioms e do texto Our Two Selves (Inglês 3º tri)
// Mesmo personagem dos gestos (gestos.mjs). Uso: node ferramentas/ingles/idioms.mjs
//   → ing-imgs/3tri/idioms/<nome>.svg
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { linha, mov, cabeca, tronco, mao, braco, cartao, TRACO, DESTAQUE, CAMISA, CAMISA2, PELE, RAIZ } from './gestos.mjs';

const SAIDA = join(RAIZ, 'ing-imgs', '3tri', 'idioms');
mkdirSync(SAIDA, { recursive: true });
const kf = (n, p) => `@keyframes ${n}{${p}}`;
const m = (x, c = 'm') => `<g class="${c}">${x}</g>`;
const txt = (x, y, t, s = 16, c = TRACO, w = 700) => `<text x="${x}" y="${y}" font-family="Arial" font-size="${s}" font-weight="${w}" fill="${c}" text-anchor="middle">${t}</text>`;
// personagem menor, deslocado (para dividir a cena com objetos)
const mini = (x, y, esc, corpo) => `<g transform="translate(${x} ${y}) scale(${esc})">${corpo}</g>`;
const VERDE = '#1f8a55', VERM = '#d64545', AZUL = '#2f6fd6', AMAR = '#e0a800';
const I = {};

// be on a steep learning curve: gráfico íngreme e um ponto subindo
I['steep-learning-curve'] = cartao(
  linha('M30 210 L30 30', TRACO, 3) + linha('M30 210 L215 210', TRACO, 3) +
  `<path d="M40 205 C80 200 95 120 120 70 C130 50 150 40 205 36" fill="none" stroke="${AZUL}" stroke-width="5" stroke-linecap="round"/>` +
  `<circle class="sobe" r="10" fill="${DESTAQUE}" stroke="#fff" stroke-width="2" style="offset-path:path('M40 205 C80 200 95 120 120 70 C130 50 150 40 205 36');animation:sobe 2.6s ease-in-out infinite"/>` +
  mini(118, 120, 0.42, tronco() + cabeca({ boca: 'aberta', sobr: 'erguida' })),
  kf('sobe', '0%{offset-distance:0%}80%,100%{offset-distance:100%}'));

// go blank: balão de pensamento vazio que pisca
I['go-blank'] = cartao(tronco() + cabeca({ boca: 'aberta', sobr: 'erguida', olhos: 'normal' }) +
  m(`<ellipse cx="190" cy="48" rx="40" ry="30" fill="#fff" stroke="${TRACO}" stroke-width="3"/><circle cx="160" cy="88" r="7" fill="#fff" stroke="${TRACO}" stroke-width="2.5"/><circle cx="150" cy="104" r="4" fill="#fff" stroke="${TRACO}" stroke-width="2"/>` +
    txt(190, 56, '...', 22, '#9aa5a8')),
  kf('vazio', '0%,100%{opacity:1}50%{opacity:.25}') + `.m{animation:vazio 1.4s infinite}`);

// run on empty: bateria sem carga piscando
I['run-on-empty'] = cartao(tronco() + cabeca({ boca: 'neutra', olhos: 'fechados' }) +
  `<rect x="168" y="22" width="56" height="28" rx="5" fill="#fff" stroke="${TRACO}" stroke-width="3"/><rect x="224" y="30" width="6" height="12" rx="2" fill="${TRACO}"/>` +
  m(`<rect x="172" y="26" width="9" height="20" rx="2" fill="${VERM}"/>`) + txt(196, 70, 'zzz', 18, DESTAQUE) ,
  kf('pisca', '0%,100%{opacity:1}50%{opacity:0}') + `.m{animation:pisca 1s infinite}`);

// breeze through: folha com check e vento
I['breeze-through'] = cartao(tronco() + cabeca({ boca: 'sorriso', olhos: 'apertados' }) +
  `<rect x="170" y="20" width="52" height="64" rx="6" fill="#fff" stroke="${TRACO}" stroke-width="3"/>` +
  linha('M180 36 h32', '#c9d3d6', 3) + linha('M180 48 h32', '#c9d3d6', 3) +
  m(linha('M182 64 l10 10 l20 -22', VERDE, 5)) +
  m(mov('M20 50 q20 -10 40 0') + mov('M14 70 q24 -10 48 0') + mov('M24 90 q16 -8 32 0'), 'fx'),
  kf('check', '0%,30%{opacity:0;transform:scale(.4)}50%,100%{opacity:1;transform:scale(1)}') + `.m{animation:check 2s infinite}` +
  kf('vento', '0%{transform:translateX(-10px);opacity:0}50%{opacity:1}100%{transform:translateX(20px);opacity:0}') + `.fx{animation:vento 1.4s infinite}`);

// get the hang of it: barra de progresso enchendo
I['get-the-hang-of'] = cartao(tronco() + cabeca({ boca: 'sorriso' }) +
  `<rect x="34" y="24" width="172" height="22" rx="11" fill="#fff" stroke="${TRACO}" stroke-width="3"/>` +
  `<rect class="m" x="38" y="28" width="164" height="14" rx="7" fill="${VERDE}"/>`,
  `.m{transform-box:fill-box;transform-origin:left center;animation:enche 2.6s ease-out infinite}` + kf('enche', '0%{transform:scaleX(.05)}70%,100%{transform:scaleX(1)}'));

// get your head down: cabeça baixa, livro e linhas de foco
I['get-head-down'] = cartao(tronco() +
  `<g transform="translate(0 18)">${cabeca({ boca: 'neutra', olhos: 'fechados', sobr: 'franzida' })}</g>` +
  `<path d="M70 196 L120 186 L170 196 L170 232 L120 222 L70 232 Z" fill="#fff" stroke="${TRACO}" stroke-width="3"/>` + linha('M120 186 L120 222', TRACO, 2) +
  m(mov('M60 40 l14 14') + mov('M180 40 l-14 14') + mov('M120 18 v16'), 'fx'),
  kf('foco', '0%,100%{opacity:.2}50%{opacity:1}') + `.fx{animation:foco 1.2s infinite}`);

// give it your best shot: bola em arco até a cesta
I['give-best-shot'] = cartao(
  mini(-20, 70, 0.62, tronco() + cabeca({ boca: 'sorriso', sobr: 'erguida' })) +
  `<rect x="186" y="56" width="40" height="30" rx="3" fill="#fff" stroke="${TRACO}" stroke-width="3"/>` +
  linha('M176 92 h44', VERM, 5) + linha('M180 92 l6 22 M196 92 l0 22 M212 92 l-6 22', '#b9c2c5', 2) +
  `<circle class="bola" r="11" fill="${DESTAQUE}" stroke="${TRACO}" stroke-width="2" style="offset-path:path('M80 120 Q140 0 198 92');animation:arco 2s ease-in infinite"/>`,
  kf('arco', '0%{offset-distance:0%;opacity:1}70%{offset-distance:100%;opacity:1}85%,100%{offset-distance:100%;opacity:0}'));

// drum something into somebody: professor repetindo a regra três vezes
I['drum-into'] = cartao(
  `<rect x="96" y="26" width="132" height="92" rx="6" fill="#2e5d4b" stroke="${TRACO}" stroke-width="3"/>` +
  [0, 1, 2].map(i => `<g class="r r${i}">${txt(162, 54 + i * 26, 'check your mirrors!', 12, '#f3f7f4', 600)}</g>`).join('') +
  mini(-30, 60, 0.7, tronco() + cabeca({ boca: 'aberta', sobr: 'franzida' })) +
  m(mov('M96 140 l-12 6') + mov('M96 150 h-14')),
  `.r{opacity:0;animation:aparece 3s infinite}.r1{animation-delay:.6s}.r2{animation-delay:1.2s}` +
  kf('aparece', '0%{opacity:0}10%,80%{opacity:1}100%{opacity:0}'));

// keep somebody on track: trilha com bandeira e ponto seguindo
I['keep-on-track'] = cartao(
  `<path d="M30 200 C80 200 70 120 120 120 C170 120 160 50 210 50" fill="none" stroke="#c9b48a" stroke-width="18" stroke-linecap="round"/>` +
  `<path d="M30 200 C80 200 70 120 120 120 C170 120 160 50 210 50" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 8"/>` +
  linha('M210 50 L210 14', TRACO, 3) + `<path d="M210 14 l26 8 l-26 8z" fill="${VERM}"/>` +
  `<circle class="seg" r="10" fill="${AZUL}" stroke="#fff" stroke-width="2" style="offset-path:path('M30 200 C80 200 70 120 120 120 C170 120 160 50 210 50');animation:seg 3s linear infinite"/>` +
  txt(120, 234, 'stay on track', 15, AZUL),
  kf('seg', '0%{offset-distance:0%}90%,100%{offset-distance:100%}'));

// Our Two Selves (cartão grande 640x560 para a cena "desenho")
{
  const fala = (x, y, t, cls) => `<g class="${cls}"><rect x="${x}" y="${y}" width="${t.length * 9.2 + 24}" height="34" rx="12" fill="#fff" stroke="${VERM}" stroke-width="2.5"/>${`<text x="${x + 12}" y="${y + 23}" font-family="Arial" font-size="16" font-weight="700" fill="${VERM}">${t}</text>`}</g>`;
  const corpo = `<rect width="640" height="560" rx="28" fill="#eef8f9"/>` +
    `<text x="320" y="46" font-family="Arial" font-size="26" font-weight="800" fill="${TRACO}" text-anchor="middle">Self 1 talks · Self 2 plays</text>` +
    `<rect x="60" y="300" width="520" height="210" rx="10" fill="#2f8f5b"/>` + linha('M60 405 h520', '#fff', 3) + linha('M320 300 v210', '#fff', 3) +
    // Self 2: jogador
    `<g transform="translate(250 150) scale(.85)">${tronco()}${cabeca({ boca: 'sorriso', olhos: 'normal' })}</g>` +
    `<g class="raq"><path d="M430 300 l40 -60" stroke="${TRACO}" stroke-width="7" stroke-linecap="round"/><ellipse cx="482" cy="222" rx="26" ry="34" fill="none" stroke="${TRACO}" stroke-width="6" transform="rotate(35 482 222)"/></g>` +
    `<circle class="bola" r="12" fill="#d9ef3a" stroke="${TRACO}" stroke-width="2" style="offset-path:path('M120 330 Q300 180 470 230');animation:bola 2.4s ease-in-out infinite"/>` +
    // Self 1: a voz que julga, que vai sumindo
    fala(40, 90, 'Bend your knees!', 'f1') + fala(40, 140, 'Oh, this is embarrassing...', 'f2') + fala(40, 190, 'Watch the ball!', 'f3') +
    `<text x="140" y="545" font-family="Arial" font-size="18" font-weight="800" fill="${VERM}" text-anchor="middle">Self 1: judges</text>` +
    `<text x="470" y="545" font-family="Arial" font-size="18" font-weight="800" fill="${VERDE}" text-anchor="middle">Self 2: plays naturally</text>`;
  const css = `.f1,.f2,.f3{animation:some 6s infinite}.f2{animation-delay:.4s}.f3{animation-delay:.8s}` +
    kf('some', '0%,40%{opacity:1}60%,100%{opacity:0}') +
    kf('bola', '0%{offset-distance:0%}100%{offset-distance:100%}') +
    `.raq{transform-box:view-box;transform-origin:430px 300px;animation:raq 2.4s ease-in-out infinite}` + kf('raq', '0%,80%{transform:rotate(0)}92%{transform:rotate(-25deg)}100%{transform:rotate(0)}');
  I['two-selves'] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 560" width="640" height="560"><style>.cab,.boca,.sobr,.nariz{transform-box:fill-box;transform-origin:center}${css}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>${corpo}</svg>`;
}

for (const [n, s] of Object.entries(I)) writeFileSync(join(SAIDA, n + '.svg'), s);
console.log(Object.keys(I).length + ' ilustrações em ' + SAIDA);
