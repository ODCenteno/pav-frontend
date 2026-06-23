/**
 * Strapi CMS client.
 *
 * Provides typed `get*` functions for each content type. Falls back to local
 * dev data when the CMS is unreachable so the site can be developed without
 * a running Strapi instance.
 *
 * Env vars (set in .env):
 *   STRAPI_URL   - default http://localhost:1337
 *   STRAPI_TOKEN - read-only API token (Settings → API Tokens)
 */

import type { Category } from '../types/category.type';
import type { Listing } from '../types/listing.type';
import type { TeamMember, Organization } from '../types/about.type';
import type { SiteContent } from '../types/site-content.type';
import type { HomepageData } from '../types/homepage.type';
import {
  transformCategory,
  transformListing,
  transformTeamMember,
  transformOrganization,
  transformSiteContent,
  transformHomepage,
  unwrap,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type TeamMemberAttributes,
  type OrganizationAttributes,
  type SiteContentAttributes,
  type HomepageAttributes,
} from '../utils/strapiTransformer';

export async function getSiteSettings() {
  return (await import('../config/siteSettings')).getSiteSettings();
}

async function _getSiteSettingsCms(): Promise<{
  contact: { email: string; phone: string; phoneRaw: string; whatsapp: string; address: string };
  social: { instagram: string; facebook: string; googleMaps: string };
  metadata: { siteName: string; defaultTitle: string; defaultDescription: string };
  seo: { keywords: string; ogImage: string; ogUrl: string; author: string; themeColor: string };
  branding: { logoImage: string; logoShortName: string };
}> {
  const gs = await getGlobalSettings();
  if (gs) return gs as any;
  return {
    contact: { email: "info@puertoaguaverde.mx", phone: "+52 614 123 4567", phoneRaw: "+526141234567", whatsapp: "526141234567", address: "Puerto Agua Verde, BCS, México" },
    social: { instagram: "https://instagram.com/puertoaguaverde", facebook: "https://facebook.com/puertoaguaverde", googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde" },
    metadata: { siteName: "Puerto Agua Verde", defaultTitle: "Puerto Agua Verde - Community Directory", defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme." },
    seo: { keywords: "BCS, Puerto Agua Verde, Rancho San Cosme, Directorio, Turismo, Servicios", ogImage: "", ogUrl: "", author: "ODCenteno", themeColor: "#5A8A80" },
    branding: { logoImage: "", logoShortName: "Agua Verde" },
  };
}

export async function getSiteSettingsDirect(): Promise<{
  contact: { email: string; phone: string; phoneRaw: string; whatsapp: string; address: string };
  social: { instagram: string; facebook: string; googleMaps: string };
  metadata: { siteName: string; defaultTitle: string; defaultDescription: string };
  seo: { keywords: string; ogImage: string; ogUrl: string; author: string; themeColor: string };
  branding: { logoImage: string; logoShortName: string };
}> {
  try {
    const gs = await getGlobalSettings();
    if (gs) return gs as any;
  } catch (error) {
    console.warn('[siteSettings] Failed to fetch from Strapi, using defaults:', error);
  }
  return {
    contact: { email: "info@puertoaguaverde.mx", phone: "+52 614 123 4567", phoneRaw: "+526141234567", whatsapp: "526141234567", address: "Puerto Agua Verde, BCS, México" },
    social: { instagram: "https://instagram.com/puertoaguaverde", facebook: "https://facebook.com/puertoaguaverde", googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde" },
    metadata: { siteName: "Puerto Agua Verde", defaultTitle: "Puerto Agua Verde - Community Directory", defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme." },
    seo: { keywords: "BCS, Puerto Agua Verde, Rancho San Cosme, Directorio, Turismo, Servicios", ogImage: "", ogUrl: "", author: "ODCenteno", themeColor: "#5A8A80" },
    branding: { logoImage: "", logoShortName: "Agua Verde" },
  };
}

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

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

async function cachedFetch<T>(
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

interface StrapiList<T> {
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

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
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

async function strapiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiList<T>> {
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

async function strapiGetOne<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiItem<T> | null> {
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

async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
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

// ---------- categories ----------

export async function getCategories(locale: string = 'es'): Promise<Category[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<CategoryAttributes>('/categories', {
        'filters[isActive][$eq]': 'true',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map(transformCategory);
    })) ?? []
  );
}

// ---------- listings ----------

export async function getListings(locale: string = 'es'): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'category',
        'populate[1]': 'mainImage',
        'populate[2]': 'gallery',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

export async function getListingBySlug(slug: string, locale: string = 'es'): Promise<Listing | null> {
  return safe(async () => {
    const res = await strapiGet<ListingAttributes>('/listings', {
      'filters[slug][$eq]': slug,
      'filters[publishedAt][$notNull]': 'true',
      'populate[0]': 'category',
      'populate[1]': 'mainImage',
      'populate[2]': 'gallery',
      'populate[3]': 'relatedListings',
      'pagination[pageSize]': '1',
      locale,
    });
    if (res.data.length === 0) return null;
    return transformListing(res.data[0], locale);
  });
}

export async function getListingsByCategorySlug(categorySlug: string, locale: string = 'es'): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[category][slug][$eq]': categorySlug,
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'category',
        'populate[1]': 'mainImage',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

export async function getFeaturedListings(locale: string = 'es', limit: number = 3): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[isFeatured][$eq]': 'true',
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'category',
        'populate[1]': 'mainImage',
        sort: 'order:asc',
        'pagination[pageSize]': String(limit),
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

// ---------- team members ----------

export async function getTeamMembers(locale: string = 'es'): Promise<TeamMember[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<TeamMemberAttributes>('/team-members', {
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'photo',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map(transformTeamMember);
    })) ?? []
  );
}

// ---------- organizations ----------

export async function getOrganizations(locale: string = 'es'): Promise<Organization[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<OrganizationAttributes>('/organizations', {
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'logo',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map(transformOrganization);
    })) ?? []
  );
}

// ---------- site content ----------

export async function getSiteContent(key: string, locale: string = 'es'): Promise<SiteContent | null> {
  return safe(async () => {
    const item = await strapiGetOne<SiteContentAttributes>('/site-contents', {
      'filters[key][$eq]': key,
      locale,
    });
    if (!item) return null;
    return transformSiteContent(item, locale);
  });
}

/**
 * Batch fetch multiple site-content keys in a single API request.
 * Uses Strapi's `$in` operator to fetch all keys at once instead of
 * making N parallel requests.
 */
export async function getSiteContents(keys: string[], locale: string = 'es'): Promise<(SiteContent | null)[]> {
  if (keys.length === 0) return [];

  const result = await safe(async () => {
    // Build $in array params
    const inParams: Record<string, string> = {};
    keys.forEach((key, idx) => {
      inParams[`filters[key][$in][${idx}]`] = key;
    });

    const res = await strapiGet<SiteContentAttributes>('/site-contents', {
      ...inParams,
      'pagination[pageSize]': String(Math.max(keys.length * 2, 100)),
      locale,
    });

    // Index results by key for fast lookup
    const byKey = new Map<string, SiteContent>();
    for (const item of res.data) {
      const transformed = transformSiteContent(item, locale);
      byKey.set(transformed.key, transformed);
    }

    // Return in same order as requested keys
    return keys.map((key) => byKey.get(key) ?? null);
  });

  return result ?? keys.map(() => null);
}

// ---------- legal pages ----------

export interface LegalPageAttributes {
  slug: string;
  title: { es: string; en: string };
  content: { es: string; en: string };
  publishedAt: string | null;
}

export async function getLegalPage(slug: string, locale: string = 'es'): Promise<{ slug: string; title: string; content: string } | null> {
  return safe(async () => {
    const item = await strapiGetOne<LegalPageAttributes>('/legal-pages', {
      'filters[slug][$eq]': slug,
      locale,
    });
    if (!item) return null;
    const attrs = unwrap(item);
    const loc = locale.startsWith('en') ? 'en' : 'es';
    return {
      slug: attrs.slug,
      title: attrs.title[loc] || attrs.title.es,
      content: attrs.content[loc] || attrs.content.es,
    };
  });
}

// ---------- global settings ----------

export interface GlobalAttributes {
  contactEmail: string;
  contactPhone: string;
  contactPhoneRaw: string;
  contactWhatsapp: string;
  contactAddress: string;
  socialInstagram: string;
  socialFacebook: string;
  socialGoogleMaps: string;
  metadataSiteName: string;
  metadataDefaultTitle: string;
  metadataDefaultDescription: string;
  seoKeywords?: string;
  seoOgImage?: { data?: { id: number; attributes?: { url: string; alternativeText?: string } } | null };
  seoOgUrl?: string;
  seoAuthor?: string;
  seoThemeColor?: string;
  logoImage?: { data?: { id: number; attributes?: { url: string } } | null };
  logoShortName?: string;
}

export async function getGlobalSettings(): Promise<{
  contact: { email: string; phone: string; phoneRaw: string; whatsapp: string; address: string };
  social: { instagram: string; facebook: string; googleMaps: string };
  metadata: { siteName: string; defaultTitle: string; defaultDescription: string };
  seo: { keywords: string; ogImage: string; ogUrl: string; author: string; themeColor: string };
  branding: { logoImage: string; logoShortName: string };
} | null> {
  return safe(async () => {
    const item = await strapiGetOne<GlobalAttributes>('/site-global', {});
    if (!item) return null;
    const a = unwrap(item);
    const strapiBaseUrl = STRAPI_URL.replace(/\/$/, '');
    const ogImageData = a.seoOgImage?.data;
    const ogImageUrl = ogImageData?.attributes?.url
      ? ogImageData.attributes.url.startsWith('http')
        ? ogImageData.attributes.url
        : `${strapiBaseUrl}${ogImageData.attributes.url}`
      : '';
    const logoImageData = a.logoImage?.data;
    const logoImageUrl = logoImageData?.attributes?.url
      ? logoImageData.attributes.url.startsWith('http')
        ? logoImageData.attributes.url
        : `${strapiBaseUrl}${logoImageData.attributes.url}`
      : '';
    return {
      contact: {
        email: a.contactEmail,
        phone: a.contactPhone,
        phoneRaw: a.contactPhoneRaw,
        whatsapp: a.contactWhatsapp,
        address: a.contactAddress,
      },
      social: {
        instagram: a.socialInstagram,
        facebook: a.socialFacebook,
        googleMaps: a.socialGoogleMaps,
      },
      metadata: {
        siteName: a.metadataSiteName,
        defaultTitle: a.metadataDefaultTitle,
        defaultDescription: a.metadataDefaultDescription,
      },
      seo: {
        keywords: a.seoKeywords || '',
        ogImage: ogImageUrl,
        ogUrl: a.seoOgUrl || '',
        author: a.seoAuthor || '',
        themeColor: a.seoThemeColor || '#5A8A80',
      },
      branding: {
        logoImage: logoImageUrl,
        logoShortName: a.logoShortName || 'Agua Verde',
      },
    };
  });
}

// ---------- homepage ----------

export async function getHomepage(locale: string = 'es'): Promise<HomepageData | null> {
  return safe(async () => {
    const item = await strapiGetOne<HomepageAttributes>('/homepage', {
      'populate[0]': 'hero.images',
      'populate[1]': 'destinations.image',
      'populate[2]': 'highlights.image',
      'populate[3]': 'quickFactsImage1',
      'populate[4]': 'quickFactsImage2',
      'populate[5]': 'mapSection.image',
      locale,
    });
    if (!item) return null;
    return transformHomepage(item, locale);
  });
}

export async function getHomepageWithFallback(locale: string = 'es'): Promise<HomepageData> {
  const fromCms = await getHomepage(locale);
  if (fromCms) return fromCms;
  return getHomepageFallback(locale);
}

const HOMEPAGE_FALLBACK_ES: HomepageData = {
  hero: {
    title: 'Puerto Agua Verde &',
    titleHighlight: 'Rancho San Cosme',
    description: 'Un destino natural en Baja California Sur donde la tranquilidad, la tradición y los paisajes espectaculares se encuentran con la auténtica vida costera. Explora playas, experiencias locales, senderos y servicios para planear tu visita.',
    ctaLabel: 'Explorar el destino',
    ctaLink: '/sitios',
    images: [
      { url: '/images/PAV-Lanscape-Cueva.webp', alt: 'Coast' },
      { url: '/images/pav-02.jpg', alt: 'Nature' },
      { url: '/images/PAV-Lanscape-Fuga.webp', alt: 'Landscape' },
    ],
  },
  destinations: {
    header: {
      title: 'Conoce el destino',
      subtitle: 'Descubre la historia y cultura de estos lugares únicos',
    },
    items: [
      {
        title: 'Puerto Agua Verde',
        text: 'Puerto Agua Verde es un pequeño rincón de Baja California Sur conocido por sus aguas color turquesa, su ambiente comunitario y su naturaleza intacta. Aquí se combinan la pesca tradicional, las playas tranquilas y las actividades al aire libre que atraen a viajeros en busca de autenticidad y paz.',
        image: '/images/PAV-Letrero-.webp',
        alt: 'Puerto Agua Verde',
      },
      {
        title: 'Rancho San Cosme',
        text: 'Rancho San Cosme es un espacio histórico y cultural donde la vida rural se mantiene viva. Rodeado de montañas y vegetación desértica, es un punto de encuentro para visitantes que buscan experiencias locales, senderos, actividades guiadas y conexión con la naturaleza.',
        image: '/images/pav-landscape-12.webp',
        alt: 'Rancho San Cosme',
      },
    ],
  },
  highlights: {
    header: {
      title: 'Lo más destacado',
      subtitle: 'Descubre las mejores opciones para tu visita',
    },
    items: [
      {
        title: 'Experiencias para disfrutar',
        description: 'Descubre actividades únicas para conectar con la naturaleza, la cultura local y la hospitalidad de la comunidad.',
        image: '/images/pav-landscape-13.webp',
        alt: 'Experiences',
        link: '/experiencias',
      },
      {
        title: 'Hospédate con nosotros',
        description: 'Encuentra opciones de alojamiento que combinan comodidad, naturaleza y una vista privilegiada del paisaje.',
        image: '/images/pav-aloja-01.webp',
        alt: 'Accommodation',
        link: '/sitios?category=accommodation',
      },
      {
        title: 'Sabores de la región',
        description: 'Desde mariscos frescos hasta cocina tradicional, conoce los lugares donde podrás disfrutar la gastronomía local.',
        image: '/images/PAV-Comida.webp',
        alt: 'Restaurants',
        link: '/sitios?category=restaurants',
      },
    ],
  },
  quickFacts: {
    header: {
      title: 'Lo esencial de un vistazo',
      subtitle: 'Datos rápidos para entender por qué Puerto Agua Verde y Rancho San Cosme merecen el viaje.',
    },
    items: [
      { title: 'A ~2 horas de Loreto', value: '98 km', description: 'Puerto Agua Verde se encuentra a unos 98 km de Loreto, con un trayecto aproximado de 2 horas en auto.' },
      { title: 'A ~5 horas de La Paz', value: '360 km', description: 'Desde La Paz, el recorrido es de alrededor de 360 km, con un tiempo estimado de casi 5 horas por carretera.' },
      { title: 'Mejor época', value: 'Mayo–junio', description: 'La mejor ventana para actividades al aire libre va de principios de mayo a mediados de junio. Octubre también destaca.' },
      { title: 'Naturaleza cercana', value: '5 islas', description: 'El Parque Nacional Bahía de Loreto reúne cinco islas principales, uno de los grandes atractivos naturales de la región.' },
      { title: 'Biodiversidad', value: '1,300+ especies', description: 'En el Parque Nacional Bahía de Loreto se han registrado más de 1,300 especies de plantas y animales.' },
      { title: 'Qué hacer', value: 'Snorkel · Kayak · Hiking', description: 'La región destaca por actividades como kayak, snorkel, senderismo, campamento y observación de fauna.' },
    ],
    images: ['/images/pav-01.jpg', '/images/pav-04.jpg'],
  },
  mapSection: {
    title: 'Mapa del Destino',
    description: 'Explora los puntos clave de Puerto Agua Verde y Rancho San Cosme. Encuentra rutas, servicios, playas y actividades cerca de ti.',
    buttonLabel: 'Ver Mapa en OpenStreetMap',
    buttonUrl: 'https://www.openstreetmap.org/?#map=15/25.51204/-111.07577&layers=C',
    image: '/images/landing/mapa-OSM.webp',
    alt: 'Mapa de Puerto Agua Verde',
  },
  finalCta: {
    title: 'Tu viaje comienza aquí',
    description: 'Puerto Agua Verde y Rancho San Cosme no son solo puntos en el mapa, son paisajes vivos de mar, desierto y tradición. Planea tu estancia, explora experiencias locales y descubre el ritmo auténtico de la vida en Baja.',
    buttonLabel: 'Comenzar a planear mi visita',
    buttonLink: '/sitios',
  },
};

const HOMEPAGE_FALLBACK_EN: HomepageData = {
  hero: {
    title: 'Puerto Agua Verde &',
    titleHighlight: 'Rancho San Cosme',
    description: 'A natural destination in Baja California Sur where tranquility, tradition, and spectacular landscapes meet authentic coastal life. Explore beaches, local experiences, trails, and services to plan your visit.',
    ctaLabel: 'Explore the destination',
    ctaLink: '/en/sitios',
    images: [
      { url: '/images/PAV-Lanscape-Cueva.webp', alt: 'Coast' },
      { url: '/images/pav-02.jpg', alt: 'Nature' },
      { url: '/images/PAV-Lanscape-Fuga.webp', alt: 'Landscape' },
    ],
  },
  destinations: {
    header: {
      title: 'Discover the destination',
      subtitle: 'Learn about the history and culture of these unique places',
    },
    items: [
      {
        title: 'Puerto Agua Verde',
        text: 'Puerto Agua Verde is a small corner of Baja California Sur known for its turquoise waters, community atmosphere, and untouched nature. Here, traditional fishing, quiet beaches, and outdoor activities combine to attract travelers in search of authenticity and peace.',
        image: '/images/PAV-Letrero-.webp',
        alt: 'Puerto Agua Verde',
      },
      {
        title: 'Rancho San Cosme',
        text: 'Rancho San Cosme is a historical and cultural space where rural life remains alive. Surrounded by mountains and desert vegetation, it is a meeting point for visitors seeking local experiences, trails, guided activities, and connection with nature.',
        image: '/images/pav-landscape-12.webp',
        alt: 'Rancho San Cosme',
      },
    ],
  },
  highlights: {
    header: {
      title: 'Highlights',
      subtitle: 'Discover the best options for your visit',
    },
    items: [
      {
        title: 'Experiences to enjoy',
        description: 'Discover unique activities to connect with nature, local culture, and community hospitality.',
        image: '/images/pav-landscape-13.webp',
        alt: 'Experiences',
        link: '/en/experiences',
      },
      {
        title: 'Stay with us',
        description: 'Find accommodation options that combine comfort, nature, and a privileged view of the landscape.',
        image: '/images/pav-aloja-01.webp',
        alt: 'Accommodation',
        link: '/en/sitios?category=accommodation',
      },
      {
        title: 'Flavors of the region',
        description: 'From fresh seafood to traditional cuisine, discover the places where you can enjoy local gastronomy.',
        image: '/images/PAV-Comida.webp',
        alt: 'Restaurants',
        link: '/en/sitios?category=restaurants',
      },
    ],
  },
  quickFacts: {
    header: {
      title: 'At a glance',
      subtitle: 'A few facts that make Puerto Agua Verde & Rancho San Cosme worth the trip.',
    },
    items: [
      { title: '~2 hours from Loreto', value: '98 km', description: 'Puerto Agua Verde is about 98 km from Loreto, with a driving time of roughly 2 hours.' },
      { title: '~5 hours from La Paz', value: '360 km', description: 'From La Paz, the route is about 360 km, with an estimated drive of around 5 hours.' },
      { title: 'Best season', value: 'May–June', description: 'The best window for outdoor activities runs from early May to mid-June. October is also a strong option.' },
      { title: 'Protected nature nearby', value: '5 islands', description: 'Loreto Bay National Park includes five major islands, one of the region\'s standout natural treasures.' },
      { title: 'Biodiversity', value: '1,300+ species', description: 'More than 1,300 plant and animal species have been recorded in Loreto Bay National Park.' },
      { title: 'What to do', value: 'Snorkel · Kayak · Hiking', description: 'The area is ideal for kayaking, snorkeling, hiking, camping, and wildlife-focused activities.' },
    ],
    images: ['/images/pav-01.jpg', '/images/pav-04.jpg'],
  },
  mapSection: {
    title: 'Destination Map',
    description: 'Explore key points of Puerto Agua Verde and Rancho San Cosme. Find routes, services, beaches, and activities near you.',
    buttonLabel: 'View Map on OpenStreetMap',
    buttonUrl: 'https://www.openstreetmap.org/?#map=15/25.51204/-111.07577&layers=C',
    image: '/images/landing/mapa-OSM.webp',
    alt: 'Puerto Agua Verde map',
  },
  finalCta: {
    title: 'Your journey begins here',
    description: 'Puerto Agua Verde and Rancho San Cosme are more than places on the map, they are living landscapes of sea, desert, and tradition. Plan your stay, explore local experiences, and discover the rhythm of authentic Baja life.',
    buttonLabel: 'Start planning your visit',
    buttonLink: '/en/sitios',
  },
};

function getHomepageFallback(locale: string): HomepageData {
  return locale === 'en' || locale.startsWith('en') ? HOMEPAGE_FALLBACK_EN : HOMEPAGE_FALLBACK_ES;
}

// ---------- composite getters ----------

export interface AboutPageData {
  intro: { title: string; text: string } | null;
  values:
    | {
        mission: { title: string; text: string };
        vision: { title: string; text: string };
        values: { title: string; items: string[] };
      }
    | null;
  community: { title: string; text: string } | null;
  collaboration:
    | {
        title: string;
        desc: string;
        btnPrimary: string;
        btnSecondary: string;
        links: { primary: string; secondary: string };
      }
    | null;
  team: TeamMember[];
  organizations: Organization[];
}

export async function getAboutPage(locale: string = 'es'): Promise<AboutPageData> {
  // Batch the 4 site-content keys into a single API call
  const [siteContents, team, organizations] = await Promise.all([
    getSiteContents(
      ['about-intro', 'about-values', 'about-community', 'about-collaboration'],
      locale
    ),
    getTeamMembers(locale),
    getOrganizations(locale),
  ]);

  const [intro, values, community, collaboration] = siteContents;
  const loc = locale.startsWith('en') ? 'en' : 'es';

  return {
    intro: intro
      ? { title: intro.title[loc] || intro.title.es, text: intro.text[loc] || intro.text.es }
      : null,
    values: values?.extraData
      ? {
          mission: (values.extraData as any).mission,
          vision: (values.extraData as any).vision,
          values: (values.extraData as any).values,
        }
      : null,
    community: community
      ? { title: community.title[loc] || community.title.es, text: community.text[loc] || community.text.es }
      : null,
    collaboration: collaboration?.extraData
      ? {
          title: (collaboration.extraData as any).title || collaboration.title[loc] || collaboration.title.es,
          desc: (collaboration.extraData as any).desc || collaboration.text[loc] || collaboration.text.es,
          btnPrimary: (collaboration.extraData as any).btnPrimary,
          btnSecondary: (collaboration.extraData as any).btnSecondary,
          links: (collaboration.extraData as any).links || { primary: '#', secondary: '#' },
        }
      : null,
    team,
    organizations,
  };
}

// Re-export the transformer types so callers can type their own data.
export type { StrapiItem, CategoryAttributes, ListingAttributes, TeamMemberAttributes, OrganizationAttributes, SiteContentAttributes };

// ---------- dev-fallback aware wrappers ----------
//
// In development, if the CMS is unreachable the page can still render by
// falling back to local seed data. These wrappers centralize that policy.

import { getListingsFallback, getTeamFallback, getOrganizationsFallback, getAboutFallback } from '../data/devFallback';

// Dev fallback is enabled by default in dev mode, and disabled in production
// builds. Override explicitly with STRAPI_USE_DEV_FALLBACK=true|false.
const _envFallback = import.meta.env.STRAPI_USE_DEV_FALLBACK;
const USE_DEV_FALLBACK =
  _envFallback === undefined
    ? import.meta.env.DEV
    : _envFallback === 'true';

/**
 * Derive categories from a listings array. No API call is made - this
 * extracts unique category slugs from already-loaded listings.
 *
 * Use this when you've already loaded listings via getListingsWithFallback
 * to avoid a redundant listings fetch.
 */
export function deriveCategoriesFromListings(listings: Listing[]): Category[] {
  const seen = new Map<string, Category>();
  for (const l of listings) {
    const slug = l.categoryId || l.category?.slug;
    if (slug && !seen.has(slug)) {
      const c = l.category;
      seen.set(slug, {
        id: slug,
        slug,
        name: (c?.name as any) || { es: slug, en: slug },
        order: c?.order ?? 0,
        isActive: true,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * @deprecated Prefer deriveCategoriesFromListings(listings) when listings
 * are already loaded. This variant still works but may trigger an extra
 * listings fetch via getListingsFallback().
 */
export function getCategoriesWithFallback(locale: string = 'es'): Category[] {
  return deriveCategoriesFromListings(getListingsFallback());
}

/**
 * In-flight promise dedup for listings queries. When multiple components
 * call getListingsWithFallback on the same render, they share a single
 * underlying request instead of firing N parallel HTTP calls.
 */
const listingsInFlight = new Map<string, Promise<Listing[]>>();

function dedupedListingsFetch(locale: string): Promise<Listing[]> {
  const key = locale;
  const existing = listingsInFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const listings = await getListings(locale);

    if (listings.length > 0) return listings;

    if (!USE_DEV_FALLBACK) return [];
    return getListingsFallback();
  })();

  listingsInFlight.set(key, promise);
  promise.finally(() => listingsInFlight.delete(key));
  return promise;
}

export async function getListingsWithFallback(locale: string = 'es'): Promise<Listing[]> {
  return dedupedListingsFetch(locale);
}

export async function getListingBySlugWithFallback(slug: string, locale: string = 'es'): Promise<Listing | null> {
  const fromCms = await getListingBySlug(slug, locale);
  if (fromCms) return fromCms;
  if (!USE_DEV_FALLBACK) return null;
  return getListingsFallback().find((l) => l.slug === slug) ?? null;
}

export async function getFeaturedListingsWithFallback(locale: string = 'es', limit: number = 3): Promise<Listing[]> {
  const fromCms = await getFeaturedListings(locale, limit);
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getListingsFallback().filter((l) => l.isFeatured).slice(0, limit);
}

export async function getTeamWithFallback(locale: string = 'es'): Promise<TeamMember[]> {
  const fromCms = await getTeamMembers(locale);
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getTeamFallback();
}

export async function getOrganizationsWithFallback(locale: string = 'es'): Promise<Organization[]> {
  const fromCms = await getOrganizations(locale);
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getOrganizationsFallback();
}

export async function getAboutPageWithFallback(locale: string = 'es'): Promise<AboutPageData> {
  const fromCms = await getAboutPage(locale);
  if (fromCms.intro || fromCms.community) return fromCms;
  if (!USE_DEV_FALLBACK) return fromCms;
  const fallback = getAboutFallback();
  return {
    intro: { title: fallback.introData.title, text: fallback.introData.text },
    values: {
      mission: { title: fallback.valuesData.mission.title, text: fallback.valuesData.mission.text },
      vision: { title: fallback.valuesData.vision.title, text: fallback.valuesData.vision.text },
      values: { title: fallback.valuesData.values.title, items: fallback.valuesData.values.items },
    },
    community: { title: fallback.communityMessageData.title, text: fallback.communityMessageData.text },
    collaboration: {
      title: fallback.collaborationData.title,
      desc: fallback.collaborationData.desc,
      btnPrimary: fallback.collaborationData.btnPrimary,
      btnSecondary: fallback.collaborationData.btnSecondary,
      links: fallback.collaborationData.links || { primary: '#', secondary: '#' },
    },
    team: getTeamFallback(),
    organizations: getOrganizationsFallback(),
  };
}

// ---------- guide page ----------

export interface GuidePageData {
  hero: { title: string; desc: string; image: string } | null;
  intro: { ranchTitle: string; ranchText: string; portTitle: string; portText: string } | null;
  history: { title: string; text: string; milestones: { year: string; es: string; en: string }[] } | null;
  fishing: { title: string; text: string; rules: string[] } | null;
  protected: { title: string; text: string; linkLabel: string; linkHref: string } | null;
  influence: { title: string; text: string } | null;
  recommendations: { title: string; items: string[] } | null;
  directions: {
    title: string;
    loreto: { label: string; desc: string; distance: string; time: string; image: string };
    laPaz: { label: string; desc: string; distance: string; time: string; image: string };
    drivingTipsTitle: string;
    drivingTips: string[];
  } | null;
  amenities: { title: string; items: { icon: string; title: string; text: string }[] } | null;
  touristMap: { title: string; image: string; caption: string } | null;
  cta: { title: string; desc: string; btn: string } | null;
}

function pickLocale<T extends { es: string; en: string } | undefined>(v: T, locale: string): string {
  if (!v) return '';
  return locale.startsWith('en') ? v.en : v.es;
}

function pickLocaleList<T extends { es: string[]; en: string[] } | undefined>(v: T, locale: string): string[] {
  if (!v) return [];
  return locale.startsWith('en') ? v.en : v.es;
}

export async function getGuidePage(locale: string = 'es'): Promise<GuidePageData> {
  const keys = [
    'guide-hero',
    'guide-bay',
    'guide-history',
    'guide-fishing',
    'guide-conap',
    'guide-influence',
    'guide-recommendations',
    'guide-directions',
    'guide-amenities',
    'guide-tourist-map',
    'guide-cta',
  ];
  const [hero, bay, history, fishing, conap, influence, recommendations, directions, amenities, touristMap, cta] = await getSiteContents(keys, locale);

  return {
    hero: hero
      ? { title: pickLocale(hero.title, locale), desc: pickLocale(hero.text, locale), image: (hero.extraData as any)?.image || '' }
      : null,
    intro: bay && bay.extraData
      ? {
          ranchTitle: pickLocale((bay.extraData as any).ranchTitle, locale),
          ranchText: pickLocale((bay.extraData as any).ranchText, locale),
          portTitle: pickLocale((bay.extraData as any).portTitle, locale),
          portText: pickLocale((bay.extraData as any).portText, locale),
        }
      : null,
    history: history && history.extraData
      ? {
          title: pickLocale(history.title, locale),
          text: pickLocale(history.text, locale),
          milestones: ((history.extraData as any).milestones || []).map((m: any) => ({
            year: m.year,
            es: m.es,
            en: m.en,
          })),
        }
      : null,
    fishing: fishing && fishing.extraData
      ? {
          title: pickLocale(fishing.title, locale),
          text: pickLocale(fishing.text, locale),
          rules: pickLocaleList((fishing.extraData as any).rules, locale),
        }
      : null,
    protected: conap && conap.extraData
      ? {
          title: pickLocale(conap.title, locale),
          text: pickLocale(conap.text, locale),
          linkLabel: pickLocale((conap.extraData as any).link?.label, locale),
          linkHref: (conap.extraData as any).link?.href || 'https://descubreanp.conanp.gob.mx/',
        }
      : null,
    influence: influence
      ? { title: pickLocale(influence.title, locale), text: pickLocale(influence.text, locale) }
      : null,
    recommendations: recommendations && recommendations.extraData
      ? {
          title: pickLocale(recommendations.title, locale),
          items: pickLocaleList((recommendations.extraData as any).items, locale),
        }
      : null,
    directions: directions && directions.extraData
      ? {
          title: pickLocale(directions.title, locale),
          loreto: {
            label: pickLocale((directions.extraData as any).loreto?.label, locale),
            desc: pickLocale((directions.extraData as any).loreto?.desc, locale),
            distance: (directions.extraData as any).loreto?.distance || '',
            time: (directions.extraData as any).loreto?.time || '',
            image: (directions.extraData as any).loreto?.image || '',
          },
          laPaz: {
            label: pickLocale((directions.extraData as any).laPaz?.label, locale),
            desc: pickLocale((directions.extraData as any).laPaz?.desc, locale),
            distance: (directions.extraData as any).laPaz?.distance || '',
            time: (directions.extraData as any).laPaz?.time || '',
            image: (directions.extraData as any).laPaz?.image || '',
          },
          drivingTipsTitle: pickLocale((directions.extraData as any).drivingTipsTitle, locale),
          drivingTips: pickLocaleList((directions.extraData as any).drivingTips, locale),
        }
      : null,
    amenities: amenities && amenities.extraData
      ? {
          title: pickLocale(amenities.title, locale),
          items: ((amenities.extraData as any).items || []).map((item: any) => ({
            icon: item.icon,
            title: pickLocale(item.title, locale),
            text: pickLocale(item.text, locale),
          })),
        }
      : null,
    touristMap: touristMap
      ? {
          title: pickLocale(touristMap.title, locale),
          image: (touristMap.extraData as any)?.image || '',
          caption: pickLocale(touristMap.text, locale),
        }
      : null,
    cta: cta
      ? {
          title: pickLocale(cta.title, locale),
          desc: pickLocale(cta.text, locale),
          btn: pickLocale((cta.extraData as any)?.btn, locale),
        }
      : null,
  };
}

export async function getGuidePageWithFallback(locale: string = 'es'): Promise<GuidePageData> {
  const fromCms = await getGuidePage(locale);
  if (fromCms.hero || fromCms.intro) return fromCms;
  if (!USE_DEV_FALLBACK) return fromCms;
  // The dev fallback is the existing guideData.js; the page can keep using
  // that file directly when the CMS returns nothing. This function just
  // returns the empty result here; the page does its own fallback below.
  return fromCms;
}
