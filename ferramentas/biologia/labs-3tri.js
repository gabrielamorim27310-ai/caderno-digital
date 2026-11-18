/* Laboratórios de Biologia (3º tri + revisão). Só variáveis do ios.css: claro e escuro. */
(function () {
const $ = s => document.querySelector(s);
const cv = n => getComputedStyle(document.body).getPropertyValue(n).trim() || '#888';
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const F = (w = 600, s = 13) => `${w} ${s}px Inter,system-ui,sans-serif`;
const T = (x, y, s, a = 'start', c = 'var(--label)', w = 600, z = 13) => `<text x="${x}" y="${y}" text-anchor="${a}" style="fill:${c};font:${F(w, z)}">${s}</text>`;
const T2 = (x, y, s, a = 'start') => T(x, y, s, a, 'var(--label-2)', 500, 11.5);
const BOX = (x, y, w, h, st = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:var(--bg-2);stroke:var(--sep);stroke-width:1.5;${st}"/>`;
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

/* ═════════ REPRODUTOR MASCULINO ═════════ */
(function () {
  const svg = $('#rotaSvg'), out = $('#rotaOut'); if (!svg) return;
  let vas = false;
  const INFO = {
    testiculo: '<b>Testículo</b>: nos <b>túbulos seminíferos</b> são produzidos os espermatozoides; as células entre os túbulos fazem <b>testosterona</b>. Fica na bolsa escrotal, mais fria que o abdome.',
    epididimo: '<b>Epidídimo</b>: tubo enovelado sobre o testículo, onde os espermatozoides são <b>armazenados e amadurecem</b>.',
    deferente: '<b>Canal deferente</b>: leva os espermatozoides do epidídimo até a uretra. É o que se corta na <b>vasectomia</b>.',
    vesicula: '<b>Vesícula seminal</b>: produz o líquido seminal (cerca de 80% do sêmen), com <b>frutose</b> que dá energia aos espermatozoides.',
    prostata: '<b>Próstata</b>: líquido prostático (cerca de 20%), <b>alcalino</b>: neutraliza a acidez da vagina e ativa os espermatozoides.',
    uretra: '<b>Uretra</b>: canal comum aos sistemas <b>excretor e reprodutor</b> (urina e sêmen saem por ela).',
    bexiga: '<b>Bexiga</b>: guarda a urina (sistema excretor). Durante a ejaculação, o sêmen não se mistura com a urina.',
  };
  const ROTA = 'M175 205 C150 205 140 180 160 168 C178 156 190 130 196 110 C205 70 240 45 285 60 C330 75 330 125 345 150 C352 165 360 180 360 200 L360 248';
  function draw() {
    const part = (id, d, st) => `<g class="pt" data-id="${id}" style="cursor:pointer">${d.replace('/>', ` style="${st}"/>`)}</g>`;
    svg.innerHTML = `
      ${part('bexiga', '<ellipse cx="300" cy="105" rx="44" ry="34"/>', 'fill:#f3d36b;opacity:.55;stroke:#c9a227;stroke-width:2')}
      ${part('vesicula', '<path d="M330 125 q24 -10 30 10 q-4 18 -24 14 z"/>', 'fill:#b58ad6;stroke:#7d4fa6;stroke-width:2')}
      ${part('prostata', '<ellipse cx="345" cy="168" rx="26" ry="16"/>', 'fill:#e38c6b;stroke:#b45a3a;stroke-width:2')}
      ${part('testiculo', '<ellipse cx="175" cy="218" rx="34" ry="24"/>', 'fill:#f2b8a0;stroke:#c97b5d;stroke-width:2')}
      <path d="M152 214 q6 -8 12 0 t12 0 t12 0 t12 0" style="fill:none;stroke:#c97b5d;stroke-width:1.5;pointer-events:none"/>
      ${part('epididimo', '<path d="M150 200 q-10 -26 20 -34 q14 -2 12 10" />', 'fill:none;stroke:#a35f3f;stroke-width:7;stroke-linecap:round')}
      <g class="pt" data-id="deferente" style="cursor:pointer"><path id="rotaPath" d="${ROTA}" style="fill:none;stroke:#5b8fd1;stroke-width:5;stroke-linecap:round;opacity:.85"/></g>
      ${part('uretra', '<path d="M360 200 L360 252"/>', 'stroke:#c9a227;stroke-width:8;stroke-linecap:round')}
      ${vas ? '<g><line x1="186" y1="118" x2="208" y2="128" style="stroke:var(--red);stroke-width:3"/><line x1="182" y1="128" x2="204" y2="138" style="stroke:var(--red);stroke-width:3"/>' + T(214, 128, '✂ corte', 'start', 'var(--red)', 700, 12) + '</g>' : ''}
      ${T(118, 252, 'testículo', 'middle')}${T(108, 168, 'epidídimo', 'middle')}${T(228, 40, 'canal deferente', 'middle')}
      ${T(300, 108, 'bexiga', 'middle')}${T(372, 125, 'vesícula seminal')}${T(380, 175, 'próstata')}${T(372, 242, 'uretra')}
      <g id="rotaDots"></g>
      ${BOX(492, 150, 140, 96)}${T(502, 172, 'Sêmen que sai:')}
      <g id="rotaSemen">${T2(502, 194, '—')}</g>`;
    svg.querySelectorAll('.pt').forEach(g => g.onclick = () => { out.innerHTML = INFO[g.dataset.id]; svg.querySelectorAll('.pt').forEach(x => x.style.opacity = x === g ? 1 : .55); });
  }
  function go() {
    draw();
    const p = svg.querySelector('#rotaPath'), L = p.getTotalLength(), dots = svg.querySelector('#rotaDots');
    const N = 7, cut = L * .24;
    anim(2600, t => {
      let s = '';
      for (let k = 0; k < N; k++) {
        let d = Math.max(0, t * L * 1.25 - k * 18);
        if (vas && d > cut) d = cut - k * 3;
        if (d <= 0 || d >= L) continue;
        const q = p.getPointAtLength(d);
        s += `<circle cx="${q.x}" cy="${q.y}" r="4.5" style="fill:#3b62a8;opacity:${vas && d >= cut - 20 ? .6 - t * .5 : 1}"/>`;
      }
      if (t > .55) { // líquidos entram
        const a = (t - .55) / .45;
        s += `<circle cx="${352 + 6 * a}" cy="${145 + 40 * a}" r="4" style="fill:#7d4fa6"/><circle cx="${360}" cy="${175 + 50 * a}" r="4" style="fill:#b45a3a"/>`;
      }
      dots.innerHTML = s;
    }, () => {
      svg.querySelector('#rotaSemen').innerHTML = vas
        ? T2(502, 194, '✗ espermatozoides') + T2(502, 212, '✓ líquido da vesícula') + T2(502, 230, '✓ líquido da próstata')
        : T2(502, 194, '✓ espermatozoides') + T2(502, 212, '✓ líquido da vesícula') + T2(502, 230, '✓ líquido da próstata');
      out.innerHTML = vas
        ? '<b>Vasectomia</b>: os espermatozoides continuam sendo produzidos, mas param no corte do <b>canal deferente</b> e são <b>reabsorvidos</b>. A ejaculação continua, com sêmen <b>sem espermatozoides</b>. Testículos, FSH, LH e testosterona não mudam.'
        : 'Rota: <b>túbulos seminíferos → epidídimo → canal deferente → uretra</b>. No caminho entram o líquido da <b>vesícula seminal</b> e o da <b>próstata</b>. Sêmen = espermatozoides + líquidos.';
    });
  }
  $('#rotaGo').onclick = go;
  seg($('#rotaSeg'), v => { vas = v === 'v'; draw(); out.innerHTML = vas ? 'O canal deferente foi cortado. Clique em <b>Ejacular</b>.' : 'Clique numa estrutura ou em <b>Ejacular</b>.'; });
  draw();
})();

(function () {
  const svg = $('#eixoMSvg'), out = $('#eixoMOut'); if (!svg) return;
  const S = [
    { v: [.6, .6, .8, .7, .7, .8], fb: .5, t: '<b>Normal</b>: o hipotálamo estimula a adeno-hipófise; o <b>FSH</b> estimula a produção de espermatozoides nos túbulos e o <b>LH</b> a de testosterona. A testosterona faz <b>feedback negativo</b> (seta vermelha) e mantém tudo estável.' },
    { v: [.1, .1, .05, .1, .95, .05], fb: 1, t: '<b>Injeção de testosterona</b> (anticoncepcional masculino): a testosterona alta inibe, por feedback negativo, hipotálamo e hipófise. <b>Sem FSH</b>, para a produção de espermatozoides; <b>sem LH</b>, cai a testosterona própria, mas a injetada mantém as características masculinas.' },
    { v: [.6, .6, .8, .7, .7, 0], fb: .5, t: '<b>Vasectomia</b>: nada muda no eixo hormonal. FSH, LH, testosterona e produção de espermatozoides continuam iguais; só o <b>sêmen sai sem espermatozoides</b>, porque o canal deferente foi cortado.' },
  ];
  const nomes = ['FSH', 'LH', 'Produção de espermatozoides', 'Testosterona do testículo', 'Testosterona no sangue', 'Espermatozoides no sêmen'];
  const cores = [C.verde, C.verm, C.azul, C.amar, C.lar, C.roxo];
  let cur = S[0].v.slice();
  function draw(i) {
    const alvo = S[i].v, ini = cur.slice();
    anim(500, p => {
      cur = ini.map((a, k) => a + (alvo[k] - a) * p);
      svg.innerHTML = `<defs><marker id="emA" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" style="fill:var(--label-2)"/></marker><marker id="emB" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" style="fill:var(--red)"/></marker></defs>
        ${BOX(20, 20, 130, 40)}${T(85, 45, 'Hipotálamo', 'middle')}
        ${BOX(20, 95, 130, 40)}${T(85, 120, 'Adeno-hipófise', 'middle')}
        ${BOX(20, 170, 130, 40)}${T(85, 195, 'Testículos', 'middle')}
        <path d="M85 62 V92 M85 137 V167" style="stroke:var(--label-2);stroke-width:2.5;marker-end:url(#emA)"/>
        <path d="M150 190 C200 190 200 40 152 40" style="fill:none;stroke:var(--red);stroke-width:${1 + S[i].fb * 4};stroke-dasharray:6 5;marker-end:url(#emB)"/>
        ${T(196, 112, '−', 'middle', 'var(--red)', 800, 20)}
        ${nomes.map((n, k) => { const y = 26 + k * 33; return T(250, y + 14, n) + `<rect x="430" y="${y}" width="190" height="18" rx="9" style="fill:var(--bg-2);stroke:var(--sep)"/><rect x="430" y="${y}" width="${Math.max(4, 190 * cur[k])}" height="18" rx="9" style="fill:${cores[k]}"/>`; }).join('')}`;
    });
    out.innerHTML = S[i].t;
  }
  seg($('#eixoMSeg'), v => draw(+v)); draw(0);
})();

/* ═════════ CICLO MENSTRUAL ═════════ */
(function () {
  const c = $('#cicloCv'), r = $('#cicloR'), out = $('#cicloOut'); if (!c) return;
  const g = c.getContext('2d'); let modo = 'normal';
  const gs = (d, m, s) => Math.exp(-((d - m) ** 2) / (2 * s * s));
  const H = {
    normal: d => ({
      FSH: .22 + .18 * gs(d, 4, 3) + .32 * gs(d, 13.5, 1.1) - .08 * gs(d, 21, 4) + .12 * gs(d, 28, 2),
      LH: .14 + .86 * gs(d, 13.8, .9) - .05 * gs(d, 21, 4),
      Estrógeno: .14 + .78 * gs(d, 12.5, 2.6) + .38 * gs(d, 21.5, 3),
      Progesterona: .05 + .85 * gs(d, 21.5, 3.2),
      end: d <= 5 ? .62 - .1 * d : d <= 14 ? .12 + (d - 5) * .055 : d <= 25 ? Math.min(1, .62 + (d - 14) * .05) : 1 - (d - 25) * .25,
    }),
    gravidez: d => d < 20 ? H.normal(d) : ({
      FSH: .1, LH: .1, Estrógeno: .55 + (d - 20) * .03, Progesterona: .9 + (d - 20) * .01, HCG: Math.min(1, (d - 20) * .12), end: 1,
    }),
    pilula: d => ({ FSH: .14, LH: .12, Estrógeno: d <= 21 ? .6 : .1, Progesterona: d <= 21 ? .65 : .08, end: d <= 3 ? .3 : d <= 21 ? Math.min(.75, .3 + d * .03) : .3 }),
    menopausa: () => ({ FSH: .95, LH: .8, Estrógeno: .05, Progesterona: .04, end: .12 }),
  };
  const COR = { FSH: C.verde, LH: C.verm, Estrógeno: C.roxo, Progesterona: C.amar, HCG: C.azul };
  function texto(d) {
    if (modo === 'menopausa') return '<b>Menopausa</b>: os ovários esgotaram os folículos e quase não produzem estrógeno e progesterona. <b>Sem feedback negativo</b>, a hipófise libera FSH e LH em quantidade alta, mas sem efeito: não há folículos para responder.';
    if (modo === 'pilula') return d <= 21 ? `Dia ${d} da cartela: hormônios sintéticos parecidos com <b>estrógeno e progesterona</b> ficam altos e, por <b>feedback negativo</b>, mantêm <b>FSH e LH baixos e sem pico</b>. O folículo não amadurece: <b>sem ovulação</b>.` : `Pausa (dia ${d}): os hormônios caem e o endométrio descama: há <b>sangramento</b>, mas não houve ovulação.`;
    if (modo === 'gravidez' && d >= 20) return `Dia ${d}: houve fecundação e <b>nidação</b>. O trofoblasto (futura placenta) produz <b>HCG</b>, que mantém o <b>corpo lúteo</b> fazendo progesterona e estrógeno. O endométrio <b>não descama</b>: sem menstruação. (Teste de gravidez detecta HCG na urina.)`;
    if (d <= 5) return `Dia ${d}: <b>menstruação</b>. Estrógeno e progesterona baixos: o endométrio descama. Sem o feedback negativo, o <b>FSH</b> começa a subir.`;
    if (d <= 12) return `Dia ${d}: <b>fase folicular</b>. O FSH faz o folículo crescer; o folículo produz <b>estrógeno</b>, que reconstrói o endométrio.`;
    if (d <= 15) return `Dia ${d}: <b>ovulação</b> (por volta do 14º dia). O estrógeno alto provoca o <b>pico de LH</b> (o pico fino e alto do gráfico): o <b>ovócito II</b> é liberado na tuba.`;
    if (d <= 25) return `Dia ${d}: <b>fase lútea</b>. O folículo vazio vira <b>corpo lúteo</b> e produz <b>progesterona</b> (a curva larga). O endométrio fica espesso e vascularizado. Estrógeno e progesterona altos <b>inibem FSH e LH</b>.`;
    return `Dia ${d}: sem fecundação e sem LH, o <b>corpo lúteo degenera</b>, a progesterona cai e o endométrio vai descamar: nova menstruação. ${modo === 'gravidez' ? '' : ''}`;
  }
  function ovario(x, y, d) {
    g.save(); g.translate(x, y);
    g.fillStyle = '#f2c4b5'; g.beginPath(); g.ellipse(0, 0, 38, 26, 0, 0, 7); g.fill();
    if (modo === 'menopausa') { g.restore(); return; }
    if (modo === 'pilula') { g.fillStyle = '#d8a090'; g.beginPath(); g.arc(-8, 2, 6, 0, 7); g.fill(); g.restore(); return; }
    if (d < 14) { const r = 5 + d * 1.2; g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.fillStyle = '#e07a8a'; g.beginPath(); g.arc(r * .3, 0, 4, 0, 7); g.fill(); }
    else if (d === 14) { g.fillStyle = '#e07a8a'; g.beginPath(); g.arc(44, -18, 5, 0, 7); g.fill(); g.strokeStyle = '#e07a8a'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.stroke(); }
    else { const viva = modo === 'gravidez' || d <= 25, r = viva ? 16 : 16 - (d - 25) * 4; g.fillStyle = viva ? '#f5bf3c' : '#c9b08a'; g.beginPath(); g.arc(0, 0, Math.max(3, r), 0, 7); g.fill(); }
    g.restore();
  }
  function draw() {
    const d = +r.value, W = 760, x0 = 50, x1 = 560, y0 = 26, y1 = 210;
    const X = dd => x0 + (dd - 1) / 27 * (x1 - x0), Y = v => y1 - v * (y1 - y0);
    g.clearRect(0, 0, W, 330);
    g.font = F(500, 11); g.fillStyle = cv('--label-2');
    for (let dd = 1; dd <= 28; dd += 3) g.fillText(dd, X(dd) - 4, y1 + 16);
    g.strokeStyle = cv('--sep'); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x1, y1); g.stroke();
    // faixas
    if (modo !== 'menopausa' && modo !== 'pilula') { g.fillStyle = 'rgba(217,83,79,.10)'; g.fillRect(X(1), y0, X(5) - X(1), y1 - y0); g.fillStyle = cv('--label-2'); g.fillText('menstruação', X(1) + 4, y0 + 12); }
    const keys = Object.keys(H[modo](25)).filter(k => k !== 'end').concat(modo === 'gravidez' ? [] : []);
    const all = modo === 'gravidez' ? ['FSH', 'LH', 'Estrógeno', 'Progesterona', 'HCG'] : keys;
    all.forEach(k => {
      g.strokeStyle = COR[k]; g.lineWidth = 3; g.beginPath(); let first = true;
      for (let dd = 1; dd <= 28; dd += .25) { const v = H[modo](dd)[k]; if (v === undefined) { first = true; continue; } const px = X(dd), py = Y(Math.max(0, Math.min(1, v))); first ? g.moveTo(px, py) : g.lineTo(px, py); first = false; }
      g.stroke();
    });
    // cursor
    g.strokeStyle = cv('--label'); g.setLineDash([4, 4]); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(d), y0); g.lineTo(X(d), 300); g.stroke(); g.setLineDash([]);
    // endométrio
    const e = H[modo](d).end;
    g.fillStyle = cv('--label-2'); g.font = F(600, 11.5); g.fillText('endométrio', x0, 238);
    for (let dd = 1; dd <= 28; dd += .5) { const ee = H[modo](dd).end; g.fillStyle = 'rgba(200,70,90,' + (.25 + ee * .6) + ')'; g.fillRect(X(dd), 300 - ee * 50, X(1.5) - X(1) + 1, ee * 50); }
    // legenda + valores
    const vals = H[modo](d);
    g.font = F(600, 12.5);
    all.forEach((k, i) => { const y = 40 + i * 24; g.fillStyle = COR[k]; g.fillRect(585, y - 10, 12, 12); g.fillStyle = cv('--label'); g.fillText(k, 604, y); const v = vals[k]; g.fillStyle = cv('--label-2'); g.fillText(v === undefined ? '—' : v > .6 ? 'alto' : v > .3 ? 'médio' : 'baixo', 700, y); });
    g.fillStyle = cv('--label'); g.font = F(700, 13); g.fillText('Ovário · dia ' + d, 585, 185);
    ovario(650, 240, d);
  }
  r.oninput = () => { draw(); out.innerHTML = texto(+r.value); };
  seg($('#cicloSeg'), v => { modo = v; if (v === 'gravidez' && +r.value < 20) r.value = 24; draw(); out.innerHTML = texto(+r.value); });
  let it; $('#cicloPlay').onclick = () => { clearInterval(it); r.value = 1; it = setInterval(() => { r.value = +r.value + 1; r.oninput(); if (+r.value >= 28) clearInterval(it); }, 380); };
  draw(); out.innerHTML = texto(1);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
})();

/* ═════════ GÊMEOS ═════════ */
(function () {
  const svg = $('#gemSvg'), out = $('#gemOut'); if (!svg) return;
  let tipo = 'mono';
  const ovo = (x, y, r, cor) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${cor};stroke:rgba(0,0,0,.25);stroke-width:2"/><circle cx="${x}" cy="${y}" r="${r * .3}" style="fill:rgba(0,0,0,.18)"/>`;
  const esp = (x, y, cor = '#3b62a8') => `<g transform="translate(${x},${y})"><ellipse rx="7" ry="5" style="fill:${cor}"/><path d="M-7 0 q-10 -6 -20 0 t-18 0" style="fill:none;stroke:${cor};stroke-width:2"/></g>`;
  function cena(k) {
    const mono = tipo === 'mono'; let s = '';
    if (k === 0) s = mono ? ovo(320, 110, 34, '#f6c7d0') + T2(320, 170, '1 ovócito II', 'middle') : ovo(240, 110, 30, '#f6c7d0') + ovo(400, 110, 30, '#f9d9a8') + T2(320, 170, '2 ovócitos no mesmo ciclo', 'middle');
    if (k === 1) s = mono ? ovo(320, 110, 34, '#f6c7d0') + esp(270, 110) : ovo(240, 110, 30, '#f6c7d0') + ovo(400, 110, 30, '#f9d9a8') + esp(195, 110) + esp(355, 110, '#2e7d8a');
    if (k === 2) s = mono ? ovo(320, 110, 30, '#e8a3b5') + T2(320, 170, '1 zigoto', 'middle') : ovo(240, 110, 26, '#e8a3b5') + ovo(400, 110, 26, '#e8c58a') + T2(320, 170, '2 zigotos diferentes', 'middle');
    if (k === 3) s = mono ? ovo(285, 110, 24, '#e8a3b5') + ovo(355, 110, 24, '#e8a3b5') + T2(320, 170, 'o zigoto se divide em 2 massas de células', 'middle') : ovo(240, 110, 26, '#e8a3b5') + ovo(400, 110, 26, '#e8c58a') + T2(320, 170, 'cada zigoto vira um embrião', 'middle');
    if (k === 4) { const bebe = (x, cor, sx) => `<g transform="translate(${x},100)"><circle cy="-22" r="16" style="fill:${cor}"/><rect x="-16" y="-4" width="32" height="40" rx="14" style="fill:${cor}"/>${T(0, 60, sx, 'middle', 'var(--label)', 700, 12)}</g>`;
      s = mono ? bebe(270, '#e8a3b5', 'mesmo DNA') + bebe(370, '#e8a3b5', 'mesmo sexo') : bebe(240, '#e8a3b5', 'menina') + bebe(400, '#8fb7e8', 'menino'); }
    svg.innerHTML = `<g style="animation:labIn .35s both">${s}</g>` + T(16, 24, ['Ovulação', 'Fecundação', 'Zigoto', 'Divisão', 'Gêmeos'][k]);
    out.innerHTML = mono
      ? ['Um único ovócito II é liberado.', 'Um espermatozoide fecunda o ovócito.', '<b>1 zigoto</b>.', 'O zigoto (ou o embrião inicial) <b>se divide em duas massas de células</b>.', '<b>Monozigóticos</b> (idênticos, univitelinos): mesmo material genético, <b>mesmo sexo</b> e muito parecidos.'][k]
      : ['<b>Dois ovócitos</b> são liberados no mesmo ciclo.', 'Cada um é fecundado por um <b>espermatozoide diferente</b>.', '<b>2 zigotos</b>, geneticamente diferentes.', 'Cada zigoto forma um embrião.', '<b>Dizigóticos</b> (fraternos, bivitelinos): irmãos comuns que nasceram juntos; <b>podem ter sexos diferentes</b>.'][k];
  }
  let tm = [];
  function go() { tm.forEach(clearTimeout); tm = [0, 1, 2, 3, 4].map(k => setTimeout(() => cena(k), k * 1100)); }
  $('#gemGo').onclick = go; seg($('#gemSeg'), v => { tipo = v; tm.forEach(clearTimeout); cena(0); }); cena(0);
})();

/* ═════════ TABELINHA ═════════ */
(function () {
  const r = $('#tabR'), cal = $('#tabCal'), out = $('#tabOut'); if (!r) return;
  function draw() {
    const L = +r.value, o1 = L - 17, o2 = L - 13, f1 = Math.max(1, o1 - 3), f2 = o2 + 3;
    $('#tabN').textContent = L + ' dias';
    let s = '';
    for (let d = 1; d <= L; d++) {
      const men = d <= 5, ov = d >= o1 && d <= o2, fe = d >= f1 && d <= f2;
      const bg = ov ? 'var(--red)' : fe ? 'var(--orange)' : men ? 'rgba(200,70,90,.35)' : 'var(--bg-2)';
      s += `<div style="aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font-weight:700;font-size:.85rem;background:${bg};color:${ov || fe ? '#fff' : 'var(--label)'};border:1px solid var(--sep);position:relative">${d}${men ? '<span style="position:absolute;bottom:2px;font-size:.55rem">🩸</span>' : ''}</div>`;
    }
    cal.innerHTML = s;
    const sobre = f1 <= 5;
    out.innerHTML = `<span style="color:var(--red)">■</span> ovulação provável: dias <b>${o1} a ${o2}</b> · <span style="color:var(--orange)">■</span> período fértil (3 dias antes e 3 depois): <b>${f1} a ${f2}</b>. ` +
      (sobre ? '<br>⚠ Ciclo curto: o período fértil <b>encosta na menstruação</b>. Por isso dá para engravidar menstruada (o espermatozoide vive cerca de 3 dias).' : '') +
      '<br><small>A tabelinha falha muito porque os ciclos variam: é indicada para quem quer engravidar, não como contraceptivo.</small>';
  }
  r.oninput = draw; draw();
})();

sorter($('#sortContra'), [
  ['Pílula anticoncepcional', 'Impede a ovulação', 'Estrógeno e progesterona sintéticos altos inibem FSH e LH (feedback negativo): sem pico de LH, sem ovulação.'],
  ['Laqueadura', 'Impede o encontro dos gametas', 'Corta ou amarra as tubas uterinas. A mulher continua ovulando e menstruando.'],
  ['Vasectomia', 'Impede o encontro dos gametas', 'Corta os canais deferentes: o sêmen sai sem espermatozoides.'],
  ['Tabelinha', 'Evita o período fértil', 'Método comportamental: evitar relações perto da ovulação. Falha muito.'],
  ['Injeção mensal de testosterona (em teste)', 'Impede a produção de espermatozoides', 'Testosterona alta inibe FSH e LH; sem FSH, os túbulos param de produzir espermatozoides.'],
], ['Impede a ovulação', 'Impede o encontro dos gametas', 'Impede a produção de espermatozoides', 'Evita o período fértil']);

/* ═════════ SISTEMA NERVOSO: ORGANIZAÇÃO ═════════ */
sorter($('#sortSN'), [
  ['Cérebro', 'SNC', 'Encéfalo: atos voluntários, memória, linguagem.'],
  ['Cerebelo', 'SNC', 'Encéfalo: equilíbrio e coordenação.'],
  ['Bulbo', 'SNC', 'Tronco encefálico: respiração, batimentos.'],
  ['Hipotálamo', 'SNC', 'Encéfalo: temperatura, fome, sede; comanda a hipófise.'],
  ['Medula espinal', 'SNC', 'Conduz impulsos e elabora os atos reflexos.'],
  ['Gânglio nervoso', 'SNP', 'Corpos celulares de neurônios fora do SNC.'],
  ['Nervo', 'SNP', 'Feixe de axônios fora do encéfalo e da medula.'],
  ['Receptor sensorial', 'SNP', 'Transforma estímulos em impulsos elétricos.'],
  ['Nervo que leva informação do receptor ao SNC', 'Nervo sensitivo', 'Sensitivo = aferente.'],
  ['Nervo que leva ordens do SNC ao músculo', 'Nervo motor', 'Motor = eferente.'],
  ['Nervo trigêmeo / nervos espinais', 'Nervo misto', 'Têm fibras sensitivas e motoras.'],
], ['SNC', 'SNP', 'Nervo sensitivo', 'Nervo motor', 'Nervo misto']);

/* ═════════ POTENCIAL DE AÇÃO ═════════ */
(function () {
  const c = $('#paCv'), out = $('#paOut'); if (!c) return;
  const g = c.getContext('2d'); let modo = 'n', perdas = 0, trace = [], fase = 'repouso';
  const x0 = 60, x1 = 520, Y = v => 30 + (50 - v) / 140 * 230; // +50 .. -90
  function curva(s) {
    const rep = modo === 'atp' ? -70 + perdas * 14 : -70;
    const local = rep + s * .35, limiar = -55;
    const pico = modo === 'atp' ? 40 - perdas * 28 : 40;
    const dispara = modo !== 'anest' && local >= limiar && pico > limiar;
    const pts = [];
    for (let t = 0; t <= 10; t += .05) {
      let v = rep;
      if (t > 1) {
        const u = t - 1;
        if (!dispara) v = rep + (local - rep) * Math.exp(-((u - .4) ** 2) / .12);
        else if (u < .5) v = rep + (local - rep) * (u / .5);
        else if (u < 1.2) v = local + (pico - local) * ((u - .5) / .7);
        else if (u < 2.6) v = pico + (-82 - pico) * ((u - 1.2) / 1.4);
        else v = -82 + (rep + (modo === 'atp' ? 14 : 0) + 82) * (1 - Math.exp(-(u - 2.6) / 1.2));
      }
      pts.push([t, v]);
    }
    return { pts, dispara, local, rep };
  }
  function membrana(estado) {
    const bx = 545, by = 40;
    g.fillStyle = cv('--label'); g.font = F(700, 13); g.fillText('Membrana agora', bx, by);
    const sinais = { repouso: ['+', '−'], desp: ['−', '+'], rep: ['+', '−'], hiper: ['+', '−'] }[estado];
    g.fillStyle = 'rgba(59,130,196,.12)'; g.fillRect(bx, by + 14, 200, 56); g.fillStyle = 'rgba(227,162,26,.15)'; g.fillRect(bx, by + 94, 200, 56);
    g.fillStyle = cv('--label-2'); g.font = F(600, 11); g.fillText('FORA', bx + 6, by + 28); g.fillText('DENTRO', bx + 6, by + 146);
    g.fillStyle = '#8a7a6a'; g.fillRect(bx, by + 72, 200, 18);
    g.font = F(800, 18);
    for (let i = 0; i < 5; i++) { g.fillStyle = sinais[0] === '+' ? C.verm : C.azul; g.fillText(sinais[0], bx + 60 + i * 28, by + 62); g.fillStyle = sinais[1] === '+' ? C.verm : C.azul; g.fillText(sinais[1], bx + 60 + i * 28, by + 112); }
    g.font = F(600, 11.5); g.fillStyle = cv('--label');
    const lab = { repouso: ['Polarizado (repouso)', 'bomba Na⁺/K⁺: transporte ATIVO'], desp: ['Despolarizado', 'Na⁺ ENTRA por canais: PASSIVO'], rep: ['Repolarizando', 'K⁺ SAI: PASSIVO'], hiper: ['Hiperpolarização', 'bomba restaura: ATIVO (ATP)'] }[estado];
    g.fillText(lab[0], bx, by + 176); g.fillStyle = cv('--label-2'); g.fillText(lab[1], bx, by + 194);
    if (estado === 'desp') { g.fillStyle = C.verm; g.font = F(700, 12); g.fillText('Na⁺ ↓', bx + 160, by + 86); }
    if (estado === 'rep') { g.fillStyle = C.azul; g.font = F(700, 12); g.fillText('K⁺ ↑', bx + 160, by + 86); }
    if (estado === 'repouso' || estado === 'hiper') { g.fillStyle = C.amar; g.font = F(700, 11); g.fillText('3Na⁺↑ 2K⁺↓', bx + 128, by + 86); }
  }
  function draw(n) {
    g.clearRect(0, 0, 760, 300);
    g.strokeStyle = cv('--sep'); g.lineWidth = 1; g.font = F(500, 11); g.fillStyle = cv('--label-2');
    [40, 0, -55, -70].forEach(v => { g.beginPath(); g.setLineDash(v === -55 ? [5, 4] : []); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); g.fillText((v > 0 ? '+' : '') + v + ' mV', 8, Y(v) + 4); });
    g.setLineDash([]); g.fillStyle = cv('--label-2'); g.fillText('limiar', x1 - 34, Y(-55) - 5); g.fillText('tempo (ms) →', x1 - 70, 286);
    if (trace.length) {
      g.strokeStyle = cv('--tint'); g.lineWidth = 3; g.beginPath();
      trace.slice(0, n).forEach(([t, v], i) => { const px = x0 + t / 10 * (x1 - x0), py = Y(v); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
      const last = trace[Math.max(0, Math.min(n, trace.length) - 1)], prev = trace[Math.max(0, Math.min(n, trace.length) - 3)];
      fase = last[1] > -55 && last[1] >= prev[1] ? 'desp' : last[1] > -70 && last[1] < prev[1] - .01 ? 'rep' : last[1] < -72 ? 'hiper' : 'repouso';
    }
    membrana(fase);
  }
  function stim() {
    const s = +$('#paR').value, res = curva(s); trace = res.pts;
    anim(2200, p => draw(Math.round(p * trace.length)), () => {
      fase = 'repouso'; draw(trace.length);
      if (modo === 'anest') out.innerHTML = '<b>Pomada anestésica</b>: os canais de sódio ficam fechados. Sem entrada de Na⁺ não há despolarização, logo <b>não há potencial de ação</b>: a dor não chega ao SNC, por mais forte que seja o estímulo.';
      else if (!res.dispara && modo === 'atp' && perdas >= 2) out.innerHTML = '<b>Sem ATP</b>, a bomba de sódio e potássio parou: as concentrações não foram restauradas, a membrana foi perdendo a polarização e <b>o neurônio não consegue mais disparar</b>.';
      else if (!res.dispara) out.innerHTML = `Estímulo fraco: a membrana mudou um pouco, mas <b>não atingiu o limiar</b> (cerca de −55 mV). Não houve potencial de ação. É a lei do <b>tudo ou nada</b>: ou dispara inteiro, ou não dispara.`;
      else {
        out.innerHTML = '<b>Potencial de ação!</b> Repouso em −70 mV (<b>polarizado</b>, fora +, dentro −, mantido pela bomba: ativo) → canais de Na⁺ abrem e o Na⁺ entra (<b>despolarização</b>, até cerca de +40 mV: passivo) → K⁺ sai (<b>repolarização</b>: passivo) → passa abaixo de −70 (hiperpolarização, período refratário) → a bomba restaura (ativo).' + (modo === 'atp' ? ' <br>⚠ <b>Sem ATP</b>: a bomba não restaurou tudo. Estimule de novo.' : ' <small>Aumentar o estímulo acima do limiar não aumenta o pico (tudo ou nada).</small>');
        if (modo === 'atp') perdas++;
      }
    });
  }
  $('#paGo').onclick = stim;
  seg($('#paSeg'), v => { modo = v; perdas = 0; trace = []; draw(0); out.innerHTML = { n: 'Escolha a intensidade e estimule. Tente um estímulo fraco e um forte.', anest: 'Canais de sódio bloqueados. Estimule com força máxima.', atp: 'A bomba de sódio e potássio não tem ATP. Estimule algumas vezes seguidas.' }[v]; });
  draw(0); out.innerHTML = 'Escolha a intensidade e estimule. Tente um estímulo fraco e um forte.';
})();

/* ═════════ MIELINA ═════════ */
(function () {
  const c = $('#mieCv'), out = $('#mieOut'); if (!c) return;
  const g = c.getContext('2d'), x0 = 70, x1 = 720, nos = 8;
  function base(pa, pb) {
    g.clearRect(0, 0, 760, 230);
    g.font = F(700, 13); g.fillStyle = cv('--label');
    g.fillText('Com mielina: condução saltatória', 16, 26); g.fillText('Sem mielina: condução contínua', 16, 136);
    // axônio A
    g.strokeStyle = cv('--label-2'); g.lineWidth = 6; g.beginPath(); g.moveTo(x0, 70); g.lineTo(x1, 70); g.moveTo(x0, 180); g.lineTo(x1, 180); g.stroke();
    const passo = (x1 - x0) / nos;
    for (let i = 0; i < nos; i++) { g.fillStyle = '#f0e2b6'; g.strokeStyle = '#c8b27a'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(x0 + i * passo + 6, 56, passo - 12, 28, 12); g.fill(); g.stroke(); }
    g.fillStyle = cv('--label-2'); g.font = F(500, 11); g.fillText('bainha de mielina', x0 + 10, 102); g.fillText('nódulo de Ranvier ↑', x0 + passo - 30, 118);
    // impulso A: salta de nó em nó
    if (pa >= 0) { const k = Math.min(nos, Math.floor(pa * nos + .001)); for (let i = 0; i <= k; i++) { const x = x0 + i * passo; g.fillStyle = i === k ? C.verm : 'rgba(217,83,79,.35)'; g.beginPath(); g.arc(x, 70, i === k ? 9 : 5, 0, 7); g.fill(); }
      if (k < nos) { const f = pa * nos - k; g.strokeStyle = 'rgba(217,83,79,.6)'; g.lineWidth = 2; g.beginPath(); const xa = x0 + k * passo; g.moveTo(xa, 52); g.quadraticCurveTo(xa + passo / 2, 20, xa + passo * Math.min(1, f * 1.2), 52); g.stroke(); } }
    if (pb >= 0) { const x = x0 + pb * (x1 - x0); const gr = g.createLinearGradient(x - 120, 0, x, 0); gr.addColorStop(0, 'rgba(217,83,79,0)'); gr.addColorStop(1, 'rgba(217,83,79,.8)'); g.strokeStyle = gr; g.lineWidth = 10; g.beginPath(); g.moveTo(Math.max(x0, x - 120), 180); g.lineTo(x, 180); g.stroke(); g.fillStyle = C.verm; g.beginPath(); g.arc(x, 180, 9, 0, 7); g.fill(); }
  }
  base(-1, -1);
  $('#mieGo').onclick = () => {
    const TA = 900, TB = 3200, t0 = performance.now();
    out.textContent = 'Correndo...';
    const f = t => { const e = t - t0; base(Math.min(1, e / TA), Math.min(1, e / TB)); if (e < TB) requestAnimationFrame(f); else out.innerHTML = '<b>Com mielina</b>: a mielina isola o axônio; a despolarização só acontece nos <b>nódulos de Ranvier</b> e o impulso "salta" de nó em nó: <b>muito mais rápida</b> e gasta menos energia. <b>Sem mielina</b>: a despolarização percorre toda a membrana, trecho a trecho: mais lenta.'; };
    if (RM) { base(1, 1); out.innerHTML = 'Com mielina chega bem antes (condução saltatória).'; } else requestAnimationFrame(f);
  };
})();

/* ═════════ SINAPSE ═════════ */
(function () {
  const c = $('#sinCv'), out = $('#sinOut'); if (!c) return;
  const g = c.getContext('2d'); let modo = 'n', P = [], rodando = false;
  const recs = [90, 130, 170, 210];
  function cena(t, fase) {
    g.clearRect(0, 0, 760, 300);
    // pré-sináptico
    g.fillStyle = 'rgba(142,68,173,.18)'; g.strokeStyle = C.roxo; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 125); g.lineTo(220, 125); g.bezierCurveTo(300, 60, 360, 90, 360, 150); g.bezierCurveTo(360, 210, 300, 240, 220, 175); g.lineTo(0, 175); g.fill(); g.stroke();
    // pós-sináptico (músculo)
    const contr = fase === 'contrai' ? 18 * Math.sin(Math.min(1, t) * Math.PI) : 0;
    g.fillStyle = 'rgba(217,83,79,.18)'; g.strokeStyle = C.verm; g.beginPath(); g.roundRect(410 + contr, 40 + contr * .4, 330 - contr * 2, 220 - contr * .8, 18); g.fill(); g.stroke();
    for (let i = 0; i < 6; i++) { g.strokeStyle = 'rgba(217,83,79,.35)'; g.beginPath(); g.moveTo(440 + contr, 70 + i * 30); g.lineTo(720 - contr, 70 + i * 30); g.stroke(); }
    // receptores
    recs.forEach((y, i) => { const lig = fase === 'liga' || fase === 'contrai'; g.fillStyle = modo === 'curare' ? C.cinza : lig ? C.verde : '#6aa889'; g.fillRect(404, y - 6 + 30, 10, 18);
      if (modo === 'curare') { g.fillStyle = C.verm; g.beginPath(); g.moveTo(398, y + 30); g.lineTo(390, y + 24); g.lineTo(390, y + 36); g.fill(); } });
    // vesículas
    for (let i = 0; i < 5; i++) { const vx = 270 + (i % 3) * 25 + (fase === 'libera' ? t * 40 : fase && fase !== 'chega' ? 40 : 0) * (i < 3 ? 1 : 0), vy = 125 + Math.floor(i / 3) * 30 + (i % 2) * 10;
      if (i < 3 && fase && fase !== 'chega' && (fase !== 'libera' || t > .7)) continue;
      g.fillStyle = 'rgba(227,162,26,.35)'; g.strokeStyle = C.amar; g.beginPath(); g.arc(vx, vy, 12, 0, 7); g.fill(); g.stroke();
      g.fillStyle = C.amar; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(vx - 5 + (k % 2) * 9, vy - 4 + Math.floor(k / 2) * 8, 2.4, 0, 7); g.fill(); } }
    // neurotransmissores
    P.forEach(p => { if (p.dead) return; g.fillStyle = C.amar; g.beginPath(); g.arc(p.x, p.y, 3.4, 0, 7); g.fill(); });
    // impulso
    if (fase === 'chega') { const x = t * 330; g.fillStyle = C.verm; g.beginPath(); g.arc(x, 150, 9, 0, 7); g.fill(); }
    g.fillStyle = cv('--label'); g.font = F(700, 12.5);
    g.fillText('neurônio pré-sináptico (motor)', 10, 110); g.fillText('fenda', 368, 30); g.fillText('fibra muscular (pós-sináptica)', 470, 30);
    g.fillStyle = cv('--label-2'); g.font = F(500, 11); g.fillText('vesículas com acetilcolina', 220, 270); g.fillText('receptores', 380, 280);
    if (modo === 'curare') { g.fillStyle = C.verm; g.fillText('▶ curare ocupando os receptores', 470, 290); }
  }
  function run() {
    if (rodando) return; rodando = true; P = [];
    const etapas = [
      ['chega', 900, '1. O impulso chega à terminação do axônio do neurônio <b>pré-sináptico</b>.'],
      ['libera', 800, '2. As <b>vesículas</b> se fundem à membrana e liberam o neurotransmissor (aqui, <b>acetilcolina</b>) na <b>fenda sináptica</b>.'],
      ['difunde', 1100, '3. O neurotransmissor se difunde pela fenda até os <b>receptores</b> da célula pós-sináptica.'],
      ['liga', 600, modo === 'curare' ? '4. O <b>curare</b> bloqueia os receptores: a acetilcolina <b>não consegue se ligar</b>.' : '4. Ligado aos receptores, ele abre canais de íons e gera um novo <b>potencial de ação</b> na fibra.'],
      [modo === 'curare' ? 'nada' : 'contrai', 900, modo === 'curare' ? '5. A ordem nervosa não chega: o músculo fica <b>flácido (paralisado)</b>.' : '5. O músculo esquelético <b>contrai</b> (sinapse neuromuscular, placa motora).'],
      ['degrada', 1000, '6. Para a resposta acabar, o neurotransmissor é <b>degradado por enzimas</b> na fenda (ou recaptado). A sinapse é <b>unidirecional</b>: só o pré tem vesículas, só o pós tem receptores.'],
    ];
    let i = 0;
    const next = () => {
      if (i >= etapas.length) { rodando = false; return; }
      const [fase, dur, txt] = etapas[i++]; out.innerHTML = txt;
      if (fase === 'libera') P = Array.from({ length: 22 }, () => ({ x: 360, y: 125 + Math.random() * 50, vx: 1 + Math.random() * 1.2, vy: (Math.random() - .5) * 2.4 }));
      anim(dur, t => {
        P.forEach(p => {
          if (fase === 'difunde' || (fase === 'liga' && modo === 'curare')) { p.x = Math.min(modo === 'curare' ? 380 : 400, p.x + p.vx); p.y += p.vy; if (p.y < 70 || p.y > 250) p.vy *= -1; }
          if (fase === 'liga' && modo !== 'curare') { const ry = recs[Math.floor(Math.abs(p.y * 7)) % 4] + 30; p.x += (400 - p.x) * .2; p.y += (ry - p.y) * .2; }
          if (fase === 'degrada' && Math.random() < .06) p.dead = true;
        });
        cena(t, fase);
      }, next);
    };
    next();
  }
  $('#sinGo').onclick = run;
  seg($('#sinSeg'), v => { modo = v; P = []; cena(0, null); out.innerHTML = v === 'curare' ? 'O <b>curare</b> bloqueia os receptores de acetilcolina. Mande o impulso.' : 'Mande um impulso e acompanhe as 6 etapas.'; });
  cena(0, null); out.innerHTML = 'Mande um impulso e acompanhe as 6 etapas.';
})();

