/* Laboratórios de Filosofia 3º tri. Usa só variáveis do ios.css (claro/escuro). */
(function () {
const $ = s => document.querySelector(s);
const cv = n => getComputedStyle(document.body).getPropertyValue(n).trim() || '#888';
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const T = (x, y, s, o = '') => `<text x="${x}" y="${y}" ${o} style="fill:var(--label);font:600 13px Inter,system-ui,sans-serif">${s}</text>`;
const T2 = (x, y, s, o = '') => `<text x="${x}" y="${y}" ${o} style="fill:var(--label-2);font:500 11.5px Inter,system-ui,sans-serif">${s}</text>`;
const BOX = (x, y, w, h, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" style="fill:var(--bg-2);stroke:var(--sep);stroke-width:1.2;filter:drop-shadow(0 2px 4px rgba(0,0,0,.12))" ${extra}/>`;
function seg(el, cb) { if (!el) return; el.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); cb(b.dataset.v); }); }
function loop(canvas, draw) { // só anima quando visível
  let on = false, raf = 0;
  const tick = t => { draw(t); if (on && !RM) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(es => { on = es[0].isIntersecting; cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(tick); }).observe(canvas);
  draw(0);
  return () => { if (RM || !on) draw(performance.now()); };
}
function steps(el, labels, cb) {
  el.innerHTML = labels.map((l, i) => `<button type="button" data-i="${i}">${l}</button>`).join('');
  const go = i => { el.querySelectorAll('button').forEach((b, j) => b.classList.toggle('on', j === i)); cb(i); };
  el.onclick = e => { const b = e.target.closest('button'); if (b) go(+b.dataset.i); };
  go(0);
}

/* ── 0. Navio de Teseu ── */
(function () {
  const svg = $('#teseuSvg'), r = $('#teseuR'), out = $('#teseuOut'); if (!svg) return;
  const ordem = [5, 2, 9, 0, 7, 11, 3, 8, 1, 10, 4, 6];
  function draw() {
    const k = +r.value, novas = new Set(ordem.slice(0, k));
    let p = '';
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / 6), col = i % 6, x = 150 + col * 58 + row * 14, y = 128 + row * 26, w = 56 - row * 4;
      const nova = novas.has(i);
      p += `<rect x="${x}" y="${y}" width="${w}" height="24" rx="3" style="fill:${nova ? '#e3b04b' : '#7a4a22'};stroke:${nova ? '#b07d1e' : '#4d2c12'};stroke-width:1.5;transition:fill .4s"/>`;
    }
    svg.innerHTML = `
      <path d="M0 190 Q80 180 160 190 T320 190 T480 190 T640 190 V230 H0Z" style="fill:#3b82c4;opacity:.35"/>
      <line x1="320" y1="20" x2="320" y2="128" style="stroke:#5b3a1a;stroke-width:6"/>
      <path d="M326 28 L430 110 L326 110 Z" style="fill:var(--bg-2);stroke:var(--sep);stroke-width:1.5"/>
      <path d="M140 128 L500 128 L470 180 L176 180 Z" style="fill:none;stroke:#4d2c12;stroke-width:2"/>
      ${p}
      ${T(20, 34, `Tábuas novas: ${k} de 12`)}
      ${T2(20, 54, k === 12 ? 'nenhuma tábua original' : `${Math.round(k / 12 * 100)}% trocado`)}
      <rect x="22" y="70" width="12" height="12" rx="2" style="fill:#7a4a22"/>${T2(40, 80, 'original')}
      <rect x="22" y="90" width="12" height="12" rx="2" style="fill:#e3b04b"/>${T2(40, 100, 'nova')}`;
    const fala = k === 0
      ? 'Nenhuma tábua trocada. Fácil: <b>é o mesmo navio</b>. Agora arraste.'
      : `<b>Heráclito:</b> ele nunca foi "o mesmo" de um instante para o outro; o navio <i>está sendo</i>, como o rio.<br>
         <b>Parmênides:</b> a troca é aparência dos sentidos; se o navio <i>é</i>, ele não pode virar não-ser.<br>
         <b>Aristóteles:</b> mudou a matéria (propriedades); a <i>essência</i> de navio, feito para navegar, continua nele.` +
        (k === 12 ? '<br><small>E se alguém montasse outro navio com as 12 tábuas velhas? Qual dos dois seria "o" navio? É esse o problema da identidade.</small>' : '');
    out.innerHTML = fala;
  }
  r.oninput = draw; draw();
  let it = 0;
  $('#teseuAuto').onclick = function () {
    clearInterval(it); if (+r.value >= 12) r.value = 0;
    it = setInterval(() => { r.value = +r.value + 1; draw(); if (+r.value >= 12) clearInterval(it); }, 650);
  };
})();

