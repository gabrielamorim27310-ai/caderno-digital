// desenhos.mjs — esquemas animados de Biologia (SVG + CSS) para os vídeos e o site.
// Uso: node ferramentas/biologia/desenhos.mjs   → grava bio-imgs/esquemas/<nome>.svg
// Cada desenho é um cartão claro 640x560 que se anima sozinho (até dentro de <img>)
// e mostra o processo, não só a anatomia: o impulso corre, o sangue circula, a curva se desenha.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SAIDA = join(RAIZ, 'bio-imgs', 'esquemas');
mkdirSync(SAIDA, { recursive: true });

const FUNDO = '#f1f7f3', TINTA = '#1d2b24', CINZA = '#6b7a72', VERDE = '#1f8a55', VERM = '#d64545',
  AZUL = '#2f6fd6', LARANJA = '#e8730c', ROXO = '#7a4cc2', AMAR = '#e0a800', PELE = '#f3c9a6';
const W = 640, H = 560;

const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-family="Inter,Arial,sans-serif" font-size="${o.s || 20}" font-weight="${o.w || 700}" fill="${o.c || TINTA}" text-anchor="${o.a || 'middle'}"${o.cls ? ` class="${o.cls}"` : ''}>${t}</text>`;
const seta = (d, c = TINTA, w = 3, cls = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ponta)"${cls ? ` class="${cls}"` : ''}/>`;

function cartao(titulo, corpo, css = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><marker id="ponta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs>
<style>.a,.b,.c,.d,.e,.f{transform-box:fill-box;transform-origin:center}
${css}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style>
<rect width="${W}" height="${H}" rx="28" fill="${FUNDO}"/>
${titulo ? txt(W / 2, 46, titulo, { s: 26, w: 800 }) : ''}
${corpo}
</svg>`;
}
const kf = (n, p) => `@keyframes ${n}{${p}}`;
// bolinha que percorre um caminho (offset-path): o "impulso", a "hemácia", o "gameta"
const viajante = (cls, d, r, cor, dur, atraso = 0) =>
  `<circle class="${cls}" r="${r}" fill="${cor}" stroke="#fff" stroke-width="2" style="offset-path:path('${d}');animation:${cls}-v ${dur}s linear ${atraso}s infinite"/>` +
  `<style>${kf(cls + '-v', '0%{offset-distance:0%;opacity:0}6%{opacity:1}94%{opacity:1}100%{offset-distance:100%;opacity:0}')}</style>`;

const D = {};

// ── 1. Neurônio: o impulso vai do dendrito à terminação ──
{
  const eixo = 'M150 300 L520 300';
  D['neuronio-impulso'] = cartao('O impulso nervoso tem sentido único',
    // dendritos
    [[150, 300, 80, 230], [150, 300, 70, 300], [150, 300, 85, 370], [120, 260, 95, 215], [120, 340, 100, 395]]
      .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${ROXO}" stroke-width="7" stroke-linecap="round"/>`).join('') +
    `<circle cx="150" cy="300" r="46" fill="#b9a3e3" stroke="${ROXO}" stroke-width="4"/><circle cx="150" cy="300" r="16" fill="${ROXO}"/>` +
    `<path d="${eixo}" stroke="${ROXO}" stroke-width="10"/>` +
    [0, 1, 2, 3].map(i => `<rect x="${215 + i * 75}" y="286" width="58" height="28" rx="14" fill="#f6e7b0" stroke="${AMAR}" stroke-width="3"/>`).join('') +
    [[520, 300, 580, 250], [520, 300, 590, 300], [520, 300, 580, 350]].map(([x1, y1, x2, y2]) =>
      `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${ROXO}" stroke-width="6" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="10" fill="${ROXO}"/>`).join('') +
    viajante('imp', 'M70 300 L150 300 L520 300 L590 300', 13, LARANJA, 3) +
    txt(85, 432, 'dendritos', { s: 19 }) + txt(150, 380, 'corpo celular', { s: 19 }) + txt(330, 268, 'axônio com bainha de mielina', { s: 19 }) +
    txt(330, 345, 'nódulos de Ranvier (entre as faixas)', { s: 16, w: 600, c: CINZA }) + txt(565, 395, 'terminações', { s: 19 }) +
    seta('M120 480 L520 480', LARANJA, 4) + txt(320, 516, 'dendrito → corpo celular → axônio → terminação', { s: 20, c: LARANJA }));
}

