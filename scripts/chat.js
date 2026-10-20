/* ═══════════════════════════════════════════════════════════
   chat.js — Nêuron, assistente de estudos
   Versão canônica. Todas as páginas devem usar este arquivo.
   ═══════════════════════════════════════════════════════════ */

function toggleChat() {
  var p = document.getElementById('chat-panel');
  p.classList.toggle('open');
  if (p.classList.contains('open')) document.getElementById('chat-input').focus();
}

/* ── Contexto enviado ao Nêuron ──
   O resumo inteiro não cabe no limite da IA. Em vez de mandar só o começo,
   a página é dividida em trechos e vão os mais ligados à pergunta, mais a
   seção que o aluno está lendo. Lê também os acordeões fechados (textContent,
   não innerText, que ignora o que está com display:none). */
var LIMITE_CONTEXTO = 9000;
var PALAVRAS_VAZIAS = ' para pela pelo pelos pelas como qual quais quando onde porque porquê sobre entre isso esse essa este esta aquele aquela muito mais menos também ainda então depois antes fala falar explica explique exemplo diferença qual quem tinha tenho fazer feito pode podem sendo seria foram eram eles elas dele dela nosso minha meu voce você resumo questao questão prova ';

function normalizar(t) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function trechosDoResumo() {
  var raiz = document.querySelector('main, .content') || document.body;
  var c = raiz.cloneNode(true);
  c.querySelectorAll('script, style, svg, button, input, nav, #chat-panel, #chat-btn').forEach(function (x) { x.remove(); });
  c.querySelectorAll('h1, h2, h3, h4, h5').forEach(function (h) { h.prepend('\n## '); });
  c.querySelectorAll('td, th').forEach(function (x) { x.append(' | '); });
  c.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, tr, div, section, article, blockquote, figcaption, label').forEach(function (x) { x.append('\n'); });
  var linhas = c.textContent.split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
  var trechos = [], atual = null, titulo = '';
  linhas.forEach(function (l) {
    var cabecalho = l.indexOf('## ') === 0;
    if (cabecalho) titulo = l.slice(3);
    if (!atual || (cabecalho && atual.texto.length > 300) || atual.texto.length > 1500) {
      atual = { titulo: titulo, texto: '' };
      trechos.push(atual);
    }
    atual.texto += (cabecalho ? l.slice(3) + ':' : l) + ' ';
  });
  return trechos;
}

// título (h2/h3) da seção que está no meio da tela
function tituloEmVista() {
  var t = '';
  document.querySelectorAll('main h2, main h3, .content h2, .content h3').forEach(function (h) {
    var r = h.getBoundingClientRect();
    if (r.height && r.top < window.innerHeight / 2) t = h.textContent.replace(/\s+/g, ' ').trim();
  });
  return t;
}

function getContext(pergunta) {
  var trechos = trechosDoResumo();
  var raizes = normalizar(pergunta || '').split(/[^a-z0-9]+/)
    .filter(function (p) { return p.length >= 4 && PALAVRAS_VAZIAS.indexOf(' ' + p + ' ') < 0; })
    .map(function (p) { return p.length > 6 ? p.slice(0, 6) : p; });
  var emVista = tituloEmVista();
  trechos.forEach(function (t, i) {
    var corpo = normalizar(t.texto), cab = normalizar(t.titulo);
    t.i = i;
    t.pontos = 0;
    raizes.forEach(function (r) {
      if (corpo.indexOf(r) >= 0) t.pontos += 1;
      if (cab.indexOf(r) >= 0) t.pontos += 2;
    });
    if (emVista && t.titulo === emVista) t.pontos += 1.5;
  });
  // sempre o começo da página (título e visão geral); depois, os mais relevantes
  var escolhidos = [trechos[0]].concat(trechos.slice(1).sort(function (a, b) { return b.pontos - a.pontos || a.i - b.i; }));
  var usados = [], total = 0;
  escolhidos.forEach(function (t) {
    if (!t || total + t.texto.length > LIMITE_CONTEXTO) return;
    usados.push(t);
    total += t.texto.length;
  });
  usados.sort(function (a, b) { return a.i - b.i; });
  return usados.map(function (t) { return t.texto.trim(); }).join('\n…\n');
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
      body: JSON.stringify({ message: text, context: getContext(text) })
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
