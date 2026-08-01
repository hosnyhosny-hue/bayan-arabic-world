const CACHE = "bayan-pulse-v3";
const CORE = [
  "/pulse",
  "/pulse/offline",
  "/images/bayan/pulse-main-hero.jpg",
  "/images/bayan/pulse-feed-1.jpg",
  "/images/bayan/pulse-feed-2.jpg",
  "/images/bayan/pulse-feed-3.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(async () => (await caches.match(event.request)) || (await caches.match("/pulse/offline")))
    );
    return;
  }

  if (event.request.destination === "image") {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      }))
    );
  }
});
