/**
 * Locale-aware web manifest for the English locale.
 * Mirrors /src/pages/manifest.webmanifest.ts — see that file for details.
 */

import type { APIRoute } from 'astro';
import { manifest as buildManifest } from '@/lib/manifest';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = JSON.stringify(buildManifest('en'), null, 2);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
