/* ═══════════════════════════════════════════════════════════
   sw.js — Service worker: modo offline do Caderno Digital
   - Na instalação, guarda o app (CSS, JS, ícones) e TODAS as páginas
     de resumo, para abrirem sem internet mesmo nunca visitadas.
   - Páginas, CSS e JS: rede primeiro (sempre a versão mais nova com
     internet); a cópia guardada só é usada offline.
   - Imagens: cópia guardada primeiro, atualizada em segundo plano.
   - /api/ (Nêuron, envio de resumos) e outros sites: nunca guardados.
   Ao mudar a lista abaixo, troque VERSAO para renovar a instalação.
   ═══════════════════════════════════════════════════════════ */

const VERSAO = 'cd-2026-10-20-socio3b';
const ESSENCIAIS = [
  './',
  'biologia-1tri.html',
  'biologia-2tri.html',
  'filosofia-1tri.html',
  'filosofia-2tri.html',
  'geografia-1tri.html',
  'geografia-2tri-america.html',
  'geografia-2tri.html',
  'historia-1tri.html',
  'historia-2tri.html',
  'index.html',
  'enviar.html',
  'ingles-2tri.html',
  'ingles-flashcards.html',
  'matematica-2tri.html',
  'portugues-1tri.html',
  'quimica-1tri.html',
  'quimica-2tri.html',
  'sociologia-1tri.html',
  'sociologia-2tri.html',
  'sociologia-3tri.html',
  'config.js',
  'manifest.webmanifest',
  'icons.svg',
  'favicon.svg',
  'icon-192.png',
  'pensador.png',
  'styles/ios.css',
  'styles/shared.css',
  'styles/effects.css',
  'scripts/theme.js',
  'scripts/app.js',
  'scripts/chat.js',
  'scripts/contribuir.js',
  'scripts/effects.js',
  'scripts/progress.js',
  'scripts/globe.js',
  'scripts/globe-landmask.js',
  'scripts/globe-regions.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSAO)
      // um arquivo que falhe não impede a instalação do resto
      .then((c) => Promise.allSettled(ESSENCIAIS.map((u) => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function guardar(req, resp) {
  if (resp && resp.ok && resp.type === 'basic') {
    const copia = resp.clone();
    caches.open(VERSAO).then((c) => c.put(req, copia));
  }
  return resp;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Imagens: cópia primeiro, atualiza em segundo plano
  if (req.destination === 'image') {
    e.respondWith(
      caches.match(req).then((guardada) => {
        const daRede = fetch(req).then((r) => guardar(req, r)).catch(() => guardada);
        return guardada || daRede;
      })
    );
    return;
  }

  // Páginas, CSS, JS e o resto: rede primeiro, cópia se estiver offline
  e.respondWith(
    fetch(req)
      .then((r) => guardar(req, r))
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((guardada) =>
          guardada || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())
        )
      )
  );
});