// ── 2. Membrana: polarizada, despolarizada, repolarizada ──
{
  const faixa = (y, cls) => `<g class="${cls}">` +
    `<rect x="70" y="${y}" width="500" height="56" rx="10" fill="#e9dcc4" stroke="${CINZA}" stroke-width="2"/>` +
    Array.from({ length: 10 }, (_, i) => txt(95 + i * 50, y - 10, '+', { s: 28, c: VERM, cls: 'fora' }) + txt(95 + i * 50, y + 92, '−', { s: 30, c: AZUL, cls: 'dentro' })).join('') + `</g>`;
  D['membrana-potencial'] = cartao('Repouso e potencial de ação',
    txt(600, 92, 'FORA da célula', { s: 16, c: CINZA, a: 'end' }) + faixa(150, 'mem') + `<g class="inv">${Array.from({ length: 10 }, (_, i) => txt(95 + i * 50, 140, '−', { s: 30, c: AZUL }) + txt(95 + i * 50, 238, '+', { s: 28, c: VERM })).join('')}</g>` + txt(600, 300, 'DENTRO da célula', { s: 16, c: CINZA, a: 'end' }) +
    `<g class="na">${[140, 260, 380].map(x => `<g><circle cx="${x}" cy="92" r="17" fill="${LARANJA}"/>${txt(x, 98, 'Na⁺', { s: 14, c: '#fff' })}</g>`).join('')}</g>` +
    `<g class="est1">${txt(320, 380, 'Polarizada: fora +, dentro −  (−70 mV)', { s: 22, c: VERDE })}${txt(320, 410, 'mantida pela bomba de Na⁺/K⁺ (transporte ativo, ATP)', { s: 17, w: 600 })}</g>` +
    `<g class="est2">${txt(320, 380, 'Despolarizada: Na⁺ entra e inverte as cargas', { s: 22, c: LARANJA })}${txt(320, 410, 'canais de sódio abertos (difusão facilitada)', { s: 17, w: 600 })}</g>` +
    `<g class="est3">${txt(320, 380, 'Repolarizada: K⁺ sai, a bomba restaura', { s: 22, c: AZUL })}${txt(320, 410, 'volta a fora +, dentro −', { s: 17, w: 600 })}</g>` +
    // gráfico pequeno
    `<path d="M90 520 L220 520 L250 450 L275 528 L300 520 L560 520" fill="none" stroke="${CINZA}" stroke-width="3" opacity=".5"/>` +
    `<path class="traco" d="M90 520 L220 520 L250 450 L275 528 L300 520 L560 520" fill="none" stroke="${LARANJA}" stroke-width="4" pathLength="100" stroke-dasharray="100"/>` +
    txt(250, 442, '+40 mV', { s: 14, c: CINZA }) + txt(150, 510, '−70 mV', { s: 14, c: CINZA }),
    kf('ciclo1', '0%,30%{opacity:1}36%,100%{opacity:0}') + kf('ciclo2', '0%,32%{opacity:0}38%,63%{opacity:1}69%,100%{opacity:0}') + kf('ciclo3', '0%,65%{opacity:0}71%,97%{opacity:1}100%{opacity:0}') +
    `.est1{animation:ciclo1 7s infinite}.est2{animation:ciclo2 7s infinite}.est3{animation:ciclo3 7s infinite}` +
    kf('entra', '0%,32%{transform:translateY(0);opacity:1}48%,62%{transform:translateY(180px);opacity:1}70%,100%{transform:translateY(180px);opacity:0}') + `.na{animation:entra 7s infinite}` +
    kf('vira-f', '0%,40%{opacity:1}46%,64%{opacity:0}72%,100%{opacity:1}') + `.fora{animation:vira-f 7s infinite}` +
    kf('vira-d', '0%,40%{opacity:1}46%,64%{opacity:0}72%,100%{opacity:1}') + `.dentro{animation:vira-d 7s infinite}` + kf('inv', '0%,42%{opacity:0}48%,62%{opacity:1}68%,100%{opacity:0}') + `.inv{animation:inv 7s infinite}` +
    kf('desenha', '0%{stroke-dashoffset:100}90%,100%{stroke-dashoffset:0}') + `.traco{animation:desenha 7s linear infinite}`);
}

