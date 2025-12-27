// Service Worker para PWA
const CACHE_NAME = 'prioridades-v1735330000';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/styles.css',
  '/app.js',
  '/auth.js',
  '/supabase-init.js',
  '/supabase-config.js',
  '/manifest.json'
];

// Instalar o Service Worker e fazer cache dos arquivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache.map(url => {
          return new Request(url, {cache: 'reload'});
        })).catch(err => {
          console.log('⚠️ Erro ao adicionar ao cache:', err);
        });
      })
  );
  self.skipWaiting();
});

// Ativar o Service Worker e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições do Supabase e outras APIs
  if (event.request.url.includes('supabase.co') || 
      event.request.url.includes('supabase.io') ||
      event.request.url.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retornar resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Verificar se recebemos uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone da resposta
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Se falhar, tentar retornar do cache
          return caches.match('/index.html');
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
