// desenhos.mjs — esquemas animados de Sociologia 3º tri (SVG + CSS) para o site e o vídeo.
// Uso: node ferramentas/sociologia/desenhos.mjs   → grava socio-imgs/3tri/esquemas/<nome>.svg
// Cada desenho é um cartão claro 640x560 que se anima sozinho (até dentro de <img>).
// Modelo: ferramentas/biologia/desenhos.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = join(RAIZ, 'socio-imgs', '3tri', 'esquemas');
mkdirSync(SAIDA, { recursive: true });

const FUNDO = '#f6f1fb', TINTA = '#24182f', CINZA = '#6f6479', ROXO = '#6c3483', ROSA = '#c2336f',
  VERDE = '#1f8a55', VERM = '#d64545', AZUL = '#2f6fd6', AMAR = '#e0a800', LARANJA = '#e8730c', PELE = '#f3c9a6';
const W = 640, H = 560;

const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-family="Inter,Arial,sans-serif" font-size="${o.s || 20}" font-weight="${o.w || 700}" fill="${o.c || TINTA}" text-anchor="${o.a || 'middle'}"${o.cls ? ` class="${o.cls}"` : ''}>${t}</text>`;
const seta = (d, c = TINTA, w = 3, cls = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ponta)"${cls ? ` class="${cls}"` : ''}/>`;
const kf = (n, p) => `@keyframes ${n}{${p}}`;

