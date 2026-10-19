/* ═══════════════════════════════════════════════════════════
   contribuir.js — "Enviar meu resumo"
   Botão + formulário para o aluno mandar o próprio resumo da
   matéria. Os envios ficam privados e são revisados antes de
   entrarem no resumo da página. Backend: api/enviar-resumo.js
   ═══════════════════════════════════════════════════════════ */

(function () {
  var pagina = location.pathname.split('/').pop().replace(/\.html$/, '');
  if (!/^[a-z]+-\dtri(-[a-z]+)?$/.test(pagina)) return;

  var MAX_ARQUIVO = 3 * 1024 * 1024;
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
        '<label>Ou anexe um arquivo (PDF, DOCX, ODT, TXT ou MD, até 3 MB)<input name="arquivo" type="file" accept=".pdf,.docx,.odt,.txt,.md"></label>' +
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

  function abrir() { modal.classList.add('open'); form.texto.focus(); }
  function fechar() { modal.classList.remove('open'); }
  function avisar(msg, tipo) { status.textContent = msg; status.className = tipo || ''; }

  btn.addEventListener('click', abrir);
  modal.querySelector('#contrib-close').addEventListener('click', fechar);
  modal.addEventListener('click', function (e) { if (e.target === modal) fechar(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });

  function lerBase64(file) {
    return new Promise(function (ok, erro) {
      var r = new FileReader();
      r.onload = function () { ok(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { erro(r.error); };
      r.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var texto = form.texto.value.trim();
    var file = form.arquivo.files[0];

    if (!texto && !file) return avisar('Cole um texto ou anexe um arquivo.', 'erro');
    if (file) {
      var ext = file.name.split('.').pop().toLowerCase();
      if (EXTENSOES.indexOf(ext) === -1) return avisar('Formato não aceito. Use PDF, DOCX, ODT, TXT ou MD.', 'erro');
      if (file.size > MAX_ARQUIVO) return avisar('Arquivo maior que 3 MB.', 'erro');
    }

    send.disabled = true;
    avisar('Enviando...');

    try {
      var payload = {
        pagina: pagina,
        assunto: form.assunto.value,
        texto: texto,
        nome: form.nome.value,
        site: form.site.value,
      };
      if (file) payload.arquivo = { nome: file.name, base64: await lerBase64(file) };

      var r = await fetch('/api/enviar-resumo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok || !d.ok) throw new Error(d.error || 'Não foi possível enviar.');

      form.reset();
      avisar('Valeu! Seu resumo foi recebido e vai ser revisado. ✅', 'ok');
    } catch (err) {
      avisar(err.message || 'Erro de conexão. Tente novamente.', 'erro');
    } finally {
      send.disabled = false;
    }
  });
})();
