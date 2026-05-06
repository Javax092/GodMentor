const STATIC_CACHE = "evolua-static-v1";
const STATIC_ROUTES = ["/manifest.webmanifest", "/apple-icon", "/pwa-icons/192", "/pwa-icons/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ROUTES)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(request) {
  if (request.method !== "GET") {
    return false;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return false;
  }

  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/diario") ||
    url.pathname.startsWith("/metas") ||
    url.pathname.startsWith("/revisoes") ||
    url.pathname.startsWith("/configuracoes") ||
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register")
  ) {
    return false;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pwa-icons/")) {
    return true;
  }

  if (STATIC_ROUTES.includes(url.pathname)) {
    return true;
  }

  return ["style", "script", "worker", "font", "image"].includes(request.destination);
}

self.addEventListener("fetch", (event) => {
  if (!isStaticAsset(event.request)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response.ok) {
          return response;
        }

        const cloned = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, cloned));
        return response;
      });
    })
  );
});
