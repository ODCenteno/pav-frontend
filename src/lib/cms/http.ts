/**
 * Shared Strapi HTTP client.
 *
 * Extracted from `src/lib/cms.ts` (pure move, zero behavior change): URL
 * building, the cached GET helpers, the in-memory request cache with
 * in-flight dedup, `CmsError`, the locale mapping and the `safe` wrapper.
 * Every `get*` fetcher in `src/lib/cms.ts` and `src/lib/cms/*` composes
 * these primitives; nothing here knows about a specific content type.
 *
 * Env vars (set in .env):
 *   STRAPI_URL   - default http://localhost:1337
 *   STRAPI_TOKEN - read-only API token (Settings → API Tokens)
 */

import type { StrapiItem } from '../../utils/strapiTransformer';

export const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

/**
 * Map Astro's locale code to Strapi's locale code.
 * Astro uses short codes ("es", "en"); Strapi uses full codes ("es-MX", "en").
 */
const ASTRO_TO_STRAPI_LOCALE: Record<string, string> = {
  es: 'es-MX',
  en: 'en',
};
export function toStrapiLocale(locale: string): string {
  return ASTRO_TO_STRAPI_LOCALE[locale] || locale;
}

// Cache TTL: 60 seconds - balances freshness with performance
const CACHE_TTL_MS = 60_000;

// In-memory request cache to prevent duplicate API calls within the same
// request lifecycle (Astro renders pages on each request, so this helps
// prevent redundant calls when multiple components fetch the same data).
type CacheEntry<T> = { data: T; expiresAt: number };
const requestCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get cached data or fetch fresh if cache miss/expired.
 * Deduplicates concurrent requests using in-flight promise tracking.
 */
const inFlightRequests = new Map<string, Promise<unknown>>();

export async function cachedFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(cacheKey) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  // Deduplicate concurrent requests for the same key
  const inFlight = inFlightRequests.get(cacheKey) as Promise<T> | undefined;
  if (inFlight) {
    return inFlight;
  }

  const promise = fetcher()
    .then((data) => {
      requestCache.set(cacheKey, { data, expiresAt: now + CACHE_TTL_MS });
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Clear all cached CMS data. Useful for cache invalidation scenarios.
 */
export function clearCmsCache(): void {
  requestCache.clear();
}

export interface StrapiList<T> {
  data: StrapiItem<T>[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiSingle<T> {
  data: StrapiItem<T> | null;
}

interface StrapiError {
  status: number;
  statusText: string;
  body: string;
}

export class CmsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'CmsError';
  }
}

export function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${STRAPI_URL}/api${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Normalize params to a stable string for cache key generation.
 */
function paramsToKey(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

export async function strapiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiList<T>> {
  const cacheKey = `GET:${path}?${paramsToKey(params)}`;
  return cachedFetch(cacheKey, async () => {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      headers: {
        Authorization: STRAPI_TOKEN ? `Bearer ${STRAPI_TOKEN}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text();
      const err: StrapiError = { status: res.status, statusText: res.statusText, body };
      throw new CmsError(
        `Strapi GET ${path} failed: ${err.status} ${err.statusText} ${err.body}`,
        err.status
      );
    }
    return (await res.json()) as StrapiList<T>;
  });
}

export async function strapiGetOne<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiItem<T> | null> {
  const cacheKey = `GETONE:${path}?${paramsToKey(params)}`;
  return cachedFetch(cacheKey, async () => {
    const url = buildUrl(path, params);
    const res = await fetch(url, {
      headers: {
        Authorization: STRAPI_TOKEN ? `Bearer ${STRAPI_TOKEN}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new CmsError(
        `Strapi GET ${path} failed: ${res.status} ${res.statusText} ${body}`,
        res.status
      );
    }
    const json = (await res.json()) as StrapiSingle<T> | StrapiList<T>;
    // Handle both list and single responses. `data: null` or empty `[]` → return null.
    const data = (json as StrapiSingle<T>).data ?? (json as StrapiList<T>).data;
    if (data == null) return null;
    if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
    return data;
  });
}

// ---------- generic safe wrapper ----------
//
// Each `get*` function returns the typed view model or null on a network
// failure. The pages themselves decide whether to fall back to local data.

export async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof CmsError) {
      // eslint-disable-next-line no-console
      console.warn(`[cms] ${e.message}`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[cms] unexpected error`, e);
    }
    return null;
  }
}
