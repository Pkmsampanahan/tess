const CACHE_NAME = 'gardena-v1.2.1'; 
const ASSETS = ["./","./manifest.json","./icon-192.png","./icon-512.png","./index.html"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); });
self.addEventListener('fetch', e => {
    if (e.request.url.includes('script.google.com')) return fetch(e.request);
    e.respondWith(caches.match(e.request).then(response => {
            const fetchPromise = fetch(e.request).then(networkResponse => {
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => { cache.put(e.request, responseClone); });
                }
                return networkResponse;
            });
            return response || fetchPromise;
        })
    );
});
self.addEventListener('sync', e => { if (e.tag === 'sync-absensi') e.waitUntil(console.log('Syncing...')); });
