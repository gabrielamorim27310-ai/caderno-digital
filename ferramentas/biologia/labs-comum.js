/* Base dos laboratórios de Biologia: utilitários + laboratórios de revisão usados no 2º e no 3º tri.
   O montar-labs.mjs junta este arquivo com labs-<tri>.js dentro de uma função só. */
const $ = s => document.querySelector(s);
const cv = n => getComputedStyle(document.body).getPropertyValue(n).trim() || '#888';
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = (w = 600, s = 13) => `${w} ${s}px Inter,system-ui,sans-serif`;
const T = (x, y, s, a = 'start', c = 'var(--label)', w = 600, z = 13) => `<text x="${x}" y="${y}" text-anchor="${a}" style="fill:${c};font:${F(w, z)}">${s}</text>`;
const T2 = (x, y, s, a = 'start') => T(x, y, s, a, 'var(--label-2)', 500, 11.5);
const BOX = (x, y, w, h, st = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" style="fill:var(--bg-2);stroke:var(--sep);stroke-width:1.2;filter:drop-shadow(0 2px 4px rgba(0,0,0,.12));${st}"/>`;
const C = { verde: '#2e9d6a', verm: '#d9534f', roxo: '#8e44ad', amar: '#e3a21a', azul: '#3b82c4', lar: '#e0702a', cinza: '#8e8e93' };
function seg(el, cb) { if (!el) return; el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v); }); }
function steps(el, labels, cb) {
  el.innerHTML = labels.map((l, i) => `<button type="button" data-i="${i}">${l}</button>`).join('');
  const go = i => { el.querySelectorAll('button').forEach((b, j) => b.classList.toggle('on', j === i)); cb(i); };
  el.onclick = e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); };
  go(0); return go;
}
function anim(dur, fn, done) { // fn(p) com p de 0 a 1
  if (RM) { fn(1); done && done(); return; }
  const t0 = performance.now();
  const f = t => { const p = Math.min(1, (t - t0) / dur); fn(p); if (p < 1) requestAnimationFrame(f); else done && done(); };
  requestAnimationFrame(f);
}
function sorter(el, items, opts) {
  if (!el) return;
  let fila = shuffle(items), i = 0, ac = 0, done = false;
  function show() {
    if (i >= fila.length) { el.innerHTML = `<div class="card-q">Fim! <b style="color:var(--tint)">${ac} de ${fila.length}</b> de primeira.</div><div class="opts"><button class="lbtn pri" type="button">Jogar de novo</button></div>`; el.querySelector('button').onclick = () => { fila = shuffle(items); i = ac = 0; show(); }; return; }
    done = false; let errou = false;
    el.innerHTML = `<div class="meta"><span>${i + 1} de ${fila.length}</span><span>acertos de primeira: ${ac}</span></div><div class="card-q">${fila[i][0]}</div><div class="opts">${opts.map(o => `<button class="lbtn" type="button" data-k="${o}">${o}</button>`).join('')}</div><div class="fb"></div>`;
    el.querySelector('.opts').onclick = e => {
      const b = e.target.closest('button'); if (!b || done) return;
      const [, cert, why] = fila[i], fb = el.querySelector('.fb');
      if (b.dataset.k === cert) { b.classList.add('ok'); done = true; if (!errou) ac++; fb.className = 'fb ok'; fb.innerHTML = '✔ ' + why; setTimeout(() => { i++; show(); }, 2100); }
      else { errou = true; b.classList.add('no'); b.disabled = true; fb.className = 'fb no'; fb.textContent = 'Não é. Tente de novo.'; }
    };
  }
  show();
}
function canvasFit(c) { const g = c.getContext('2d'); return g; }

