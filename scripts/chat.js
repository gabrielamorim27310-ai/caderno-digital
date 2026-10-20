/* ═══════════════════════════════════════════════════════════
   chat.js — Nêuron, assistente de estudos
   Versão canônica. Todas as páginas devem usar este arquivo.
   ═══════════════════════════════════════════════════════════ */

function toggleChat() {
  var p = document.getElementById('chat-panel');
  p.classList.toggle('open');
  if (p.classList.contains('open')) document.getElementById('chat-input').focus();
}

function getContext() {
  var el = document.querySelector('main, .content') || document.body;
  var texto = el.innerText;
  // Não manda a própria conversa como se fosse conteúdo do resumo
  var chat = document.getElementById('chat-panel');
  if (chat && el.contains(chat)) texto = texto.replace(chat.innerText, '');
  return texto.replace(/\s+/g, ' ').slice(0, 6000);
}

// Esc fecha o chat
document.addEventListener('keydown', function (e) {
  var p = document.getElementById('chat-panel');
  if (e.key === 'Escape' && p && p.classList.contains('open')) toggleChat();
});

async function sendMsg(e) {
  e.preventDefault();
  var input = document.getElementById('chat-input');
  var msgs  = document.getElementById('chat-msgs');
  var text  = input.value.trim();
  if (!text) return;
  input.value = '';

  var userMsg = document.createElement('div');
  userMsg.className = 'cmsg user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);

  var loader = document.createElement('div');
  loader.className = 'cmsg bot loading';
  loader.textContent = 'Pensando...';
  msgs.appendChild(loader);
  msgs.scrollTop = msgs.scrollHeight;

  var endpoint = (typeof APP !== 'undefined' && APP.aiEndpoint) ? APP.aiEndpoint : '/api/chat';

  try {
    var r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, context: getContext() })
    });
    var d = await r.json();
    loader.className = 'cmsg bot';
    loader.textContent = d.reply || d.error || 'Sem resposta.';
  } catch(err) {
    loader.className = 'cmsg bot';
    loader.textContent = 'Erro de conexão. Tente novamente.';
  }
  msgs.scrollTop = msgs.scrollHeight;
}