/* ═════════ ARCO REFLEXO ═════════ */
(function () {
  const svg = $('#arcoSvg'), out = $('#arcoOut'); if (!svg) return;
  let corte = 'n';
  const SENS = 'M100 163 C150 130 220 106 300 100 C340 96 365 100 380 108', ASSOC = 'M392 112 C405 125 405 140 395 150', MOT = 'M385 160 C340 210 250 240 150 238', SOBE = 'M395 105 C400 70 410 50 420 22';
  function draw() {
    svg.innerHTML = `
      <ellipse cx="400" cy="130" rx="70" ry="62" style="fill:var(--bg-2);stroke:var(--sep);stroke-width:2"/>
      <path d="M370 95 q30 25 60 0 q-10 35 0 70 q-30 -25 -60 0 q10 -35 0 -70" style="fill:rgba(142,68,173,.18);stroke:${C.roxo};stroke-width:1.5"/>
      ${T(400, 210, 'medula espinal', 'middle')}
      <circle cx="320" cy="99" r="11" style="fill:#f0d39a;stroke:#c9a227;stroke-width:2"/>
      <path id="pS" d="${SENS}" style="fill:none;stroke:${C.azul};stroke-width:4"/>
      <path id="pA" d="${ASSOC}" style="fill:none;stroke:${C.roxo};stroke-width:4"/>
      <path id="pM" d="${MOT}" style="fill:none;stroke:${C.verm};stroke-width:4"/>
      <path id="pU" d="${SOBE}" style="fill:none;stroke:var(--label-2);stroke-width:3;stroke-dasharray:5 4"/>
      ${T(430, 26, 'ao cérebro (dor)')}
      ${T2(120, 84, 'neurônio sensitivo · raiz dorsal')}${T2(305, 128, 'gânglio', 'middle')}${T2(470, 140, 'neurônio associativo')}${T2(230, 262, 'neurônio motor · raiz ventral')}
      <g transform="translate(40,150)"><rect x="0" y="0" width="60" height="26" rx="13" style="fill:#f2c4a8"/><path d="M-6 13 L-26 6 L-26 20 Z" style="fill:#7a8a3a"/></g>${T2(14, 140, 'espinho na pele (receptor)')}
      <g id="musc"><ellipse cx="120" cy="240" rx="40" ry="16" style="fill:rgba(217,83,79,.35);stroke:${C.verm};stroke-width:2"/></g>${T2(120, 272, 'músculo (efetor)', 'middle')}
      ${corte === 'd' ? '<g>' + T(260, 106, '✂', 'middle', 'var(--red)', 800, 22) + '</g>' : ''}
      ${corte === 'v' ? '<g>' + T(300, 230, '✂', 'middle', 'var(--red)', 800, 22) + '</g>' : ''}
      <circle id="imp" r="7" style="fill:${C.amar};opacity:0"/>`;
  }
  function go() {
    draw();
    const imp = svg.querySelector('#imp'), seq = [['pS', corte === 'd' ? .48 : 1], ['pA', corte === 'd' ? 0 : 1], ['pM', corte === 'v' ? .38 : 1]];
    let k = 0; imp.style.opacity = 1;
    const sobe = corte !== 'd';
    const res = { n: [true, true, true], d: [false, false, true], v: [false, true, false] }[corte];
    const fim = () => {
      if (res[0]) { const m = svg.querySelector('#musc'); m.style.transformOrigin = '120px 240px'; m.style.transition = 'transform .25s'; m.style.transform = 'scaleX(.7) scaleY(1.4)'; }
      if (sobe) anim(900, p => { const pa = svg.querySelector('#pU'), q = pa.getPointAtLength(p * pa.getTotalLength()); imp.setAttribute('cx', q.x); imp.setAttribute('cy', q.y); });
      out.innerHTML = `<table style="width:100%;font-size:.88rem"><tr><td>Reflexo (tira a mão)?</td><td><b>${res[0] ? 'Sim' : 'Não'}</b></td></tr><tr><td>Sente a dor?</td><td><b>${res[1] ? 'Sim, depois' : 'Não'}</b></td></tr><tr><td>Move o braço voluntariamente?</td><td><b>${res[2] ? 'Sim' : 'Não'}</b></td></tr></table>` +
        ({ n: 'Arco reflexo composto: <b>sensitivo → associativo → motor</b>, elaborado pela <b>medula</b>, sem passar pelo cérebro. A informação também sobe: a dor é sentida <b>depois</b> que a mão já saiu.', d: '<b>Raiz dorsal</b> (sensitiva, com gânglio) cortada: o impulso não chega à medula, então não há reflexo nem dor. A via motora está intacta: ele ainda move o braço.', v: '<b>Raiz ventral</b> (motora) cortada: a informação chega à medula e sobe ao cérebro (sente a dor), mas a ordem não chega ao músculo: sem reflexo e sem movimento.' })[corte];
    };
    const step = () => {
      if (k >= seq.length) return fim();
      const [id, ate] = seq[k++]; if (ate === 0) return fim();
      const pa = svg.querySelector('#' + id), L = pa.getTotalLength();
      anim(700 * ate, p => { const q = pa.getPointAtLength(p * ate * L); imp.setAttribute('cx', q.x); imp.setAttribute('cy', q.y); }, () => ate < 1 ? fim() : step());
    };
    step();
  }
  $('#arcoGo').onclick = go;
  seg($('#arcoSeg'), v => { corte = v; draw(); out.innerHTML = v === 'n' ? 'Encoste no espinho.' : 'Nervo cortado. Encoste no espinho e veja o que muda.'; });
  draw(); out.innerHTML = 'Encoste no espinho e acompanhe o impulso.';
})();

