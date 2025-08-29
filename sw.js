const CACHE_NAME = 'ocr-gemini-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/vite.svg',
  'https://unpkg.com/react-image-crop/dist/ReactCrop.css',
  'https://cdn.tailwindcss.com',
  'https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1',
  'https://aistudiocdn.com/@google/genai@^1.15.0',
  'https://aistudiocdn.com/react-image-crop@^11.0.6',
  'https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.min.mjs',
  'https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs'
];

self.addEventListener('install', (event) => {
  // Realiza a instalação e armazena os assets em cache
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se a resposta estiver no cache, a retorna
        if (response) {
          return response;
        }
        // Caso contrário, busca na rede
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Deleta caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
