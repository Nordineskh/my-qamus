// My Qamus : mise en cache pour un usage hors ligne
const CACHE = "my-qamus-v16";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const mine = u.origin === location.origin, fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!mine && !fonts) return; // API Claude et audio : toujours en direct
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
