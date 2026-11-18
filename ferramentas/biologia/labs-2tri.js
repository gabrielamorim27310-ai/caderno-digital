/* Laboratórios do 2º tri. Utilitários e os de revisão (digestão, coração, hemoglobina, néfron) em labs-comum.js. */

/* ═════════ BILE ═════════ */
(function () {
  const c = $('#bileCv'), r = $('#bileR'), out = $('#bileOut'); if (!c) return;
  const g = c.getContext('2d'); let lip = 0;
  function gotas(n) { // divide um volume fixo em 4^n gotas
    const k = Math.min(256, 4 ** n), R = 80 / Math.sqrt(k), arr = [];
    for (let i = 0; i < k; i++) { const cols = Math.ceil(Math.sqrt(k)); arr.push([60 + (i % cols + .5) * (260 / cols), 20 + (Math.floor(i / cols) + .5) * (190 / cols), R]); }
    return arr;
  }
  function draw() {
    const n = +r.value, G = gotas(n), area = G.reduce((a, [, , R]) => a + 2 * Math.PI * R, 0), area0 = 2 * Math.PI * 80;
    g.clearRect(0, 0, 760, 230);
    G.forEach(([x, y, R], i) => { const comido = lip > 0 ? Math.min(1, lip * (1 + n) / 6) : 0; g.fillStyle = `rgba(227,162,26,${.85 - comido * .7})`; g.beginPath(); g.arc(x, y, R * (1 - comido * .6), 0, 7); g.fill(); g.strokeStyle = C.amar; g.stroke(); });
    g.fillStyle = cv('--label'); g.font = F(700, 14); g.fillText('Superfície para a lipase agir', 400, 50);
    g.fillStyle = cv('--sep'); g.fillRect(400, 64, 320, 18); g.fillStyle = C.verde; g.fillRect(400, 64, Math.min(320, 320 * area / area0 / 16), 18);
    g.fillStyle = cv('--label'); g.font = F(800, 26); g.fillText('×' + (area / area0).toFixed(0), 400, 120);
    g.fillStyle = cv('--label-2'); g.font = F(500, 12); g.fillText(`${G.length} gota(s) · mesma quantidade de gordura`, 400, 145);
    if (lip > 0) { g.fillStyle = cv('--label'); g.font = F(600, 12.5); g.fillText(`Lipase: ${Math.min(100, Math.round(lip * (1 + n) / 6 * 100))}% virou ácidos graxos + glicerol`, 400, 185); }
  }
  function txt() {
    const n = +r.value;
    out.innerHTML = n === 0 ? 'Um glóbulo grande de gordura. Arraste a <b>bile</b>.'
      : `Os <b>sais biliares</b> dividiram a gordura em ${4 ** n > 256 ? 'centenas de' : 4 ** n} gotículas: é a <b>emulsificação</b>, uma ação <b>física</b>. A gordura continua sendo gordura, só que com muito mais superfície. <b>A bile não tem enzima</b>: produzida no fígado, guardada na vesícula biliar, chega ao duodeno pelo ducto colédoco.`;
  }
  r.oninput = () => { lip = 0; draw(); txt(); };
  $('#bileLip').onclick = () => {
    lip = 0; const n = +r.value;
    anim(1600, p => { lip = p; draw(); }, () => {
      out.innerHTML = n < 3 ? 'Com pouca bile, a <b>lipase pancreática</b> só alcança a superfície de gotas grandes: a digestão é lenta. Emulsifique mais e tente de novo.' : 'Com a gordura emulsificada, a <b>lipase pancreática</b> quebra rápido os lipídios em <b>ácidos graxos + glicerol</b> (absorvíveis). Quem digere é a lipase; a bile só prepara.';
    });
  };
  draw(); txt();
})();