/* ═════════ GANGORRA AUTÔNOMO ═════════ */
(function () {
  const svg = $('#ganSvg'), r = $('#ganR'), out = $('#ganOut'); if (!svg) return;
  function draw() {
    const s = +r.value / 100, simp = s >= .5, bpm = Math.round(60 + 100 * s), ang = (s - .5) * 24;
    const lin = (x, y, rot, a, b) => `${T(x, y, a)}${T2(x, y + 16, b)}`;
    svg.innerHTML = `
      <g transform="translate(320,46) rotate(${ang})"><rect x="-150" y="-5" width="300" height="10" rx="5" style="fill:var(--label-2)"/>
        <rect x="-150" y="-30" width="96" height="26" rx="8" style="fill:${C.verde};opacity:${1.2 - s}"/><text x="-102" y="-12" text-anchor="middle" style="fill:#fff;font:${F(700, 11)}">Parassimpático</text>
        <rect x="54" y="-30" width="96" height="26" rx="8" style="fill:${C.lar};opacity:${.2 + s}"/><text x="102" y="-12" text-anchor="middle" style="fill:#fff;font:${F(700, 11)}">Simpático</text></g>
      <path d="M310 70 L320 52 L330 70Z" style="fill:var(--label-2)"/>
      ${T(320, 92, simp ? 'Noradrenalina (+ adrenalina das adrenais)' : 'Acetilcolina', 'middle', 'var(--tint)', 700, 12.5)}
      <g transform="translate(70,150)"><ellipse rx="40" ry="22" style="fill:#fff;stroke:var(--label-2);stroke-width:2"/><circle r="17" style="fill:#5a7d9a"/><circle r="${4 + 10 * s}" style="fill:#111;transition:r .3s"/></g>${lin(30, 195, 0, 'Pupila', simp ? 'dilata' : 'contrai')}
      <g transform="translate(190,150)"><path d="M0 18 C-30 -6 -22 -30 0 -14 C22 -30 30 -6 0 18Z" style="fill:${C.verm};transform-origin:0 0;animation:hb ${(60 / bpm).toFixed(2)}s infinite"/></g>${lin(160, 195, 0, 'Coração', bpm + ' bpm · ' + (simp ? 'acelera' : 'desacelera'))}
      <g transform="translate(300,150)" style="stroke:#c97b8a;fill:none;stroke-linecap:round"><path d="M0 -26 V0 M0 0 L-16 18 M0 0 L16 18" style="stroke-width:${3 + 6 * s}"/></g>${lin(270, 195, 0, 'Brônquios', simp ? 'dilatam' : 'contraem')}
      <g transform="translate(410,150)"><path d="M-22 -14 q22 -14 40 4 q8 24 -14 28 q-24 2 -26 -32" style="fill:rgba(227,162,26,.35);stroke:${C.amar};stroke-width:2"/>${!simp ? '<path d="M-14 0 q6 -6 12 0 t12 0" style="fill:none;stroke:' + C.amar + ';stroke-width:2"><animate attributeName="d" values="M-14 0 q6 -6 12 0 t12 0;M-14 0 q6 6 12 0 t12 0;M-14 0 q6 -6 12 0 t12 0" dur="1s" repeatCount="indefinite"/></path>' : ''}</g>${lin(380, 195, 0, 'Digestão', simp ? 'inibe' : 'estimula')}
      <g transform="translate(520,150)"><path d="M0 -24 q14 18 0 30 q-14 -12 0 -30" style="fill:#7fb3e0;opacity:${1.1 - s}"/></g>${lin(492, 195, 0, 'Saliva', simp ? 'inibe (boca seca)' : 'estimula')}
      ${lin(30, 238, 0, 'Fígado', simp ? 'libera glicose' : 'armazena glicogênio')}${lin(270, 238, 0, 'Bexiga', simp ? 'relaxa (segura)' : 'contrai (esvazia)')}${lin(492, 238, 0, 'Adrenais', simp ? 'liberam adrenalina' : '(sem ação)')}
      <style>@keyframes hb{0%,100%{transform:scale(1)}30%{transform:scale(1.18)}}@media (prefers-reduced-motion:reduce){#ganSvg *{animation:none!important}}</style>`;
    out.innerHTML = simp
      ? '<b>Simpático</b> no comando: estresse, <b>luta ou fuga</b>, exercício intenso. Libera <b>noradrenalina</b> e faz as adrenais liberarem <b>adrenalina</b>. Por isso o susto acelera o coração.'
      : '<b>Parassimpático</b> no comando: <b>repouso e digestão</b>. Libera <b>acetilcolina</b>. Os dois ramos agem nos mesmos órgãos com <b>ações antagônicas</b>, como uma gangorra, mantendo a homeostase.';
  }
  r.oninput = draw; draw();
})();