/* ── 1. Rio de Heráclito ── */
(function () {
  const c = $('#rioCv'), out = $('#rioOut'); if (!c) return;
  const g = c.getContext('2d'); let id = 0, olhar = 'h', entradas = [], pe = 0;
  const P = Array.from({ length: 90 }, () => ({ id: id++, x: Math.random() * 640, y: 60 + Math.random() * 120, v: 0.6 + Math.random() * 1.2, ph: Math.random() * 6 }));
  let last = 0;
  const redraw = loop(c, t => {
    const dt = last ? Math.min(50, t - last) / 16 : 1; last = t;
    g.clearRect(0, 0 , 640, 220);
    g.fillStyle = olhar === 'h' ? 'rgba(59,130,196,.28)' : 'rgba(128,128,140,.22)';
    g.fillRect(0, 50, 640, 140);
    for (const p of P) {
      if (olhar === 'h') { p.x += p.v * dt; if (p.x > 645) { p.x = -5; p.id = id++; p.y = 60 + Math.random() * 120; } }
      const y = p.y + (olhar === 'h' ? Math.sin(t / 600 + p.ph) * 4 : 0);
      g.beginPath(); g.arc(p.x, y, 3.2, 0, 7);
      g.fillStyle = olhar === 'h' ? '#3b82c4' : cv('--label-2'); g.fill();
    }
    if (pe > 0) { g.font = '40px system-ui'; g.fillText('🦶', 300, 140); pe -= dt; }
    g.fillStyle = cv('--label'); g.font = '600 14px Inter,system-ui,sans-serif';
    g.fillText(olhar === 'h' ? 'Tudo flui: as gotas que passam nunca são as mesmas' : 'Pela razão: o Ser é uno e imóvel. O fluxo é aparência.', 16, 30);
    g.fillStyle = cv('--label-2'); g.font = '500 12px Inter,system-ui,sans-serif';
    g.fillText(olhar === 'h' ? 'devir · luta dos contrários · logos' : 'via da verdade (razão) × via da opinião (sentidos)', 16, 212);
  });
  $('#rioEntrar').onclick = () => {
    const ids = new Set(P.filter(p => p.x > 280 && p.x < 360).map(p => p.id));
    entradas.push(ids); pe = 40;
    if (olhar === 'p') { out.innerHTML = 'Para Parmênides não há o que comparar: <b>o rio é</b>. Que ele "corre" é o que os sentidos dizem, e os sentidos enganam.'; redraw(); return; }
    if (entradas.length === 1) out.innerHTML = `Primeira vez: você tocou <b>${ids.size} gotas</b>. Espere um pouco e entre de novo.`;
    else {
      const a = entradas[entradas.length - 2], comum = [...ids].filter(x => a.has(x)).length;
      out.innerHTML = `Desta vez: ${ids.size} gotas, <b>${comum} em comum</b> com a anterior. Nem o rio é o mesmo, nem você (seu corpo também mudou). <i>"Ninguém se banha duas vezes no mesmo rio."</i>`;
    }
    redraw();
  };
  seg($('#rioOlhar'), v => { olhar = v; entradas = []; out.innerHTML = v === 'h' ? 'Entre no rio duas vezes e compare a água.' : 'Com os olhos da razão, o movimento some: tente entrar no rio agora.'; redraw(); });
})();

