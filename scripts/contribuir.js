/* ═══════════════════════════════════════════════════════════
   contribuir.js — "Enviar meu resumo"
   Botão + formulário para o aluno mandar o próprio resumo da
   matéria. Os envios ficam privados e são revisados antes de
   entrarem no resumo da página. Backend: api/enviar-resumo.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  var pagina = location.pathname.split('/').pop().replace(/\.html$/, '');
  if (!/^[a-z]+-\dtri(-[a-z]+)?$/.test(pagina)) return;

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

  var btn = document.createElement('button');
  btn.id = 'contrib-btn';
  btn.type = 'button';
  btn.textContent = '📝 Enviar meu resumo';

  var modal = document.createElement('div');
  modal.id = 'contrib-modal';
  modal.innerHTML =
    '<div id="contrib-box" role="dialog" aria-modal="true" aria-labelledby="contrib-title">' +
      '<div id="contrib-head">' +
        '<span id="contrib-title">📝 Contribua com o seu resumo</span>' +
        '<button type="button" id="contrib-close" aria-label="Fechar">✕</button>' +
      '</div>' +
      '<form id="contrib-form">' +
        '<p class="contrib-info">Seu resumo é guardado de forma privada e revisado antes de entrar no resumo desta página. Ele não é publicado do jeito que você enviou.</p>' +
        '<label>Assunto (opcional)<input name="assunto" type="text" maxlength="120" placeholder="Ex.: Período Joanino"></label>' +
        '<label>Seu resumo<textarea name="texto" rows="8" maxlength="50000" placeholder="Cole aqui o seu resumo..."></textarea></label>' +
        '<label>Ou anexe fotos do caderno ou arquivos (PDF, DOCX, ODT, TXT, MD; até 10 arquivos de 20 MB)<input name="arquivo" type="file" multiple accept="image/*,.pdf,.docx,.odt,.txt,.md"></label>' +
        '<ul id="contrib-files"></ul>' +
        '<label>Seu nome (opcional, para os créditos)<input name="nome" type="text" maxlength="80"></label>' +
        '<input name="site" type="text" tabindex="-1" autocomplete="off" class="contrib-hp" aria-hidden="true">' +
        '<div id="contrib-status" role="status"></div>' +
        '<button type="submit" id="contrib-send">Enviar</button>' +
      '</form>' +
    '</div>';

  document.body.appendChild(btn);
  document.body.appendChild(modal);

  var form = modal.querySelector('#contrib-form');
  var status = modal.querySelector('#contrib-status');
  var send = modal.querySelector('#contrib-send');
  var lista = modal.querySelector('#contrib-files');

  function abrir() { modal.classList.add('open'); form.texto.focus(); }
  function fechar() { modal.classList.remove('open'); }
  function avisar(msg, tipo) { status.textContent = msg; status.className = tipo || ''; }

  btn.addEventListener('click', abrir);
  modal.querySelector('#contrib-close').addEventListener('click', fechar);
  modal.addEventListener('click', function (e) { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

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

    if (!texto && !files.length) return avisar('Cole um texto ou anexe um arquivo.', 'erro');
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
        pagina: pagina,
        assunto: form.assunto.value,
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

      form.reset();
      lista.innerHTML = '';
      avisar('Valeu! Seu resumo foi recebido e vai ser revisado. ✅', 'ok');
    } catch (err) {
      avisar(err.message || 'Erro de conexão. Tente novamente.', 'erro');
    } finally {
      send.disabled = false;
    }
  });
})();
