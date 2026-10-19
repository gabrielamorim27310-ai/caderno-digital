/* ═══════════════════════════════════════════════════════════
   theme.js — Modo claro / escuro
   Carregue no <head>, SEM defer, logo depois de styles/ios.css:
   ele marca <html data-theme> antes da página aparecer, para não
   piscar branco no modo escuro.

   Sem escolha salva, o site segue o aparelho (e acompanha se o
   aparelho trocar de modo com a página aberta). Escolher claro ou
   escuro grava em localStorage 'cd_theme' (mesma chave de antes).

   API: CDTheme.atual()  → 'light' | 'dark'
        CDTheme.alternar()
        CDTheme.definir('light' | 'dark' | 'auto')
   Dispara o evento 'cd:tema' em window a cada mudança.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var KEY = 'cd_theme';
  var root = document.documentElement;
  var media = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;

  function salvo() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }

  function atual() {
    return salvo() || (media && media.matches ? 'dark' : 'light');
  }

  // Cor da barra de status / barra do navegador no celular.
  function corDaBarra() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = atual() === 'dark' ? '#000000' : '#f2f2f7';
  }

  function aplicar() {
    var s = salvo();
    if (s) root.setAttribute('data-theme', s);
    else root.removeAttribute('data-theme');
    corDaBarra();
    try { window.dispatchEvent(new CustomEvent('cd:tema', { detail: atual() })); } catch (e) {}
  }

  function definir(modo) {
    try {
      if (modo === 'light' || modo === 'dark') localStorage.setItem(KEY, modo);
      else localStorage.removeItem(KEY);
    } catch (e) {}
    aplicar();
  }

  function alternar() {
    definir(atual() === 'dark' ? 'light' : 'dark');
  }

  if (media) {
    var ouvir = function () { if (!salvo()) aplicar(); };
    if (media.addEventListener) media.addEventListener('change', ouvir);
    else if (media.addListener) media.addListener(ouvir);
  }

  window.CDTheme = { atual: atual, alternar: alternar, definir: definir };
  aplicar();
})();