// ── 3. Sinapse química ──
{
  const ves = [[250, 170], [290, 215], [235, 245], [300, 150]];
  D['sinapse-quimica'] = cartao('Sinapse química: só num sentido',
    `<path d="M60 120 Q260 100 330 160 Q370 200 330 250 Q260 310 60 290 Z" fill="#cdbbef" stroke="${ROXO}" stroke-width="4"/>` +
    txt(150, 210, 'neurônio', { s: 18 }) + txt(150, 234, 'pré-sináptico', { s: 18 }) +
    ves.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="20" fill="#fff" stroke="${ROXO}" stroke-width="3"/>` +
      Array.from({ length: 4 }, (_, k) => `<circle class="nt nt${i}" cx="${x - 6 + (k % 2) * 12}" cy="${y - 6 + Math.floor(k / 2) * 12}" r="4.5" fill="${LARANJA}" style="animation-delay:${i * 0.5 + k * 0.12}s"/>`).join('')).join('') +
    `<path d="M600 120 L420 140 Q395 205 420 270 L600 290 Z" fill="#c4e3cf" stroke="${VERDE}" stroke-width="4"/>` +
    [150, 180, 210, 240, 262].map(y => `<rect x="410" y="${y}" width="16" height="14" rx="3" fill="${VERDE}"/>`).join('') +
    txt(520, 210, 'célula', { s: 18 }) + txt(520, 234, 'pós-sináptica', { s: 18 }) +
    txt(372, 330, 'fenda sináptica', { s: 17, c: CINZA }) +
    seta('M120 360 L540 360', LARANJA, 4) +
    txt(320, 410, '1. o impulso chega e as vesículas liberam o neurotransmissor', { s: 17, w: 600 }) +
    txt(320, 440, '2. ele atravessa a fenda e se liga aos receptores', { s: 17, w: 600 }) +
    txt(320, 470, '3. abre canais de íons: novo impulso (ou inibição)', { s: 17, w: 600 }) +
    txt(320, 500, '4. depois é degradado por enzimas ou recaptado', { s: 17, w: 600 }),
    kf('libera', '0%,20%{transform:translate(0,0);opacity:1}55%{transform:translate(95px,8px);opacity:1}75%{transform:translate(118px,10px);opacity:1}92%,100%{transform:translate(118px,10px);opacity:0}') +
    `.nt{animation:libera 3.2s ease-in infinite}`);
}

// ── 4. Arco reflexo composto ──
{
  const via = 'M80 160 C160 160 200 200 260 250 L330 280 L390 300 C430 340 470 390 540 410';
  D['arco-reflexo'] = cartao('Arco reflexo: resposta pela medula',
    // medula (corte)
    `<ellipse cx="350" cy="290" rx="95" ry="80" fill="#efe3d0" stroke="${CINZA}" stroke-width="3"/>` +
    `<path d="M310 240 Q350 270 390 240 Q370 290 390 340 Q350 310 310 340 Q330 290 310 240Z" fill="#c9b8a0"/>` +
    txt(350, 392, 'medula espinal', { s: 18, c: CINZA }) +
    // receptor (mão) e músculo
    `<circle cx="70" cy="160" r="24" fill="${PELE}" stroke="${TINTA}" stroke-width="2"/>` + txt(70, 120, 'receptor', { s: 17 }) +
    `<g class="chama"><path d="M70 205 q-12 18 0 34 q12 -16 0 -34z" fill="${LARANJA}"/></g>` +
    `<ellipse cx="560" cy="420" rx="50" ry="26" fill="#e7a3a3" stroke="${VERM}" stroke-width="3" class="musc"/>` + txt(560, 470, 'músculo (efetor)', { s: 17 }) +
    // neurônios
    `<path d="M94 160 C160 160 200 200 262 248" fill="none" stroke="${AZUL}" stroke-width="6"/>` + txt(160, 222, 'sensitivo', { s: 17, c: AZUL }) +
    `<path d="M262 248 L388 300" fill="none" stroke="${ROXO}" stroke-width="6"/>` + txt(330, 214, 'associativo', { s: 17, c: ROXO }) +
    `<path d="M388 300 C430 340 470 390 515 412" fill="none" stroke="${VERDE}" stroke-width="6"/>` + txt(470, 330, 'motor', { s: 17, c: VERDE }) +
    // sobe ao cérebro (depois)
    `<path class="sobe" d="M350 210 L350 90" fill="none" stroke="${CINZA}" stroke-width="3" stroke-dasharray="6 6"/>` + txt(350, 80, 'ao cérebro: a dor é sentida depois', { s: 16, w: 600, c: CINZA }) +
    viajante('sinal', via, 12, LARANJA, 2.6) +
    txt(320, 520, 'receptor → sensitivo → associativo → motor → músculo', { s: 19, c: LARANJA }),
    kf('contrai', '0%,80%{transform:scaleX(1)}88%,96%{transform:scaleX(.8)}100%{transform:scaleX(1)}') + `.musc{animation:contrai 2.6s infinite}` +
    kf('pisca', '0%,100%{opacity:.4}50%{opacity:1}') + `.chama{animation:pisca .6s infinite}` +
    kf('tarde', '0%,85%{opacity:0}92%,100%{opacity:1}') + `.sobe{animation:tarde 2.6s infinite}`);
}

// ── 5. Gráficos hormonais que se desenham ──
function grafico(nome, titulo, curvas, eixoX, marcas, dur = 6) {
  const x0 = 80, x1 = 590, y0 = 470, y1 = 110;
  let css = '';
  const corpo = `<path d="M${x0} ${y1 - 10} L${x0} ${y0} L${x1 + 10} ${y0}" fill="none" stroke="${TINTA}" stroke-width="3"/>` +
    eixoX.map(([x, t]) => txt(x, y0 + 28, t, { s: 15, w: 600, c: CINZA })).join('') +
    marcas.join('') +
    curvas.map(([d, cor, rot, rx, ry], i) => {
      css += `.cv${i}{stroke-dasharray:100;animation:cv ${dur}s ${i * 0.35}s linear infinite}`;
      return `<path class="cv${i}" d="${d}" fill="none" stroke="${cor}" stroke-width="5" stroke-linecap="round" pathLength="100"/>` + txt(rx, ry, rot, { s: 18, c: cor });
    }).join('');
  css += kf('cv', '0%{stroke-dashoffset:100}70%,100%{stroke-dashoffset:0}');
  D[nome] = cartao(titulo, corpo, css);
}
grafico('ciclo-menstrual', 'Ciclo menstrual (28 dias)', [
  ['M80 400 C140 380 170 360 220 380 C250 390 270 330 300 150 C315 330 340 400 380 410 C460 420 520 420 590 420', ROXO, 'LH', 300, 138],
  ['M80 380 C130 340 160 330 210 370 C250 395 280 330 300 300 C320 360 360 400 420 410 L590 415', AZUL, 'FSH', 240, 330],
  ['M80 440 C150 430 220 330 285 250 C300 300 330 360 380 340 C440 320 500 360 590 440', VERM, 'estrógeno', 210, 300],
  ['M80 455 L300 450 C350 440 380 270 450 250 C510 240 540 330 590 450', VERDE, 'progesterona', 470, 232],
], [[90, 'dia 1'], [300, '14'], [590, '28']],
[`<rect x="80" y="110" width="60" height="360" fill="${VERM}" opacity=".08"/>` + txt(110, 100, 'menstruação', { s: 14, w: 600, c: VERM }),
 `<path d="M300 110 L300 470" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 6"/>` + txt(330, 100, 'ovulação', { s: 14, w: 600, c: CINZA })]);
grafico('gravidez-hormonios', 'Hormônios na gravidez', [
  ['M80 460 C110 300 140 140 170 140 C210 140 230 400 300 430 L590 440', LARANJA, 'HCG', 190, 128],
  ['M80 450 C200 430 300 340 420 250 C500 190 540 160 560 150 L575 450', VERM, 'estrógeno', 470, 150],
  ['M80 440 C200 410 300 300 420 220 C490 180 530 150 555 135 L570 450', VERDE, 'progesterona', 400, 186],
], [[90, 'fecundação'], [250, '3º mês'], [565, 'parto']],
[txt(480, 405, '3º mês: a placenta assume', { s: 15, w: 600, c: CINZA })]);

// ── 6. Rota do espermatozoide ──
{
  const rota = 'M160 400 C150 350 170 320 200 300 C240 280 260 220 300 190 C360 150 430 170 450 230 L455 330 C455 380 470 420 520 440';
  D['rota-espermatozoide'] = cartao('Caminho do espermatozoide',
    `<ellipse cx="160" cy="420" rx="48" ry="58" fill="#f2c4b5" stroke="${VERM}" stroke-width="3"/>` + txt(160, 505, 'testículo', { s: 18 }) +
    txt(160, 425, 'túbulos', { s: 14, w: 600, c: CINZA }) + txt(160, 443, 'seminíferos', { s: 14, w: 600, c: CINZA }) +
    `<path d="M200 380 C230 360 225 330 205 310" fill="none" stroke="${ROXO}" stroke-width="12" stroke-linecap="round"/>` + txt(268, 360, 'epidídimo', { s: 17, c: ROXO }) +
    `<path d="${rota}" fill="none" stroke="${AZUL}" stroke-width="7" stroke-linecap="round" opacity=".55"/>` + txt(330, 140, 'canal deferente', { s: 17, c: AZUL }) +
    `<ellipse cx="470" cy="210" rx="26" ry="40" fill="#f6e2a1" stroke="${AMAR}" stroke-width="3"/>` + txt(560, 200, 'vesícula', { s: 16 }) + txt(560, 220, 'seminal', { s: 16 }) +
    `<circle cx="455" cy="300" r="30" fill="#c6e2cd" stroke="${VERDE}" stroke-width="3"/>` + txt(545, 300, 'próstata', { s: 16 }) +
    txt(545, 450, 'uretra', { s: 17 }) +
    viajante('esp', rota, 9, AZUL, 3.4) + viajante('esp2', rota, 9, AZUL, 3.4, 1.1) +
    txt(320, 540, 'túbulos seminíferos → epidídimo → deferente → uretra', { s: 18, c: AZUL }));
}

// ── 7. Simpático × parassimpático (gangorra) ──
D['autonomo-gangorra'] = cartao('Simpático × parassimpático',
  `<path d="M320 400 L280 470 L360 470 Z" fill="${CINZA}"/>` +
  `<g class="gang"><rect x="90" y="380" width="460" height="16" rx="8" fill="${TINTA}"/>` +
  `<g>${txt(160, 300, 'SIMPÁTICO', { s: 22, c: VERM })}${txt(160, 330, 'luta e fuga', { s: 17, w: 600 })}${txt(160, 356, 'noradrenalina', { s: 17, w: 600, c: VERM })}</g>` +
  `<g>${txt(480, 300, 'PARASSIMPÁTICO', { s: 22, c: VERDE })}${txt(480, 330, 'repouso e digestão', { s: 17, w: 600 })}${txt(480, 356, 'acetilcolina', { s: 17, w: 600, c: VERDE })}</g></g>` +
  txt(160, 110, '♥ acelera', { s: 20, c: VERM }) + txt(160, 145, 'pupila dilata', { s: 18, w: 600 }) + txt(160, 175, 'digestão para', { s: 18, w: 600 }) + txt(160, 205, 'brônquios dilatam', { s: 18, w: 600 }) +
  txt(480, 110, '♥ desacelera', { s: 20, c: VERDE }) + txt(480, 145, 'pupila contrai', { s: 18, w: 600 }) + txt(480, 175, 'digestão ativa', { s: 18, w: 600 }) + txt(480, 205, 'brônquios contraem', { s: 18, w: 600 }) +
  txt(320, 525, 'ações antagônicas: um acelera, o outro freia', { s: 19 }),
  `.gang{transform-box:view-box;transform-origin:320px 388px;animation:gangorra 4s ease-in-out infinite}` + kf('gangorra', '0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}'));

// ── 8. Coração: pequena e grande circulação ──
{
  // Lados do coração como no livro (direito do paciente à esquerda da tela).
  // Sangue venoso (azul): corpo → veias cavas → AD → VD → artéria pulmonar → pulmões.
  // Sangue arterial (vermelho): pulmões → veias pulmonares → AE → VE → aorta → corpo.
  const venoso = 'M220 498 L100 498 L100 240 L210 240 L210 375 L300 375 L300 132';
  const arterial = 'M340 132 L340 240 L430 240 L430 375 L545 375 L545 498 L420 498';
  const vaso = (d, cor) => `<path d="${d}" fill="none" stroke="${cor}" stroke-width="16" stroke-linejoin="round" opacity=".35"/>`;
  D['coracao-circulacao'] = cartao('O caminho do sangue no coração',
    vaso(venoso, AZUL) + vaso(arterial, VERM) +
    `<rect x="220" y="72" width="200" height="60" rx="26" fill="#f7cfd6" stroke="${VERM}" stroke-width="2"/>` + txt(320, 110, 'pulmões', { s: 18 }) +
    `<rect x="220" y="470" width="200" height="56" rx="26" fill="#e3d6c3" stroke="${CINZA}" stroke-width="2"/>` + txt(320, 505, 'corpo', { s: 18 }) +
    `<rect x="150" y="190" width="120" height="100" rx="20" fill="#b9cdf2" stroke="${AZUL}" stroke-width="3"/>` + txt(210, 236, 'AD', { s: 22, c: AZUL }) + txt(210, 260, 'átrio direito', { s: 13, w: 600 }) +
    `<g class="vd"><rect x="150" y="305" width="120" height="125" rx="20" fill="#b9cdf2" stroke="${AZUL}" stroke-width="3"/></g>` + txt(210, 362, 'VD', { s: 22, c: AZUL }) + txt(210, 386, 'ventr. direito', { s: 13, w: 600 }) +
    `<rect x="370" y="190" width="120" height="100" rx="20" fill="#f3b7b7" stroke="${VERM}" stroke-width="3"/>` + txt(430, 236, 'AE', { s: 22, c: VERM }) + txt(430, 260, 'átrio esquerdo', { s: 13, w: 600 }) +
    `<g class="ve"><rect x="370" y="305" width="120" height="125" rx="20" fill="#f3b7b7" stroke="${VERM}" stroke-width="3"/></g>` + txt(430, 362, 'VE', { s: 22, c: VERM }) + txt(430, 386, 'ventr. esquerdo', { s: 13, w: 600 }) +
    txt(92, 370, 'veias cavas', { s: 14, c: AZUL, a: 'end' }).replace('text-anchor="end"', 'text-anchor="middle" transform="rotate(-90 92 370)"') +
    txt(290, 170, 'art. pulmonar', { s: 14, c: AZUL, a: 'end' }) + txt(350, 170, 'veias pulmonares', { s: 14, c: VERM, a: 'start' }) +
    txt(560, 440, 'aorta', { s: 14, c: VERM, a: 'start' }) +
    viajante('ven', venoso, 11, AZUL, 4.5) + viajante('art', arterial, 11, VERM, 4.5, 2.25) +
    txt(320, 548, 'sístole: ventrículos contraem e empurram o sangue para as artérias', { s: 15 }),
    `.ve,.vd{transform-box:fill-box;transform-origin:center;animation:bate 1s infinite}` + kf('bate', '0%,100%{transform:scale(1)}15%{transform:scale(.93)}'));
}

// ── 9. Néfron ──
{
  const caminho = 'M170 150 C170 210 230 230 260 260 C300 300 260 330 300 360 L300 470 C300 500 360 500 360 470 L360 340 C360 300 420 300 430 260 C440 220 480 200 520 210 L520 500';
  D['nefron'] = cartao('Néfron: filtração e reabsorção',
    `<circle cx="170" cy="140" r="52" fill="#f7d8dc" stroke="${VERM}" stroke-width="3"/>` +
    `<path d="M140 140 q15 -25 30 0 q15 25 30 0" fill="none" stroke="${VERM}" stroke-width="5"/>` +
    txt(90, 80, 'glomérulo', { s: 16, c: VERM }) + txt(260, 92, 'cápsula de Bowman', { s: 16 }) +
    `<path d="${caminho}" fill="none" stroke="#d8c9a8" stroke-width="22" stroke-linecap="round"/>` +
    `<path d="${caminho}" fill="none" stroke="#fff6e2" stroke-width="12" stroke-linecap="round"/>` +
    txt(205, 300, 'túbulo', { s: 15, w: 600 }) + txt(205, 318, 'proximal', { s: 15, w: 600 }) +
    txt(330, 528, 'alça de Henle', { s: 15, w: 600 }) +
    txt(455, 196, 'distal', { s: 15, w: 600 }) + txt(575, 360, 'ducto', { s: 15, w: 600 }) + txt(575, 378, 'coletor', { s: 15, w: 600 }) +
    viajante('fil', caminho, 8, AMAR, 4) +
    `<g class="reab">${[[270, 300], [300, 410], [360, 410], [430, 270]].map(([x, y]) => seta(`M${x} ${y} l-34 0`, AZUL, 3)).join('')}</g>` +
    txt(120, 372, 'reabsorção', { s: 15, c: AZUL }) + txt(120, 390, '(glicose, água, sais)', { s: 13, w: 600, c: AZUL }) +
    `<g class="adh">${seta('M520 300 l40 0', VERDE, 3)}${seta('M520 420 l40 0', VERDE, 3)}</g>` +
    txt(595, 300, 'ADH:', { s: 14, c: VERDE }) + txt(595, 318, 'mais água', { s: 13, w: 600, c: VERDE }) + txt(595, 336, 'volta', { s: 13, w: 600, c: VERDE }) +
    seta('M520 505 L520 545', AMAR, 4) + txt(470, 548, 'urina', { s: 15, c: AMAR }),
    kf('pisca', '0%,100%{opacity:.35}50%{opacity:1}') + `.reab{animation:pisca 1.6s infinite}.adh{animation:pisca 1.6s .8s infinite}`);
}

// ── 10. Digestão: onde age cada enzima ──
{
  const tubo = 'M320 90 L320 160 C320 190 300 200 300 230 C300 290 420 280 420 230 C420 200 380 200 350 250 L340 300 C330 330 250 330 250 360 C250 390 390 380 390 410 C390 440 250 440 250 470 C250 500 330 500 330 530';
  D['digestao-enzimas'] = cartao('Onde age cada enzima',
    `<g transform="translate(150 0)"><path d="${tubo}" fill="none" stroke="#f0b8a8" stroke-width="30" stroke-linecap="round"/>` +
    `<path d="${tubo}" fill="none" stroke="#fbe1d8" stroke-width="18" stroke-linecap="round"/>` +
    viajante('bolo', tubo, 10, LARANJA, 5) + '</g>' +
    [[90, 'BOCA · pH 7', 'amilase salivar: amido → maltose', AZUL],
     [240, 'ESTÔMAGO · pH 2', 'pepsina (HCl): proteínas → peptídeos', VERM],
     [350, 'DUODENO · pH 8', 'pancreáticas: amilase, tripsina, lipase', VERDE],
     [445, 'INTESTINO DELGADO', 'maltase, lactase, peptidases: absorção', ROXO]]
      .map(([y, t, s, c]) => txt(40, y, t, { s: 17, c, a: 'start' }) + txt(40, y + 22, s, { s: 14, w: 600, a: 'start' })).join('') +
    txt(40, 535, 'bile (fígado): emulsifica a gordura, mas não é enzima', { s: 15, c: AMAR, a: 'start' }));
}

// ── 11. Curva de saturação da hemoglobina (e o desvio para a direita) ──
{
  // x: pO2 0..120 mmHg → 90..590 ; y: 0..100% → 470..110
  const X = p => 90 + p / 120 * 500, Y = s => 470 - s / 100 * 360;
  const sig = (p50) => { let d = ''; for (let p = 0; p <= 120; p += 4) { const s = 100 * p ** 2.7 / (p ** 2.7 + p50 ** 2.7); d += (p ? ' L' : 'M') + X(p).toFixed(1) + ' ' + Y(s).toFixed(1); } return d; };
  D['hemoglobina-curva'] = cartao('Curva de saturação da hemoglobina',
    `<path d="M90 100 L90 470 L600 470" fill="none" stroke="${TINTA}" stroke-width="3"/>` +
    txt(345, 510, 'pressão de O₂ (mmHg)', { s: 16, c: CINZA }) + txt(40, 290, 'saturação', { s: 16, c: CINZA }).replace('text-anchor="middle"', 'text-anchor="middle" transform="rotate(-90 40 290)"') +
    [0, 40, 100].map(p => txt(X(p), 492, String(p), { s: 14, w: 600, c: CINZA })).join('') + [50, 100].map(s => txt(76, Y(s) + 5, s + '%', { s: 14, w: 600, c: CINZA, a: 'end' })).join('') +
    `<rect x="${X(30)}" y="110" width="${X(45) - X(30)}" height="360" fill="${AZUL}" opacity=".08"/>` + txt(X(37), 455, 'tecidos', { s: 15, c: AZUL }) +
    `<rect x="${X(90)}" y="110" width="${X(115) - X(90)}" height="360" fill="${VERM}" opacity=".08"/>` + txt(X(102), 455, 'pulmões', { s: 15, c: VERM }) +
    `<path class="cn" d="${sig(27)}" fill="none" stroke="${VERM}" stroke-width="5" pathLength="100"/>` + txt(X(70), Y(99) - 12, 'normal (pH 7,4)', { s: 16, c: VERM }) +
    `<path class="cd" d="${sig(38)}" fill="none" stroke="${LARANJA}" stroke-width="5" stroke-dasharray="10 8"/>` +
    `<g class="cdt">${txt(X(80), Y(62), 'ácido, CO₂ alto, calor:', { s: 16, c: LARANJA })}${txt(X(80), Y(62) + 22, 'solta mais O₂ (efeito Bohr)', { s: 16, c: LARANJA })}</g>` +
    seta(`M${X(45)} ${Y(70)} l40 0`, LARANJA, 3, 'cdt'),
    `.cn{stroke-dasharray:100;animation:cn 6s linear infinite}` + kf('cn', '0%{stroke-dashoffset:100}40%,100%{stroke-dashoffset:0}') +
    `.cd,.cdt{animation:cd 6s infinite}` + kf('cd', '0%,45%{opacity:0}60%,100%{opacity:1}'));
}

// ── 12. Transporte pela membrana ──
{
  const painel = (x, tit, sub, cor) => txt(x, 110, tit, { s: 19, c: cor }) + txt(x, 134, sub, { s: 14, w: 600, c: CINZA });
  const bicamada = `<rect x="40" y="250" width="560" height="60" fill="#efe1c6"/>` + Array.from({ length: 28 }, (_, i) => `<circle cx="${50 + i * 20}" cy="254" r="7" fill="#e0b97a"/><circle cx="${50 + i * 20}" cy="306" r="7" fill="#e0b97a"/>`).join('');
  D['transporte-membrana'] = cartao('Atravessando a membrana',
    bicamada + txt(40, 236, 'fora', { s: 14, c: CINZA, a: 'start' }) + txt(40, 340, 'dentro', { s: 14, c: CINZA, a: 'start' }) +
    painel(120, 'difusão simples', 'O₂, CO₂: passa direto', VERDE) + painel(320, 'difusão facilitada', 'glicose: por proteína', AZUL) + painel(520, 'transporte ativo', 'contra o gradiente, ATP', VERM) +
    // canal e bomba
    `<rect x="300" y="244" width="40" height="72" rx="10" fill="${AZUL}" opacity=".75"/>` +
    `<rect x="496" y="240" width="48" height="80" rx="12" fill="${VERM}" opacity=".8"/>` + txt(470, 410, 'ATP', { s: 18, c: AMAR }) + `<circle cx="520" cy="372" r="0" />` +
    // partículas
    [[90, 190], [130, 175], [150, 205], [110, 220]].map(([x, y], i) => `<circle class="dif d${i}" cx="${x}" cy="${y}" r="9" fill="${VERDE}"/>`).join('') +
    [[300, 190], [330, 172], [345, 210]].map(([x, y], i) => `<rect class="fac f${i}" x="${x - 8}" y="${y - 8}" width="16" height="16" rx="3" fill="${AZUL}"/>`).join('') +
    [[505, 380], [535, 395]].map(([x, y], i) => `<circle class="atv a${i}" cx="${x}" cy="${y}" r="9" fill="${VERM}"/>`).join('') +
    seta('M120 200 L120 360', VERDE, 3) + seta('M320 200 L320 360', AZUL, 3) + seta('M570 380 L570 200', VERM, 3) +
    txt(320, 450, 'a favor do gradiente: passivo, sem gastar energia', { s: 17, w: 600 }) +
    txt(320, 480, 'contra o gradiente: ativo, gasta ATP (bomba de Na⁺/K⁺)', { s: 17, w: 600 }) +
    txt(320, 520, 'osmose: a água vai para o lado com mais soluto', { s: 17, c: AZUL }),
    kf('desce', '0%{transform:translateY(0);opacity:1}70%{transform:translateY(170px);opacity:1}100%{transform:translateY(170px);opacity:0}') +
    kf('sobe', '0%{transform:translateY(0);opacity:1}70%{transform:translateY(-170px);opacity:1}100%{transform:translateY(-170px);opacity:0}') +
    `.dif{animation:desce 3s infinite}.d1{animation-delay:.7s}.d2{animation-delay:1.4s}.d3{animation-delay:2.1s}` +
    `.fac{animation:desce 3s infinite}.f1{animation-delay:1s}.f2{animation-delay:2s}` +
    `.atv{animation:sobe 3s infinite}.a1{animation-delay:1.5s}`);
}

// ── 13. Resposta imune primária × secundária ──
grafico('imune-resposta', 'Resposta imune: 1º e 2º contato', [
  ['M90 465 C140 465 170 440 210 400 C240 370 260 380 300 440 L330 462', AZUL, '1º contato: lenta e fraca', 200, 360],
  ['M330 462 C350 462 360 380 380 200 C395 140 420 150 460 260 C500 360 540 420 590 440', VERM, '2º contato: rápida e forte', 205, 210],
], [[90, 'antígeno'], [330, 'antígeno de novo'], [590, 'tempo']],
[txt(205, 235, 'graças às células de memória', { s: 15, w: 600, c: CINZA }), `<path d="M330 110 L330 470" stroke="${CINZA}" stroke-width="2" stroke-dasharray="6 6"/>`]);

for (const [n, s] of Object.entries(D)) writeFileSync(join(SAIDA, n + '.svg'), s);
console.log(Object.keys(D).length + ' esquemas em ' + SAIDA);
