const CACHE = 'xiaosu-v2';
const FILES = ['./icon.svg','./manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return;          // 跨域 API 不缓存
  if (e.request.mode === 'navigate' || u.pathname.endsWith('.html')) {
    // 页面：网络优先，断了才用缓存
    e.respondWith(fetch(e.request).then(res=>{
      const c = res.clone(); caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{});
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
