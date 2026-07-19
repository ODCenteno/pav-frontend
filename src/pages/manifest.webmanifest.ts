/**
 * Locale-aware web manifest.
 *
 * Generates a per-locale PWA manifest so the `start_url` points at the
 * user's preferred locale. Pre-rendered at build time — one per locale
 * thanks to Astro's i18n routing (`prefixDefaultLocale: false`).
 *
 *   /manifest.webmanifest        → defaults to `es-MX` (`/`)
 *   /en/manifest.webmanifest    → `en` (`/en/`)
 */

import type { APIRoute } from 'astro';
import { manifest as buildManifest } from '@/lib/manifest';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = JSON.stringify(buildManifest('es-MX'), null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
