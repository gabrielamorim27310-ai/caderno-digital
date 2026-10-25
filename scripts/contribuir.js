/* ═══════════════════════════════════════════════════════════
   contribuir.js — formulário "Enviar meu resumo" (página /enviar)
   O aluno escolhe trimestre, matéria e tópico e manda texto, fotos do caderno
   ou arquivos. Os envios ficam privados e são juntados por tópico
   antes de entrar no resumo (ferramentas/COMO-JUNTAR.md).
   Backend: api/enviar-resumo.js

   Link para compartilhar: /enviar
   Com a matéria (e o tópico) já escolhidos:
     /enviar?materia=historia-2tri&topico=Período Joanino
   ═══════════════════════════════════════════════════════════ */

(function () {
  var raiz = document.getElementById('enviar-raiz');
  if (!raiz) return;

  var MAX_ARQUIVO = 20 * 1024 * 1024;
  var MAX_ARQUIVOS = 10;
  var LADO_MAX = 2000;   // px; fotos são reduzidas e viram JPEG antes do envio
  var MIME = {             // precisa bater com allowed_mime_types do bucket (supabase/schema.sql)
    pdf:  'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    odt:  'application/vnd.oasis.opendocument.text',
    txt:  'text/plain',
    md:   'text/markdown',
  };
  var VARIOS = 'Vários tópicos / outro';
  var PAGINA_OK = /^[a-z]+-\dtri(-[a-z]+)?$/;   // igual à validação da API e do banco

  raiz.innerHTML =
    '<form id="contrib-form" novalidate>' +
      '<h2 class="group-title">Sobre o quê</h2>' +
      '<div class="group form-group">' +
        '<label class="form-row">Trimestre<select name="tri" required>' +
          '<option value="1">1º trimestre</option><option value="2">2º trimestre</option><option value="3">3º trimestre</option>' +
        '</select></label>' +
        '<label class="form-row">Matéria<select name="materia" required><option value="">Escolha a matéria...</option></select></label>' +
        '<label class="form-row">Tópico<select name="topico" required disabled><option value="">Escolha a matéria primeiro</option></select></label>' +
        '<label class="form-row">Detalhe (opcional)<input name="assunto" type="text" maxlength="80" placeholder="Ex.: Tratados de 1810"></label>' +
      '</div>' +
      '<h2 class="group-title">Seu resumo</h2>' +
      '<div class="group form-group">' +
        '<label class="form-row">Texto<textarea name="texto" rows="8" maxlength="50000" placeholder="Cole ou escreva aqui o seu resumo..."></textarea></label>' +
        '<div class="form-row">' +
          '<span>Fotos do caderno ou arquivos</span>' +
          '<label class="btn gray small arquivo-btn"><input name="arquivo" type="file" multiple accept="image/*,.pdf,.docx,.odt,.txt,.md">Escolher fotos ou arquivos</label>' +
          '<span class="form-dica">PDF, DOCX, ODT, TXT ou MD · até 10 arquivos de 20 MB</span>' +
          '<ul id="contrib-files"></ul>' +
        '</div>' +
      '</div>' +
      '<h2 class="group-title">Créditos</h2>' +
      '<div class="group form-group">' +
        '<label class="form-row">Seu nome (opcional)<input name="nome" type="text" maxlength="80" autocomplete="name"></label>' +
      '</div>' +
      '<input name="site" type="text" tabindex="-1" autocomplete="off" class="contrib-hp" aria-hidden="true">' +
      '<p class="group-footer">Seu resumo fica guardado de forma privada. Ele é juntado com os dos colegas sobre o mesmo tópico e revisado antes de entrar no site.</p>' +
      '<div id="contrib-status" role="status" aria-live="polite"></div>' +
      '<button type="submit" id="contrib-send" class="btn block">Enviar</button>' +
    '</form>';

  var form = raiz.querySelector('#contrib-form');
  var status = raiz.querySelector('#contrib-status');
  var send = raiz.querySelector('#contrib-send');
  var lista = raiz.querySelector('#contrib-files');
  var params = new URLSearchParams(location.search);

  function avisar(msg, tipo) { status.textContent = msg; status.className = tipo || ''; }

  /* ── Trimestre e matéria (config.js) ── */
  // Primeiro o trimestre, depois só as matérias dele. Entram as páginas que
  // existem e as matérias ainda sem página (o aluno já pode mandar; o tópico
  // é digitado).
  var LISTA = typeof MATERIAS !== 'undefined' ? MATERIAS : [];
  var ATUAL = (typeof APP !== 'undefined' && APP.triAtual) || 3;
  var porTri = {}, nomes = {};
  LISTA.forEach(function (m) { if (m.materia && !nomes[m.materia]) nomes[m.materia] = m.nome.split(' · ')[0]; });
  [1, 2, 3].forEach(function (t) {
    var opcoes = [], usados = {}, temPagina = {};
    LISTA.forEach(function (m) {
      if (m.tri !== t || !m.id || !PAGINA_OK.test(m.id) || usados[m.id]) return;
      usados[m.id] = temPagina[m.materia] = true;
      opcoes.push({ id: m.id, rotulo: m.nome });
    });
    Object.keys(nomes).forEach(function (chave) {
      var id = chave + '-' + t + 'tri';
      if (!temPagina[chave] && !usados[id]) { usados[id] = true; opcoes.push({ id: id, rotulo: nomes[chave] }); }
    });
    opcoes.sort(function (a, b) { return a.rotulo.localeCompare(b.rotulo); });
    porTri[t] = opcoes;
  });
  function triDe(id) { var m = /-(\d)tri/.exec(id || ''); return m ? +m[1] : 0; }

  function preencherMaterias() {
    var sel = form.materia;
    sel.innerHTML = '';
    sel.add(new Option('Escolha a matéria...', ''));
    (porTri[form.tri.value] || []).forEach(function (o) { sel.add(new Option(o.rotulo, o.id)); });
  }

  // o endereço acompanha a escolha, para o link poder ser compartilhado
  function atualizarUrl() {
    var url = new URL(location.href);
    url.searchParams.set('tri', form.tri.value);
    if (form.materia.value) url.searchParams.set('materia', form.materia.value); else url.searchParams.delete('materia');
    url.searchParams.delete('topico');
    history.replaceState(null, '', url);
  }

  /* ── Tópicos = capítulos do menu da página da matéria ── */
  var cacheTopicos = {};
  var semCapitulos = false;
  var linhaTopico = form.topico.closest('label');
  var rotuloDetalhe = form.assunto.closest('label');
  async function topicosDe(id) {
    if (cacheTopicos[id]) return cacheTopicos[id];
    var r = await fetch(id + '.html');
    if (!r.ok) return (cacheTopicos[id] = []);   // matéria ainda sem página
    var html = await r.text();
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var vistos = {}, nomes = [];
    doc.querySelectorAll('nav a[href^="#"]').forEach(function (a) {
      var nome = a.textContent.replace(/\s+/g, ' ').trim().replace(/^\d+\.\s*/, '');
      if (!nome || vistos[nome] || /quiz|exerc|quest|flashcard/i.test(nome)) return;
      vistos[nome] = true;
      nomes.push(nome);
    });
    return (cacheTopicos[id] = nomes);
  }

  async function carregarTopicos(escolher) {
    var sel = form.topico;
    sel.innerHTML = '';
    if (!form.materia.value) {
      sel.add(new Option('Escolha a matéria primeiro', ''));
      sel.disabled = true;
      return;
    }
    sel.add(new Option('Carregando...', ''));
    sel.disabled = true;
    var nomes = [];
    try { nomes = await topicosDe(form.materia.value); } catch (e) { /* sem rede: fica só "Vários" */ }
    sel.innerHTML = '';
    semCapitulos = !nomes.length;
    linhaTopico.hidden = semCapitulos;
    rotuloDetalhe.firstChild.textContent = semCapitulos ? 'Tópico (escreva o assunto)' : 'Detalhe (opcional)';
    form.assunto.placeholder = semCapitulos ? 'Ex.: Revolução Industrial' : 'Ex.: Tratados de 1810';
    if (semCapitulos) { sel.add(new Option(VARIOS, VARIOS)); sel.value = VARIOS; sel.disabled = false; return; }
    sel.add(new Option('Escolha o tópico...', ''));
    nomes.concat(VARIOS).forEach(function (n) { sel.add(new Option(n, n)); });
    sel.disabled = false;
    if (escolher && nomes.concat(VARIOS).indexOf(escolher) >= 0) sel.value = escolher;
  }

  form.tri.addEventListener('change', function () { preencherMaterias(); carregarTopicos(); atualizarUrl(); });
  form.materia.addEventListener('change', function () { carregarTopicos(); atualizarUrl(); });

  var pedida = params.get('materia');
  form.tri.value = String(triDe(pedida) || +params.get('tri') || ATUAL);
  if (!form.tri.value) form.tri.value = String(ATUAL);
  preencherMaterias();
  if (pedida) {
    form.materia.value = pedida;
    if (form.materia.value) carregarTopicos(params.get('topico'));
  }

  /* ── Arquivos ── */
  function extensao(nome) { return nome.split('.').pop().toLowerCase(); }

  function tamanho(b) {
    return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function ehImagem(file) { return /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name); }

  form.arquivo.addEventListener('change', function () {
    lista.innerHTML = '';
    Array.prototype.forEach.call(form.arquivo.files, function (f) {
      var li = document.createElement('li');
      li.textContent = (ehImagem(f) ? '📷 ' : '📄 ') + f.name + ' · ' + tamanho(f.size);
      lista.appendChild(li);
    });
  });

  // Reduz a foto para no máximo LADO_MAX px e converte para JPEG.
  async function comprimir(file) {
    var img;
    try {
      img = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (e) {
      throw new Error('Não consegui abrir a foto "' + file.name + '". Envie em JPG ou PNG.');
    }
    var escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
    var c = document.createElement('canvas');
    c.width = Math.round(img.width * escala);
    c.height = Math.round(img.height * escala);
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    var blob = await new Promise(function (ok) { c.toBlob(ok, 'image/jpeg', 0.85); });
    if (!blob) throw new Error('Não consegui processar a foto "' + file.name + '".');
    return { nome: file.name.replace(/\.[^.]*$/, '') + '.jpg', blob: blob };
  }

  async function postar(payload) {
    var r = await fetch('/api/enviar-resumo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    var d = await r.json().catch(function () { return {}; });
    if (!r.ok || !d.ok) throw new Error(d.error || 'Não foi possível enviar.');
    return d;
  }

  // Manda o arquivo direto ao Supabase pela URL assinada (mesmo formato do supabase-js).
  async function subir(url, a) {
    var corpo = new FormData();
    corpo.append('cacheControl', '3600');
    corpo.append('', a.blob, a.nome);
    var r = await fetch(url, { method: 'PUT', body: corpo });
    if (!r.ok) throw new Error('Falha ao enviar "' + a.nome + '". Tente de novo.');
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var texto = form.texto.value.trim();
    var files = Array.prototype.slice.call(form.arquivo.files);

    if (!form.materia.value) return avisar('Escolha a matéria.', 'erro');
    if (semCapitulos && !form.assunto.value.trim()) return avisar('Escreva o tópico do seu resumo.', 'erro');
    if (!form.topico.value) return avisar('Escolha o tópico do seu resumo.', 'erro');
    if (!texto && !files.length) return avisar('Escreva um texto ou anexe uma foto ou arquivo.', 'erro');
    if (files.length > MAX_ARQUIVOS) return avisar('No máximo ' + MAX_ARQUIVOS + ' arquivos por envio.', 'erro');
    for (var i = 0; i < files.length; i++) {
      if (!ehImagem(files[i]) && !MIME[extensao(files[i].name)]) return avisar('Formato não aceito: "' + files[i].name + '".', 'erro');
      if (!ehImagem(files[i]) && files[i].size > MAX_ARQUIVO) return avisar('"' + files[i].name + '" passa de 20 MB.', 'erro');
    }

    send.disabled = true;

    try {
      var prontos = [];
      for (var j = 0; j < files.length; j++) {
        if (ehImagem(files[j])) {
          avisar('Preparando foto ' + (j + 1) + ' de ' + files.length + '...');
          prontos.push(await comprimir(files[j]));
        } else {
          // Tipo explícito: o navegador às vezes deixa vazio (.md, .odt) e o bucket recusaria.
          var f = files[j];
          prontos.push({ nome: f.name, blob: new Blob([f], { type: MIME[extensao(f.name)] }) });
        }
      }

      avisar('Enviando...');
      var envio = await postar({
        acao: 'iniciar',
        pagina: form.materia.value,
        // sem capítulos, o tópico é o texto digitado (é por ele que os envios são agrupados)
        assunto: semCapitulos ? form.assunto.value.trim() : [form.topico.value, form.assunto.value.trim()].filter(Boolean).join(' · '),
        texto: texto,
        nome: form.nome.value,
        site: form.site.value,
        arquivos: prontos.map(function (a) { return { nome: a.nome, tamanho: a.blob.size }; }),
      });

      if (envio.id) {
        for (var k = 0; k < envio.uploads.length; k++) {
          avisar('Enviando arquivo ' + (k + 1) + ' de ' + envio.uploads.length + '...');
          await subir(envio.uploads[k].url, prontos[k]);
        }
        avisar('Finalizando...');
        await postar({ acao: 'concluir', id: envio.id });
      }

      // mantém matéria e nome para quem quiser mandar outro tópico
      form.texto.value = '';
      form.assunto.value = '';
      form.arquivo.value = '';
      form.topico.value = '';
      lista.innerHTML = '';
      avisar('Valeu! Seu resumo foi recebido e vai ser revisado. ✅ Se quiser, mande outro tópico.', 'ok');
    } catch (err) {
      avisar(err.message || 'Erro de conexão. Tente novamente.', 'erro');
    } finally {
      send.disabled = false;
    }
  });
})();
