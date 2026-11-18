/* Laboratórios do 3º tri (reprodutor, nervoso, endócrino). Utilitários em labs-comum.js. */
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
    bexiga: '<b>Bexiga</b>: guarda a urina (sistema excretor). O sêmen e a urina não passam pela uretra ao mesmo tempo.',
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
      ${BOX(492, 150, 140, 96)}${T(502, 172, 'Ao final do trajeto:')}
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
        ? '<b>Vasectomia</b>: os espermatozoides continuam sendo produzidos, mas param no corte do <b>canal deferente</b> e são <b>reabsorvidos</b>. O sêmen continua sendo formado, mas <b>sem espermatozoides</b>. Testículos, FSH, LH e testosterona não mudam.'
        : 'Rota: <b>túbulos seminíferos → epidídimo → canal deferente → uretra</b>. No caminho entram o líquido da <b>vesícula seminal</b> e o da <b>próstata</b>. Sêmen = espermatozoides + líquidos.';
    });
  }
  $('#rotaGo').onclick = go;
  seg($('#rotaSeg'), v => { vas = v === 'v'; draw(); out.innerHTML = vas ? 'O canal deferente foi cortado. Clique em <b>Percorrer o caminho</b>.' : 'Clique numa estrutura ou em <b>Percorrer o caminho</b>.'; });
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