/* ═════════ INTESTINO GROSSO ═════════ */
(function () {
  const svg = $('#fezSvg'), r = $('#fezR'), out = $('#fezOut'); if (!svg) return;
  function draw() {
    const t = +r.value / 100, agua = Math.round(95 - t * 45);
    const gotas = Array.from({ length: 8 }, (_, i) => `<text x="${120 + i * 50}" y="${40 - (i % 2) * 8}" style="font-size:14px;opacity:${.3 + t * .7}">💧</text><path d="M${128 + i * 50} 52 V70" style="stroke:#3b82c4;stroke-width:2;opacity:${.2 + t * .8}"/>`).join('');
    const cor = t < .3 ? '#c9a46a' : t < .7 ? '#8a5a2b' : '#5b3a1a';
    svg.innerHTML = `<rect x="60" y="80" width="520" height="56" rx="28" style="fill:rgba(200,120,90,.18);stroke:#c97b5d;stroke-width:2"/>
      ${gotas}${T2(140, 16, 'água e sais absorvidos por osmose (o cólon absorve Na⁺ ativamente e a água segue)')}
      <g transform="translate(${120 + t * 360},108)">${t < .3 ? `<ellipse rx="44" ry="16" style="fill:${cor};opacity:.75"/>` : t < .7 ? `<rect x="-36" y="-14" width="72" height="28" rx="14" style="fill:${cor}"/>` : [0, 1, 2].map(k => `<circle cx="${-22 + k * 22}" r="11" style="fill:${cor}"/>`).join('')}</g>
      ${T(60, 170, 'Água nas fezes: ' + agua + '%')}${T2(60, 188, 'normal: cerca de 3/4 de água')}
      ${T(400, 170, t < .3 ? 'Diarreia' : t < .7 ? 'Normal' : 'Constipação', 'start', t < .3 || t >= .7 ? 'var(--red)' : 'var(--green)', 800, 15)}`;
    out.innerHTML = t < .3 ? '<b>Passagem rápida</b> (ou infecção): pouco tempo para absorver água → fezes com excesso de água: <b>diarreia</b>.'
      : t < .7 ? 'O intestino grosso <b>não digere</b> nutrientes: absorve <b>água e sais</b> e compacta as fezes (3/4 água, 1/4 sólido: células mortas, bactérias, fibras).'
      : '<b>Passagem lenta</b>: absorção excessiva de água → fezes ressecadas: <b>constipação</b>. As <b>fibras insolúveis</b> (celulose) aumentam o bolo fecal e aceleram o trânsito.';
  }
  r.oninput = draw; draw();
})();

/* ═════════ OSMOSE ═════════ */
(function () {
  const svg = $('#osSvg'), out = $('#osOut'); if (!svg) return;
  let cel = 'a', sol = 'iso', atual = 1;
  const alvo = { a: { hipo: 1.45, iso: 1, hiper: .72 }, v: { hipo: 1.08, iso: 1, hiper: .62 } };
  const TX = {
    a: { hipo: '<b>Hipotônica</b> (menos solutos fora): a água <b>entra</b> por osmose, a hemácia incha e pode estourar: <b>lise</b> (não tem parede celular).', iso: '<b>Isotônica</b>: mesma concentração dentro e fora; a água entra e sai na mesma quantidade. Célula <b>normal</b>.', hiper: '<b>Hipertônica</b> (mais solutos fora): a água <b>sai</b> e a hemácia murcha: <b>crenação</b>.' },
    v: { hipo: '<b>Hipotônica</b>: a água entra, mas a <b>parede de celulose</b> segura: a célula fica <b>túrgida (turgescente)</b>, sem estourar.', iso: '<b>Isotônica</b>: a célula vegetal fica <b>flácida</b>.', hiper: '<b>Hipertônica</b>: a água sai do vacúolo e a membrana <b>descola da parede</b>: <b>plasmólise</b>.' },
  };
  function draw(k) {
    const n = sol === 'hipo' ? 6 : sol === 'iso' ? 16 : 34, solutos = Array.from({ length: n }, (_, i) => `<circle cx="${30 + (i * 137) % 580}" cy="${30 + (i * 71) % 170}" r="4" style="fill:${C.roxo};opacity:.7"/>`).join('');
    const dentro = Array.from({ length: 16 }, (_, i) => { const a = i * 2.4, d = 10 + (i % 4) * 9; return `<circle cx="${320 + Math.cos(a) * d * k}" cy="${115 + Math.sin(a) * d * k * .8}" r="4" style="fill:${C.roxo}"/>`; }).join('');
    let cell;
    if (cel === 'a') {
      const enr = k < .85 ? `stroke-dasharray:6 3` : '';
      cell = k > 1.4 ? `<circle cx="320" cy="115" r="${70 * k}" style="fill:rgba(217,83,79,.15);stroke:${C.verm};stroke-width:3;stroke-dasharray:14 10"/>${T(320, 120, '💥 lise', 'middle', 'var(--red)', 800, 16)}`
        : `<ellipse cx="320" cy="115" rx="${70 * k}" ry="${52 * k}" style="fill:rgba(217,83,79,.3);stroke:${C.verm};stroke-width:3;${enr}"/>`;
    } else {
      cell = `<rect x="230" y="40" width="180" height="150" rx="10" style="fill:none;stroke:${C.verde};stroke-width:6"/>
        <rect x="${320 - 82 * k}" y="${115 - 68 * k}" width="${164 * k}" height="${136 * k}" rx="${14 + (1 - k) * 40}" style="fill:rgba(46,157,106,.25);stroke:${C.verde};stroke-width:2"/>
        ${T2(415, 36, 'parede de celulose')}`;
    }
    const seta = sol === 'hipo' ? '→ água entra →' : sol === 'hiper' ? '← água sai ←' : '⇄ equilíbrio';
    svg.innerHTML = solutos + cell + dentro + T(20, 222, seta, 'start', '#3b82c4', 700, 13) + T2(620, 222, '● soluto', 'end');
    out.innerHTML = TX[cel][sol] + ' <small>Osmose: a água vai do meio <b>hipotônico</b> para o <b>hipertônico</b>, sem gastar ATP.</small>';
  }
  function go() { const a = atual, b = alvo[cel][sol]; anim(700, p => { atual = a + (b - a) * p; draw(atual); }); }
  seg($('#osCel'), v => { cel = v; atual = 1; go(); }); seg($('#osSol'), v => { sol = v; go(); }); draw(1);
})();