function cartao(titulo, corpo, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><marker id="ponta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs>
<style>.giro,.pulsa,.cresce,.balanca,.brilho,.sobe{transform-box:fill-box;transform-origin:center}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
<rect width="${W}" height="${H}" rx="28" fill="${FUNDO}"/>
${titulo ? txt(W / 2, 46, titulo, { s: 26, w: 800 }) : ''}
${corpo}
</svg>`;
}
// bolinha que percorre um caminho (offset-path)
const viajante = (cls, d, r, cor, dur, atraso = 0) =>
  `<circle class="${cls}" r="${r}" fill="${cor}" stroke="#fff" stroke-width="2" style="offset-path:path('${d}');animation:${cls}-v ${dur}s linear ${atraso}s infinite"/>` +
  `<style>${kf(cls + '-v', '0%{offset-distance:0%;opacity:0}6%{opacity:1}94%{opacity:1}100%{offset-distance:100%;opacity:0}')}</style>`;
// pessoa simples: cabeça + ombros (x, y = centro da cabeça)
const pessoa = (x, y, cor, s = 1, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})"${extra}>` +
  `<path d="M-34 78 Q-34 30 0 30 Q34 30 34 78 Z" fill="${cor}"/><circle cx="0" cy="0" r="22" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/></g>`;
const coracao = (x, y, s, cls) => `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-4 -2 -14 -2 -14 6 C-14 14 0 20 0 24 C0 20 14 14 14 6 C14 -2 4 -2 0 6Z" fill="${ROSA}"/>`;
const brilho = (x, y, r, cls) => `<path class="${cls}" d="M${x} ${y - r} L${x + r * .25} ${y - r * .25} L${x + r} ${y} L${x + r * .25} ${y + r * .25} L${x} ${y + r} L${x - r * .25} ${y + r * .25} L${x - r} ${y} L${x - r * .25} ${y - r * .25}Z" fill="${AMAR}"/>`;

const D = {};

// ── 1. Valor de uso × fetiche da mercadoria (Marx, via Debord) ──
D['uso-fetiche'] = cartao('Valor de uso × fetiche da mercadoria',
  `<path d="M320 80 L320 430" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 8"/>` +
  txt(165, 110, 'Valor de uso', { s: 24, c: AZUL }) +
  // caneta escrevendo
  `<path class="risco" d="M95 300 q15 -22 30 0 t30 0 t30 0 t30 0" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="100"/>` +
  `<g class="pena"><g transform="translate(95 300) rotate(35)"><rect x="-9" y="-150" width="18" height="118" rx="6" fill="${AZUL}"/><rect x="-9" y="-150" width="18" height="26" rx="6" fill="#1d4fa3"/><path d="M-9 -32 L0 -4 L9 -32Z" fill="${TINTA}"/></g></g>` +
  txt(165, 370, 'a caneta vale pelo', { s: 19, w: 600 }) + txt(165, 396, 'que ela faz: escrever', { s: 19, w: 600 }) +
  txt(480, 110, 'Fetiche', { s: 24, c: ROXO }) + txt(480, 138, 'da mercadoria', { s: 19, c: ROXO }) +
  `<circle class="pulsa aura" cx="480" cy="300" r="100" fill="${AMAR}" opacity=".18"/>` +
  `<path d="M445 250 Q480 180 515 250" fill="none" stroke="${ROXO}" stroke-width="9" stroke-linecap="round"/>` +
  `<path d="M410 250 L550 250 L566 372 L394 372 Z" fill="${ROXO}"/>` +
  `<circle cx="480" cy="305" r="20" fill="none" stroke="${AMAR}" stroke-width="4"/><path d="M470 305 L480 295 L490 305 L480 315Z" fill="${AMAR}"/>` +
  `<g class="balanca"><path d="M515 252 L540 286" stroke="${CINZA}" stroke-width="2"/><rect x="522" y="284" width="58" height="30" rx="6" fill="#fff" stroke="${CINZA}" stroke-width="2"/>${txt(551, 305, '$$$', { s: 17, c: VERDE })}</g>` +
  brilho(395, 215, 14, 'brilho b1') + brilho(570, 220, 11, 'brilho b2') + brilho(585, 345, 13, 'brilho b3') +
  txt(480, 410, 'paga-se pela imagem', { s: 19, w: 600 }) + txt(480, 436, 'e pelo status social', { s: 19, w: 600 }) +
  txt(320, 500, 'Debord: o status passa por cima da utilidade', { s: 20, c: ROXO }),
  `.risco{animation:risco 4s linear infinite}` + kf('risco', '0%{stroke-dashoffset:100}60%,100%{stroke-dashoffset:0}') +
  `.pena{animation:pena 4s linear infinite}` + kf('pena', '0%{transform:translateX(0)}60%{transform:translateX(120px)}75%{transform:translateX(120px)}100%{transform:translateX(0)}') +
  `.aura{animation:aura 2.4s ease-in-out infinite}` + kf('aura', '0%,100%{transform:scale(.9);opacity:.12}50%{transform:scale(1.06);opacity:.28}') +
  `.balanca{transform-box:view-box;transform-origin:515px 252px;animation:tag 2s ease-in-out infinite}` + kf('tag', '0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}') +
  `.brilho{animation:pisca 1.6s ease-in-out infinite}.b2{animation-delay:.5s}.b3{animation-delay:1s}` + kf('pisca', '0%,100%{transform:scale(.3);opacity:.2}50%{transform:scale(1.15);opacity:1}'));

// ── 2. O mundo fictício na tela ──
D['espetaculo-tela'] = cartao('O mundo fictício do espetáculo',
  `<defs><clipPath id="tela"><rect x="84" y="112" width="202" height="336" rx="16"/></clipPath>` +
  `<linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf9e"/><stop offset="1" stop-color="#ff9fbf"/></linearGradient></defs>` +
  `<rect x="70" y="84" width="230" height="392" rx="32" fill="${TINTA}"/>` +
  `<g clip-path="url(#tela)"><rect x="84" y="112" width="202" height="336" fill="url(#ceu)"/>` +
  `<g class="giro"><circle cx="185" cy="200" r="30" fill="${AMAR}"/>${Array.from({ length: 8 }, (_, i) => `<path d="M185 200 L185 150" stroke="${AMAR}" stroke-width="5" stroke-linecap="round" transform="rotate(${i * 45} 185 200)" stroke-dasharray="0 34 16"/>`).join('')}</g>` +
  `<rect x="84" y="318" width="202" height="130" fill="#7cc7e8"/><path class="onda" d="M70 330 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>` +
  `<path d="M250 318 C246 280 238 250 226 232" stroke="#8a5a2b" stroke-width="7" fill="none" stroke-linecap="round"/>` +
  `<path d="M226 232 q-26 -6 -40 10 M226 232 q-10 -26 -34 -24 M226 232 q16 -22 40 -14 M226 232 q24 4 32 24" stroke="${VERDE}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
  `<g transform="translate(140 300)"><circle r="11" fill="${PELE}"/><path d="M-14 36 Q-14 14 0 14 Q14 14 14 36Z" fill="${ROSA}"/><path d="M-12 18 L-24 0 M12 18 L24 0" stroke="${PELE}" stroke-width="5" stroke-linecap="round"/><rect x="-9" y="-4" width="18" height="5" rx="2" fill="${TINTA}"/></g>` +
  `</g>` +
  coracao(250, 420, 1, 'sobe c1') + coracao(232, 420, .8, 'sobe c2') + coracao(262, 420, .7, 'sobe c3') +
  txt(185, 105, '@vida_perfeita', { s: 13, c: '#fff' }) +
  // quem assiste
  `<path class="olhar" d="M408 250 L300 260" stroke="${CINZA}" stroke-width="3" stroke-dasharray="8 8"/>` +
  `<rect x="372" y="330" width="210" height="130" rx="10" fill="#ddd6e3"/>` +
  pessoa(440, 250, '#9a90a3', 1.15) +
  `<g class="nuvem"><ellipse cx="520" cy="150" rx="88" ry="52" fill="#fff" stroke="${CINZA}" stroke-width="2"/><circle cx="470" cy="214" r="9" fill="#fff" stroke="${CINZA}" stroke-width="2"/><circle cx="455" cy="232" r="5" fill="#fff" stroke="${CINZA}" stroke-width="2"/>` +
  txt(520, 142, 'por que a minha', { s: 16, w: 600 }) + txt(520, 164, 'vida não é assim?', { s: 16, w: 600 }) + `</g>` +
  txt(478, 400, 'a vida real', { s: 17, w: 600, c: CINZA }) +
  txt(320, 520, 'confundir o fictício com o real gera frustração', { s: 19, c: ROXO }),
  `.giro{animation:giro 9s linear infinite}` + kf('giro', 'to{transform:rotate(360deg)}') +
  `.sobe{transform-box:fill-box;animation:sobe 3s ease-out infinite;opacity:0}.c2{animation-delay:1s}.c3{animation-delay:2s}` + kf('sobe', '0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-230px) scale(1.2);opacity:0}') +
  `.onda{animation:onda 2.5s linear infinite}` + kf('onda', 'to{transform:translateX(-48px)}') +
  `.olhar{animation:olhar 1s linear infinite}` + kf('olhar', 'to{stroke-dashoffset:-32}') +
  `.nuvem{animation:nuvem 4s ease-in-out infinite}` + kf('nuvem', '0%,20%{opacity:0;transform:translateY(8px)}35%,85%{opacity:1;transform:translateY(0)}100%{opacity:0}'));

// ── 3. Fim da relação direta ──
{
  const via = 'M150 392 L250 380 L390 380 L490 392';
  D['relacao-mediada'] = cartao('Fim da relação direta',
    txt(320, 95, 'antes: relação direta', { s: 18, c: CINZA }) +
    `<g class="direta"><path d="M200 175 L440 175" stroke="${VERDE}" stroke-width="6" stroke-linecap="round"/>${txt(320, 160, 'experiência própria', { s: 17, w: 600, c: VERDE })}</g>` +
    `<g class="xis"><path d="M300 155 L340 195 M340 155 L300 195" stroke="${VERM}" stroke-width="7" stroke-linecap="round"/></g>` +
    pessoa(150, 150, ROXO, .9) + pessoa(490, 150, AZUL, .9) +
    `<path d="M60 270 L580 270" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 8"/>` +
    txt(320, 305, 'hoje: mediada pela mídia e pelo mercado', { s: 18, c: ROXO }) +
    pessoa(110, 370, ROXO, .9) + pessoa(530, 370, AZUL, .9) +
    `<rect x="250" y="335" width="140" height="96" rx="14" fill="${TINTA}"/><rect x="262" y="346" width="116" height="66" rx="6" fill="#ffb3c7"/>` +
    txt(320, 376, 'mídia', { s: 17 }) + txt(320, 400, 'mercado', { s: 17 }) + `<rect x="300" y="431" width="40" height="14" fill="${TINTA}"/>` +
    `<path d="${via}" fill="none" stroke="${ROXO}" stroke-width="4" opacity=".3"/>` +
    viajante('m1', via, 9, ROSA, 2.4) + viajante('m2', via, 9, ROSA, 2.4, 1.2) +
    txt(320, 500, 'até a viagem passa antes pelas fotos dos outros', { s: 18, w: 600 }),
    `.direta{animation:direta 5s ease-in-out infinite}` + kf('direta', '0%,35%{opacity:1}55%,90%{opacity:.18}100%{opacity:1}') +
    `.xis{animation:xis 5s ease-in-out infinite}` + kf('xis', '0%,40%{opacity:0}55%,88%{opacity:1}100%{opacity:0}'));
}

