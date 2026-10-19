/* ═══════════════════════════════════════════════════════════
   app.js — Moldura do app (estilo iOS), igual em todas as páginas
   Requer: config.js (APP, MATERIAS), scripts/theme.js, styles/ios.css

   O que faz
   - Monta a barra lateral (iPad / computador) a partir de MATERIAS
     dentro de <aside class="sidebar" data-cd-sidebar>.
   - Monta a tab bar (celular) dentro de <nav class="tabbar" data-cd-tabbar>.
   - Cria a sheet "Mais" (aparência e sobre) e cuida de todas as sheets:
       abrir:  CD.sheet.abrir('id')  ou  <button data-sheet-open="id">
       fechar: CD.sheet.fechar()     ou  <button data-sheet-close>
   - Navbar: .navbar ganha .is-scrolled ao rolar (título pequeno + vidro).
   - Marca a página como visitada (localStorage cd_visit_<pagina>),
     o que alimenta o "Continuar" do painel.

   A página informa quem ela é em <html data-pagina="historia-2tri">.
   ═══════════════════════════════════════════════════════════ */

(function () {
  var root = document.documentElement;
  var PAGINA = root.getAttribute('data-pagina') || 'index';
  var ICONS = (root.getAttribute('data-base') || '') + 'icons.svg';
  var lista = typeof MATERIAS !== 'undefined' ? MATERIAS : [];

  function icone(nome, classe) {
    return '<svg class="i' + (classe ? ' ' + classe : '') + '" aria-hidden="true"><use href="' + ICONS + '#' + nome + '"/></svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function appIcon(m, extra) {
    var conteudo = m.imagem ? '<img src="' + esc(m.imagem) + '" alt="">' : esc(m.icone || '📄');
    return '<span class="app-icon' + (extra ? ' ' + extra : '') + '" style="--icon-bg:var(--' + m.materia + '-fill, var(--' + m.materia + '))">' + conteudo + '</span>';
  }

  /* ── Visitas ── */
  function marcarVisita(id) {
    try { localStorage.setItem('cd_visit_' + id, String(Date.now())); } catch (e) {}
  }
  function ultimaVisita(id) {
    try { return parseInt(localStorage.getItem('cd_visit_' + id) || '0', 10) || 0; } catch (e) { return 0; }
  }
  function tempoAtras(ts) {
    var min = Math.floor((Date.now() - ts) / 60000);
    if (min < 1) return 'agora mesmo';
    if (min < 60) return 'há ' + min + ' min';
    var h = Math.floor(min / 60);
    if (h < 24) return 'há ' + h + ' h';
    var d = Math.floor(h / 24);
    return 'há ' + d + ' dia' + (d > 1 ? 's' : '');
  }
  if (PAGINA !== 'index') marcarVisita(PAGINA);

  /* ── Sheets ── */
  var sheetAberta = null, focoAnterior = null;
  function scrimDe() {
    var s = document.querySelector('.sheet-scrim');
    if (!s) {
      s = document.createElement('div');
      s.className = 'sheet-scrim';
      s.setAttribute('data-sheet-close', '');
      document.body.appendChild(s);
    }
    return s;
  }
  function abrirSheet(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (sheetAberta && sheetAberta !== el) fecharSheet(true);
    focoAnterior = document.activeElement;
    sheetAberta = el;
    el.classList.add('is-open');
    scrimDe().classList.add('is-open');
    document.body.classList.add('sheet-lock');
    var alvo = el.querySelector('[autofocus], input, textarea, [data-sheet-close]');
    setTimeout(function () { if (alvo) alvo.focus({ preventScroll: true }); }, 60);
    el.dispatchEvent(new CustomEvent('sheet:abriu'));
  }
  function fecharSheet(semDevolverFoco) {
    if (!sheetAberta) return;
    var el = sheetAberta;
    sheetAberta = null;
    el.classList.remove('is-open');
    scrimDe().classList.remove('is-open');
    document.body.classList.remove('sheet-lock');
    if (!semDevolverFoco && focoAnterior && focoAnterior.focus) focoAnterior.focus({ preventScroll: true });
    el.dispatchEvent(new CustomEvent('sheet:fechou'));
  }
  document.addEventListener('click', function (e) {
    var abre = e.target.closest('[data-sheet-open]');
    if (abre) { e.preventDefault(); abrirSheet(abre.getAttribute('data-sheet-open')); return; }
    if (e.target.closest('[data-sheet-close]')) { e.preventDefault(); fecharSheet(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheetAberta) { e.preventDefault(); fecharSheet(); }
    // Mantém o Tab dentro da sheet aberta
    if (e.key === 'Tab' && sheetAberta) {
      var f = sheetAberta.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var primeiro = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
  });

  function criarSheet(id, titulo, corpoHtml) {
    var el = document.createElement('div');
    el.className = 'sheet';
    el.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', id + '-titulo');
    el.innerHTML =
      '<div class="sheet-grabber" aria-hidden="true"></div>' +
      '<div class="sheet-head"><h2 id="' + id + '-titulo">' + esc(titulo) + '</h2>' +
      '<button class="bar-btn" type="button" data-sheet-close aria-label="Fechar">' + icone('x') + '</button></div>' +
      '<div class="sheet-body">' + corpoHtml + '</div>';
    document.body.appendChild(el);
    return el;
  }

  /* ── Aparência (tema) ── */
  function htmlAparencia() {
    return '<h3 class="group-title small">Aparência</h3>' +
      '<div class="segmented" role="group" aria-label="Aparência" data-cd-tema>' +
        '<button type="button" data-modo="auto">' + icone('sun-moon', 'i-sm') + 'Automático</button>' +
        '<button type="button" data-modo="light">' + icone('sun', 'i-sm') + 'Claro</button>' +
        '<button type="button" data-modo="dark">' + icone('moon', 'i-sm') + 'Escuro</button>' +
      '</div>' +
      '<p class="group-footer" style="margin-top:-8px">No automático, o site segue o modo do seu aparelho.</p>';
  }
  function sincronizarTema() {
    var salvo = null;
    try { salvo = localStorage.getItem('cd_theme'); } catch (e) {}
    var modo = salvo === 'light' || salvo === 'dark' ? salvo : 'auto';
    document.querySelectorAll('[data-cd-tema] [data-modo]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-modo') === modo));
    });
    var escuro = window.CDTheme && CDTheme.atual() === 'dark';
    document.querySelectorAll('[data-cd-alternar-tema]').forEach(function (b) {
      b.setAttribute('aria-label', escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro');
      var use = b.querySelector('use');
      if (use) use.setAttribute('href', ICONS + (escuro ? '#sun' : '#moon'));
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cd-tema] [data-modo]');
    if (b && window.CDTheme) CDTheme.definir(b.getAttribute('data-modo'));
    if (e.target.closest('[data-cd-alternar-tema]') && window.CDTheme) CDTheme.alternar();
  });
  window.addEventListener('cd:tema', sincronizarTema);

  /* ── Sheet "Mais" ── */
  function criarSheetMais(extrasHtml) {
    var ano = (typeof APP !== 'undefined' && APP.year) || '';
    var corpo = (extrasHtml || '') + htmlAparencia() +
      '<h3 class="group-title small">Sobre</h3>' +
      '<div class="group">' +
        '<div class="cell"><span class="cell-body"><span class="cell-title">' + esc((typeof APP !== 'undefined' && APP.name) || 'Caderno Digital') + '</span>' +
        '<span class="cell-sub">' + esc((typeof APP !== 'undefined' && (APP.grade + ' · ' + APP.school + ' · ' + ano)) || '') + '</span></span></div>' +
        '<div class="cell"><span class="cell-body"><span class="cell-title">Feito por ' + esc((typeof APP !== 'undefined' && APP.author) || '') + '</span>' +
        '<span class="cell-sub">Achou um erro ou quer ajudar? Use "Enviar meu resumo" em qualquer matéria.</span></span></div>' +
      '</div>';
    criarSheet('sheet-mais', 'Mais', corpo);
  }

  /* ── Barra lateral ── */
  function montarSidebar(el, capitulosHtml) {
    var porTri = {};
    lista.forEach(function (m) { (porTri[m.tri] = porTri[m.tri] || []).push(m); });
    var h = '<a class="sidebar-brand" href="index.html">' +
      '<span class="app-icon" style="--icon-bg:var(--tint-fill)">📚</span>' + esc((typeof APP !== 'undefined' && APP.name) || 'Caderno Digital') + '</a>';
    h += '<a class="sidebar-item" href="index.html"' + (PAGINA === 'index' ? ' aria-current="page"' : '') + '>' + icone('house') + '<span class="txt">Início</span></a>';
    if (capitulosHtml) h += capitulosHtml;
    Object.keys(porTri).sort().forEach(function (tri) {
      h += '<h2 class="sidebar-section">' + tri + 'º trimestre</h2>';
      porTri[tri].forEach(function (m) {
        if (!m.id) return;
        h += '<a class="sidebar-item" href="' + m.id + '.html"' + (m.id === PAGINA ? ' aria-current="page"' : '') + '>' +
          appIcon(m) + '<span class="txt">' + esc(m.nome) + '</span>' +
          (m.status === 'fora' ? '<span class="sidebar-meta">extra</span>' : '') + '</a>';
        (m.extras || []).forEach(function (x) {
          h += '<a class="sidebar-item sub" href="' + x.id + '.html"' + (x.id === PAGINA ? ' aria-current="page"' : '') + '>' +
            '<span class="app-icon" style="--icon-bg:transparent;color:var(--label-2)">' + icone('layers', 'i-sm') + '</span><span class="txt">' + esc(m.nome) + ' · ' + esc(x.nome) + '</span></a>';
        });
      });
    });
    h += '<h2 class="sidebar-section">Ajustes</h2>' +
      '<button class="sidebar-item" type="button" data-sheet-open="sheet-mais">' + icone('sun-moon') + '<span class="txt">Aparência e sobre</span></button>';
    el.innerHTML = h;
  }

  /* ── Tab bar ── */
  function montarTabbar(el, abas) {
    el.innerHTML = abas.map(function (a) {
      var attrs = a.href ? 'href="' + a.href + '"' : 'type="button"';
      if (a.sheet) attrs += ' data-sheet-open="' + a.sheet + '"';
      if (a.acao) attrs += ' data-cd-acao="' + a.acao + '"';
      if (a.atual) attrs += ' aria-current="page"';
      return '<' + (a.href ? 'a' : 'button') + ' class="tab" ' + attrs + '>' + icone(a.icone) + '<span>' + esc(a.rotulo) + '</span></' + (a.href ? 'a' : 'button') + '>';
    }).join('');
  }

  /* ── Navbar: título pequeno e vidro ao rolar ── */
  function ligarNavbar() {
    var nav = document.querySelector('.navbar');
    if (!nav) return;
    var marco = document.querySelector('.large-title');
    function atualizar() {
      var limite = marco ? marco.getBoundingClientRect().bottom - nav.offsetHeight : 40;
      nav.classList.toggle('is-scrolled', marco ? limite < 0 : scrollY > 40);
    }
    addEventListener('scroll', atualizar, { passive: true });
    addEventListener('resize', atualizar);
    atualizar();
  }

  window.CD = {
    pagina: PAGINA,
    icone: icone,
    esc: esc,
    appIcon: appIcon,
    tempoAtras: tempoAtras,
    ultimaVisita: ultimaVisita,
    marcarVisita: marcarVisita,
    sheet: { abrir: abrirSheet, fechar: fecharSheet, criar: criarSheet },
    montarSidebar: montarSidebar,
    montarTabbar: montarTabbar,
    criarSheetMais: criarSheetMais,
    sincronizarTema: sincronizarTema,
    ligarNavbar: ligarNavbar,
  };
})();
