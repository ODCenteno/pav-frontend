/**
 * Puerto Agua Verde PWA Service Worker
 *
 * Caching layers (all versioned with the pav-* prefix so they purge on upgrade):
 *   - pav-shell-v2     Pre-rendered HTML shell + offline fallback page
 *   - pav-fonts-v1     Google Fonts CSS + woff/ttf files
 *   - pav-images-v1    PNG/JPG/WebP/SVG assets
 *   - pav-api-v1       Cross-origin API responses (e.g. R2 / Strapi media)
 *
 * The `caches.match` priority for navigations is:
 *   1. Stale-while-revalidate: cache hit → respond instantly + refresh in bg
 *   2. Cache miss + network fail → /offline fallback → /
 *
 * The previous SW called self.skipWaiting() inside the install handler, which
 * bypassed the update banner UX. We intentionally let the install complete and
 * wait for the page to postMessage({ type: 'SKIP_WAITING' }) so the user can
 * choose when to activate the new version.
 */

/* eslint-disable no-restricted-globals */

const CACHE_SHELL = 'pav-shell-v2';
const CACHE_FONTS = 'pav-fonts-v1';
const CACHE_IMAGES = 'pav-images-v1';
const CACHE_API = 'pav-api-v1';

const OFFLINE_URL = '/offline';

const SHELL_URLS = [
  '/',
  '/offline',
  '/sitios',
  '/experiencias',
  '/acerca',
  '/guide',
  '/en/',
  '/en/sitios',
  '/en/experiencias',
  '/en/acerca',
  '/en/guide',
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'BROADCAST_SW_UPDATED') {
    broadcastSwUpdated();
  }
});

async function broadcastSwUpdated() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'SW_UPDATED' });
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_SHELL)
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => {
              // Pre-cache failures are non-fatal: pages will fall through to network.
              console.warn('[sw] pre-cache failed:', url);
            }),
          ),
        ),
      ),
  );
  // NOTE: deliberately NOT calling self.skipWaiting() here.
  // The new SW waits until the page sends postMessage({ type: 'SKIP_WAITING' }),
  // which the BaseLayout update banner triggers on user click.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('pav-') && key !== CACHE_SHELL && key !== CACHE_FONTS && key !== CACHE_IMAGES && key !== CACHE_API)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
      // Background-precache listing detail pages so every site works offline
      // after the user has visited the site at least once online.
      precacheListings().catch((error) => {
        console.warn('[sw] background precache failed:', error);
      });
    })(),
  );
});

async function precacheListings() {
  const response = await fetch('/api/data/listings-index.json', { cache: 'no-cache' });
  if (!response.ok) return;
  const data = await response.json().catch(() => null);
  if (!data || !Array.isArray(data.items)) return;

  const cache = await caches.open(CACHE_SHELL);
  const urls = data.items.map((item) =>
    item.locale === 'en' ? `/en/sitios/${item.slug}` : `/sitios/${item.slug}`,
  );
  await Promise.all(
    urls.map((url) =>
      cache.add(url).catch(() => {
        // Pre-cache failures (e.g. network blip) don't propagate; next visit
        // hits the network and caches the page on demand.
      }),
    ),
  );

  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'PRECACHE_COMPLETE', count: urls.length });
  }
}

/**
 * Generic stale-while-revalidate cache for any same-origin or allowed
 * cross-origin resource. Returns the cached response immediately if present,
 * fires a background fetch to refresh the cache, and falls back to the cached
 * response if the network is offline.
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

function isFontAsset(url) {
  return url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com');
}

function isImageAsset(url) {
  return /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(url.pathname);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

async function handleNavigationRequest(request) {
  // SWR for HTML navigations: instant cached shell + background refresh.
  const cache = await caches.open(CACHE_SHELL);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => {});
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  // Network failed AND nothing cached: serve offline fallback (shell always has it).
  const offlinePage = await cache.match(OFFLINE_URL);
  if (offlinePage) return offlinePage;
  const root = await cache.match('/');
  if (root) return root;

  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET — POST/PUT/DELETE etc. always hit the network.
  if (request.method !== 'GET') return;

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (isFontAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_FONTS));
    return;
  }

  if (isImageAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_IMAGES));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_API));
  }
});
