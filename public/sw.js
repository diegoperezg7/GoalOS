const CACHE_NAME = "goalos-shell-v4";
// Only cache stable shell assets (no content hash).
// JS/CSS bundles (/assets/*) have content-hash names and immutable nginx headers —
// the SW must NOT hold them or it serves stale bundles after every redeploy.
const APP_SHELL = ["/goalos-mark.svg", "/favicon-32.png", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Navigation: always network-first so new deploys are immediately visible.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match("/")) || Response.error();
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Hashed bundles: network-first — nginx already caches them immutably by filename.
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then((r) => r || Response.error()),
      ),
    );
    return;
  }

  // Static shell assets (icons, SVG): cache-first — stable across deploys.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
