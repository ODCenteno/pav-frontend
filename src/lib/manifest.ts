/**
 * Single source of truth for the PWA web manifest.
 *
 * Exported as a builder that takes the locale and returns the manifest object.
 * Called by `/pages/manifest.webmanifest.ts` and `/pages/en/manifest.webmanifest.ts`
 * so both versions share identical icon/theme metadata; only `start_url` and
 * locale-specific fields differ per locale.
 */

export interface WebManifestInput {
  name: string;
  short_name: string;
  description: string;
  lang: string;
  start_url: string;
}

const FAVICON_ICON = '/favicon/android-chrome-192x192.png';
const FAVICON_LARGE_ICON = '/favicon/android-chrome-512x512.png';

const BASE_ICONS = [
  { src: FAVICON_ICON, sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: FAVICON_LARGE_ICON, sizes: '512x512', type: 'image/png', purpose: 'any' },
  { src: FAVICON_ICON, sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: FAVICON_LARGE_ICON, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

const SHORTCUTS = [
  {
    name: 'Explorar',
    short_name: 'Explorar',
    description: 'Ver todos los sitios',
    url: '/sitios',
    icons: [{ src: FAVICON_ICON, sizes: '192x192' }],
  },
  {
    name: 'Experiencias',
    short_name: 'Experiencias',
    description: 'Ver experiencias',
    url: '/experiencias',
    icons: [{ src: FAVICON_ICON, sizes: '192x192' }],
  },
];

export function manifest(locale: 'es' | 'en' | 'es-MX') {
  const isEnglish = locale.startsWith('en');

  const localized: WebManifestInput = isEnglish
    ? {
        name: 'Puerto Agua Verde',
        short_name: 'PAV',
        description:
          'Directory of services and points of interest in Puerto Agua Verde and Rancho San Cosme',
        lang: 'en',
        start_url: '/en/',
      }
    : {
        name: 'Puerto Agua Verde',
        short_name: 'PAV',
        description:
          'Directorio de servicios y puntos de interés en Puerto Agua Verde y Rancho San Cosme',
        lang: 'es-MX',
        start_url: '/',
      };

  return {
    name: localized.name,
    short_name: localized.short_name,
    description: localized.description,
    start_url: localized.start_url,
    scope: '/',
    display: 'standalone',
    background_color: '#FDFCF8',
    theme_color: '#5A8A80',
    orientation: 'portrait-primary',
    lang: localized.lang,
    categories: ['travel', 'lifestyle'],
    icons: BASE_ICONS,
    shortcuts: SHORTCUTS,
  };
}
