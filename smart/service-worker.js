/* Service worker Argo Tookee Smart — naikkan VERSION setiap file aplikasi diubah */
const VERSION = 'smart-v49-tanpa-berangkat';
const PAGE = './index.html';
const SHELL = ['./', PAGE, './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('smart-') && k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.origin !== location.origin) {           // Firebase & WhatsApp tidak disentuh; hanya font di-cache
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      e.respondWith(caches.open(VERSION).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit))));
    }
    return;
  }
  if (url.pathname.endsWith('/revoked.json')) return;   // selalu ambil langsung dari jaringan
  if (req.mode === 'navigate') {                  // halaman: versi terbaru dulu, offline pakai cache
    e.respondWith(fetch(req.url, { cache:'no-store' }).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(PAGE, cp)); return r; }).catch(() => caches.match(PAGE)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(l => { for(const c of l){ if('focus' in c) return c.focus(); } return clients.openWindow('./'); }));
});


/* ===== Web Push (notifikasi saat aplikasi ditutup) ===== */
self.addEventListener('push', e => {
  let d = {}; try{ d = e.data.json(); }catch(x){}
  e.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    const vis = list.some(c => c.visibilityState === 'visible');
    return self.registration.showNotification(d.title || 'Argo Tookee', { body:d.body || '', tag:d.tag || 'argo', icon:'icon-192.png', badge:'icon-192.png', renotify:true, requireInteraction:!!d.call, vibrate:d.call ? [400,200,400,200,400] : [200,100,200], silent:vis }).then(() => {
      if(vis) setTimeout(() => self.registration.getNotifications({ tag:d.tag || 'argo' }).then(n => n.forEach(x => x.close())), 800);
    });
  }));
});
