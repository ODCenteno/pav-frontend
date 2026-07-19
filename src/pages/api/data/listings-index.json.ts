/**
 * Pre-rendered listings index.
 *
 * Returns a minimal `{ slug, locale }` payload for every published listing in
 * every locale. The service worker fetches this file on activate to know
 * which listing detail pages to background-cache for offline browsing.
 *
 * Pre-rendered at build time → the SW never has to hit Strapi at runtime,
 * which keeps the offline path fully self-contained.
 *
 * Output shape:
 *   { count: number, items: Array<{ slug: string, locale: 'es' | 'en' }> }
 */
import type { APIRoute } from 'astro';
import { getListingsWithFallback } from '@/lib/cms';

export const prerender = true;

interface IndexItem {
  slug: string;
  locale: 'es' | 'en';
}

export const GET: APIRoute = async () => {
  const [esListings, enListings] = await Promise.all([
    getListingsWithFallback('es'),
    getListingsWithFallback('en'),
  ]);

  const items: IndexItem[] = [];
  for (const listing of esListings) {
    if (listing.slug) items.push({ slug: listing.slug, locale: 'es' });
  }
  for (const listing of enListings) {
    if (listing.slug) items.push({ slug: listing.slug, locale: 'en' });
  }

  const body = JSON.stringify({ count: items.length, items }, null, 0);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
