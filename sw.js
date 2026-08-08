const CACHE_NAME = 'jadwal-jurnal-v3';

// Daftar file inti yang dicache di awal
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Langsung aktifkan versi terbaru
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Teknik "Satu per satu": Jika satu file gagal di-cache, file lain tetap aman
      CORE_ASSETS.forEach(url => {
        cache.add(url).catch(err => console.log("Gagal cache:", url));
      });
    })
  );
});

self.addEventListener('activate', event => {
  // Membersihkan cache versi lama
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Strategi: "Network First, lalu Fallback ke Cache"
self.addEventListener('fetch', event => {
  // Hanya memproses request pengambilan data (GET)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika sedang online dan file berhasil dipanggil, simpan ke memori offline (Cache)
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Jika OFFLINE (internet mati), otomatis ambil file dari dalam memori HP
        return caches.match(event.request);
      })
  );
});
