// 1. Nombre del service worker y los archivos a cachear
const CACHE_NAME = "mi-cache-v1";
const BASE_PATH = "/PWA-ejemplo/";

const urlsToCache = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}style.css`,
  `${BASE_PATH}offline.html`,
  `${BASE_PATH}icons/icon-192x192.png`,
  `${BASE_PATH}icons/icon-512x512.png`
];

// 2. INSTALL: cachear los recursos base
self.addEventListener("install", event => {
  console.log("Service Worker: Instalando...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Archivos cacheados");
      return cache.addAll(urlsToCache);
    })
  );
});

// 3. ACTIVATE: limpiar cachés antiguos
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// 4. FETCH: servir desde cache o red; fallback offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si hay respuesta en cache, usarla
      if (response) return response;

      // Si no, intentar desde la red
      return fetch(event.request).catch(() => {
        // Si falla (sin conexión), mostrar offline.html
        if (event.request.mode === "navigate") {
          return caches.match(`${BASE_PATH}offline.html`);
        }
      });
    })
  );
});

// 5. PUSH (opcional)
self.addEventListener("push", event => {
  const data = event.data ? event.data.text() : "Notificación sin texto";
  event.waitUntil(
    self.registration.showNotification("Mi PWA", { body: data })
  );
});