/* ═════════ REVISÃO: DIGESTÃO ═════════ */
(function () {
  const svg = $('#digSvg'), out = $('#digOut'); if (!svg) return;
  const LOC = ['Boca', 'Estômago', 'Duodeno', 'Suco entérico'], PH = ['~7 neutro', '~2 ácido (HCl)', '~8 (bicarbonato)', '~8 (delgado)'];
  const D = {
    amido: [['Amilase salivar (ptialina)', 'amido → maltose', 6, 3], ['nenhuma para amido', 'o pH ácido desnatura a ptialina', 3, 3], ['Amilase pancreática', 'amido → maltose', 3, 2], ['Maltase (suco entérico)', 'maltose → glicose + glicose (absorvível)', 2, 1]],
    prot: [['nenhuma', 'só mastigação', 6, 6], ['Pepsina (pepsinogênio ativado pelo HCl)', 'proteínas → peptídeos (não absorvíveis)', 6, 3], ['Tripsina e quimiotripsina (pâncreas)', 'peptídeos → peptídeos menores', 3, 2], ['Peptidases (suco entérico)', 'peptídeos → aminoácidos (absorvíveis)', 2, 1]],
    lip: [['nenhuma', 'só mastigação', 6, 6], ['nenhuma', 'continua inteira', 6, 6], ['Bile emulsifica + lipase pancreática', 'lipídios → ácidos graxos + glicerol (a bile não é enzima!)', 6, 1], ['absorção', 'ácidos graxos vão para os vasos quilíferos (linfa)', 1, 1]],
  };
  let ali = 'amido', go;
  function draw(i) {
    const [enz, reac, n0, n1] = D[ali][i], cor = { amido: C.amar, prot: C.verm, lip: C.lar }[ali];
    let mol = ''; const pedacos = n1, tam = n0;
    for (let k = 0; k < tam; k++) { const grupo = Math.floor(k / Math.max(1, tam / pedacos)); mol += `<circle cx="${420 + k * 22 + grupo * 14}" cy="150" r="9" style="fill:${cor};animation:labIn .4s ${k * 40}ms both"/>`; }
    svg.innerHTML = LOC.map((l, k) => `<g style="opacity:${k === i ? 1 : .4}"><circle cx="${60 + k * 100}" cy="60" r="${k === i ? 24 : 16}" style="fill:${k === i ? 'var(--tint)' : 'var(--bg-2)'};stroke:var(--sep);stroke-width:2"/>${T(60 + k * 100, 104, l, 'middle')}${T2(60 + k * 100, 120, PH[k], 'middle')}</g>`).join('') + `<path d="M84 60 H${36 + 300}" style="stroke:var(--sep);stroke-width:3;stroke-dasharray:4 4"/>` +
      T(420, 40, enz, 'start', 'var(--label)', 700, 13) + T2(420, 60, reac) + mol;
    out.innerHTML = `<b>${LOC[i]}</b>${PH[i] ? ` (pH ${PH[i]})` : ''}: <b>${enz}</b> · ${reac}.`;
  }
  go = steps($('#digSteps'), LOC.map((l, i) => `${i + 1}. ${l}`), draw);
  seg($('#digSeg'), v => { ali = v; go(0); });
})();

