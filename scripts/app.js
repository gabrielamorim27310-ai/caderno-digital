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
    montarResumo: montarResumo,
  };

  /* ═══ Páginas de resumo (<body class="ios resumo">) ═══
     Monta a moldura a partir do que a página já tem: o título do
     .hero e os links da <nav> de capítulos (que fica escondida). */
  function montarResumo() {
    var body = document.body;
    var info = null;
    lista.forEach(function (m) {
      if (m.id === PAGINA) info = { m: m, nome: m.nome };
      (m.extras || []).forEach(function (x) { if (x.id === PAGINA) info = { m: m, nome: m.nome + ' · ' + x.nome }; });
    });
    var tri = info ? info.m.tri : 2;
    var voltar = 'index.html#t' + tri;

    // Capítulos: links internos da navegação antiga
    var navAntiga = null;
    document.querySelectorAll('nav').forEach(function (n) {
      if (!navAntiga && n.querySelector('a[href^="#"]') && !n.closest('.sidebar, .tabbar')) navAntiga = n;
    });
    var capitulos = [];
    if (navAntiga) {
      navAntiga.querySelectorAll('a[href^="#"]').forEach(function (a) {
        var alvo = a.getAttribute('href');
        if (alvo.length > 1 && document.getElementById(alvo.slice(1))) {
          capitulos.push({ href: alvo, nome: a.textContent.replace(/\s+/g, ' ').trim() });
        }
      });
      navAntiga.classList.add('cd-oculto');
    }
    var temChat = typeof window.toggleChat === 'function' && document.getElementById('chat-panel');

    // Pular para o conteúdo
    var pular = document.createElement('a');
    pular.className = 'skip-link';
    pular.href = '#conteudo';
    pular.textContent = 'Pular para o conteúdo';
    body.insertBefore(pular, body.firstChild);
    var principal = document.querySelector('main') || document.querySelector('.content');
    if (principal && !principal.id) principal.id = 'conteudo';

    // Navbar
    var titulo = document.querySelector('.hero h1');
    if (titulo) titulo.classList.add('large-title');
    var nav = document.createElement('header');
    nav.className = 'navbar';
    nav.innerHTML =
      '<div class="navbar-row">' +
        '<div class="navbar-left"><a class="bar-btn" href="' + voltar + '">' + icone('chevron-left') + 'Início</a></div>' +
        '<span class="navbar-title" aria-hidden="true">' + esc(info ? info.nome + ' · ' + tri + 'º tri' : document.title) + '</span>' +
        '<div class="navbar-right">' +
          (capitulos.length ? '<button class="bar-btn glass so-celular" type="button" data-sheet-open="sheet-capitulos" aria-label="Capítulos">' + icone('list') + '</button>' : '') +
          '<button class="bar-btn glass" type="button" data-cd-alternar-tema aria-label="Alternar modo claro e escuro">' + icone('moon') + '</button>' +
        '</div>' +
      '</div>';
    body.insertBefore(nav, pular.nextSibling);

    // Barra lateral: capítulos desta página + todas as matérias
    var capHtml = '';
    if (capitulos.length) {
      capHtml = '<h2 class="sidebar-section">Nesta página</h2>' + capitulos.map(function (c, i) {
        var quiz = /quiz|exerc/i.test(c.href + c.nome);
        return '<a class="sidebar-item chapter-link" href="' + esc(c.href) + '"><span class="num">' +
          (quiz ? icone('circle-help', 'i-sm') : (i + 1)) + '</span><span class="txt">' + esc(c.nome) + '</span></a>';
      }).join('');
    }
    var acoes = '';
    if (temChat) acoes += '<button class="sidebar-item" type="button" data-cd-acao="chat">' + icone('message-circle') + '<span class="txt">Perguntar ao ' + esc((typeof APP !== 'undefined' && APP.aiName) || 'Nêuron') + '</span></button>';
    acoes += '<button class="sidebar-item" type="button" data-cd-acao="contribuir">' + icone('upload') + '<span class="txt">Enviar meu resumo</span></button>';
    var aside = document.createElement('aside');
    aside.className = 'sidebar';
    aside.setAttribute('aria-label', 'Navegação');
    body.appendChild(aside);
    montarSidebar(aside, capHtml + acoes);
    body.classList.add('has-sidebar');

    // Tab bar
    var tab = document.createElement('nav');
    tab.className = 'tabbar';
    tab.setAttribute('aria-label', 'Navegação principal');
    body.appendChild(tab);
    var abas = [{ rotulo: 'Início', icone: 'house', href: voltar }];
    if (capitulos.length) abas.push({ rotulo: 'Capítulos', icone: 'list', sheet: 'sheet-capitulos' });
    if (temChat) abas.push({ rotulo: (typeof APP !== 'undefined' && APP.aiName) || 'Nêuron', icone: 'message-circle', acao: 'chat' });
    abas.push({ rotulo: 'Mais', icone: 'ellipsis', sheet: 'sheet-mais' });
    montarTabbar(tab, abas);

    // Sheets
    if (capitulos.length) {
      var sc = criarSheet('sheet-capitulos', 'Capítulos', '<div class="group">' + capitulos.map(function (c, i) {
        var quiz = /quiz|exerc/i.test(c.href + c.nome);
        return '<a class="cell has-icon" href="' + esc(c.href) + '"><span class="app-icon" style="--icon-bg:' + (quiz ? 'var(--fill)' : 'var(--tint-fill)') + ';' + (quiz ? 'color:var(--tint)' : '') + '">' +
          (quiz ? icone('circle-help', 'i-sm') : (i + 1)) + '</span><span class="cell-body"><span class="cell-title">' + esc(c.nome) + '</span></span>' + icone('chevron-right', 'cell-chev') + '</a>';
      }).join('') + '</div>');
      sc.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a) return;
        e.preventDefault();
        fecharSheet(true);
        var alvo = document.getElementById(a.getAttribute('href').slice(1));
        if (alvo) setTimeout(function () { alvo.scrollIntoView(); history.replaceState(null, '', a.getAttribute('href')); }, 20);
      });
    }
    criarSheetMais(
      '<div class="group">' +
        (temChat ? '<button class="cell has-icon" type="button" data-cd-acao="chat"><span class="app-icon" style="--icon-bg:var(--tint-fill)">' + icone('message-circle', 'i-sm') + '</span><span class="cell-body"><span class="cell-title">Perguntar ao ' + esc((typeof APP !== 'undefined' && APP.aiName) || 'Nêuron') + '</span><span class="cell-sub">Tire dúvidas sobre este resumo</span></span>' + icone('chevron-right', 'cell-chev') + '</button>' : '') +
        '<button class="cell has-icon" type="button" data-cd-acao="contribuir"><span class="app-icon" style="--icon-bg:#34c759">' + icone('upload', 'i-sm') + '</span><span class="cell-body"><span class="cell-title">Enviar meu resumo</span><span class="cell-sub">Texto, fotos do caderno ou arquivos</span></span>' + icone('chevron-right', 'cell-chev') + '</button>' +
      '</div>'
    );
    sincronizarTema();
    ligarNavbar();

    // Ações: abrir o chat e o envio de resumo que a página já tem
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cd-acao]');
      if (!b) return;
      var acao = b.getAttribute('data-cd-acao');
      if (acao === 'chat' && temChat) {
        fecharSheet(true);
        if (!document.getElementById('chat-panel').classList.contains('open')) window.toggleChat();
      }
      if (acao === 'contribuir') {
        fecharSheet(true);
        var botao = document.getElementById('contrib-btn');
        if (botao) botao.click();
      }
    });

    // Acordeões: avisa leitores de tela se estão abertos (depois do onclick da página)
    function marcarAcordeoes() {
      document.querySelectorAll('.accordion-btn').forEach(function (b) {
        var ac = b.closest('.accordion');
        b.setAttribute('aria-expanded', String(!!(ac && ac.classList.contains('open'))));
      });
    }
    marcarAcordeoes();
    document.addEventListener('click', function (e) { if (e.target.closest('.accordion-btn')) setTimeout(marcarAcordeoes, 0); });

    // Capítulo atual em destaque na barra lateral
    if ('IntersectionObserver' in window && capitulos.length) {
      var links = aside.querySelectorAll('.chapter-link');
      var visiveis = {};
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) { visiveis[en.target.id] = en.isIntersecting; });
        var atual = null;
        capitulos.forEach(function (c) { if (!atual && visiveis[c.href.slice(1)]) atual = c.href; });
        links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === atual); });
      }, { rootMargin: '-64px 0px -55% 0px' });
      capitulos.forEach(function (c) { obs.observe(document.getElementById(c.href.slice(1))); });
    }

    // Globo flutuante (Geografia): sai da frente enquanto o quiz está na tela,
    // senão cobre as alternativas no celular (o CSS só esconde em telas estreitas)
    var quiz = document.querySelector('#quiz-section, #exercicios, .quiz-section');
    if (quiz && document.querySelector('.globe-sticky') && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        body.classList.toggle('cd-no-quiz', en[0].isIntersecting);
      }).observe(quiz);
    }
  }

  function iniciar() {
    if (document.body.classList.contains('resumo')) montarResumo();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  /* Modo offline (sw.js). Só em https ou no localhost. */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
