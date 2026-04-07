const CACHE_NAME = 'chess-game-v4';
const STATIC_CACHE = 'chess-static-v4';

const PRECACHE_URLS = [
  '/',
  '/index.html',
];

const GAME_ASSETS = [
  'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/79c4520d-63b3-4e07-8bba-0b7b41c53435.jpg',
  'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/files/5a37bc71-a83e-4a96-b899-abd4e284ef6e.jpg',
  'https://cdn.poehali.dev/projects/44b012df-8579-4e50-a646-a3ff586bd941/bucket/82c99961-b454-4287-b988-1e4c6af37144.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(CACHE_NAME).then((cache) =>
        Promise.allSettled(
          GAME_ASSETS.map((url) =>
            fetch(url, { mode: 'no-cors' }).then((res) => {
              if (res.status === 0 || res.ok) cache.put(url, res);
            }).catch(() => {})
          )
        )
      )
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE && key !== 'chess-pending-results')
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  if (url.hostname === 'upload.wikimedia.org' || url.hostname === 'cdn.poehali.dev') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 404 }));
      })
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || new Response('', { status: 404 }));
      })
    );
    return;
  }

  if (url.origin !== location.origin) return;

  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'QUEUE_RESULT') {
    savePendingResult(event.data.payload);
  }

  if (event.data && event.data.type === 'FLUSH_RESULTS') {
    flushPendingResults();
  }

  if (event.data && event.data.type === 'CHECK_UPDATE') {
    self.registration.update();
  }
});

async function savePendingResult(payload) {
  const cache = await caches.open('chess-pending-results');
  const existing = await cache.match('/pending-results');
  let results = [];
  if (existing) {
    results = await existing.json();
  }
  results.push({ ...payload, queued_at: Date.now() });
  await cache.put('/pending-results', new Response(JSON.stringify(results)));
}

async function flushPendingResults() {
  const cache = await caches.open('chess-pending-results');
  const existing = await cache.match('/pending-results');
  if (!existing) return;

  let results = await existing.json();
  if (!results.length) return;

  const remaining = [];
  for (const r of results) {
    try {
      const res = await fetch(r.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(r.body)
      });
      if (!res.ok) remaining.push(r);
    } catch {
      remaining.push(r);
    }
  }

  if (remaining.length) {
    await cache.put('/pending-results', new Response(JSON.stringify(remaining)));
  } else {
    await cache.delete('/pending-results');
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'RESULTS_FLUSHED', remaining: remaining.length });
  });
}