/* ═════════ REVISÃO: CORAÇÃO ═════════ */
(function () {
  const svg = $('#corSvg'), out = $('#corOut'); if (!svg) return;
  const AZ = '#5b7fc7', VM = '#d9534f';
  const S = [
    ['Cavas → AD', ['vc', 'AD'], 'O sangue <b>venoso</b> (pobre em O₂) do corpo chega pelas <b>veias cavas</b> ao <b>átrio direito</b>.'],
    ['AD → VD', ['AD', 'VD'], 'Do átrio direito passa ao <b>ventrículo direito</b> pela valva tricúspide, enquanto o ventrículo está relaxado (<b>diástole</b>).'],
    ['VD → pulmões', ['VD', 'ap', 'pul'], 'Na <b>sístole</b> (contração), o VD manda o sangue pela <b>artéria pulmonar</b> aos pulmões. ⚠ Artéria com sangue <b>venoso</b>: artéria é o vaso que <b>sai</b> do coração. Nos pulmões ocorre a hematose.'],
    ['Pulmões → AE', ['pul', 'vp', 'AE'], 'O sangue, agora <b>arterial</b> (rico em O₂), volta pelas <b>veias pulmonares</b> ao <b>átrio esquerdo</b>. ⚠ Veia com sangue arterial. Fim da <b>circulação pulmonar</b> (pequena).'],
    ['AE → VE', ['AE', 'VE'], 'Do átrio esquerdo passa ao <b>ventrículo esquerdo</b> pela valva mitral (bicúspide).'],
    ['VE → corpo', ['VE', 'ao', 'corpo'], 'Na sístole, o VE (parede mais grossa, mais força) manda o sangue pela <b>aorta</b> para todo o corpo: <b>circulação sistêmica</b> (grande). Nos tecidos, o sangue entrega O₂ e vira venoso de novo.'],
  ];
  function draw(i) {
    const on = new Set(S[i][1]), op = k => on.has(k) ? 1 : .35, sw = k => on.has(k) ? 7 : 4;
    svg.innerHTML = `
      <g style="opacity:${op('pul')}"><ellipse cx="320" cy="40" rx="140" ry="26" style="fill:rgba(217,83,79,.12);stroke:var(--sep);stroke-width:2"/>${T(320, 45, 'PULMÕES', 'middle')}</g>
      <g style="opacity:${op('corpo')}"><ellipse cx="320" cy="272" rx="160" ry="22" style="fill:rgba(91,127,199,.12);stroke:var(--sep);stroke-width:2"/>${T(320, 277, 'CORPO (tecidos)', 'middle')}</g>
      <path d="M200 60 C150 70 150 120 250 115" style="fill:none;stroke:${AZ};stroke-width:${sw('ap')};opacity:${op('ap')}"/>
      <path d="M440 60 C490 70 490 120 395 115" style="fill:none;stroke:${VM};stroke-width:${sw('vp')};opacity:${op('vp')}"/>
      <path d="M395 205 C480 215 490 245 440 258" style="fill:none;stroke:${VM};stroke-width:${sw('ao')};opacity:${op('ao')}"/>
      <path d="M200 258 C150 245 150 150 248 140" style="fill:none;stroke:${AZ};stroke-width:${sw('vc')};opacity:${op('vc')}"/>
      ${[['AD', 250, 100, AZ, 'Átrio direito'], ['VD', 250, 160, AZ, 'Ventrículo direito'], ['AE', 330, 100, VM, 'Átrio esquerdo'], ['VE', 330, 160, VM, 'Ventrículo esquerdo']].map(([k, x, y, cor, n]) => `<g style="opacity:${op(k)}"><rect x="${x}" y="${y}" width="${70}" height="${k[0] === 'V' ? 56 : 46}" rx="12" style="fill:${cor};stroke:${on.has(k) ? 'var(--label)' : 'none'};stroke-width:2"/><text x="${x + 35}" y="${y + 28}" text-anchor="middle" style="fill:#fff;font:${F(800, 15)}">${k}</text></g>`).join('')}
      ${T2(120, 168, 'veias cavas', 'middle')}${T2(150, 82, 'artéria pulmonar', 'middle')}${T2(500, 82, 'veias pulmonares', 'middle')}${T2(500, 230, 'aorta', 'middle')}
      ${T2(285, 230, 'lado direito: venoso', 'middle')}${T2(365, 245, 'lado esquerdo: arterial', 'middle')}`;
    out.innerHTML = S[i][2];
  }
  steps($('#corSteps'), S.map((s, i) => `${i + 1}. ${s[0]}`), draw);
})();

