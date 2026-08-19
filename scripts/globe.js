/* ═══════════════════════════════════════════════════════════
   globe.js — Globo terrestre interativo em canvas 2D puro

   Zero dependências. Os continentes vêm da máscara de terra em
   scripts/globe-landmask.js (Natural Earth 110m).

   Inspirado no Interactive Globe do 21st.dev (canvas, esfera de
   Fibonacci) — reescrito aqui em JS puro, com continentes reais.

   COMO USAR
     <script src="scripts/globe-landmask.js"></script>
     <script src="scripts/globe-regions.js"></script>  <!-- opcional -->
     <script src="scripts/globe.js"></script>

     <div class="globe-wrap">
       <canvas class="globe"
               data-globe-markers="48.85,2.35,Paris|52.52,13.40,Berlim"></canvas>
     </div>

   Cada marcador é "latitude,longitude,rótulo", separados por |.
   Latitude: positiva ao norte. Longitude: positiva a leste.

   Atributos opcionais no <canvas>:
     data-globe-dots     densidade dos continentes (padrão 8600)
     data-globe-speed    velocidade da rotação (padrão 1)
     data-globe-tilt     inclinação do eixo em graus (padrão 18)

   Arraste com o mouse ou o dedo para girar. Solte e ele volta a girar
   sozinho. Em prefers-reduced-motion ele desenha parado, sem animar.

   REGIÕES (subdivisão por cor + fronteiras) — opcional
   Se scripts/globe-regions.js estiver carregado, as 5 subdivisões do
   resumo (anglo/méxico/central/andina/platina) ganham cor própria e
   contorno de fronteira. Marque cada capítulo com:

     <div class="chapter-header" data-globe-focus="23.6,-102.5"
          data-globe-region="mexico">México</div>

   Ao rolar até ali, o globo gira para a região E acende só aquela cor,
   apagando as demais (efeito "holofote"). Capítulos sem
   data-globe-region (ex.: Visão Geral) mostram as 5 cores cheias.
   Cores em --globe-region-anglo / -mexico / -central / -andina / -platina.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Máscara de terra ─────────────────────────────────── */

  function decodeMask(m) {
    var bin = atob(m.data);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return { w: m.width, h: m.height, bytes: bytes };
  }

  // lat/lon em graus -> true se cai em terra firme
  function isLand(mask, lat, lon) {
    var col = Math.floor((lon + 180) / 360 * mask.w);
    var row = Math.floor((90 - lat) / 180 * mask.h);
    if (col < 0) col = 0; else if (col >= mask.w) col = mask.w - 1;
    if (row < 0) row = 0; else if (row >= mask.h) row = mask.h - 1;
    var idx = row * mask.w + col;
    return (mask.bytes[idx >> 3] >> (7 - (idx & 7))) & 1;
  }

  /* ── Regiões (subdivisão por cor) + fronteiras ────────────
     Opcional: só carrega se scripts/globe-regions.js estiver presente
     na página. Mesma grade do landmask, mas 4 bits/célula (código de
     região 0-5) mais 1 bit/célula (célula de fronteira). */

  function decodeRegions(r) {
    var rbin = atob(r.regionData);
    var rbytes = new Uint8Array(rbin.length);
    for (var i = 0; i < rbin.length; i++) rbytes[i] = rbin.charCodeAt(i);
    var bbin = atob(r.borderData);
    var bbytes = new Uint8Array(bbin.length);
    for (var j = 0; j < bbin.length; j++) bbytes[j] = bbin.charCodeAt(j);
    return { w: r.width, h: r.height, region: rbytes, border: bbytes, names: r.regionNames };
  }

  function cellIndex(regions, lat, lon) {
    var col = Math.floor((lon + 180) / 360 * regions.w);
    var row = Math.floor((90 - lat) / 180 * regions.h);
    if (col < 0) col = 0; else if (col >= regions.w) col = regions.w - 1;
    if (row < 0) row = 0; else if (row >= regions.h) row = regions.h - 1;
    return row * regions.w + col;
  }

  // lat/lon -> código de região (0 = nenhuma / resto do mundo)
  function regionAt(regions, lat, lon) {
    var idx = cellIndex(regions, lat, lon);
    var byte = regions.region[idx >> 1];
    return (idx & 1) === 0 ? (byte >> 4) : (byte & 0x0F);
  }

  // lat/lon -> true se a célula está na borda entre duas regiões (ou litoral)
  function borderAt(regions, lat, lon) {
    var idx = cellIndex(regions, lat, lon);
    return !!((regions.border[idx >> 3] >> (7 - (idx & 7))) & 1);
  }

  /* ── Geometria ────────────────────────────────────────── */

  // Distribui n pontos quase uniformemente na esfera (espiral de Fibonacci).
  // Uniforme de verdade — bem melhor que varrer lat/lon, que amontoa nos polos.
  function fibonacciSphere(n) {
    var pts = [];
    var golden = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad
    for (var i = 0; i < n; i++) {
      var y = 1 - (i / (n - 1)) * 2;      // de 1 (polo N) a -1 (polo S)
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = golden * i;
      pts.push({
        x: Math.cos(theta) * r,
        y: y,
        z: Math.sin(theta) * r
      });
    }
    return pts;
  }

  // lat/lon em graus -> ponto unitário na esfera
  function latLonToVec(lat, lon) {
    var la = lat * Math.PI / 180;
    var lo = lon * Math.PI / 180;
    return {
      x: Math.cos(la) * Math.sin(lo),
      y: Math.sin(la),
      z: Math.cos(la) * Math.cos(lo)
    };
  }

  // vetor unitário -> lat/lon em graus
  function vecToLatLon(v) {
    return {
      lat: Math.asin(v.y) * 180 / Math.PI,
      lon: Math.atan2(v.x, v.z) * 180 / Math.PI
    };
  }

  // rotaciona em torno de Y (giro do globo), depois em torno de X (inclinação)
  function rotate(p, spin, tilt) {
    var cs = Math.cos(spin), sn = Math.sin(spin);
    var x = p.x * cs - p.z * sn;
    var z = p.x * sn + p.z * cs;

    var ct = Math.cos(tilt), st = Math.sin(tilt);
    var y2 = p.y * ct - z * st;
    var z2 = p.y * st + z * ct;

    return { x: x, y: y2, z: z2 };
  }

  /* ── Leitura das cores da página ──────────────────────── */

  // Paleta padrão das 5 subdivisões do resumo. Pode ser sobrescrita por
  // página via as custom properties --globe-region-<nome> no CSS.
  var REGION_DEFAULTS = {
    anglo:   '#2e6da4',  // América Anglo-Saxônica — azul
    mexico:  '#d9822b',  // México — terracota
    central: '#1f9e7a',  // América Central — verde-água
    andina:  '#8859c9',  // América Andina — violeta
    platina: '#c9a227'   // América Platina — âmbar
  };

  function readColors(canvas) {
    var cs = getComputedStyle(canvas);
    function pick(name, fallback) {
      var v = cs.getPropertyValue(name).trim();
      return v || fallback;
    }
    var regionColors = {};
    for (var name in REGION_DEFAULTS) {
      regionColors[name] = pick('--globe-region-' + name, REGION_DEFAULTS[name]);
    }
    return {
      land: pick('--globe-land', pick('--primary', '#1a3a5c')),
      water: pick('--globe-water', pick('--border', '#cbd7e2')),
      marker: pick('--globe-marker', pick('--secondary', '#2e6da4')),
      label: pick('--globe-label', pick('--text', '#1e1e1e')),
      border: pick('--globe-border-cell', '#ffffff'),
      region: regionColors
    };
  }

  /* ── Um globo ─────────────────────────────────────────── */

  function createGlobe(canvas, mask, regions) {
    var ctx = canvas.getContext('2d');
    var dots = parseInt(canvas.dataset.globeDots, 10) || 8600;
    var speed = parseFloat(canvas.dataset.globeSpeed);
    if (isNaN(speed)) speed = 1;
    var tiltDeg = parseFloat(canvas.dataset.globeTilt);
    if (isNaN(tiltDeg)) tiltDeg = 18;
    var tilt = tiltDeg * Math.PI / 180;

    var colors = readColors(canvas);

    // Duas nuvens separadas, ambas peneiradas pela máscara uma vez só
    // (a máscara não muda, não faz sentido consultá-la a cada quadro).
    //
    // Uma nuvem única desperdiçaria pontos: ~71% da superfície é água, e é
    // justamente onde não queremos densidade. Então geramos uma espiral
    // grande e ficamos com a terra, e outra pequena para o oceano — a terra
    // fica desenhada com detalhe pelo mesmo custo por quadro.
    // land[0] = terra sem região marcada (resto do mundo); land[1..5] = as
    // 5 subdivisões do resumo (anglo/méxico/central/andina/platina).
    // borderPts = subconjunto que cai em célula de fronteira — desenhado
    // de novo por cima, como um realce, dando o efeito de contorno.
    var REGION_NAMES = ['none', 'anglo', 'mexico', 'central', 'andina', 'platina'];
    var land = [[], [], [], [], [], []], water = [], borderPts = [];

    fibonacciSphere(dots * 3).forEach(function (p) {
      var ll = vecToLatLon(p);
      if (!isLand(mask, ll.lat, ll.lon)) return;
      var code = regions ? regionAt(regions, ll.lat, ll.lon) : 0;
      land[code].push(p);
      if (regions && code !== 0 && borderAt(regions, ll.lat, ll.lon)) borderPts.push(p);
    });

    fibonacciSphere(Math.round(dots * 0.5)).forEach(function (p) {
      var ll = vecToLatLon(p);
      if (!isLand(mask, ll.lat, ll.lon)) water.push(p);
    });

    // marcadores declarados no HTML
    var markers = [];
    if (canvas.dataset.globeMarkers) {
      canvas.dataset.globeMarkers.split('|').forEach(function (chunk) {
        var parts = chunk.split(',');
        if (parts.length < 2) return;
        var lat = parseFloat(parts[0]), lon = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lon)) return;
        markers.push({
          vec: latLonToVec(lat, lon),
          label: (parts[2] || '').trim()
        });
      });
    }

    // Longitude que começa virada para o observador. Um ponto de longitude L
    // fica no centro quando spin = L (em radianos), porque a rotação em Y leva
    // z para cos(L - spin), máximo em L = spin.
    var startLon = parseFloat(canvas.dataset.globeLon);
    var spin = isNaN(startLon) ? 0 : startLon * Math.PI / 180;

    var dragging = false, lastX = 0, dragVel = 0;
    var w = 0, h = 0, radius = 0, cx = 0, cy = 0, dpr = 1;

    // null = mostra as 5 subdivisões cheias (visão geral); 1-5 = só essa
    // região em cor plena, as demais apagadas (ver setRegion mais abaixo).
    var focusRegion = null;
    var REGION_INDEX = { anglo: 1, mexico: 2, central: 3, andina: 4, platina: 5 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2;
      radius = Math.min(w, h) / 2 * 0.86;  // folga para os rótulos
    }

    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      // halo suave atrás do globo
      var glow = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius * 1.14);
      glow.addColorStop(0, hexA(colors.marker, 0.16));
      glow.addColorStop(1, hexA(colors.marker, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.14, 0, Math.PI * 2);
      ctx.fill();

      // oceano: pontos discretos, só para dar volume à esfera
      drawDots(water, colors.water, 0.8, 0.34);
      // resto do mundo (sem região marcada): cor neutra de continente
      drawDots(land[0], colors.land, 1.15, 0.95);

      // as 5 subdivisões do resumo, cada uma na sua cor. Quando uma seção
      // está em foco (focusRegion), as outras apagam — um "holofote" que
      // acompanha a rolagem; sem foco (visão geral), todas aparecem cheias.
      for (var ri = 1; ri <= 5; ri++) {
        if (!land[ri].length) continue;
        var isFocused = focusRegion === null || focusRegion === ri;
        var dim = isFocused ? 1 : 0.16;
        var pop = isFocused && focusRegion !== null ? 1.25 : 1;
        drawDots(land[ri], colors.region[REGION_NAMES[ri]], 1.15 * pop, 0.95 * dim);
      }

      // fronteiras/litoral das subdivisões: realce constante por cima,
      // independente do foco — funciona como o contorno do mapa.
      if (borderPts.length) drawDots(borderPts, colors.border, 0.85, 0.55);

      drawMarkers();
    }

    // Desenha uma nuvem de pontos agrupando por nível de opacidade.
    // Trocar fillStyle é a operação cara do canvas 2D, então em vez de
    // uma cor por ponto (milhares de trocas por quadro) quantizamos a
    // profundidade em STEPS faixas e desenhamos cada faixa num path só.
    var STEPS = 10;

    function drawDots(pts, color, size, maxAlpha) {
      var buckets = [];
      for (var s = 0; s < STEPS; s++) buckets.push([]);

      for (var i = 0; i < pts.length; i++) {
        var p = rotate(pts[i], spin, tilt);
        if (p.z < -0.02) continue;              // costas do globo: descarta

        var depth = (p.z + 1) / 2;              // 0..1, 1 = mais perto
        var bucket = Math.min(STEPS - 1, Math.floor(depth * STEPS));
        buckets[bucket].push(
          cx + p.x * radius,
          cy - p.y * radius,
          size * (0.6 + depth * 0.4)
        );
      }

      for (var b = 0; b < STEPS; b++) {
        var arr = buckets[b];
        if (!arr.length) continue;

        var d = (b + 0.5) / STEPS;
        ctx.fillStyle = hexA(color, maxAlpha * (0.22 + d * 0.78));
        ctx.beginPath();
        for (var k = 0; k < arr.length; k += 3) {
          var r = arr[k + 2];
          // quadrado em vez de arco: neste tamanho (1-2px) não dá para
          // distinguir e o custo por ponto cai bastante
          ctx.rect(arr[k] - r, arr[k + 1] - r, r * 2, r * 2);
        }
        ctx.fill();
      }
    }

    function drawMarkers() {
      // Os mais ao fundo primeiro: assim os da frente ficam por cima, e o
      // teste de colisão abaixo dá prioridade a quem está mais próximo.
      var vis = markers
        .map(function (m) { return { p: rotate(m.vec, spin, tilt), label: m.label }; })
        .sort(function (a, b) { return a.p.z - b.p.z; });

      var pins = [];
      vis.forEach(function (m) {
        if (m.p.z < 0) return;                  // do outro lado do planeta
        var x = cx + m.p.x * radius;
        var y = cy - m.p.y * radius;
        var fade = Math.min(1, m.p.z * 2.6);    // some ao virar a borda

        ctx.strokeStyle = hexA(colors.marker, 0.42 * fade);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = hexA(colors.marker, fade);
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();

        if (m.label && fade > 0.55) pins.push({ x: x, y: y, label: m.label, fade: fade });
      });

      // Rótulos por último, e só os que cabem. Marcadores vizinhos (as capitais
      // da América Central, por exemplo) empilhariam texto ilegível, então quem
      // colide com um rótulo já desenhado fica só com o ponto.
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      var boxes = [];
      // do mais à frente para o mais ao fundo: o mais próximo ganha o rótulo
      pins.reverse().forEach(function (m) {
        var w = ctx.measureText(m.label).width + 10;
        var h = 16;
        var bx = m.x - w / 2, by = m.y - 13 - h / 2;

        var colide = boxes.some(function (o) {
          return bx < o.x + o.w && bx + w > o.x && by < o.y + o.h && by + h > o.y;
        });
        if (colide) return;
        boxes.push({ x: bx, y: by, w: w, h: h });

        // pílula escura por trás: garante contraste tanto sobre o oceano
        // quanto sobre os continentes, seja qual for a cor do rótulo
        ctx.fillStyle = 'rgba(8,18,30,' + (0.62 * m.fade).toFixed(3) + ')';
        roundRect(bx, by, w, h, 8);
        ctx.fill();

        ctx.fillStyle = hexA(colors.label, m.fade);
        ctx.fillText(m.label, m.x, by + h / 2);
      });
    }

    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    /* ── Interação: arrastar para girar ───────────────── */

    function pointerDown(e) {
      dragging = true;
      dragVel = 0;
      flight = null;      // a mão do usuário tem prioridade sobre o voo
      autoSpin = true;
      lastX = (e.touches ? e.touches[0].clientX : e.clientX);
      canvas.style.cursor = 'grabbing';
    }

    function pointerMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      var dx = x - lastX;
      lastX = x;
      dragVel = dx * 0.005;
      spin += dragVel;
      if (reduced) draw();          // sem loop de animação, redesenha na mão
      if (e.cancelable) e.preventDefault();
    }

    function pointerUp() {
      dragging = false;
      canvas.style.cursor = 'grab';
    }

    canvas.addEventListener('mousedown', pointerDown);
    window.addEventListener('mousemove', pointerMove);
    window.addEventListener('mouseup', pointerUp);
    canvas.addEventListener('touchstart', pointerDown, { passive: true });
    canvas.addEventListener('touchmove', pointerMove, { passive: false });
    canvas.addEventListener('touchend', pointerUp);
    canvas.style.cursor = 'grab';

    /* ── Loop ─────────────────────────────────────────── */

    var running = false;

    function frame(ts) {
      if (!running) return;
      if (flight) {
        stepFlight(ts);
      } else if (!dragging) {
        if (Math.abs(dragVel) > 0.0002) {
          spin += dragVel;          // inércia depois de soltar
          dragVel *= 0.94;
        } else if (autoSpin) {
          spin += 0.0016 * speed;   // rotação de repouso
        }
      }
      draw();
      requestAnimationFrame(frame);
    }

    // só anima enquanto o globo estiver visível na tela
    function watch() {
      if (!('IntersectionObserver' in window)) { start(); return; }
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) start(); else running = false;
        });
      }, { threshold: 0.05 }).observe(canvas);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      requestAnimationFrame(frame);
    }

    /* ── Voar até uma coordenada ──────────────────────────
       Anima o giro até deixar (lat, lon) de frente. Usado pelo modo
       de rolagem: cada capítulo pede a sua região. */

    var flight = null;   // {from, to, t0, dur} enquanto anima
    var autoSpin = true; // pausa a rotação de repouso durante o voo

    function flyTo(lat, lon, dur) {
      var target = lon * Math.PI / 180;

      // Escolhe o caminho curto: sem isso, ir de -170° a +170° daria
      // uma volta quase completa no sentido errado.
      var TAU = Math.PI * 2;
      var delta = ((target - spin + Math.PI) % TAU + TAU) % TAU - Math.PI;

      flight = {
        from: spin,
        to: spin + delta,
        tiltFrom: tilt,
        tiltTo: -lat * Math.PI / 180 * 0.55,  // inclina um pouco na direção da latitude
        t0: null,
        dur: dur || 1400
      };
      autoSpin = false;
      start();
    }

    function stepFlight(ts) {
      if (!flight) return;
      if (flight.t0 === null) flight.t0 = ts;
      var p = Math.min((ts - flight.t0) / flight.dur, 1);
      var e = p < 0.5 ? 4 * p * p * p            // easeInOutCubic
                      : 1 - Math.pow(-2 * p + 2, 3) / 2;
      spin = flight.from + (flight.to - flight.from) * e;
      tilt = flight.tiltFrom + (flight.tiltTo - flight.tiltFrom) * e;
      if (p >= 1) { flight = null; autoSpin = true; }
    }

    // As cores são lidas uma vez, na criação — getComputedStyle a cada quadro
    // seria desperdício. Quando a página muda o contexto do globo (por exemplo,
    // ele sai do hero escuro e vai para um canto claro), chame refreshColors.
    function refreshColors() {
      colors = readColors(canvas);
      draw();
    }

    // Acende uma subdivisão e apaga as demais ("nome" ∈ anglo/mexico/
    // central/andina/platina), ou volta a mostrar todas cheias (null /
    // nome desconhecido). Chamado pelo modo de rolagem a cada capítulo.
    function setRegion(name) {
      var code = name ? REGION_INDEX[name] : null;
      focusRegion = code || null;
      draw();
    }

    // deixa a API acessível de fora (usada pelo controlador de rolagem)
    canvas.__globe = { flyTo: flyTo, refreshColors: refreshColors, setRegion: setRegion };

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { resize(); draw(); }, 120);
    });

    resize();
    draw();
    if (reduced) return;   // desenha uma vez e para; arrastar ainda funciona
    watch();
  }

  /* ── Utilitário de cor ────────────────────────────────
     Aceita #rgb, #rrggbb ou qualquer cor que o canvas entenda, e
     devolve com alfa aplicado. */
  function hexA(color, alpha) {
    var c = color.trim();
    if (c[0] === '#') {
      var hex = c.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length === 6) {
        var n = parseInt(hex, 16);
        return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' +
               (n & 255) + ',' + alpha.toFixed(3) + ')';
      }
    }
    // rgb(...) -> rgba(...)
    if (c.indexOf('rgb(') === 0) {
      return c.replace('rgb(', 'rgba(').replace(')', ',' + alpha.toFixed(3) + ')');
    }
    return c;
  }

  /* ── Modo rolagem ─────────────────────────────────────
     O globo acompanha a leitura: ao entrar na tela, um trecho marcado
     com data-globe-focus="lat,lon" faz o globo girar até aquela região.

       <div class="chapter-header" data-globe-focus="23.6,-102.5">México</div>

     Some-se a classe .globe-sticky no .globe-wrap para ele encolher e
     acompanhar a rolagem num canto (ver styles/effects.css).
     Em prefers-reduced-motion nada disso liga. */

  function initScrollFocus(canvas) {
    var alvos = document.querySelectorAll('[data-globe-focus]');
    if (!alvos.length || !('IntersectionObserver' in window)) return;

    var atual = null;

    var io = new IntersectionObserver(function (entries) {
      // entre os visíveis, o que estiver mais perto do topo da tela manda
      var visiveis = entries.filter(function (e) { return e.isIntersecting; });
      if (!visiveis.length) return;

      visiveis.sort(function (a, b) {
        return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
      });

      var el = visiveis[0].target;
      if (el === atual) return;             // já estamos olhando para lá
      atual = el;

      var partes = (el.dataset.globeFocus || '').split(',');
      var lat = parseFloat(partes[0]), lon = parseFloat(partes[1]);
      if (isNaN(lat) || isNaN(lon)) return;

      if (canvas.__globe) {
        canvas.__globe.flyTo(lat, lon);
        canvas.__globe.setRegion(el.dataset.globeRegion || null);
      }

      // deixa a página estilizar o trecho em foco, se quiser
      document.querySelectorAll('.globe-focused').forEach(function (o) {
        o.classList.remove('globe-focused');
      });
      el.classList.add('globe-focused');
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    alvos.forEach(function (el) { io.observe(el); });
  }

  /* ── Início ───────────────────────────────────────────── */

  function init() {
    var canvases = document.querySelectorAll('canvas.globe');
    if (!canvases.length) return;

    if (!window.GLOBE_LANDMASK) {
      console.warn('globe.js: falta scripts/globe-landmask.js — carregue-o antes.');
      return;
    }

    var mask = decodeMask(window.GLOBE_LANDMASK);
    var regions = window.GLOBE_REGIONS ? decodeRegions(window.GLOBE_REGIONS) : null;
    canvases.forEach(function (c) { createGlobe(c, mask, regions); });

    // só o primeiro globo da página segue a rolagem
    if (!reduced) initScrollFocus(canvases[0]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
