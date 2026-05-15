const CACHE_NAME = 'gardena-v1.2.4';
const ASSETS = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png", "./index.html"];

// Database Config
const DB_NAME = 'GARDENA_DB';
const STORE_NAME = 'offline_attendance';

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    if (e.request.url.includes('script.google.com')) return fetch(e.request);
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});

// Fitur Background Sync
self.addEventListener('sync', e => {
    if (e.tag === 'sync-absensi') {
        e.waitUntil(sendOfflineData());
    }
});

async function sendOfflineData() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const allData = await store.getAll();

    for (const data of allData) {
        try {
            // Kirim ke Google Sheets
            const response = await fetch(data.url, { method: 'GET' }); 
            if (response.ok) {
                // Jika sukses, hapus dari IndexedDB
                const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                await deleteTx.objectStore(STORE_NAME).delete(data.id);
            }
        } catch (err) {
            console.error("Gagal sinkron data ID: " + data.id);
        }
    }
}

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