/* ═════════ REVISÃO: HEMOGLOBINA ═════════ */
(function () {
  const c = $('#hbCv'), r = $('#hbR'), out = $('#hbOut'); if (!c) return;
  const g = c.getContext('2d'); let ex = false;
  const P50 = [26.8, 34.4]; // pH 7,4: 75% a 40 mmHg · pH 7,2: 60% a 40 mmHg
  const S = (p, p50) => p <= 0 ? 0 : p ** 2.7 / (p ** 2.7 + p50 ** 2.7);
  function draw() {
    const p = +r.value, x0 = 60, x1 = 600, y0 = 20, y1 = 250, X = v => x0 + v / 100 * (x1 - x0), Y = v => y1 - v * (y1 - y0);
    g.clearRect(0, 0, 760, 300);
    g.strokeStyle = cv('--sep'); g.lineWidth = 1; g.font = F(500, 11); g.fillStyle = cv('--label-2');
    [0, .25, .5, .75, 1].forEach(v => { g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); g.fillText(v * 100 + '%', 18, Y(v) + 4); });
    [0, 20, 40, 60, 80, 100].forEach(v => g.fillText(v, X(v) - 6, y1 + 16)); g.fillText('pO₂ (mmHg)', x1 - 60, y1 + 32);
    const curva = (p50, cor, dash) => { g.strokeStyle = cor; g.lineWidth = 3; g.setLineDash(dash); g.beginPath(); for (let v = 0; v <= 100; v++) { v ? g.lineTo(X(v), Y(S(v, p50))) : g.moveTo(X(v), Y(0)); } g.stroke(); g.setLineDash([]); };
    curva(P50[0], C.azul, ex ? [6, 5] : []); if (ex) curva(P50[1], C.verm, []);
    [[100, 'pulmões'], [40, 'tecido em repouso'], [20, 'músculo em exercício']].forEach(([v, n]) => { g.fillStyle = cv('--label-2'); g.fillText(v === 100 ? n + ' ▼' : '▼ ' + n, X(v) - (v === 100 ? 56 : 5), y0 + 10 + (v === 20 ? 14 : 0)); });
    const p50 = P50[ex ? 1 : 0], s = S(p, p50);
    g.strokeStyle = cv('--label'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(p), y1); g.lineTo(X(p), Y(s)); g.lineTo(x0, Y(s)); g.stroke(); g.setLineDash([]);
    g.fillStyle = ex ? C.verm : C.azul; g.beginPath(); g.arc(X(p), Y(s), 7, 0, 7); g.fill();
    g.fillStyle = cv('--label'); g.font = F(700, 13); g.fillText(`pO₂ = ${p}`, 620, 50); g.fillText(`${Math.round(s * 100)}% saturada`, 620, 68);
    const lib = S(100, p50) - S(ex ? 20 : 40, p50);
    g.font = F(500, 12); g.fillStyle = cv('--label-2'); g.fillText('O₂ entregue', 620, 100); g.fillText('(pulmão → tecido):', 620, 116);
    g.fillStyle = cv('--label'); g.font = F(800, 22); g.fillText(Math.round(lib * 100) + '%', 620, 146);
  }
  function txt() { out.innerHTML = ex ? 'No <b>exercício</b>, mais CO₂ → mais H⁺ → pH cai (7,2), e a temperatura sobe: a curva <b>desloca para a direita</b>. Em 40 mmHg a saturação cai de 75% para cerca de 60%: a hemoglobina <b>solta mais O₂</b> justamente no músculo (efeito Bohr).' : 'Curva <b>sigmoide</b> (ligação cooperativa). Nos <b>pulmões</b> (pO₂ 80 a 120 mmHg) a saturação passa de 90% (~97%); no <b>sangue venoso</b> (pO₂ ~40) fica em ~75%. Arraste a pO₂ e compare com o exercício.'; }
  r.oninput = draw; seg($('#hbSeg'), v => { ex = v === 'e'; draw(); txt(); }); draw(); txt();
})();

