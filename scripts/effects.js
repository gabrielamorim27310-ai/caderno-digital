/* ═══════════════════════════════════════════════════════════
   effects.js — Comportamento dos efeitos de styles/effects.css
   Portado de react-bits para JS puro. Ver docs/ui-recursos.md.

   Só age sobre elementos que tenham as classes .fx-*.
   Sem elementos marcados, o arquivo não faz nada.
   Respeita prefers-reduced-motion (sai sem fazer nada).
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Marca cedo (antes do DOMContentLoaded) para o CSS poder esconder os
  // .fx-reveal sem piscada. Se este arquivo não carregar, a classe não
  // existe e o conteúdo aparece normalmente — nada fica invisível.
  document.documentElement.classList.add('fx-ready');

  /* ── 1. Revelação ao rolar (.fx-reveal) ─────────────────
     Origem: react-bits FadeContent / AnimatedContent / ScrollReveal */
  function initReveal() {
    var items = document.querySelectorAll('.fx-reveal');
    if (!items.length) return;

    // Sem IntersectionObserver, mostra tudo em vez de esconder.
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('fx-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fx-in');
        io.unobserve(entry.target); // anima uma vez só
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ── 2. Spotlight seguindo o cursor (.fx-spotlight) ─────
     Origem: react-bits SpotlightCard */
  function initSpotlight() {
    document.querySelectorAll('.fx-spotlight').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--fx-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--fx-y', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── 3. Botão magnético (.fx-magnet) ────────────────────
     Origem: react-bits Magnet
     data-fx-strength: divisor do deslocamento (padrão 3, menor = mais forte) */
  function initMagnet() {
    document.querySelectorAll('.fx-magnet').forEach(function (el) {
      var strength = parseFloat(el.dataset.fxStrength) || 3;

      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.setProperty('--fx-mx', (dx / strength) + 'px');
        el.style.setProperty('--fx-my', (dy / strength) + 'px');
      });

      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--fx-mx', '0px');
        el.style.setProperty('--fx-my', '0px');
      });
    });
  }

  /* ── 4. Card inclinado (.fx-tilt) ───────────────────────
     Origem: react-bits TiltedCard
     data-fx-max: inclinação máxima em graus (padrão 9) */
  function initTilt() {
    document.querySelectorAll('.fx-tilt').forEach(function (el) {
      var max = parseFloat(el.dataset.fxMax) || 9;

      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;  // 0..1
        var py = (e.clientY - r.top) / r.height;  // 0..1
        el.style.setProperty('--fx-ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--fx-rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
      });

      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--fx-rx', '0deg');
        el.style.setProperty('--fx-ry', '0deg');
      });
    });
  }

  /* ── 5. Contador animado (.fx-count) ────────────────────
     Origem: react-bits CountUp
     <span class="fx-count" data-fx-to="87" data-fx-dur="1200">0</span>
     data-fx-decimals: casas decimais (padrão 0)
     Dispara quando entra na viewport. */
  function initCount() {
    var els = document.querySelectorAll('.fx-count');
    if (!els.length) return;

    function run(el) {
      var to = parseFloat(el.dataset.fxTo);
      if (isNaN(to)) return;
      var dur = parseFloat(el.dataset.fxDur) || 1200;
      var dec = parseInt(el.dataset.fxDecimals, 10) || 0;
      var from = parseFloat(el.dataset.fxFrom) || 0;

      if (reduced) { el.textContent = to.toFixed(dec); return; }

      var t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = (from + (to - from) * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(run);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── 6. Texto embaralhado (.fx-scramble) ────────────────
     Origem: react-bits DecryptedText / ScrambledText
     <h1 class="fx-scramble">Biologia</h1>
     Embaralha e resolve letra a letra ao entrar na viewport. */
  function initScramble() {
    var els = document.querySelectorAll('.fx-scramble');
    if (!els.length || reduced) return;

    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    function run(el) {
      var final = el.textContent;
      var speed = parseFloat(el.dataset.fxSpeed) || 42; // ms por quadro
      var i = 0;

      var timer = setInterval(function () {
        el.textContent = final
          .split('')
          .map(function (ch, idx) {
            if (idx < i) return final[idx];        // já resolvido
            if (ch === ' ') return ' ';            // preserva espaços
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');

        i += 1 / 2; // duas voltas por letra: dá tempo de ver o embaralhado
        if (i >= final.length) {
          clearInterval(timer);
          el.textContent = final;
        }
      }, speed);
    }

    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ── 7. Faísca no clique (.fx-spark) ────────────────────
     Origem: react-bits ClickSpark
     Desenha raios curtos a partir do ponto clicado. Sem canvas: divs
     temporárias, removidas no fim da animação. */
  function initSpark() {
    var hosts = document.querySelectorAll('.fx-spark');
    if (!hosts.length || reduced) return;

    hosts.forEach(function (host) {
      host.addEventListener('click', function (e) {
        var n = 8;
        for (var i = 0; i < n; i++) {
          var s = document.createElement('span');
          var angle = (360 / n) * i;
          s.style.cssText =
            'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
            'width:2px;height:10px;pointer-events:none;z-index:9999;' +
            'background:var(--secondary,#c9a227);border-radius:1px;' +
            'transform:rotate(' + angle + 'deg) translateY(-6px);' +
            'transition:transform .45s cubic-bezier(.22,1,.36,1),opacity .45s ease;';
          document.body.appendChild(s);

          // força o reflow para a transição valer
          void s.offsetWidth;
          s.style.transform = 'rotate(' + angle + 'deg) translateY(-26px)';
          s.style.opacity = '0';

          setTimeout(
            (function (node) { return function () { node.remove(); }; })(s),
            460
          );
        }
      });
    });
  }

  /* ── Inicialização ──────────────────────────────────── */
  function init() {
    initReveal();
    initSpotlight();
    initMagnet();
    initTilt();
    initCount();
    initScramble();
    initSpark();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