/* ── Jogos "quem diria isso?" ── */
function sorter(el, items, opts) {
  if (!el) return;
  let fila = shuffle(items), i = 0, ac = 0, tot = 0, done = false;
  function show() {
    if (i >= fila.length) { el.innerHTML = `<div class="card-q">Fim! <b style="color:var(--tint)">${ac} de ${tot}</b> de primeira.</div><div class="opts"><button class="lbtn pri" type="button">Jogar de novo</button></div>`; el.querySelector('button').onclick = () => { fila = shuffle(items); i = ac = tot = 0; show(); }; return; }
    const [frase] = fila[i]; done = false;
    el.innerHTML = `<div class="meta"><span>${i + 1} de ${fila.length}</span><span>acertos de primeira: ${ac}</span></div><div class="card-q">"${frase}"</div><div class="opts">${opts.map(o => `<button class="lbtn" type="button" data-k="${o}">${o}</button>`).join('')}</div><div class="fb"></div>`;
    let errou = false;
    el.querySelector('.opts').onclick = e => {
      const b = e.target.closest('button'); if (!b || done) return;
      const [, cert, why] = fila[i], fb = el.querySelector('.fb');
      if (b.dataset.k === cert) {
        b.classList.add('ok'); done = true; tot++; if (!errou) ac++;
        fb.className = 'fb ok'; fb.innerHTML = '✔ ' + why;
        setTimeout(() => { i++; show(); }, 1900);
      } else { errou = true; b.classList.add('no'); b.disabled = true; fb.className = 'fb no'; fb.textContent = 'Não é. Tente de novo.'; }
    };
  }
  show();
}
/* ── 4. Potência e ato ── */
(function () {
  const svg = $('#potSvg'), r = $('#potR'), out = $('#potOut'); if (!svg) return;
  let ex = 0;
  function draw() {
    const t = +r.value / 100; let s = '';
    if (ex === 0) {
      const h = 10 + t * 150, copa = Math.max(0, (t - .3) / .7) * 70;
      s = `<rect x="0" y="200" width="640" height="40" style="fill:#7a5230;opacity:.5"/>
        ${t < .08 ? `<ellipse cx="320" cy="196" rx="12" ry="8" style="fill:#8d6e63"/>` : `
        <path d="M320 200 V${200 - h}" style="stroke:#6d4c41;stroke-width:${3 + t * 12};stroke-linecap:round"/>
        ${copa > 2 ? `<circle cx="320" cy="${200 - h}" r="${copa}" style="fill:#2e9d6a;opacity:.9"/><circle cx="${290}" cy="${210 - h}" r="${copa * .7}" style="fill:#2e9d6a"/><circle cx="${350}" cy="${210 - h}" r="${copa * .7}" style="fill:#2e9d6a"/>` : `<path d="M320 ${200 - h} q-14 -6 -18 -16 q14 0 18 16 q4 -16 18 -16 q-4 10 -18 16" style="fill:#2e9d6a"/>`}`}
        ${t === 1 ? '<circle cx="300" cy="60" r="6" style="fill:#c0392b"/><circle cx="345" cy="72" r="6" style="fill:#c0392b"/>' : ''}`;
    } else {
      const cut = t * 30;
      s = `<rect x="0" y="210" width="640" height="30" style="fill:var(--sep)"/>
        <rect x="${250 + cut}" y="${40 + cut * .6}" width="${140 - cut * 2}" height="${170 - cut * .6}" rx="${t * 30}" style="fill:#d7d4cf;stroke:#a8a39b;stroke-width:2;opacity:${1 - t * .85}"/>
        <g style="opacity:${t}"><circle cx="320" cy="70" r="20" style="fill:#e8e5df;stroke:#a8a39b;stroke-width:2"/>
        <path d="M300 92 Q320 86 340 92 L346 150 L332 210 H308 L294 150 Z" style="fill:#e8e5df;stroke:#a8a39b;stroke-width:2"/>
        <path d="M300 100 L278 140 M340 100 L362 128" style="stroke:#a8a39b;stroke-width:7;stroke-linecap:round"/></g>
        ${t > .05 && t < 1 ? `<text x="${400}" y="${100 + Math.sin(t * 40) * 6}" style="font-size:26px">🔨</text>` : ''}`;
    }
    const nomes = ex === 0 ? ['Semente', 'árvore'] : ['Bloco de mármore', 'estátua'];
    svg.innerHTML = s + T(16, 26, t === 0 ? `${nomes[0]}: ${nomes[1]} em POTÊNCIA` : t === 1 ? `${nomes[1][0].toUpperCase() + nomes[1].slice(1)}: forma em ATO` : 'MOVIMENTO: potência → ato') +
      `<rect x="16" y="38" width="200" height="8" rx="4" style="fill:var(--sep)"/><rect x="16" y="38" width="${200 * t}" height="8" rx="4" style="fill:var(--tint)"/>` + T2(16, 62, `${Math.round(t * 100)}% atualizado`);
    out.innerHTML = t === 0
      ? (ex === 0 ? 'A semente <b>já possui a essência de uma árvore</b> e a <b>potência</b> de se tornar uma. Não vira qualquer coisa: vira árvore.' : 'O mármore tem a <b>potência</b> de virar estátua: capacidade de se transformar numa forma nova.')
      : t < 1 ? '<b>Movimento</b> = mudança qualitativa dos seres na passagem da potência para o ato. Heráclito tem razão (algo muda) e Parmênides também (a essência permanece).'
      : (ex === 0 ? '<b>Ato</b>: a forma atualizada, realizada. E a árvore agora tem nova potência: dar frutos e sementes. Um só mundo, sem precisar das Ideias de Platão.' : '<b>Ato</b>: a estátua pronta. O trabalho do escultor foi o movimento entre os dois.');
  }
  r.oninput = draw; seg($('#potSeg'), v => { ex = +v; r.value = 0; draw(); }); draw();
})();

