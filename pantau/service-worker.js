const V='pantau-v79-pasang',SHELL=['./','./index.html','./manifest.json','./icon-192.png','./logo.png','./logo-login.png','./logo-plate.png','./bg.jpg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 /* v73: cache dulu (instan), lalu perbarui diam-diam di belakang layar */
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(h=>{
  const net=fetch(r).then(x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x}).catch(()=>h||caches.match('./index.html'));
  if(h){e.waitUntil(net.catch(()=>{}));return h}
  return net}))});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return clients.openWindow('./')}))});


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
