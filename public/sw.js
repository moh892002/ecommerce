const CACHE_NAME = "shopwave-v1";
const IMAGE_CACHE = "shopwave-images-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/admin/index.html",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      return Promise.all(keys.filter(k => k !== CACHE_NAME && k !== IMAGE_CACHE).map(k => caches.delete(k)));
    })()
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Image strategy: cache-first with separate cache
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i) || event.request.destination === "image") {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) =>
          (cached || fetch(event.request, { mode: "cors" }).then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }))
        )
      )
    );
    return;
  }

  // Navigation: network-first, fallback to cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        } catch {
          return caches.match("/index.html");
        }
      })()
    );
    return;
  }

  // Static / API: stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request, { mode: "cors" }).then((response) => {
        if (response.ok && (url.origin === self.location.origin || url.hostname.endsWith(".jsdelivr.net") || url.hostname.endsWith(".unsplash.com"))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached || caches.match("/index.html"));
      return cached || fetchPromise;
    })
  );
});
