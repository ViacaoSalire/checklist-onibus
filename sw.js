// Service worker: guarda o app no celular para abrir na hora, mesmo sem internet.
const VERSAO = 'v2026-10-02-6';
const ARQUIVOS = ['./', './index.html', './gestao.html', './config.js', './manifest.webmanifest',
                  './icon-192.png', './icon-512.png', './icon-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Abre do celular na hora e, em segundo plano, baixa a versão nova (vale na próxima abertura).
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;   // API do Google passa direto
  e.respondWith(caches.open(VERSAO).then((cache) =>
    cache.match(e.request, { ignoreSearch: true }).then((salvo) => {
      const daRede = fetch(e.request).then((r) => {
        if (r && r.ok) cache.put(e.request, r.clone());
        return r;
      }).catch(() => salvo || cache.match('./index.html'));
      return salvo || daRede;
    })));
});
