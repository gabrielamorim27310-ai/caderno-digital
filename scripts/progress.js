/* ═══════════════════════════════════════════════════════════
   progress.js — Barra de progresso de leitura
   Versão canônica. Requer #progressBar no HTML.
   ═══════════════════════════════════════════════════════════ */

window.addEventListener('scroll', function() {
  var bar = document.getElementById('progressBar');
  if (!bar) return;
  var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});
