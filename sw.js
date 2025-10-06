
//1. Nombre del service worker y los archivos a cachear
const CACHE_NAME = "mi-cache"; //sustituir nombre real de la PWA
const BASE_PATH = "PWA-ejemplo/"; //ruta base de la PWA
const urlsToCache = [//lista de archivos a cachear
    `index.html`,
    `manifest.json`,
    `style.css`,
    `offline.html`, // crear pagina offline para cuando no haya conexion
    `icons/icon-192x192.png`,
    `icons/icon-512x512.png`
];

//2. Evento INSTALL -> se ejecuta al instalar el servie worker, se cachean
// (se meten a cache) los recursos base de la PWA
self.addEventListener("install", event => {
    console.log("Service Worker: Instalando...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Archivos cacheados");
            cache.addAll(urlsToCache)
        })
    );
});

//3. Evento ACTIVATE -> se ejecuta al activar el service worker y necesito limpiar
// caches antiguos, para mantener version actual 
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => 
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            )
        )
    );
});

//4. Evento FETCH -> intercepta peticiones de la app 
// Intercepta cada peticion de la PWA. 
// Busca primero en cache y si no esta busca en internet
// En caso de falla muestra la pagina offline.html
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch (() => caches.match("offline.html"))
        })
    );
}); 

//5. Evento PUSH -> notificaciones en segundo plano
// manejo de notificaciones push (opcioonnal)
self.addEventListener("push", event => {
    const data = event.data ? event.data.text() : "Notificacion sin texto";
    event.waitUntil(
        self.registration.showNotification("Mi PWA" , {body: data})
    );
});
//