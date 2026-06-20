const CACHE_NAME = 'pav-static-v1';
const OFFLINE_URL = '/offline';

const PRECACHE_URLS = [
  '/',
  '/offline',
  '/sitios',
  '/experiencias',
  '/acerca',
  '/guide',
];

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all(
        PRECACHE_URLS.map(function(url) {
          return cache.add(url).catch(function() {
            console.warn('Failed to precache:', url);
          });
        })
      );
    })
  );
  return self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys
          .filter(function(key) {
            return key !== CACHE_NAME && key.startsWith('pav-');
          })
          .map(function(key) {
            return caches.delete(key);
          })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  var url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(function() {
        return caches.match(request).then(function(cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match(OFFLINE_URL).then(function(offlinePage) {
            if (offlinePage) {
              return offlinePage;
            }
            return caches.match('/');
          });
        });
      })
    );
    return;
  }

  if (url.href.indexOf('fonts.googleapis.com') !== -1 || url.href.indexOf('fonts.gstatic.com') !== -1) {
    event.respondWith(
      caches.open('google-fonts-cache').then(function(cache) {
        return cache.match(request).then(function(response) {
          if (response) {
            return response;
          }
          return fetch(request).then(function(networkResponse) {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(function() {
            return response;
          });
        });
      })
    );
    return;
  }

  if (/\.(?:png|jpg|jpeg|webp|avif|gif|svg)$/i.test(request.url)) {
    event.respondWith(
      caches.open('images-cache').then(function(cache) {
        return cache.match(request).then(function(response) {
          if (response) {
            return response;
          }
          return fetch(request).then(function(networkResponse) {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(function() {
            return response;
          });
        });
      })
    );
    return;
  }

  if (url.pathname.indexOf('/api/') !== -1) {
    event.respondWith(
      caches.open('api-cache').then(function(cache) {
        return cache.match(request).then(function(response) {
          var fetchPromise = fetch(request).then(function(networkResponse) {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(function() {
            return response;
          });
          return response || fetchPromise;
        });
      })
    );
    return;
  }
});