/* ═════════ REVISÃO: NÉFRON ═════════ */
(function () {
  const svg = $('#nefSvg'), out = $('#nefOut'); if (!svg) return;
  const S = [
    ['Glomérulo', 'glom', '<b>Filtração</b> no glomérulo (dentro da cápsula de Bowman), sob alta pressão (~75 mmHg). Passam água, glicose, aminoácidos, sais e ureia; <b>células e proteínas grandes não passam</b>. É pressão hidrostática: não é osmose, difusão nem transporte ativo. O filtrado ≈ plasma sem células e proteínas.'],
    ['Túbulo proximal', 'prox', '<b>Reabsorção em massa</b>: 100% da glicose e dos aminoácidos voltam ao sangue por <b>transporte ativo</b>; a água acompanha por <b>osmose</b>. Glicemia alta demais (diabetes mellitus) passa do limite: glicose na urina.'],
    ['Alça de Henle', 'alca', 'Ramo descendente: a água sai por <b>osmose</b>. Ramo ascendente: <b>transporte ativo de NaCl</b> (impermeável à água). Cria o gradiente da medula que concentra a urina.'],
    ['Túbulo distal', 'dist', '<b>Secreção ativa</b> de excretas (ácido úrico, amônia, H⁺): do sangue para o filtrado. Ajuste fino: a <b>aldosterona</b> aumenta a reabsorção de <b>sódio</b> (a água vai junto) e sobe a pressão.'],
    ['Ducto coletor', 'col', 'Reabsorção final de água por <b>osmose</b>, via <b>aquaporinas</b> reguladas pelo <b>ADH</b>: urina concentrada. Álcool inibe o ADH: muita urina diluída.'],
    ['Urina', 'uri', 'Dos ~180 L de filtrado por dia, saem só ~1,5 L de <b>urina</b>: água, ureia (feita no fígado), sais, creatinina, ácido úrico. Glicose, proteínas ou hemácias na urina são sinal de problema. Caminho: pelve renal → ureter → bexiga → uretra.'],
  ];
  function draw(i) {
    const k = S[i][1], w = id => id === k ? 9 : 5, o = id => id === k ? 1 : .4;
    svg.innerHTML = `
      <g style="opacity:${o('glom')}"><circle cx="90" cy="70" r="40" style="fill:none;stroke:var(--label-2);stroke-width:3"/><path d="M70 60 q10 -20 20 0 t20 0 q-10 20 -20 0 t-20 0" style="fill:none;stroke:${C.verm};stroke-width:${w('glom')}"/></g>
      <path d="M130 70 C190 70 200 30 230 50 C260 70 230 100 270 100" style="fill:none;stroke:${C.amar};stroke-width:${w('prox')};opacity:${o('prox')}"/>
      <path d="M270 100 L300 225 Q315 245 330 225 L360 100" style="fill:none;stroke:${C.azul};stroke-width:${w('alca')};opacity:${o('alca')}"/>
      <path d="M360 100 C390 70 420 110 450 70" style="fill:none;stroke:${C.verde};stroke-width:${w('dist')};opacity:${o('dist')}"/>
      <path d="M450 70 L520 70 L520 240" style="fill:none;stroke:${C.roxo};stroke-width:${w('col')};opacity:${o('col')}"/>
      <path d="M520 240 L600 240" style="fill:none;stroke:#c9a227;stroke-width:${w('uri')};opacity:${o('uri')}"/>
      ${T(90, 130, 'glomérulo', 'middle')}${T(210, 30, 'túbulo proximal', 'middle')}${T(315, 260, 'alça de Henle', 'middle')}${T(410, 52, 'túbulo distal', 'middle')}${T(530, 150, 'ducto coletor')}${T(560, 228, 'urina', 'middle')}
      ${k === 'glom' ? T2(60, 160, '↓ filtrado: água, glicose, sais, ureia') : ''}
      ${k === 'prox' ? T2(160, 120, '↑ volta ao sangue: glicose, aminoácidos (ativo), água') : ''}${k === 'alca' ? T2(380, 200, 'desce: água sai · sobe: NaCl sai') : ''}
      ${k === 'dist' ? T2(380, 130, '↑ Na⁺ (aldosterona) · ↓ secreção de H⁺, amônia') : ''}
      ${k === 'col' ? T2(400, 200, '↑ água · ADH (aquaporinas)') : ''}`;
    out.innerHTML = S[i][2];
  }
  steps($('#nefSteps'), S.map((s, i) => `${i + 1}. ${s[0]}`), draw);
})();
