// My Qamus : la page vient d’abord d’internet (pour recevoir les mises à jour), puis du cache hors ligne
const CACHE = "my-qamus-v20";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"}))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url), mine = u.origin === location.origin, fonts = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!mine && !fonts) return; // audio, API : toujours en direct
  const isPage = req.mode === "navigate" || (mine && /\/$|\.html$/.test(u.pathname));
  if (isPage) {
    e.respondWith(fetch(req, {cache: "no-store"}).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
});