/* ═════════ NEURÔNIOS → NERVO E GÂNGLIO ═════════ */
(function () {
  const svg = $('#nvSvg'), tray = $('#nvTray'), out = $('#nvOut'); if (!svg) return;
  // 3 neurônios sensitivos (azuis) e 3 motores (vermelhos). O caminho de cada um segue o sentido do impulso.
  const N = [0, 1, 2].map(k => ({ t: 's', k })).concat([0, 1, 2].map(k => ({ t: 'm', k })));
  const caminho = ({ t, k }) => t === 's'
    ? `M58 ${108 + k * 4} C90 ${110 + k * 4} 92 ${162 + k * 3} 120 ${162 + k * 3} L398 ${162 + k * 3} C430 ${160 + k * 3} 432 ${124 + k * 5} 452 ${120 + k * 5} C490 ${118 + k * 5} 505 ${132 + k * 4} 540 ${140 + k * 4}`
    : `M575 ${196 + k * 9} C545 ${198 + k * 7} 520 ${206 + k * 4} 470 ${214 + k * 3} C430 ${218 + k * 3} 428 ${178 + k * 3} 398 ${178 + k * 3} L120 ${178 + k * 3} C92 ${178 + k * 3} 90 ${232 + k * 4} 62 ${234 + k * 4}`;
  const corpo = ({ t, k }) => t === 's' ? [452, 120 + k * 5] : [575, 196 + k * 9];
  const cor = t => t === 's' ? C.azul : C.verm;
  let colocados = [], corte = false;
  const nomeDe = n => `${n.t === 's' ? 'Sensitivo' : 'Motor'} ${n.k + 1}`;
  function iconeBandeja(n, i) {
    const x = 34 + i * 58, c = cor(n.t);
    return `<g class="nv-ic" data-i="${i}" style="cursor:pointer"><rect x="${x - 24}" y="8" width="48" height="34" rx="9" style="fill:var(--bg-2);stroke:var(--sep)"/>
      <circle cx="${x - 10}" cy="25" r="6" style="fill:${c}"/><path d="M${x - 16} 25 l-5 -6 M${x - 16} 25 l-6 3 M${x - 4} 25 H${x + 16} M${x + 16} 25 l4 -4 M${x + 16} 25 l4 4" style="stroke:${c};stroke-width:2;fill:none;stroke-linecap:round"/></g>`;
  }
  function draw() {
    const s = colocados.filter(i => N[i].t === 's').length, m = colocados.length - s;
    let h = `
      <ellipse cx="562" cy="168" rx="64" ry="80" style="fill:var(--bg-2);stroke:var(--label-2);stroke-width:2"/>
      <path d="M535 120 q27 26 54 0 q-8 48 0 96 q-27 -26 -54 0 q8 -48 0 -96" style="fill:rgba(142,68,173,.15);stroke:${C.roxo};stroke-width:1.5"/>
      ${T(562, 268, 'medula (SNC)', 'middle')}
      <rect x="14" y="94" width="44" height="28" rx="8" style="fill:#f2c4a8;opacity:.8"/>${T2(10, 88, 'pele (receptor)')}
      <ellipse cx="40" cy="240" rx="28" ry="14" style="fill:rgba(217,83,79,.3);stroke:${C.verm};stroke-width:2"/>${T2(40, 268, 'músculo', 'middle')}
      ${N.map((n, i) => colocados.includes(i) ? '' : iconeBandeja(n, i)).join('')}
      ${colocados.length === 0 ? T(320, 120, 'Clique nos neurônios lá em cima ↑', 'middle', 'var(--label-2)', 600, 14) : ''}`;
    if (colocados.length >= 2 && (s >= 1 || m >= 1)) {
      const y0 = s ? 156 : 172, y1 = m ? 190 : 174;
      h += `<rect x="104" y="${y0}" width="304" height="${y1 - y0}" rx="${(y1 - y0) / 2}" style="fill:rgba(227,162,26,.18);stroke:${C.amar};stroke-width:2"/>`;
      h += T(256, y0 - 8, 'NERVO = feixe de axônios fora do SNC', 'middle', C.amar, 800, 12);
    }
    if (s >= 2) h += `<ellipse cx="452" cy="125" rx="22" ry="17" style="fill:rgba(46,157,106,.2);stroke:${C.verde};stroke-width:2"/>` + T(452, 98, 'GÂNGLIO', 'middle', C.verde, 800, 12) + T2(452, 84, 'corpos celulares fora do SNC', 'middle');
    colocados.forEach(i => { const n = N[i], [cx, cy] = corpo(n); h += `<path class="nv-f" data-i="${i}" d="${caminho(n)}" style="fill:none;stroke:${cor(n.t)};stroke-width:2.5;stroke-linecap:round"/><circle cx="${cx}" cy="${cy}" r="5.5" style="fill:${cor(n.t)};stroke:var(--bg-3);stroke-width:1.5"/>`; });
    if (corte && colocados.length) {
      h += `<path d="M250 186 L250 236" style="stroke:var(--label-2);stroke-dasharray:4 3"/><circle cx="250" cy="270" r="34" style="fill:rgba(227,162,26,.15);stroke:${C.amar};stroke-width:2"/>`;
      let k = 0; colocados.forEach(i => { for (let j = 0; j < 4; j++, k++) { const a = k * 2.4, d = 7 + 4 * Math.sqrt(k); if (d > 28) continue; h += `<circle cx="${250 + Math.cos(a) * d}" cy="${270 + Math.sin(a) * d}" r="3.2" style="fill:${cor(N[i].t)};stroke:#f0e2b6;stroke-width:1.2"/>`; } });
      h += T2(292, 262, 'corte transversal: cada bolinha é um axônio') + T2(292, 278, '(um nervo real tem milhares)');
    }
    h += '<g id="nvImpG"></g>';
    svg.innerHTML = h;
    svg.querySelectorAll('.nv-ic').forEach(g => g.onclick = () => coloca(+g.dataset.i));
    tray.innerHTML = N.map((n, i) => colocados.includes(i) ? '' : `<button class="lbtn" type="button" data-i="${i}"><span style="color:${cor(n.t)}">●</span> ${nomeDe(n)}</button>`).join('');
    tray.querySelectorAll('button').forEach(b => b.onclick = () => coloca(+b.dataset.i));
    out.innerHTML = texto(s, m);
  }
  function texto(s, m) {
    if (!s && !m) return 'Cada neurônio tem <b>corpo celular</b>, dendritos e um <b>axônio</b> comprido. Sozinhos eles são microscópicos; juntos formam as estruturas que se veem a olho nu. Os <span style="color:' + C.azul + '">azuis</span> são <b>sensitivos</b>, os <span style="color:' + C.verm + '">vermelhos</span> são <b>motores</b>.';
    const tipo = s && m ? '<b>nervo misto</b> (fibras sensitivas e motoras, como os nervos espinais e o trigêmeo)' : s ? '<b>nervo sensitivo</b> (aferente: leva informação do receptor ao SNC)' : '<b>nervo motor</b> (eferente: leva ordens do SNC ao músculo)';
    let t = s + m === 1 ? 'Um axônio sozinho é só uma <b>fibra nervosa</b>. Junte mais um.' : `Os axônios correm juntos no mesmo feixe: isso é um <b>nervo</b>. Com o que você juntou, é um ${tipo}.`;
    if (s === 1) t += ' O corpo celular do sensitivo fica <b>fora do SNC</b>, perto da medula.';
    if (s >= 2) t += ' Os corpos celulares dos sensitivos se agruparam fora do SNC: isso é um <b>gânglio</b> (na raiz dorsal do nervo espinal).';
    if (m) t += ' O corpo celular do motor fica <b>dentro da medula</b> (SNC): por isso ele não forma gânglio.';
    return t;
  }
  function coloca(i) {
    if (colocados.includes(i)) return;
    colocados.push(i); draw();
    const p = svg.querySelector(`.nv-f[data-i="${i}"]`), L = p.getTotalLength();
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
    anim(700, q => { p.style.strokeDashoffset = L * (1 - q); }, () => { p.style.strokeDasharray = ''; });
  }
  $('#nvImp').onclick = () => {
    if (!colocados.length) { out.innerHTML = 'Monte o nervo primeiro: clique nos neurônios.'; return; }
    const g = svg.querySelector('#nvImpG'), ps = colocados.map(i => svg.querySelector(`.nv-f[data-i="${i}"]`));
    anim(1800, q => { g.innerHTML = ps.map(p => { const pt = p.getPointAtLength(q * p.getTotalLength()); return `<circle cx="${pt.x}" cy="${pt.y}" r="5" style="fill:${C.amar};stroke:#fff;stroke-width:1.5"/>`; }).join(''); }, () => {
      g.innerHTML = '';
      out.innerHTML = 'No mesmo nervo, os impulsos dos <b>sensitivos</b> vão <b>da pele para a medula</b> (aferentes) e os dos <b>motores</b> vão <b>da medula para o músculo</b> (eferentes). Cada axônio conduz num só sentido; o nervo é só o cabo que junta todos.';
    });
  };
  $('#nvCorte').onclick = () => { corte = !corte; draw(); };
  $('#nvReset').onclick = () => { colocados = []; corte = false; draw(); };
  draw();
})();

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