// ── 4. Freud: o inconsciente e as imagens ──
D['freud-inconsciente'] = cartao('Freud: o inconsciente',
  `<rect x="170" y="200" width="440" height="280" rx="18" fill="#cfe6f7"/>` +
  `<path class="onda" d="M170 200 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="${AZUL}" stroke-width="3"/>` +
  `<path d="M370 120 L440 200 L300 200 Z" fill="#fff" stroke="${AZUL}" stroke-width="3"/>` +
  `<path d="M300 200 L440 200 L520 290 L490 420 L380 470 L270 430 L240 300 Z" fill="#a9cdea" stroke="${AZUL}" stroke-width="3"/>` +
  txt(370, 180, 'consciente', { s: 15, c: AZUL }) +
  txt(380, 300, 'inconsciente', { s: 24, c: TINTA }) + txt(380, 328, '(Id)', { s: 20, c: TINTA }) + txt(380, 360, 'fonte de desejos', { s: 18, w: 600, c: TINTA }) +
  // a tela que manda imagens para dentro
  `<rect x="34" y="250" width="140" height="96" rx="12" fill="${TINTA}"/><rect x="46" y="261" width="116" height="66" rx="6" fill="#ffb3c7"/>` +
  txt(104, 290, 'mídia e', { s: 15 }) + txt(104, 310, 'mercado', { s: 15 }) +
  seta('M180 300 L262 320', ROSA, 5, 'flecha f1') + seta('M180 320 L250 380', ROSA, 5, 'flecha f2') +
  txt(320, 520, 'Debord: as imagens moldam os nossos desejos', { s: 19, c: ROXO }),
  `.onda{animation:onda 2.5s linear infinite}` + kf('onda', 'to{transform:translateX(-80px)}') +
  `.flecha{stroke-dasharray:14 10;animation:flecha .9s linear infinite}.f2{animation-delay:.3s}` + kf('flecha', 'to{stroke-dashoffset:-48}'));

