const CACHE_NAME = 'islalarga-v23';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/qrcode.min.js',
  './manifest.json',
  './assets/icon.svg',
  './images/login.jpg',
  './images/playa-isla-larga.jpg',
  './images/muelle-la-rosa.jpg',
  './images/gañango.jpg',
  './images/larosa.jpg',
  './images/kayak-aguas-cristalinas.jpg',
  './images/toldoysillas.jpg',
  './images/buceo.jpg',
  './images/pescado-frito.jpg',
  './images/ceviche.jpg',
  './images/tostones.jpg',
  './images/bebidas-frias.jpg',
  './images/combo-playero.jpg',
  './images/avatar-usuario.jpg',
  './images/logo-islalarga.svg',
  './images/logo-islalarga2.svg',
  './images/logo-inparques.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