sorter($('#sortTransp'), [
  ['O₂ e CO₂ atravessando a membrana', 'Difusão simples', 'Gases pequenos e apolares passam direto pelos fosfolipídios, a favor do gradiente.'],
  ['Ácidos graxos e vitaminas A, D, E, K', 'Difusão simples', 'Apolares: atravessam a bicamada sem proteína.'],
  ['Glicose entrando pela GLUT, a favor do gradiente', 'Difusão facilitada', 'Polar, precisa de carreadora, mas não gasta ATP.'],
  ['Íons K⁺ e Ca²⁺ por proteínas canal', 'Difusão facilitada', 'Canal (poro) para íons, sem ATP.'],
  ['Água passando por aquaporinas', 'Osmose', 'Do hipotônico para o hipertônico; passivo.'],
  ['3 Na⁺ para fora e 2 K⁺ para dentro', 'Transporte ativo', 'Bomba Na⁺/K⁺-ATPase: contra o gradiente, gasta ATP.'],
  ['Macrófago englobando uma bactéria', 'Endocitose / exocitose', 'Fagocitose (endocitose com pseudópodes): ativo, por vesícula.'],
  ['Célula do pâncreas liberando insulina', 'Endocitose / exocitose', 'Exocitose (secreção): vesícula se funde à membrana.'],
], ['Difusão simples', 'Difusão facilitada', 'Osmose', 'Transporte ativo', 'Endocitose / exocitose']);

/* ═════════ VASOS: PRESSÃO × VELOCIDADE × ÁREA ═════════ */
(function () {
  const c = $('#vasCv'), r = $('#vasR'), out = $('#vasOut'); if (!c) return;
  const g = c.getContext('2d');
  const V = ['Aorta', 'Artérias', 'Arteríolas', 'Capilares', 'Veias'];
  const P = [1, .92, .55, .25, .08], VEL = [1, .7, .3, .04, .35], AREA = [.03, .08, .25, 1, .4];
  const TX = [
    '<b>Aorta</b>: sai do ventrículo esquerdo com a <b>maior pressão</b> e alta velocidade. Parede espessa e elástica.',
    '<b>Artérias</b>: levam sangue <b>do coração</b> aos tecidos; paredes grossas, elásticas, com músculo liso.',
    '<b>Arteríolas</b>: a pressão cai bastante; o músculo liso regula o fluxo.',
    '<b>Capilares</b>: parede com <b>uma camada de células</b>. A <b>área total é a maior</b>, por isso a <b>velocidade é a menor</b>: mais tempo para as trocas (O₂, CO₂, nutrientes).',
    '<b>Veias</b>: levam sangue <b>ao coração</b>; pressão baixa, paredes finas e <b>válvulas</b> que impedem o refluxo.',
  ];
  function draw() {
    const i = +r.value, x0 = 70, x1 = 720, X = k => x0 + k * (x1 - x0) / 4, Y = v => 220 - v * 180;
    g.clearRect(0, 0, 760, 260);
    g.fillStyle = 'rgba(120,120,128,.12)'; g.fillRect(X(i) - 50, 20, 100, 205);
    const linha = (arr, cor, nome, dy) => { g.strokeStyle = cor; g.lineWidth = 3.5; g.beginPath(); arr.forEach((v, k) => k ? g.lineTo(X(k), Y(v)) : g.moveTo(X(k), Y(v))); g.stroke(); arr.forEach((v, k) => { g.fillStyle = cor; g.beginPath(); g.arc(X(k), Y(v), k === i ? 7 : 4, 0, 7); g.fill(); }); g.font = F(700, 12); g.fillText(nome, x1 - 140, 30 + dy); };
    linha(P, C.verm, '— pressão', 0); linha(VEL, C.azul, '— velocidade', 16); linha(AREA, C.verde, '— área total', 32);
    g.fillStyle = cv('--label'); g.font = F(600, 12); V.forEach((v, k) => { g.textAlign = 'center'; g.fillText(v, X(k), 248); }); g.textAlign = 'start';
    out.innerHTML = TX[i] + ' <small>A velocidade é inversamente proporcional à área total dos vasos.</small>';
  }
  r.oninput = draw; draw();
})();