/* ── 5. Dialética ── */
(function () {
  const svg = $('#dialSvg'), out = $('#dialOut'); if (!svg) return;
  const EX = [
    { t: ['Antigo Regime', 'feudalismo, absolutismo'], a: ['Revolução Francesa', 'liberdade, igualdade'], s: ['Napoleão', 'imperador que espalha as leis da Revolução'],
      txt: ['<b>Tese</b>: a situação dada, o Antigo Regime.', '<b>Antítese</b>: a oposição que nasce de dentro dela, a Revolução. O choque das duas move a história.', '<b>Síntese</b>: Napoleão junta elementos dos dois (é imperador, mas espalha o Código Civil da Revolução). Ela <b>supera e conserva</b>.', 'A síntese vira <b>nova tese</b>, que terá sua própria antítese. O processo <b>se repete de modo dialético</b>: progresso acumulativo e não linear.'] },
    { t: ['Ser', 'puro, sem nenhuma qualidade'], a: ['Nada', 'o ser puro, vazio, é igual ao nada'], s: ['Devir', 'passagem de um ao outro'],
      txt: ['<b>Tese</b>: o puro Ser, o ponto de partida de Parmênides. Mas um ser sem nenhuma determinação...', '<b>Antítese</b>: ...não tem nada que o distinga do <b>Nada</b>. Pensar o Ser já leva ao seu contrário.', '<b>Síntese</b>: o <b>Devir</b> (vir a ser), a passagem do ser ao nada e do nada ao ser. É assim que Hegel começa sua Lógica: <b>junta Parmênides e Heráclito</b>.', 'O devir resulta em algo determinado, que é uma nova tese. Identidade, para Hegel, é processo: o real só se entende pelo seu contrário.'] },
  ];
  let ex = 0, k = 0;
  function caixa(x, y, [n, d], cor, op = 1) { return `<g style="opacity:${op};transition:opacity .4s">${BOX(x, y, 170, 62, `style="fill:var(--bg-2);stroke:${cor};stroke-width:2.5"`)}<text x="${x + 85}" y="${y + 27}" text-anchor="middle" style="fill:var(--label);font:700 14px Inter,sans-serif">${n}</text><text x="${x + 85}" y="${y + 47}" text-anchor="middle" style="fill:var(--label-2);font:500 11px Inter,sans-serif">${d}</text></g>`; }
  function draw() {
    const e = EX[ex];
    let s = `<defs><marker id="ad" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" style="fill:var(--tint)"/></marker></defs>`;
    if (k < 3) {
      s += T2(70, 24, 'TESE') + caixa(40, 32, e.t, '#3b82c4');
      s += T2(450, 24, 'ANTÍTESE') + caixa(430, 32, e.a, '#d9534f', k >= 1 ? 1 : .12);
      if (k >= 1) s += `<text x="320" y="72" text-anchor="middle" style="font-size:30px">⚡</text>`;
      if (k >= 2) s += `<path d="M125 96 Q130 150 230 168 M515 96 Q510 150 410 168" style="fill:none;stroke:var(--tint);stroke-width:2.5;marker-end:url(#ad)"/>` + T2(278, 150, 'SÍNTESE') + caixa(235, 158, e.s, '#e3a21a');
    } else {
      s += T2(70, 24, 'NOVA TESE') + caixa(40, 32, e.s, '#e3a21a') + T2(450, 24, 'NOVA ANTÍTESE') + caixa(430, 32, ['?', 'a contradição seguinte'], '#d9534f', .5);
      s += `<path d="M320 120 a50 40 0 1 1 -1 0" style="fill:none;stroke:var(--tint);stroke-width:2.5;stroke-dasharray:6 5;marker-end:url(#ad)"><animateTransform attributeName="transform" type="rotate" from="0 320 160" to="360 320 160" dur="6s" repeatCount="indefinite"/></path>` + T(268, 225, 'e o processo se repete');
    }
    svg.innerHTML = s; out.innerHTML = e.txt[k];
    $('#dialNext').disabled = k >= 3;
  }
  $('#dialNext').onclick = () => { k = Math.min(3, k + 1); draw(); };
  $('#dialReset').onclick = () => { k = 0; draw(); };
  seg($('#dialSeg'), v => { ex = +v; k = 0; draw(); });
  draw();
})();