/* ═════════ REVISÃO: GLICEMIA ═════════ */
(function () {
  const c = $('#glicCv'), out = $('#glicOut'); if (!c) return;
  const g = c.getContext('2d'); let tipo = 's', G = 90, food = 0, fast = 0, adr = 0, hist = [];
  const N = 160;
  function passo() {
    const ins = tipo === 't1' ? 0 : Math.max(0, G - 95) * .05 * (tipo === 't2' ? 1.6 : 1);
    const efeito = tipo === 't2' ? .22 : 1;
    const glu = Math.max(0, 86 - G) * .12 + (adr > 0 ? .4 : 0);
    const uso = .45 + (fast > 0 ? .5 : 0);
    G += food * .8 + adr * .9 - uso - ins * efeito * (G - 60) * .02 + glu * .7;
    G = Math.max(40, Math.min(320, G)); food *= .92; if (food < .05) food = 0; if (fast > 0) fast--; adr *= .9; if (adr < .05) adr = 0;
    hist.push([G, ins, glu]); if (hist.length > N) hist.shift();
  }
  function draw() {
    const x0 = 50, x1 = 740, Y = v => 230 - (v - 40) / 280 * 200;
    g.clearRect(0, 0, 760, 260);
    g.fillStyle = 'rgba(46,157,106,.12)'; g.fillRect(x0, Y(110), x1 - x0, Y(70) - Y(110));
    g.fillStyle = cv('--label-2'); g.font = F(500, 11);
    [70, 110, 200, 300].forEach(v => g.fillText(v, 14, Y(v) + 4)); g.fillText('faixa normal', x0 + 4, Y(110) + 13); g.fillText('mg/dL', 8, 18);
    hist.forEach(([v, ins, glu], i) => { const x = x0 + i / N * (x1 - x0); g.fillStyle = 'rgba(59,130,196,.45)'; g.fillRect(x, 250 - Math.min(40, ins * 30), 3, Math.min(40, ins * 30)); g.fillStyle = 'rgba(224,112,42,.5)'; g.fillRect(x, 250 - Math.min(40, glu * 18), 3, Math.min(40, glu * 18)); });
    g.strokeStyle = cv('--tint'); g.lineWidth = 3; g.beginPath(); hist.forEach(([v], i) => { const x = x0 + i / N * (x1 - x0); i ? g.lineTo(x, Y(v)) : g.moveTo(x, Y(v)); }); g.stroke();
    g.font = F(700, 12); g.fillStyle = cv('--label'); g.fillText('Glicemia: ' + Math.round(G) + ' mg/dL', x1 - 170, 20);
    g.fillStyle = C.azul; g.fillText('■ insulina', x1 - 170, 38); g.fillStyle = C.lar; g.fillText('■ glucagon', x1 - 80, 38);
  }
  for (let i = 0; i < N; i++) passo();
  let on = false;
  new IntersectionObserver(es => { on = es[0].isIntersecting; }).observe(c);
  setInterval(() => { if (!on) return; passo(); draw(); }, 90);
  draw();
  const TX = {
    comer: { s: '<b>Comeu</b>: a glicemia sobe, as células β do pâncreas liberam <b>insulina</b>, que faz a glicose entrar nas células e ser guardada como <b>glicogênio</b>. A glicemia volta ao normal: <b>feedback negativo</b>.', t1: '<b>Diabetes tipo 1</b>: o pâncreas <b>não produz insulina</b> (autoimune). A glicemia sobe e demora muito a cair: glicose na urina. Tratamento com insulina.', t2: '<b>Diabetes tipo 2</b>: há insulina (até mais), mas os <b>receptores não respondem</b> bem. A glicemia fica alta por muito tempo.' },
    jejum: { s: '<b>Jejum</b>: a glicemia cai e as células α liberam <b>glucagon</b>, que quebra o glicogênio (glicogenólise) e devolve glicose ao sangue.', t1: '<b>Jejum</b>: o glucagon continua funcionando e segura a glicemia.', t2: '<b>Jejum</b>: o glucagon continua funcionando e segura a glicemia.' },
    susto: { s: '<b>Susto</b>: a <b>adrenalina</b> (medula das adrenais, junto com o simpático) libera glicose do fígado: energia para lutar ou fugir.', t1: '<b>Susto</b>: a adrenalina sobe a glicemia, e sem insulina ela demora a voltar.', t2: '<b>Susto</b>: a adrenalina sobe a glicemia, e a resistência à insulina faz ela demorar a voltar.' },
  };
  document.querySelectorAll('#labGlic [data-g]').forEach(b => b.onclick = () => { const a = b.dataset.g; if (a === 'comer') food = 7; if (a === 'jejum') { fast = 80; food = 0; } if (a === 'susto') adr = 2.5; out.innerHTML = TX[a][tipo]; });
  seg($('#glicSeg'), v => { tipo = v; out.innerHTML = { s: 'Pâncreas saudável. Clique em Comer.', t1: 'Diabetes tipo 1: sem insulina. Clique em Comer.', t2: 'Diabetes tipo 2: insulina sem efeito nos receptores. Clique em Comer.' }[v]; });
})();