/* ═════════ CICLO CARDÍACO + MARCAPASSO ═════════ */
(function () {
  const svg = $('#ccSvg'), out = $('#ccOut'); if (!svg) return;
  const F4 = [
    ['Diástole (tudo relaxado)', { a: 0, v: 0, av: 1, sl: 0 }, 'Átrios e ventrículos relaxados: o sangue chega pelas veias e enche os átrios e, pelas <b>valvas AV abertas</b>, os ventrículos.'],
    ['Sístole atrial', { a: 1, v: 0, av: 1, sl: 0 }, 'Os <b>átrios contraem</b> e terminam de empurrar o sangue para os ventrículos (valvas AV abertas).'],
    ['Sístole ventricular', { a: 0, v: 1, av: 0, sl: 1 }, 'Os <b>ventrículos contraem</b> com força: as <b>AV (tricúspide e mitral) fecham</b> → 1º som, <b>"lub"</b>; as <b>semilunares</b> (pulmonar e aórtica) abrem e o sangue sai para as artérias.'],
    ['Diástole ventricular', { a: 0, v: 0, av: 0, sl: 0 }, 'Os ventrículos relaxam: as <b>semilunares fecham</b> (impedem o refluxo das artérias) → 2º som, <b>"dub"</b>. Logo as AV abrem e o enchimento recomeça.'],
  ];
  let f = 0, timer = 0, impulso = -1;
  function draw() {
    const [nome, s] = F4[f];
    const cam = (x, y, w, h, on, cor, txt) => `<rect x="${x + (on ? 6 : 0)}" y="${y + (on ? 6 : 0)}" width="${w - (on ? 12 : 0)}" height="${h - (on ? 12 : 0)}" rx="16" style="fill:${cor};opacity:${on ? 1 : .75};transition:all .25s"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" style="fill:#fff;font:${F(800, 13)}">${txt}</text>`;
    const valva = (x, y, aberta, horiz) => horiz ? `<path d="M${x - 22} ${y} L${x - (aberta ? 22 : 2)} ${y + (aberta ? 14 : 0)} M${x + 22} ${y} L${x + (aberta ? 22 : 2)} ${y + (aberta ? 14 : 0)}" style="stroke:${aberta ? C.verde : 'var(--label)'};stroke-width:4;stroke-linecap:round"/>` : '';
    const nos = [[255, 52, 'NSA'], [300, 112, 'NAV'], [320, 150, 'His'], [300, 215, 'Purkinje'], [345, 215, '']];
    svg.innerHTML = `
      ${cam(220, 30, 95, 75, s.a, '#5b7fc7', 'AD')}${cam(325, 30, 95, 75, s.a, '#d9534f', 'AE')}
      ${cam(220, 115, 95, 115, s.v, '#5b7fc7', 'VD')}${cam(325, 115, 95, 115, s.v, '#d9534f', 'VE')}
      ${valva(267, 110, s.av, 1)}${valva(372, 110, s.av, 1)}
      <rect x="200" y="125" width="14" height="${s.sl ? 30 : 6}" rx="3" style="fill:${s.sl ? C.verde : 'var(--label)'}"/><rect x="426" y="125" width="14" height="${s.sl ? 30 : 6}" rx="3" style="fill:${s.sl ? C.verde : 'var(--label)'}"/>
      ${T2(110, 140, 'semilunar pulmonar')}${T2(446, 140, 'semilunar aórtica')}
      ${T2(110, 100, 'tricúspide (AV)')}${T2(446, 100, 'mitral (AV)')}
      ${T(20, 30, nome, 'start', 'var(--tint)', 700, 14)}
      ${f === 2 ? T(470, 210, 'LUB', 'start', 'var(--label)', 900, 26) : ''}${f === 3 ? T(470, 210, 'DUB', 'start', 'var(--label)', 900, 26) : ''}
      ${impulso >= 0 ? nos.slice(0, impulso + 1).map(([x, y, n], k) => `<circle cx="${x}" cy="${y}" r="${k === impulso ? 9 : 6}" style="fill:${C.amar};stroke:#fff;stroke-width:2"/>${n ? T(x + 12, y - 8, n, 'start', C.amar, 800, 12) : ''}`).join('') : ''}`;
  }
  function setF(i) { f = i; draw(); out.innerHTML = F4[f][2]; }
  $('#ccStep').onclick = () => { clearInterval(timer); setF((f + 1) % 4); };
  $('#ccPlay').onclick = () => { clearInterval(timer); if (RM) return setF(2); let k = 0; timer = setInterval(() => { setF(k % 4); if (++k > 12) clearInterval(timer); }, 700); };
  $('#ccMarca').onclick = () => {
    clearInterval(timer); impulso = 0; f = 0; draw();
    const txt = ['<b>Nó sinoatrial (NSA)</b>, no átrio direito: o <b>marcapasso natural</b>, gera 60 a 100 impulsos/min e ativa os átrios.', '<b>Nó atrioventricular (NAV)</b>: <b>retarda</b> um pouco o impulso, para os átrios contraírem antes dos ventrículos.', '<b>Feixe de His</b>: conduz o impulso pelo septo entre os ventrículos.', '<b>Fibras de Purkinje</b>: espalham o impulso pelas paredes dos ventrículos, que contraem de baixo para cima.', 'Contração ventricular. O coração tem <b>automação própria</b>; o autônomo só ajusta a frequência (simpático ↑, parassimpático ↓). O ECG registra essa atividade elétrica.'];
    out.innerHTML = txt[0];
    let k = 0; const t = setInterval(() => { k++; impulso = Math.min(4, k); if (k === 1) f = 1; if (k >= 3) f = 2; draw(); out.innerHTML = txt[Math.min(4, k)]; if (k >= 4) { clearInterval(t); setTimeout(() => { impulso = -1; draw(); }, 2500); } }, 1100);
  };
  setF(0);
})();