/* ── 6. Marx: de cabeça para baixo ── */
(function () {
  const svg = $('#mxSvg'), out = $('#mxOut'); if (!svg) return;
  function draw(v) {
    const m = v === 'm';
    const topo = m ? ['SUPERESTRUTURA', 'Estado · leis · religião · arte · filosofia · ideologia'] : ['IDEIAS · ESPÍRITO', 'razão · cultura · artes · leis · tecnologia'];
    const base = m ? ['INFRAESTRUTURA (base econômica)', 'forças produtivas + relações de produção (trabalho)'] : ['MUNDO MATERIAL', 'economia, natureza: efeito das ideias'];
    svg.innerHTML = `<defs><marker id="am" markerWidth="9" markerHeight="9" refX="5" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9Z" style="fill:var(--tint)"/></marker></defs>
      <path d="M180 20 H460 L500 90 H140 Z" style="fill:var(--bg-2);stroke:${m ? 'var(--sep)' : 'var(--tint)'};stroke-width:2"/>
      <text x="320" y="52" text-anchor="middle" style="fill:var(--label);font:700 14px Inter,sans-serif">${topo[0]}</text>
      <text x="320" y="72" text-anchor="middle" style="fill:var(--label-2);font:500 11px Inter,sans-serif">${topo[1]}</text>
      <rect x="110" y="170" width="420" height="72" rx="10" style="fill:var(--bg-2);stroke:${m ? 'var(--tint)' : 'var(--sep)'};stroke-width:2"/>
      <text x="320" y="200" text-anchor="middle" style="fill:var(--label);font:700 14px Inter,sans-serif">${base[0]}</text>
      <text x="320" y="221" text-anchor="middle" style="fill:var(--label-2);font:500 11px Inter,sans-serif">${base[1]}</text>
      <path d="${m ? 'M320 166 V96' : 'M320 94 V164'}" style="stroke:var(--tint);stroke-width:4;marker-end:url(#am)"/>
      <text x="332" y="135" style="fill:var(--tint);font:700 12px Inter,sans-serif">determina</text>
      <g style="transform-origin:575px 130px;transform:rotate(${m ? 0 : 180}deg);transition:transform .8s cubic-bezier(.3,1.4,.5,1)">
        <circle cx="575" cy="98" r="11" style="fill:var(--label)"/>
        <path d="M575 109 V140 M575 140 L563 166 M575 140 L587 166 M560 120 L590 120" style="stroke:var(--label);stroke-width:4;fill:none;stroke-linecap:round"/>
      </g>
      ${T2(540, 196, m ? 'dialética de pé' : 'de cabeça para baixo')}`;
    out.innerHTML = m
      ? '<b>Marx (materialismo)</b>: a base é o modo como a sociedade <b>produz</b> a vida. É ela que determina a superestrutura (leis, Estado, religião, ideias). "O ser social determina a consciência." As transformações <b>econômicas</b> movem a história.'
      : '<b>Hegel (idealismo)</b>: as <b>ideias</b> e o Espírito vêm primeiro e movem a história; a produção cultural transforma a sociedade. Para Marx, isso é a dialética "de cabeça para baixo". Clique em Marx para desvirar.';
  }
  seg($('#mxSeg'), draw); draw('h');
})();