// ── 5. Cosmologia ameríndia (o desenho do caderno) e o xamã ──
{
  const camadas = [
    ['M70 200 Q320 60 570 200', AMAR, '2º céu · Deuses', 168],
    ['M100 270 Q320 160 540 270', AZUL, '1º céu · Espíritos', 250],
    ['M80 340 L560 340', ROXO, 'Humanos', 328],
    ['M80 390 Q320 500 560 390', VERDE, 'Animais', 420],
  ];
  D['cosmologia'] = cartao('Cosmologia ameríndia',
    camadas.map(([d, c, rot, y], i) => `<path class="arco a${i}" d="${d}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" pathLength="100" stroke-dasharray="100"/>` + txt(320, y, rot, { s: 21, c, cls: `rot r${i}` })).join('') +
    `<path d="M150 445 L150 140" stroke="${ROSA}" stroke-width="2" stroke-dasharray="3 7"/>` +
    viajante('xama', 'M150 445 L150 140 L150 445', 12, ROSA, 5) +
    txt(150, 125, 'xamã', { s: 18, c: ROSA }) +
    txt(320, 495, 'no princípio, humanos e animais eram a mesma coisa', { s: 18, w: 600 }) +
    txt(320, 525, 'a diferença veio da perda dessa condição comum', { s: 18, c: ROXO }),
    `.arco{animation:arco 8s ease-out infinite}.a1{animation-delay:.3s}.a2{animation-delay:.6s}.a3{animation-delay:.9s}` +
    kf('arco', '0%{stroke-dashoffset:100}18%,100%{stroke-dashoffset:0}') +
    `.rot{animation:rot 8s ease-out infinite}.r1{animation-delay:.3s}.r2{animation-delay:.6s}.r3{animation-delay:.9s}` +
    kf('rot', '0%,8%{opacity:0}20%,100%{opacity:1}'));
}

