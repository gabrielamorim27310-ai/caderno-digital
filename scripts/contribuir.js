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
  var PEDACO = 2.5 * 1024 * 1024;   // limite de corpo da Vercel é 4,5 MB e base64 infla ~33%
  var LADO_MAX = 2000;              // px; fotos são reduzidas e viram JPEG antes do envio
  var EXTENSOES = ['pdf', 'docx', 'odt', 'txt', 'md'];

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

  function tamanho(b) {
    return b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function ehImagem(file) { return /^image\//.test(file.type); }

  form.arquivo.addEventListener('change', function () {
    lista.innerHTML = '';
    Array.prototype.forEach.call(form.arquivo.files, function (f) {
      var li = document.createElement('li');
      li.textContent = (ehImagem(f) ? '📷 ' : '📄 ') + f.name + ' · ' + tamanho(f.size);
      lista.appendChild(li);
    });
  });

  function novoId() {
    var d = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    return d + '-' + Math.random().toString(36).slice(2, 8).padEnd(6, '0');
  }

  function lerBase64(blob) {
    return new Promise(function (ok, erro) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { erro(r.error); };
      r.readAsDataURL(blob);
    });
  }

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
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var texto = form.texto.value.trim();
    var files = Array.prototype.slice.call(form.arquivo.files);

    if (!texto && !files.length) return avisar('Cole um texto ou anexe um arquivo.', 'erro');
    if (files.length > MAX_ARQUIVOS) return avisar('No máximo ' + MAX_ARQUIVOS + ' arquivos por envio.', 'erro');
    for (var i = 0; i < files.length; i++) {
      var ext = files[i].name.split('.').pop().toLowerCase();
      if (!ehImagem(files[i]) && EXTENSOES.indexOf(ext) === -1) return avisar('Formato não aceito: "' + files[i].name + '".', 'erro');
      if (!ehImagem(files[i]) && files[i].size > MAX_ARQUIVO) return avisar('"' + files[i].name + '" passa de 20 MB.', 'erro');
    }

    send.disabled = true;

    try {
      var base = { pagina: pagina, id: novoId(), site: form.site.value };

      var prontos = [];
      for (var j = 0; j < files.length; j++) {
        if (ehImagem(files[j])) {
          avisar('Preparando foto ' + (j + 1) + ' de ' + files.length + '...');
          prontos.push(await comprimir(files[j]));
        } else {
          prontos.push({ nome: files[j].name, blob: files[j] });
        }
      }

      var partes = [];
      prontos.forEach(function (a, indice) {
        var total = Math.max(1, Math.ceil(a.blob.size / PEDACO));
        for (var p = 0; p < total; p++) {
          partes.push({ indice: indice, nome: a.nome, parte: p, total: total, blob: a.blob.slice(p * PEDACO, (p + 1) * PEDACO) });
        }
      });

      for (var k = 0; k < partes.length; k++) {
        avisar('Enviando arquivos... ' + Math.round(k / partes.length * 100) + '%');
        var pt = partes[k];
        await postar(Object.assign({ tipo: 'parte', arquivo: {
          indice: pt.indice, nome: pt.nome, parte: pt.parte, total: pt.total, base64: await lerBase64(pt.blob),
        } }, base));
      }

      avisar('Finalizando...');
      await postar(Object.assign({
        tipo: 'final',
        assunto: form.assunto.value,
        texto: texto,
        nome: form.nome.value,
        arquivos: prontos.map(function (a) { return a.nome; }),
      }, base));

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
