/* labs-ui.js — acabamento comum de todos os laboratórios (Filosofia e Biologia).
   Entra ANTES do código dos labs (montar-pagina.mjs / montar-labs.mjs):
   - canvas nítido em tela de alta densidade (o lab continua desenhando em 760x300 lógicos);
   - indicador que desliza nos seletores (.seg);
   - trilho preenchido nos sliders;
   - texto de explicação e desenho que entram com transição quando mudam. */
(function () {
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Canvas nítido: aumenta o buffer pelo devicePixelRatio e escala o contexto. */
  var dpr = Math.min(3, window.devicePixelRatio || 1);
  if (dpr > 1) {
    var orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (tipo, o) {
      var ctx = orig.call(this, tipo, o);
      if (tipo === '2d' && ctx && !this.__nitido && this.closest && this.closest('.lab')) {
        this.__nitido = true;
        var w = this.width, h = this.height;
        this.width = w * dpr; this.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var limpa = ctx.clearRect.bind(ctx);
        ctx.clearRect = function (x, y, cw, ch) { limpa(x, y, cw, ch); };
      }
      if (ctx && tipo === '2d') { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; }
      return ctx;
    };
  }

  function quando(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* 2. Seletor com indicador que desliza */
  function posInd(seg) {
    var ind = seg.querySelector('.seg-ind'), on = seg.querySelector('button.on');
    if (!ind) return;
    if (!on) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.width = on.offsetWidth + 'px'; ind.style.height = on.offsetHeight + 'px';
    ind.style.transform = 'translate(' + on.offsetLeft + 'px,' + on.offsetTop + 'px)';
  }
  function prepSeg(seg) {
    if (seg.__ind) return; seg.__ind = true;
    var ind = document.createElement('span'); ind.className = 'seg-ind'; seg.prepend(ind); seg.classList.add('tem-ind');
    var semAnim = ind.style.transition; ind.style.transition = 'none'; posInd(seg);
    requestAnimationFrame(function () { ind.style.transition = semAnim; });
    new MutationObserver(function () { posInd(seg); }).observe(seg, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  }

  /* 3. Slider com trilho preenchido */
  function pinta(r) { var a = +r.min || 0, b = +r.max || 100, v = +r.value; r.style.setProperty('--p', ((v - a) / (b - a || 1) * 100) + '%'); }

  /* 4. Texto e desenho que entram com transição */
  var ultimoSlider = 0;
  document.addEventListener('input', function (e) { if (e.target.type === 'range' && e.target.closest('.lab')) { ultimoSlider = performance.now(); pinta(e.target); } }, true);
  function reanima(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  function observa(lab) {
    lab.querySelectorAll('.lab-out').forEach(function (out) {
      var antes = out.innerHTML;
      new MutationObserver(function () {
        if (out.innerHTML === antes) return; antes = out.innerHTML;
        if (RM || performance.now() - ultimoSlider < 500) return; // arrastando o slider: sem piscar
        reanima(out, 'novo');
      }).observe(out, { childList: true, subtree: true, characterData: true });
    });
    lab.querySelectorAll('.lab-stage').forEach(function (st) {
      var svg = st.querySelector(':scope > svg'); if (!svg) return;
      var ult = 0;
      new MutationObserver(function () {
        var t = performance.now(), parado = t - ult > 450; ult = t;
        if (RM || !parado || t - ultimoSlider < 500 || st.__animando) return; // só trocas "de uma vez" (passo, seletor)
        reanima(st, 'troca');
      }).observe(svg, { childList: true });
    });
  }

  quando(function () {
    document.querySelectorAll('.lab').forEach(function (lab) {
      lab.querySelectorAll('.seg').forEach(prepSeg);
      lab.querySelectorAll('input[type=range]').forEach(pinta);
      observa(lab);
    });
    addEventListener('resize', function () { document.querySelectorAll('.seg.tem-ind').forEach(posInd); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { document.querySelectorAll('.seg.tem-ind').forEach(posInd); });
    // sliders movidos por código (botões "Animar") também atualizam o trilho
    setInterval(function () { document.querySelectorAll('.lab input[type=range]').forEach(pinta); }, 400);
  });
})();
