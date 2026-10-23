/* Service worker Argo Tookee Supir — naikkan VERSION setiap file aplikasi diubah */
const VERSION = 'supir-v1-10-4-kirim';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './bg.jpg', './bg-login.jpg', './bg-lisensi.jpg', './logo-supir.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if(r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(x => { const c = x.clone(); caches.open(VERSION).then(h => h.put(r, c)); return x; }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
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
    return self.registration.showNotification(d.title || 'Argo Tookee Supir', { body:d.body || '', tag:d.tag || 'argo', icon:'icon-192.png', badge:'icon-192.png', renotify:true, requireInteraction:!!d.call, vibrate:d.call ? [400,200,400,200,400] : [200,100,200], silent:vis }).then(() => {
      if(vis) setTimeout(() => self.registration.getNotifications({ tag:d.tag || 'argo' }).then(n => n.forEach(x => x.close())), 800);
    });
  }));
});