/* ═════════ PRESSÃO ARTERIAL ═════════ */
(function () {
  const s = $('#paS'), d = $('#paD'), fc = $('#paF'), out = $('#paOut2'); if (!s) return;
  function draw() {
    const S = +s.value, D = Math.min(+d.value, S - 10), F_ = +fc.value;
    const pa = S >= 140 || D >= 90 ? ['Hipertensão', 'var(--red)', 'Silenciosa, muitas vezes sem sintomas. Riscos: AVC, infarto, insuficiência renal.']
      : S < 90 || D < 60 ? ['Hipotensão', 'var(--orange)', 'Tontura, desmaio, fraqueza. Pode indicar desidratação ou problema cardíaco.']
      : ['Normal', 'var(--green)', 'Em torno de 12 × 8.'];
    const f = F_ < 60 ? ['Bradicardia', 'var(--orange)', 'menos de 60 bpm (comum em atletas: coração mais eficiente)'] : F_ > 100 ? ['Taquicardia', 'var(--red)', 'mais de 100 bpm (esforço, estresse, adrenalina, simpático)'] : ['Normal', 'var(--green)', '60 a 100 bpm em repouso'];
    out.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">
      <div><div style="font-size:1.9rem;font-weight:800;font-variant-numeric:tabular-nums">${S}/${D} <small style="font-size:.9rem;color:var(--label-2)">mmHg (${Math.round(S / 10)} × ${Math.round(D / 10)})</small></div><b style="color:${pa[1]}">${pa[0]}</b><br><small>${pa[2]}</small></div>
      <div><div style="font-size:1.9rem;font-weight:800;font-variant-numeric:tabular-nums">${F_} <small style="font-size:.9rem;color:var(--label-2)">bpm</small> <span style="display:inline-block;animation:hb2 ${(60 / F_).toFixed(2)}s infinite">❤️</span></div><b style="color:${f[1]}">${f[0]}</b><br><small>${f[2]}</small></div></div>
      <small>Pressão arterial = força do sangue na parede das artérias, escrita como <b>sistólica/diastólica</b>.</small><style>@keyframes hb2{30%{transform:scale(1.3)}}</style>`;
  }
  [s, d, fc].forEach(x => x.oninput = draw); draw();
})();

/* ═════════ COAGULAÇÃO ═════════ */
(function () {
  const svg = $('#coagSvg'), out = $('#coagOut'); if (!svg) return;
  let modo = 'n';
  const E = [['Plaquetas + tecido lesado', 'liberam tromboplastina'], ['Protrombina → Trombina', 'precisa de Ca²⁺ · feita no fígado com vitamina K'], ['Fibrinogênio → Fibrina', 'a trombina converte'], ['Coágulo', 'rede de fibrina prende as hemácias']];
  const para = { n: 4, k: 1, ca: 1, p: 0 };
  function draw(k) {
    const bloq = para[modo];
    svg.innerHTML = E.map(([a, b], i) => { const x = 20 + i * 155, ok = i < k && i < bloq, x2 = i === bloq && k > i;
      return `<g style="opacity:${ok ? 1 : .35};transition:opacity .3s">${BOX(x, 60, 140, 70, `stroke:${ok ? 'var(--tint)' : 'var(--sep)'};stroke-width:2`)}<text x="${x + 70}" y="88" text-anchor="middle" style="fill:var(--label);font:${F(700, 11.5)}">${a}</text><text x="${x + 70}" y="108" text-anchor="middle" style="fill:var(--label-2);font:${F(500, 9.5)}">${b}</text></g>${i < 3 ? `<path d="M${x + 142} 95 H${x + 153}" style="stroke:var(--label-2);stroke-width:2"/>` : ''}${x2 ? `<text x="${x + 70}" y="50" text-anchor="middle" style="fill:var(--red);font:${F(800, 18)}">✕ parou aqui</text>` : ''}`; }).join('') +
      (k >= 4 && bloq >= 4 ? Array.from({ length: 10 }, (_, i) => `<line x1="${470 + (i * 37) % 140}" y1="150" x2="${520 + (i * 53) % 110}" y2="225" style="stroke:${C.amar};stroke-width:2"/>`).join('') + Array.from({ length: 7 }, (_, i) => `<ellipse cx="${480 + (i * 29) % 130}" cy="${165 + (i * 17) % 55}" rx="10" ry="6" style="fill:${C.verm}"/>`).join('') + T2(470, 145, 'coágulo') : Array.from({ length: 6 }, (_, i) => `<ellipse cx="${100 + i * 70}" cy="${180 + (i % 2) * 20 + (k ? 20 : 0)}" rx="10" ry="6" style="fill:${C.verm};opacity:.8"/>`).join('') + (k ? T2(80, 230, 'o sangue continua escorrendo') : ''));
  }
  const TX = { n: 'Cascata completa: <b>tromboplastina + Ca²⁺</b> → protrombina vira <b>trombina</b> → fibrinogênio vira <b>fibrina</b> → a rede de fibrina forma o <b>coágulo</b>.', k: '<b>Sem vitamina K</b>, o fígado não produz protrombina suficiente: sem trombina, sem fibrina. Sangramentos. (Parte da vitamina K vem da microbiota intestinal.)', ca: 'Tubos de coleta com <b>EDTA ou citrato</b> sequestram o <b>cálcio</b>: sem Ca²⁺ a protrombina não vira trombina e o sangue não coagula (bom para exames).', p: '<b>Trombocitopenia</b> (plaquetas baixas, ex.: dengue grave): pouca tromboplastina e sem tampão plaquetário: petéquias, hematomas e sangramentos.' };
  $('#coagGo').onclick = () => { let k = 0; draw(0); const t = setInterval(() => { draw(++k); if (k >= 4) { clearInterval(t); out.innerHTML = TX[modo]; } }, RM ? 1 : 550); };
  seg($('#coagSeg'), v => { modo = v; draw(0); out.innerHTML = 'Clique em <b>Cortar o dedo</b>.'; });
  draw(0); out.innerHTML = 'Clique em <b>Cortar o dedo</b> e acompanhe a cascata.';
})();

/* ═════════ ANTICORPOS: 1º/2º CONTATO, VACINA, SORO ═════════ */
(function () {
  const c = $('#respCv'), out = $('#respOut'); if (!c) return;
  const g = c.getContext('2d'); let modo = 'contato';
  const prim = t => t < 6 ? 0 : .28 * (1 - Math.exp(-(t - 6) / 3)) * Math.exp(-Math.max(0, t - 14) / 8);
  const sec = t => t < 1.5 ? 0 : 1 * (1 - Math.exp(-(t - 1.5) / 1.5)) * Math.exp(-Math.max(0, t - 9) / 14);
  function curvas() {
    if (modo === 'contato') return [[t => t < 40 ? prim(t) : prim(t) + sec(t - 40), C.azul, 'anticorpos']];
    if (modo === 'vacina') return [[t => t < 30 ? prim(t) : prim(t) + sec(t - 30) * .9, C.verde, 'vacina (1ª dose + reforço)']];
    return [[t => t < 2 ? 0 : .8 * Math.exp(-(t - 2) / 9), C.lar, 'soro (anticorpos prontos)'], [t => 0, C.cinza, '']];
  }
  function draw(p = 1) {
    const x0 = 60, x1 = 720, X = t => x0 + t / 70 * (x1 - x0), Y = v => 240 - v * 190;
    g.clearRect(0, 0, 760, 280);
    g.strokeStyle = cv('--sep'); g.beginPath(); g.moveTo(x0, 240); g.lineTo(x1, 240); g.moveTo(x0, 40); g.lineTo(x0, 240); g.stroke();
    g.fillStyle = cv('--label-2'); g.font = F(500, 11); g.fillText('anticorpos', 6, 36); g.fillText('dias →', x1 - 40, 262);
    const marca = (t, txt) => { g.strokeStyle = cv('--label-2'); g.setLineDash([4, 4]); g.beginPath(); g.moveTo(X(t), 50); g.lineTo(X(t), 240); g.stroke(); g.setLineDash([]); g.fillStyle = cv('--label'); g.font = F(700, 11.5); g.fillText(txt, X(t) + 4, 58); };
    if (modo === 'contato') { marca(0, '1º contato'); marca(40, '2º contato'); }
    if (modo === 'vacina') { marca(0, '1ª dose'); marca(30, 'reforço'); }
    if (modo === 'soro') { marca(2, 'soro aplicado'); }
    curvas().forEach(([fn, cor]) => { g.strokeStyle = cor; g.lineWidth = 3.5; g.beginPath(); for (let t = 0; t <= 70 * p; t += .25) { t ? g.lineTo(X(t), Y(fn(t))) : g.moveTo(X(t), Y(fn(t))); } g.stroke(); });
  }
  const TX = {
    contato: '<b>Resposta primária</b> (1º contato): poucos linfócitos reconhecem o antígeno e precisam se multiplicar; vários dias de latência, produção baixa (predomina IgM), e ficam <b>células de memória</b>. <b>Resposta secundária</b>: rápida e muito mais intensa (predomina IgG); o patógeno costuma ser eliminado antes dos sintomas.',
    vacina: '<b>Vacina = imunização ativa artificial</b>: antígeno morto, atenuado ou mRNA faz o corpo produzir <b>os próprios anticorpos</b>. Lenta (preventiva), duradoura, <b>com memória</b>; o reforço aproveita a memória e gera a resposta secundária.',
    soro: '<b>Soro = imunização passiva artificial</b>: anticorpos <b>prontos</b> (produzidos em animal, ex.: cavalo). Ação <b>imediata</b> (tratamento, ex.: picada de cobra), mas curta e <b>sem memória</b>: uma nova picada exige novo soro.',
  };
  function go() { anim(1800, p => draw(p)); out.innerHTML = TX[modo]; }
  seg($('#respSeg'), v => { modo = v; go(); }); draw(0); go();
})();

sorter($('#sortImun'), [
  ['Tomar a vacina da gripe', 'Ativa artificial', 'O corpo produz os anticorpos; o antígeno foi introduzido por intervenção humana.'],
  ['Ter tido catapora', 'Ativa natural', 'Contraiu a doença e produziu os próprios anticorpos e memória.'],
  ['Bebê recebendo anticorpos pela placenta (IgG)', 'Passiva natural', 'Anticorpos prontos, por via natural; sem memória.'],
  ['Bebê recebendo anticorpos no leite/colostro (IgA)', 'Passiva natural', 'Anticorpos prontos, por via natural.'],
  ['Soro antiofídico após picada de cobra', 'Passiva artificial', 'Anticorpos prontos, inoculados: imediato, sem memória.'],
], ['Ativa natural', 'Ativa artificial', 'Passiva natural', 'Passiva artificial']);

/* ═════════ VENTILAÇÃO ═════════ */
(function () {
  const svg = $('#ventSvg'), r = $('#ventR'), out = $('#ventOut'); if (!svg) return;
  function draw() {
    const t = +r.value / 100, larg = 1 + t * .12, diaY = 200 + t * 26;
    const pulmao = x => `<path d="M${400 + x * 12} 70 C${400 + x * (60 + 40 * t)} 70 ${400 + x * (95 + 22 * t)} 120 ${400 + x * (90 + 18 * t)} ${diaY - 12} L${400 + x * 18} ${diaY - 12} Z" style="fill:rgba(217,83,79,${.25 + t * .2});stroke:${C.verm};stroke-width:2"/>`;
    svg.innerHTML = `
      <path d="M400 18 V70 M400 70 L290 90 M400 70 L350 90" style="stroke:#c97b8a;stroke-width:6;fill:none;stroke-linecap:round"/>
      <path d="M${400 - 120 * larg} 50 Q400 30 ${400 + 120 * larg} 50 L${400 + 130 * larg} ${diaY} L${400 - 130 * larg} ${diaY} Z" style="fill:none;stroke:var(--label-2);stroke-width:3"/>
      ${[0, 1, 2, 3].map(k => `<path d="M${400 - 120 * larg} ${70 + k * 32} Q400 ${60 + k * 32 + t * 6} ${400 + 120 * larg} ${70 + k * 32}" style="fill:none;stroke:var(--sep);stroke-width:2"/>`).join('')}
      ${pulmao(-1)}${pulmao(1)}
      <path d="M${400 - 130 * larg} ${diaY} Q400 ${diaY - (1 - t) * 50} ${400 + 130 * larg} ${diaY}" style="fill:none;stroke:${C.lar};stroke-width:6"/>
      ${T(16, 120, 'Diafragma:', 'start', C.lar, 700, 12)}${T(16, 138, t > .5 ? 'contraído, aplanado' : 'relaxado, em cúpula', 'start', C.lar, 600, 12)}
      ${T(20, 40, t > .5 ? 'INSPIRAÇÃO' : 'EXPIRAÇÃO', 'start', 'var(--tint)', 800, 14)}
      ${T2(20, 62, 'volume do tórax: ' + (t > .5 ? 'aumenta' : 'diminui'))}${T2(20, 80, 'pressão interna:')}${T2(20, 96, t > .5 ? 'menor que a atmosférica' : 'maior que a atmosférica')}
      ${T(400, 14, t > .5 ? '↓ ar entra ↓' : '↑ ar sai ↑', 'middle', '#3b82c4', 700, 12)}`;
    out.innerHTML = t > .5
      ? '<b>Inspiração</b>: o diafragma <b>contrai e se aplana</b> (e os intercostais elevam as costelas); o volume do tórax aumenta, a pressão interna fica <b>menor que a atmosférica</b> e o ar <b>entra</b>. O diafragma faz 70 a 75% do trabalho.'
      : '<b>Expiração</b> tranquila: é <b>passiva</b>, só relaxamento. O diafragma volta à cúpula, o volume diminui, a pressão interna fica <b>maior que a atmosférica</b> e o ar <b>sai</b>. Na expiração forçada entram os intercostais internos e o abdome.';
  }
  r.oninput = draw;
  let it; $('#ventPlay').onclick = () => { clearInterval(it); let k = 0; it = setInterval(() => { r.value = 50 + 50 * Math.sin(k / 8 - Math.PI / 2) * -1; draw(); if (++k > 100) clearInterval(it); }, 60); };
  draw();
})();