/* ── 7. Han: bolha ── */
(function () {
  const feed = $('#bolhaFeed'); if (!feed) return;
  const CAT = { azul: ['#3b82c4', 'Time Parque'], laranja: ['#e0702a', 'Time Estacionamento'], esporte: ['#2e9d6a', 'Esporte'], cultura: ['#8e44ad', 'Cultura'], ciencia: ['#16808b', 'Ciência'] };
  const POSTS = {
    azul: ['Parque já! A cidade precisa de verde.', 'Estudo mostra: áreas verdes reduzem o calor.', 'Quem defende estacionamento não pensa no futuro.', 'Abaixo-assinado pelo parque passa de 10 mil.', 'O outro lado só quer saber de carro.'],
    laranja: ['Estacionamento resolve o trânsito do centro!', 'Comerciantes apoiam o estacionamento.', 'Parque? Quem paga a manutenção?', 'Vídeo: o caos para estacionar no centro.', 'O outro lado não entende de economia.'],
    esporte: ['Vôlei da escola vai para a final.', 'Treino aberto no sábado.'],
    cultura: ['Nova exposição no museu da cidade.', 'Festival de cinema começa sexta.'],
    ciencia: ['Por que o céu é azul? Thread.', 'Eclipse visível no próximo mês.'],
  };
  let w;
  function reset() { w = { azul: 1, laranja: 1, esporte: 1, cultura: 1, ciencia: 1 }; render(); }
  function pickCat() { const tot = Object.values(w).reduce((a, b) => a + b, 0); let r = Math.random() * tot; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'azul'; }
  function render() {
    const items = Array.from({ length: 6 }, () => { const k = pickCat(); const l = POSTS[k]; return [k, l[Math.floor(Math.random() * l.length)]]; });
    feed.innerHTML = items.map(([k, t], i) => `<div class="post" style="animation-delay:${i * 60}ms"><span class="av" style="background:${CAT[k][0]}">${CAT[k][1][0]}</span><span>${t}<small>${CAT[k][1]}</small></span><button class="lbtn" type="button" data-k="${k}">♡ Curtir</button></div>`).join('');
    const tot = Object.values(w).reduce((a, b) => a + b, 0), ps = Object.values(w).map(x => x / tot);
    const H = -ps.reduce((a, p) => a + (p > 0 ? p * Math.log(p) : 0), 0) / Math.log(5);
    const m = $('#bolhaMeter'); m.style.width = Math.round(H * 100) + '%'; m.style.background = H > .7 ? 'var(--green)' : H > .45 ? 'var(--orange)' : 'var(--red)';
    $('#bolhaPerfil').innerHTML = Object.entries(w).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div style="display:flex;align-items:center;gap:8px;margin:3px 0"><span style="width:10px;height:10px;border-radius:50%;background:${CAT[k][0]}"></span><span style="flex:1">${CAT[k][1]}</span><b style="color:var(--label)">${Math.round(v / tot * 100)}%</b></div>`).join('');
    $('#bolhaTxt').innerHTML = H > .7 ? 'Feed variado: você vê lados diferentes (esfera pública de debate).'
      : H > .45 ? 'O algoritmo já te colocou num <b>nicho</b>. O outro lado aparece cada vez menos.'
      : 'Você está numa <b>bolha isolante</b>: só chega o que confirma o que você já pensa. O outro lado vira "o inimigo". Isso é a <b>polarização comunicativa</b> de Han.';
  }
  feed.onclick = e => { const b = e.target.closest('button[data-k]'); if (!b) return; w[b.dataset.k] *= 2.2; b.textContent = '♥ Curtido'; b.classList.add('on'); setTimeout(render, 450); };
  $('#bolhaReset').onclick = reset; reset();
})();

/* ── Revisão: quem disse (todos) ── */
sorter($('#sortTodos'), [
  ['Ninguém se banha duas vezes no mesmo rio.', 'Heráclito', 'Devir: tudo flui.'],
  ['O Ser é, o não-ser não é.', 'Parmênides', 'O Ser é uno, eterno e imóvel.'],
  ['Na realidade, só existem átomos e vazio.', 'Demócrito', 'O resto (doce, amargo, cor) é efeito nos sentidos.'],
  ['O vazio não é o nada: é o espaço do movimento.', 'Demócrito', 'Um não-ser que existe.'],
  ['As coisas do mundo sensível são cópias imperfeitas das Ideias.', 'Platão', 'Mundo inteligível × mundo sensível.'],
  ['Conhecer é relembrar o que a alma já contemplou.', 'Platão', 'Reminiscência (anamnese).'],
  ['A essência está nas próprias coisas, não em outro mundo.', 'Aristóteles', 'Recusa do dualismo platônico.'],
  ['A semente é árvore em potência.', 'Aristóteles', 'Movimento = passagem da potência ao ato.'],
  ['Deve haver um primeiro motor que move sem ser movido.', 'Aristóteles', 'Ato puro, sem potência.'],
  ['O que é racional é real, e o que é real é racional.', 'Hegel', 'Idealismo: pensamento e realidade têm a mesma estrutura.'],
  ['A contradição é o que move a realidade.', 'Hegel', 'Aceitação do contraditório.'],
  ['O Espírito Absoluto guia a história em busca de uma identidade própria.', 'Hegel', 'Processo racional da história.'],
  ['O ser social determina a consciência.', 'Marx', 'Materialismo: a base econômica vem primeiro.'],
  ['Em Hegel, a dialética está de cabeça para baixo.', 'Marx', 'Crítica ao idealismo.'],
  ['A história de todas as sociedades é a história da luta de classes.', 'Marx', 'Manifesto Comunista (1848), com Engels.'],
  ['O algoritmo nos fecha em bolhas e intensifica a polarização.', 'Han', 'Infocracia.'],
  ['O poder hoje não proíbe: ele explora a liberdade.', 'Han', 'Autoexploração, psicopolítica.'],
  ['Liberdade, amor e felicidade não são mensuráveis.', 'Han', 'Crítica ao dataísmo.'],
], ['Heráclito', 'Parmênides', 'Demócrito', 'Platão', 'Aristóteles', 'Hegel', 'Marx', 'Han']);
})();