sorter($('#sortEndo'), [
  ['GH (hormônio do crescimento)', 'Adeno-hipófise', 'Cresce ossos e síntese de proteínas. Falta: nanismo; excesso no adulto: acromegalia.'],
  ['TSH', 'Adeno-hipófise', 'Estimula a tireoide a produzir T3 e T4.'],
  ['FSH e LH', 'Adeno-hipófise', 'Gonadotrofinas: alvo nas gônadas.'],
  ['Prolactina', 'Adeno-hipófise', 'Produção de leite.'],
  ['Ocitocina', 'Neuro-hipófise', 'Produzida pelo hipotálamo, liberada pela neuro-hipófise: parto e ejeção do leite (feedback positivo).'],
  ['ADH (antidiurético)', 'Neuro-hipófise', 'Aquaporinas no ducto coletor: urina concentrada. Falta: diabetes insipidus.'],
  ['T3 e T4', 'Tireoide', 'Aumentam o metabolismo basal. Precisam de iodo.'],
  ['Calcitonina', 'Tireoide', 'Baixa o cálcio no sangue (guarda nos ossos).'],
  ['Paratormônio', 'Paratireoides', 'Sobe o cálcio no sangue (tira dos ossos).'],
  ['Insulina', 'Pâncreas', 'Células β das ilhotas: baixa a glicemia.'],
  ['Glucagon', 'Pâncreas', 'Células α: sobe a glicemia (glicogenólise).'],
  ['Adrenalina', 'Adrenais', 'Medula da adrenal: luta e fuga.'],
  ['Aldosterona', 'Adrenais', 'Córtex: reabsorção de sódio nos túbulos renais; sobe a pressão.'],
  ['Cortisol', 'Adrenais', 'Córtex: estresse, glicemia, anti-inflamatório.'],
], ['Adeno-hipófise', 'Neuro-hipófise', 'Tireoide', 'Paratireoides', 'Pâncreas', 'Adrenais']);