// ── 6. Perspectivismo: o mesmo sangue, duas perspectivas ──
{
  const onca = `<g>` +
    `<circle cx="482" cy="206" r="20" fill="#e9a23b" stroke="${TINTA}" stroke-width="2"/><circle cx="558" cy="206" r="20" fill="#e9a23b" stroke="${TINTA}" stroke-width="2"/>` +
    `<circle cx="482" cy="206" r="9" fill="#7a4512"/><circle cx="558" cy="206" r="9" fill="#7a4512"/>` +
    `<circle cx="520" cy="262" r="62" fill="#e9a23b" stroke="${TINTA}" stroke-width="2"/>` +
    [[478, 232], [500, 214], [540, 214], [564, 234], [470, 268], [570, 270], [488, 300], [552, 300]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#5a3209" stroke-width="3.5"/>`).join('') +
    `<ellipse cx="520" cy="292" rx="28" ry="20" fill="#fbeedc"/><path d="M510 280 L530 280 L520 292Z" fill="${TINTA}"/>` +
    `<circle cx="500" cy="252" r="8" fill="#c7d94a" stroke="${TINTA}" stroke-width="2"/><circle cx="540" cy="252" r="8" fill="#c7d94a" stroke="${TINTA}" stroke-width="2"/>` +
    `<ellipse cx="500" cy="252" rx="2.5" ry="6" fill="${TINTA}"/><ellipse cx="540" cy="252" rx="2.5" ry="6" fill="${TINTA}"/>` +
    `<path d="M492 296 L462 290 M492 302 L462 306 M548 296 L578 290 M548 302 L578 306" stroke="${TINTA}" stroke-width="1.5"/></g>`;
  const humano = `<g><circle cx="120" cy="262" r="62" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/>` +
    `<path d="M60 250 Q64 196 120 196 Q178 196 182 250 Q160 222 120 224 Q82 224 60 250Z" fill="#3b2a20"/>` +
    `<circle cx="100" cy="258" r="6" fill="${TINTA}"/><circle cx="142" cy="258" r="6" fill="${TINTA}"/>` +
    `<path d="M102 300 Q121 288 140 300" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  D['perspectiva-sangue'] = cartao('O mesmo sangue, duas perspectivas',
    humano + onca +
    `<path class="olhar" d="M150 258 L292 252" stroke="${CINZA}" stroke-width="3" stroke-dasharray="8 8"/>` +
    `<path class="olhar" d="M492 252 L350 252" stroke="${CINZA}" stroke-width="3" stroke-dasharray="8 8"/>` +
    `<path class="pulsa gota" d="M320 196 C320 196 288 240 288 266 A32 32 0 0 0 352 266 C352 240 320 196 320 196Z" fill="${VERM}"/>` +
    txt(320, 330, 'sangue', { s: 18, c: VERM }) +
    `<g class="bal1"><rect x="30" y="360" width="200" height="86" rx="16" fill="#fff" stroke="${VERM}" stroke-width="3"/>${txt(130, 394, 'para o humano', { s: 17, w: 600, c: CINZA })}${txt(130, 424, 'morte, algo ruim', { s: 20, c: VERM })}</g>` +
    `<g class="bal2"><rect x="410" y="360" width="200" height="86" rx="16" fill="#fff" stroke="${VERDE}" stroke-width="3"/>${txt(510, 394, 'para a onça', { s: 17, w: 600, c: CINZA })}${txt(510, 424, 'alimento, algo bom', { s: 20, c: VERDE })}</g>` +
    txt(320, 492, 'uma só cultura, muitas naturezas', { s: 22, c: ROXO }) +
    txt(320, 524, 'corpos diferentes = perspectivas diferentes', { s: 18, w: 600 }),
    `.gota{animation:gota 1.6s ease-in-out infinite}` + kf('gota', '0%,100%{transform:scale(1)}50%{transform:scale(1.12)}') +
    `.olhar{animation:olhar 1s linear infinite}` + kf('olhar', 'to{stroke-dashoffset:-32}') +
    `.bal1{animation:bal1 6s ease-in-out infinite}.bal2{animation:bal2 6s ease-in-out infinite}` +
    kf('bal1', '0%{opacity:0}10%,100%{opacity:1}') + kf('bal2', '0%,30%{opacity:0}42%,100%{opacity:1}'));
}

// ── 7. Onde está a pessoa? Ocidente × povos ameríndios ──
D['corpo-pessoa'] = cartao('Onde está a pessoa?',
  `<path d="M320 80 L320 440" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 8"/>` +
  txt(165, 105, 'Ocidente', { s: 22, c: AZUL }) +
  pessoa(165, 300, '#9fb6e6', 1.6) +
  `<g class="alma"><g transform="translate(165 300) scale(1.6)"><path d="M-34 78 Q-34 30 0 30 Q34 30 34 78 Z" fill="none" stroke="${AZUL}" stroke-width="2" stroke-dasharray="4 4"/><circle cx="0" cy="0" r="22" fill="none" stroke="${AZUL}" stroke-width="2" stroke-dasharray="4 4"/></g></g>` +
  txt(165, 470, 'corpo × alma', { s: 20, c: AZUL }) + txt(165, 498, 'a pessoa está no interior', { s: 16, w: 600 }) + txt(165, 520, '(alma, razão, consciência)', { s: 15, w: 600, c: CINZA }) +
  txt(480, 105, 'Povos ameríndios', { s: 22, c: VERDE }) +
  `<g class="lacos"><path d="M480 300 L395 180 M480 300 L580 200 M480 300 L585 380 M480 300 L385 395" stroke="${VERDE}" stroke-width="3" stroke-dasharray="6 6"/></g>` +
  `<g class="cresce">${pessoa(480, 290, VERDE, 1.25)}</g>` +
  `<circle cx="395" cy="170" r="22" fill="#e9a23b" stroke="${TINTA}" stroke-width="2"/><circle cx="388" cy="166" r="3" fill="${TINTA}"/><circle cx="402" cy="166" r="3" fill="${TINTA}"/>` +
  `<path d="M580 214 L580 236" stroke="#8a5a2b" stroke-width="6"/><circle cx="580" cy="196" r="22" fill="${VERDE}"/>` +
  pessoa(588, 372, ROXO, .55) + pessoa(382, 386, ROSA, .55) +
  txt(480, 470, 'corpo + alma juntos', { s: 20, c: VERDE }) + txt(480, 498, 'a pessoa se faz pelo corpo', { s: 16, w: 600 }) + txt(480, 520, 'e pelas relações', { s: 16, w: 600 }),
  `.alma{animation:alma 4s ease-in-out infinite}` + kf('alma', '0%,100%{transform:translate(0,0);opacity:.9}50%{transform:translate(18px,-60px);opacity:.5}') +
  `.lacos{animation:lacos 1.2s linear infinite}` + kf('lacos', 'to{stroke-dashoffset:-24}') +
  `.cresce{animation:cresce 4s ease-in-out infinite}` + kf('cresce', '0%,100%{transform:scale(.9)}50%{transform:scale(1.05)}'));

// ── 8. Duas formas de poder: coercitivo (Estado) × não coercitivo ──
{
  const roda = Array.from({ length: 8 }, (_, i) => {
    const a = i * Math.PI / 4, x = 480 + Math.cos(a) * 112, y = 290 + Math.sin(a) * 112;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/>`;
  }).join('');
  D['poder-duas-formas'] = cartao('Duas formas de poder político',
    `<path d="M320 80 L320 450" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 8"/>` +
    `<path d="M60 430 L280 430 L170 130 Z" fill="#f3d6d6" stroke="${VERM}" stroke-width="3"/>` +
    `<circle cx="170" cy="175" r="16" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/><path d="M156 160 L160 148 L170 156 L180 148 L184 160Z" fill="${AMAR}"/>` +
    [[130, 300], [170, 300], [210, 300], [100, 395], [140, 395], [180, 395], [220, 395], [255, 395]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${PELE}" stroke="${TINTA}" stroke-width="1.5"/>`).join('') +
    seta('M170 200 L170 280', VERM, 5, 'manda m1') + seta('M150 320 L130 375', VERM, 4, 'manda m2') + seta('M190 320 L210 375', VERM, 4, 'manda m3') +
    txt(170, 472, 'coercitivo', { s: 22, c: VERM }) + txt(170, 500, 'comando e obediência', { s: 16, w: 600 }) + txt(170, 522, 'separado da sociedade', { s: 16, w: 600, c: CINZA }) +
    `<circle cx="480" cy="290" r="112" fill="none" stroke="${VERDE}" stroke-width="3" stroke-dasharray="4 8"/>` +
    `<g class="giro">${roda}</g>` +
    `<circle cx="480" cy="290" r="18" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/>` +
    `<path class="fala" d="M506 270 q10 20 0 40 M520 260 q16 30 0 60" fill="none" stroke="${VERDE}" stroke-width="3" stroke-linecap="round"/>` +
    txt(480, 472, 'não coercitivo', { s: 22, c: VERDE }) + txt(480, 500, 'persuasão e prestígio', { s: 16, w: 600 }) + txt(480, 522, 'dentro da sociedade', { s: 16, w: 600, c: CINZA }),
    `.manda{stroke-dasharray:12 8;animation:manda .8s linear infinite}` + kf('manda', 'to{stroke-dashoffset:-40}') +
    `.giro{transform-box:view-box;transform-origin:480px 290px;animation:giro 18s linear infinite}` + kf('giro', 'to{transform:rotate(360deg)}') +
    `.fala{animation:fala 1.4s ease-in-out infinite}` + kf('fala', '0%,100%{opacity:.2}50%{opacity:1}'));
}

// ── 9. O chefe ameríndio e os três deveres ──
{
  const cartaoDever = (x, cls, icone, l1, l2, l3) => `<g class="dever ${cls}"><rect x="${x}" y="300" width="184" height="168" rx="18" fill="#fff" stroke="${ROXO}" stroke-width="3"/>${icone}` +
    txt(x + 92, 408, l1, { s: 18, c: ROXO }) + txt(x + 92, 432, l2, { s: 15, w: 600 }) + txt(x + 92, 452, l3, { s: 15, w: 600, c: CINZA }) + `</g>`;
  D['chefe-deveres'] = cartao('O chefe (mburuvicha)',
    `<path d="M320 190 L122 300 M320 190 L320 300 M320 190 L518 300" stroke="${ROXO}" stroke-width="3" stroke-dasharray="5 7"/>` +
    [-50, -25, 0, 25, 50].map(a => `<ellipse cx="320" cy="96" rx="8" ry="26" fill="${[AMAR, VERM, VERDE, VERM, AMAR][(a + 50) / 25]}" transform="rotate(${a} 320 128)"/>`).join('') +
    pessoa(320, 130, ROXO, 1.2) +
    cartaoDever(30, 'd1',
      `<circle cx="95" cy="350" r="14" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/><circle cx="149" cy="350" r="14" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/><path class="calma" d="M111 352 q8 -10 16 0 t16 0" stroke="${VERDE}" stroke-width="3" fill="none"/>`,
      'Apaziguar', 'conflitos pela', 'persuasão e prestígio') +
    cartaoDever(228, 'd2',
      `<rect x="298" y="332" width="44" height="34" rx="4" fill="${ROSA}"/><rect x="294" y="324" width="52" height="12" rx="3" fill="${ROSA}"/><path d="M320 324 L320 366" stroke="${AMAR}" stroke-width="5"/><path d="M320 324 q-14 -16 -18 -2 q4 6 18 2 q14 4 18 -2 q-4 -14 -18 2" fill="${AMAR}"/>`,
      'Doar bens', 'ao grupo, por', 'generosidade') +
    cartaoDever(426, 'd3',
      `<path d="M478 326 h80 a10 10 0 0 1 10 10 v28 a10 10 0 0 1 -10 10 h-50 l-14 12 v-12 h-16 a10 10 0 0 1 -10 -10 v-28 a10 10 0 0 1 10 -10z" fill="${AZUL}"/><path d="M484 342 h68 M484 356 h48" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
      'Falar todo dia', 'o dever', 'da palavra') +
    txt(320, 512, 'sem força de lei: quem tenta mandar é abandonado', { s: 18, c: VERM }),
    `.dever{transform-box:fill-box;transform-origin:center;animation:dever 6s ease-in-out infinite}.d2{animation-delay:2s}.d3{animation-delay:4s}` +
    kf('dever', '0%,30%,100%{transform:scale(1)}10%,20%{transform:scale(1.06)}') +
    `.calma{animation:calma 1.5s ease-in-out infinite}` + kf('calma', '0%,100%{opacity:.3}50%{opacity:1}'));
}

for (const [n, s] of Object.entries(D)) writeFileSync(join(SAIDA, n + '.svg'), s);
console.log(Object.keys(D).length + ' esquemas em ' + SAIDA);
