/* ═══════════════════════════════════════════════════════════
   zoom-fotos.js — clique numa foto do resumo para vê-la grande.
   Carregado pelo app.js em todas as páginas de resumo, e embutido
   nos artefatos. A foto cresce a partir do lugar onde está (FLIP),
   fecha com clique, Esc ou arrastando para baixo no celular.
   Ignora imagens pequenas (ícones), links e desenhos dos laboratórios.
   ═══════════════════════════════════════════════════════════ */
(function () {
  if (window.CDZoom) return;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = document.createElement('style');
  css.textContent =
    '.cdz-alvo{cursor:zoom-in}' +
    '.cdz-fundo{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0);-webkit-backdrop-filter:blur(0);backdrop-filter:blur(0);transition:background-color .35s cubic-bezier(.22,1,.36,1),backdrop-filter .35s;cursor:zoom-out;touch-action:none}' +
    '.cdz-fundo.on{background:rgba(0,0,0,.82);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}' +
    '.cdz-img{position:fixed;left:0;top:0;transform-origin:0 0;border-radius:12px;box-shadow:0 30px 80px -20px rgba(0,0,0,.7);transition:transform .45s cubic-bezier(.34,1.2,.64,1),border-radius .45s;will-change:transform;background:#fff;max-width:none!important}' +
    '.cdz-leg{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translate(-50%,8px);max-width:min(720px,calc(100vw - 32px));color:#fff;font:500 14px/1.45 Inter,system-ui,sans-serif;text-align:center;opacity:0;transition:opacity .3s .15s,transform .4s .15s cubic-bezier(.22,1,.36,1);pointer-events:none;text-shadow:0 1px 3px rgba(0,0,0,.6)}' +
    '.cdz-fundo.on .cdz-leg{opacity:1;transform:translate(-50%,0)}' +
    '.cdz-x{position:fixed;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.16);color:#fff;font-size:20px;cursor:pointer;opacity:0;transition:opacity .3s .1s}' +
    '.cdz-fundo.on .cdz-x{opacity:1}';
  document.head.appendChild(css);

  function serve(img) {
    if (!img || img.tagName !== 'IMG' || img.closest('a, button, .lab, .hero, .hero-icon, nav, aside, .sidebar, .tabbar, .navbar, .cdz-fundo')) return false;
    var r = img.getBoundingClientRect();
    return r.width >= 120 && img.naturalWidth >= 120;
  }
  function marca() { document.querySelectorAll('main img, .content img, figure img, .chapter img, .card img').forEach(function (i) { if (serve(i)) i.classList.add('cdz-alvo'); }); }

  function abrir(img) {
    var r = img.getBoundingClientRect();
    var W = innerWidth, H = innerHeight, m = Math.min(28, W * .04);
    var nw = img.naturalWidth || r.width, nh = img.naturalHeight || r.height;
    var esc = Math.min((W - 2 * m) / nw, (H - 2 * m - 40) / nh, 2.5);
    var fw = nw * esc, fh = nh * esc, fx = (W - fw) / 2, fy = (H - fh) / 2 - 10;
    var fundo = document.createElement('div'); fundo.className = 'cdz-fundo'; fundo.setAttribute('role', 'dialog'); fundo.setAttribute('aria-label', 'Foto ampliada');
    var big = document.createElement('img'); big.className = 'cdz-img'; big.src = img.currentSrc || img.src; big.alt = img.alt || '';
    big.style.width = fw + 'px'; big.style.height = fh + 'px';
    var de = 'translate(' + r.left + 'px,' + r.top + 'px) scale(' + (r.width / fw) + ',' + (r.height / fh) + ')';
    var para = 'translate(' + fx + 'px,' + fy + 'px) scale(1)';
    big.style.transform = de;
    var cap = (img.closest('figure') && img.closest('figure').querySelector('figcaption')) ;
    var leg = document.createElement('div'); leg.className = 'cdz-leg'; leg.textContent = cap ? cap.textContent.trim() : '';
    var x = document.createElement('button'); x.className = 'cdz-x'; x.type = 'button'; x.setAttribute('aria-label', 'Fechar'); x.textContent = '✕';
    fundo.appendChild(big); fundo.appendChild(leg); fundo.appendChild(x); document.body.appendChild(fundo);
    img.style.visibility = 'hidden';
    var fechou = false, y0 = null, dy = 0;
    requestAnimationFrame(function () { requestAnimationFrame(function () { fundo.classList.add('on'); big.style.transform = para; }); });
    if (RM) { big.style.transition = 'none'; big.style.transform = para; }
    function fechar() {
      if (fechou) return; fechou = true;
      var r2 = img.getBoundingClientRect();
      fundo.classList.remove('on');
      big.style.transition = RM ? 'none' : 'transform .38s cubic-bezier(.22,1,.36,1)';
      big.style.transform = 'translate(' + r2.left + 'px,' + r2.top + 'px) scale(' + (r2.width / fw) + ',' + (r2.height / fh) + ')';
      setTimeout(function () { img.style.visibility = ''; fundo.remove(); }, RM ? 0 : 380);
      document.removeEventListener('keydown', tecla);
    }
    function tecla(e) { if (e.key === 'Escape') fechar(); }
    document.addEventListener('keydown', tecla);
    fundo.addEventListener('click', fechar);
    fundo.addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; big.style.transition = 'none'; }, { passive: true });
    fundo.addEventListener('touchmove', function (e) { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); big.style.transform = 'translate(' + fx + 'px,' + (fy + dy) + 'px) scale(' + (1 - Math.min(.25, dy / 1200)) + ')'; fundo.style.backgroundColor = 'rgba(0,0,0,' + (.82 - Math.min(.6, dy / 500)) + ')'; }, { passive: true });
    fundo.addEventListener('touchend', function () { if (y0 === null) return; y0 = null; if (dy > 90) { fundo.style.backgroundColor = ''; fechar(); } else { big.style.transition = ''; big.style.transform = para; fundo.style.backgroundColor = ''; } dy = 0; });
    x.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('img');
    if (!serve(img)) return;
    e.preventDefault(); abrir(img);
  });
  // fotos com loading="lazy" só têm tamanho depois de carregar: marca o cursor de lupa ao passar o mouse
  document.addEventListener('pointerover', function (e) { var img = e.target.closest && e.target.closest('img'); if (serve(img)) img.classList.add('cdz-alvo'); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', marca); else marca();
  window.CDZoom = { abrir: abrir };
})();