/* ═════════ REVISÃO: DIGESTÃO ═════════ */
(function () {
  const svg = $('#digSvg'), out = $('#digOut'); if (!svg) return;
  const LOC = ['Boca', 'Estômago', 'Duodeno', 'Intestino (fim)'], PH = ['~7 neutro', '~2 ácido (HCl)', '~8 básico (bicarbonato)', ''];
  const D = {
    amido: [['Amilase salivar (ptialina)', 'amido → maltose', 6, 3], ['nenhuma para amido', 'a amilase salivar para no pH ácido', 3, 3], ['Amilase pancreática', 'amido → maltose', 3, 2], ['Maltase (intestinal)', 'maltose → glicose (absorvida)', 2, 1]],
    prot: [['nenhuma', 'só mastigação', 6, 6], ['Pepsina (do pepsinogênio)', 'proteínas → peptídeos', 6, 3], ['Tripsina e quimotripsina (pâncreas)', 'peptídeos → peptídeos menores', 3, 2], ['Peptidases (intestinais)', 'peptídeos → aminoácidos (absorvidos)', 2, 1]],
    lip: [['nenhuma', 'só mastigação', 6, 6], ['nenhuma', 'continua inteira', 6, 6], ['Bile emulsifica + lipase pancreática', 'lipídios → ácidos graxos + glicerol (a bile não é enzima!)', 6, 1], ['absorção', 'ácidos graxos e glicerol absorvidos', 1, 1]],
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
  const S = (p, p50) => p <= 0 ? 0 : p ** 2.7 / (p ** 2.7 + p50 ** 2.7);
  function draw() {
    const p = +r.value, x0 = 60, x1 = 600, y0 = 20, y1 = 250, X = v => x0 + v / 100 * (x1 - x0), Y = v => y1 - v * (y1 - y0);
    g.clearRect(0, 0, 760, 300);
    g.strokeStyle = cv('--sep'); g.lineWidth = 1; g.font = F(500, 11); g.fillStyle = cv('--label-2');
    [0, .25, .5, .75, 1].forEach(v => { g.beginPath(); g.moveTo(x0, Y(v)); g.lineTo(x1, Y(v)); g.stroke(); g.fillText(v * 100 + '%', 18, Y(v) + 4); });
    [0, 20, 40, 60, 80, 100].forEach(v => g.fillText(v, X(v) - 6, y1 + 16)); g.fillText('pO₂ (mmHg)', x1 - 60, y1 + 32);
    const curva = (p50, cor, dash) => { g.strokeStyle = cor; g.lineWidth = 3; g.setLineDash(dash); g.beginPath(); for (let v = 0; v <= 100; v++) { v ? g.lineTo(X(v), Y(S(v, p50))) : g.moveTo(X(v), Y(0)); } g.stroke(); g.setLineDash([]); };
    curva(26, C.azul, ex ? [6, 5] : []); if (ex) curva(36, C.verm, []);
    [[100, 'pulmões'], [40, 'tecido em repouso'], [20, 'músculo em exercício']].forEach(([v, n]) => { g.fillStyle = cv('--label-2'); g.fillText(v === 100 ? n + ' ▼' : '▼ ' + n, X(v) - (v === 100 ? 56 : 5), y0 + 10 + (v === 20 ? 14 : 0)); });
    const p50 = ex ? 36 : 26, s = S(p, p50);
    g.strokeStyle = cv('--label'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(p), y1); g.lineTo(X(p), Y(s)); g.lineTo(x0, Y(s)); g.stroke(); g.setLineDash([]);
    g.fillStyle = ex ? C.verm : C.azul; g.beginPath(); g.arc(X(p), Y(s), 7, 0, 7); g.fill();
    g.fillStyle = cv('--label'); g.font = F(700, 13); g.fillText(`pO₂ = ${p}`, 620, 50); g.fillText(`${Math.round(s * 100)}% saturada`, 620, 68);
    const lib = S(100, p50) - S(ex ? 20 : 40, p50);
    g.font = F(500, 12); g.fillStyle = cv('--label-2'); g.fillText('O₂ entregue', 620, 100); g.fillText('(pulmão → tecido):', 620, 116);
    g.fillStyle = cv('--label'); g.font = F(800, 22); g.fillText(Math.round(lib * 100) + '%', 620, 146);
  }
  function txt() { out.innerHTML = ex ? 'No <b>exercício</b>, mais CO₂, acidez e temperatura <b>deslocam a curva para a direita</b>: na mesma pO₂ a hemoglobina fica <b>menos saturada</b>, ou seja, <b>solta mais O₂</b> para o músculo que precisa (efeito Bohr).' : 'Onde a pO₂ é alta (<b>pulmões</b>), a hemoglobina se carrega de O₂ (~100%). Nos <b>tecidos</b>, onde a pO₂ é baixa, ela solta O₂. Arraste a pO₂ e depois compare com o exercício.'; }
  r.oninput = draw; seg($('#hbSeg'), v => { ex = v === 'e'; draw(); txt(); }); draw(); txt();
})();

/* ═════════ REVISÃO: NÉFRON ═════════ */
(function () {
  const svg = $('#nefSvg'), out = $('#nefOut'); if (!svg) return;
  const S = [
    ['Glomérulo', 'glom', '<b>Filtração</b> no glomérulo (dentro da cápsula de Bowman): a pressão do sangue empurra água, glicose, aminoácidos, sais e ureia para o néfron. <b>Células e proteínas grandes não passam</b>.'],
    ['Túbulo proximal', 'prox', '<b>Reabsorção</b>: glicose e aminoácidos (normalmente toda a glicose), muita água e sais voltam ao sangue. Se a glicemia está alta demais (diabetes mellitus), sobra glicose na urina.'],
    ['Alça de Henle', 'alca', 'Reabsorção de <b>água</b> (ramo descendente) e de <b>sais</b> (ramo ascendente): ajuda a concentrar a urina.'],
    ['Túbulo distal', 'dist', 'A <b>aldosterona</b> (córtex da adrenal) aumenta a reabsorção de <b>sódio</b>, e a água vai junto: a pressão arterial sobe. Aqui também há secreção de íons.'],
    ['Ducto coletor', 'col', 'O <b>ADH</b> (neuro-hipófise) aumenta as <b>aquaporinas</b>: mais água é reabsorvida e a urina sai <b>concentrada</b>. Álcool inibe o ADH: muita urina diluída.'],
    ['Urina', 'uri', 'Sobra a <b>urina</b>: água, ureia e sais, que segue para pelve renal → ureter → bexiga.'],
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
      ${k === 'prox' ? T2(160, 120, '↑ volta ao sangue: glicose, aminoácidos, água, sais') : ''}
      ${k === 'dist' ? T2(380, 130, '↑ Na⁺ (+ água) · aldosterona') : ''}
      ${k === 'col' ? T2(400, 200, '↑ água · ADH (aquaporinas)') : ''}`;
    out.innerHTML = S[i][2];
  }
  steps($('#nefSteps'), S.map((s, i) => `${i + 1}. ${s[0]}`), draw);
})();
})();
