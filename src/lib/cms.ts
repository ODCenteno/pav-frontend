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
import { SITE_BRAND_NAME } from '../config/brand';
import type { Listing } from '../types/listing.type';
import type { SiteContent } from '../types/site-content.type';
import type { HomepageData } from '../types/homepage.type';
import type { CommunityMember } from '../types/community.type';
import {
  transformCategory,
  transformListing,
  transformSiteContent,
  transformHomepage,
  transformCommunityMember,
  unwrap,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type SiteContentAttributes,
  type HomepageAttributes,
  type CommunityMemberAttributes,
} from '../utils/strapiTransformer';

// Shared Strapi HTTP client (buildUrl, cached GET helpers, cache, CmsError,
// locale mapping, safe wrapper). Extracted from this file with zero behavior
// change; re-exported so the public API of `cms.ts` is unchanged.
import {
  STRAPI_URL,
  buildUrl,
  cachedFetch,
  clearCmsCache,
  CmsError,
  safe,
  strapiGet,
  strapiGetOne,
  toStrapiLocale,
} from './cms/http';

export { clearCmsCache, CmsError, toStrapiLocale };

// Community fetchers with fixture fallback (contract §4 / §9).
export { getCommunities, getCommunityBySlug } from './cms/community';

// Good-practices page fetcher with guide fallback (contract §7 / §9).
export { getGoodPracticesPage } from './cms/goodPractices';

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
    contact: { email: "info@guiacomunidadesloretanas.com", phone: "+52 614 123 4567", phoneRaw: "+526141234567", whatsapp: "526141234567", address: "Puerto Agua Verde, BCS, México" },
    social: { instagram: "https://instagram.com/guiacomunidadesloretanas", facebook: "https://facebook.com/guiacomunidadesloretanas", googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde" },
    metadata: { siteName: "Puerto Agua Verde", defaultTitle: "Puerto Agua Verde - Community Directory", defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme." },
    seo: { keywords: "BCS, Puerto Agua Verde, Rancho San Cosme, Directorio, Turismo, Servicios", ogImage: "", ogUrl: "https://guiacomunidadesloretanas.com", author: "ODCenteno", themeColor: "#5A8A80" },
    branding: { logoImage: "", logoShortName: SITE_BRAND_NAME },
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
    contact: { email: "info@guiacomunidadesloretanas.com", phone: "+52 614 123 4567", phoneRaw: "+526141234567", whatsapp: "526141234567", address: "Puerto Agua Verde, BCS, México" },
    social: { instagram: "https://instagram.com/guiacomunidadesloretanas", facebook: "https://facebook.com/guiacomunidadesloretanas", googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde" },
    metadata: { siteName: "Puerto Agua Verde", defaultTitle: "Puerto Agua Verde - Community Directory", defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme." },
    seo: { keywords: "BCS, Puerto Agua Verde, Rancho San Cosme, Directorio, Turismo, Servicios", ogImage: "", ogUrl: "https://guiacomunidadesloretanas.com", author: "ODCenteno", themeColor: "#5A8A80" },
    branding: { logoImage: "", logoShortName: SITE_BRAND_NAME },
  };
}

/**
 * Full populate spec for a listing — used by both `getListings` (list views)
 * and `getListingBySlug` (detail views) so the resulting view-model always
 * contains every field (members, stories, products, social, recommendations,
 * schedule, amenities, contact, relatedListings).
 *
 * Contract §9 populate format rule (verified against Strapi 5.39): a query
 * that mixes indexed entries (populate[0]=x) with named ones silently drops
 * every indexed entry. Because the community relation needs the named form,
 * EVERY entry here is named: plain relations as populate[key]=true and
 * dotted paths as populate[key][populate][n]=sub.
 */
export const LISTING_FULL_POPULATE: Record<string, string> = {
  'populate[category]': 'true',
  'populate[mainImage]': 'true',
  'populate[gallery]': 'true',
  'populate[logo]': 'true',
  'populate[location]': 'true',
  'populate[tags]': 'true',
  'populate[contact]': 'true',
  'populate[schedule]': 'true',
  'populate[amenities]': 'true',
  'populate[recommendations]': 'true',
  'populate[relatedListings]': 'true',
  'populate[members][populate][0]': 'photo',
  'populate[members][populate][1]': 'gallery',
  'populate[members][populate][2]': 'contact',
  'populate[stories][populate][0]': 'image',
  'populate[stories][populate][1]': 'gallery',
  'populate[products]': 'true',
  // Contract §9 community subset.
  'populate[community][fields][0]': 'name',
  'populate[community][fields][1]': 'slug',
  'populate[community][fields][2]': 'color',
  'populate[community][fields][3]': 'textColor',
  'populate[community][populate][0]': 'badgeIcon',
};

/**
 * Populate spec for listing list pages (cards, maps, filters) where only the
 * summary fields are needed and full populates would bloat the response.
 * Named form only, like LISTING_FULL_POPULATE (contract §9).
 */
export const LISTING_SLIM_POPULATE: Record<string, string> = {
  'populate[category]': 'true',
  'populate[mainImage]': 'true',
  'populate[gallery]': 'true',
  'populate[location]': 'true',
  'populate[tags]': 'true',
  'populate[contact]': 'true',
  // Contract §9 community subset.
  'populate[community][fields][0]': 'name',
  'populate[community][fields][1]': 'slug',
  'populate[community][fields][2]': 'color',
  'populate[community][fields][3]': 'textColor',
  'populate[community][populate][0]': 'badgeIcon',
};

/**
 * Contract §9 community populate entries for community-member fetches.
 * Named form only — the member queries mix these with other named entries
 * (contract §9 populate format rule).
 */
const COMMUNITY_MEMBER_COMMUNITY_POPULATE: Record<string, string> = {
  'populate[community][fields][0]': 'name',
  'populate[community][fields][1]': 'slug',
  'populate[community][fields][2]': 'color',
  'populate[community][fields][3]': 'textColor',
  'populate[community][populate][0]': 'badgeIcon',
};

// ---------- categories ----------

export async function getCategories(locale: string = 'es-MX'): Promise<Category[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<CategoryAttributes>('/categories', {
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map(transformCategory);
    })) ?? []
  );
}

// ---------- listings ----------

export async function getListings(locale: string = 'es-MX'): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[publishedAt][$notNull]': 'true',
        ...LISTING_SLIM_POPULATE,
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

export async function getListingBySlug(slug: string, locale: string = 'es-MX'): Promise<Listing | null> {
  return safe(async () => {
    const res = await strapiGet<ListingAttributes>('/listings', {
      'filters[slug][$eq]': slug,
      'filters[publishedAt][$notNull]': 'true',
      ...LISTING_FULL_POPULATE,
      'pagination[pageSize]': '1',
      locale,
    });
    if (res.data.length === 0) return null;

    // EN fallback: fetch ES version so empty EN fields (stories, products,
    // tags, schedule, amenities, recommendations) fall back to Spanish content.
    let esItem: StrapiItem<ListingAttributes> | null = null;
    if (locale.startsWith('en')) {
      const esRes = await strapiGet<ListingAttributes>('/listings', {
        'filters[slug][$eq]': slug,
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'stories',
        'populate[1]': 'products',
        'populate[2]': 'tags',
        'populate[3]': 'schedule',
        'populate[4]': 'amenities',
        'populate[5]': 'recommendations',
        locale: 'es-MX',
        'pagination[pageSize]': '1',
      });
      esItem = esRes.data.length > 0 ? esRes.data[0] : null;
    }

    return transformListing(res.data[0], locale, esItem);
  });
}

export async function getListingsByCategorySlug(categorySlug: string, locale: string = 'es-MX'): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[category][slug][$eq]': categorySlug,
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'category',
        'populate[1]': 'mainImage',
        'populate[2]': 'location',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

export async function getFeaturedListings(locale: string = 'es-MX', limit: number = 3): Promise<Listing[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<ListingAttributes>('/listings', {
        'filters[isFeatured][$eq]': 'true',
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'category',
        'populate[1]': 'mainImage',
        'populate[2]': 'location',
        sort: 'order:asc',
        'pagination[pageSize]': String(limit),
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

// ---------- community members ----------

export async function getCommunityMembers(locale: string = 'es-MX'): Promise<CommunityMember[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<CommunityMemberAttributes>('/community-members', {
        'filters[publishedAt][$notNull]': 'true',
        // Named form (contract §9): mixed with the community entries below.
        'populate[photo]': 'true',
        'populate[listings]': 'true',
        ...COMMUNITY_MEMBER_COMMUNITY_POPULATE,
        sort: 'order:asc',
        'pagination[pageSize]': '100',
        locale,
      });
      return res.data.map((item) => transformCommunityMember(item, locale));
    })) ?? []
  );
}

export async function getFeaturedCommunityMembers(
  locale: string = 'es-MX',
  limit: number = 6,
): Promise<CommunityMember[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<CommunityMemberAttributes>('/community-members', {
        'filters[publishedAt][$notNull]': 'true',
        'filters[isFeatured][$eq]': 'true',
        // Named form (contract §9): mixed with the community entries below.
        'populate[photo]': 'true',
        ...COMMUNITY_MEMBER_COMMUNITY_POPULATE,
        sort: 'order:asc',
        'pagination[pageSize]': String(limit),
        locale,
      });
      return res.data.map((item) => transformCommunityMember(item, locale));
    })) ?? []
  );
}

export async function getCommunityMembersWithFallback(locale: string = 'es-MX'): Promise<CommunityMember[]> {
  const fromCms = await getCommunityMembers(locale);
  if (fromCms.length > 0) return fromCms;
  return [];
}

export async function getCommunityMemberBySlug(
  slug: string,
  locale: string = 'es-MX',
): Promise<CommunityMember | null> {
  return safe(async () => {
    const res = await strapiGet<CommunityMemberAttributes>('/community-members', {
      'filters[slug][$eq]': slug,
      'filters[publishedAt][$notNull]': 'true',
      // Named form (contract §9): mixed with the community entries below.
      'populate[photo]': 'true',
      'populate[gallery]': 'true',
      'populate[social]': 'true',
      'populate[listings]': 'true',
      'populate[relatedMembers][populate][0]': 'photo',
      ...COMMUNITY_MEMBER_COMMUNITY_POPULATE,
      'pagination[pageSize]': '1',
      locale,
    });
    if (res.data.length === 0) return null;

    // EN fallback: when locale is 'en', also fetch the ES version so empty EN
    // narrative fields (bio, role, pullQuote, legacyNote) can fall back to ES.
    let esItem: StrapiItem<CommunityMemberAttributes> | null = null;
    if (locale.startsWith('en')) {
      const esRes = await strapiGet<CommunityMemberAttributes>('/community-members', {
        'filters[slug][$eq]': slug,
        'filters[publishedAt][$notNull]': 'true',
        'populate[0]': 'photo',
        locale: 'es-MX',
        'pagination[pageSize]': '1',
      });
      esItem = esRes.data.length > 0 ? esRes.data[0] : null;
    }

    return transformCommunityMember(res.data[0], locale, esItem);
  });
}

// ---------- site content ----------

export async function getSiteContent(key: string, locale: string = 'es-MX'): Promise<SiteContent | null> {
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
export async function getSiteContents(keys: string[], locale: string = 'es-MX'): Promise<(SiteContent | null)[]> {
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
  title: { 'es-MX': string; en: string };
  content: { 'es-MX': string; en: string };
  publishedAt: string | null;
}

export async function getLegalPage(slug: string, locale: string = 'es-MX'): Promise<{ slug: string; title: string; content: string } | null> {
  return safe(async () => {
    const item = await strapiGetOne<LegalPageAttributes>('/legal-pages', {
      'filters[slug][$eq]': slug,
      locale,
    });
    if (!item) return null;
    const attrs = unwrap(item);
    const loc = locale.startsWith('en') ? 'en' : 'es-MX';
    return {
      slug: attrs.slug,
      title: attrs.title[loc] || attrs.title['es-MX'],
      content: attrs.content[loc] || attrs.content['es-MX'],
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
    const ogImageData = a.seoOgImage as any;
    const ogImageUrl = (() => {
      const raw = ogImageData?.attributes?.url ?? ogImageData?.url ?? '';
      if (!raw) return '';
      if (raw.startsWith('http')) return raw;
      return `${strapiBaseUrl}${raw}`;
    })();
    const logoImageData = a.logoImage as any;
    const logoImageUrl = (() => {
      const raw = logoImageData?.attributes?.url ?? logoImageData?.url ?? '';
      if (!raw) return '';
      if (raw.startsWith('http')) return raw;
      return `${strapiBaseUrl}${raw}`;
    })();
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
        logoShortName: a.logoShortName || SITE_BRAND_NAME,
      },
    };
  });
}

// ---------- homepage ----------

/**
 * Every component/media field on the Homepage single type that must be
 * populated. Strapi v5 does NOT return components by default — each one
 * must be listed explicitly here. Components that nest media use dot
 * notation (e.g. `hero.images`) to deep-populate the relation.
 *
 * Keep this list in sync with the `HomepageAttributes` interface in
 * `src/utils/strapiTransformer.ts` and the backend schema at
 * `pav-backend/src/api/homepage/content-types/homepage/schema.json`.
 */
const HOMEPAGE_POPULATE = {
  'populate[0]': 'hero.images',
  'populate[1]': 'highlights.image',
  'populate[2]': 'quickFactsImage1',
  'populate[3]': 'quickFactsImage2',
  'populate[4]': 'mapSection.image',
  'populate[5]': 'highlightsHeader',
  'populate[6]': 'quickFactsHeader',
  'populate[7]': 'quickFacts',
  'populate[8]': 'finalCta',
  'populate[9]': 'mapSection.centerPoint',
  'populate[10]': 'regionMapImage',
} as const;

export async function getHomepage(locale: string = 'es-MX'): Promise<HomepageData | null> {
  return safe(async () => {
    const item = await strapiGetOne<HomepageAttributes>('/homepage', {
      ...HOMEPAGE_POPULATE,
      locale,
    });
    if (!item) return null;
    return transformHomepage(item, locale);
  });
}

export async function getHomepageWithFallback(locale: string = 'es-MX'): Promise<HomepageData> {
  const fromCms = await getHomepage(locale);
  if (fromCms) {
    return mergeHomepage(fromCms, getHomepageFallback(locale));
  }
  return getHomepageFallback(locale);
}

/**
 * Merge CMS homepage data with the local fallback. Any field that the CMS
 * returns empty (blank string, empty array, missing image URL) is replaced
 * with the corresponding fallback value so the page never renders blank.
 *
 * This handles the case where some sections are populated in Strapi but
 * others are not (e.g. media never uploaded, a component left empty).
 */
function mergeHomepage(cms: HomepageData, fb: HomepageData): HomepageData {
  const str = (a: string, b: string) => (a && a.trim() ? a : b);
  const arr = <T>(a: T[], b: T[]) => (a && a.length > 0 ? a : b);

  return {
    hero: {
      title: str(cms.hero.title, fb.hero.title),
      titleHighlight: str(cms.hero.titleHighlight, fb.hero.titleHighlight),
      description: str(cms.hero.description, fb.hero.description),
      ctaLabel: str(cms.hero.ctaLabel, fb.hero.ctaLabel),
      ctaLink: str(cms.hero.ctaLink, fb.hero.ctaLink),
      images: arr(cms.hero.images, fb.hero.images).map((img, i) => ({
        url: str(img.url, fb.hero.images[i]?.url || ''),
        alt: str(img.alt, fb.hero.images[i]?.alt || ''),
      })),
    },
    highlights: {
      header: {
        title: str(cms.highlights.header.title, fb.highlights.header.title),
        subtitle: str(cms.highlights.header.subtitle, fb.highlights.header.subtitle),
      },
      items: arr(cms.highlights.items, fb.highlights.items).map((h, i) => ({
        title: str(h.title, fb.highlights.items[i]?.title || ''),
        description: str(h.description, fb.highlights.items[i]?.description || ''),
        image: str(h.image, fb.highlights.items[i]?.image || ''),
        alt: str(h.alt, fb.highlights.items[i]?.alt || ''),
        link: h.link || fb.highlights.items[i]?.link,
      })),
    },
    quickFacts: {
      header: {
        title: str(cms.quickFacts.header.title, fb.quickFacts.header.title),
        subtitle: str(cms.quickFacts.header.subtitle, fb.quickFacts.header.subtitle),
      },
      items: arr(cms.quickFacts.items, fb.quickFacts.items).map((q, i) => ({
        title: str(q.title, fb.quickFacts.items[i]?.title || ''),
        value: str(q.value, fb.quickFacts.items[i]?.value || ''),
        description: str(q.description, fb.quickFacts.items[i]?.description || ''),
      })),
      images: cms.quickFacts.images.map((url, i) =>
        str(url, fb.quickFacts.images[i] || '')
      ),
    },
    mapSection: {
      title: str(cms.mapSection.title, fb.mapSection.title),
      description: str(cms.mapSection.description, fb.mapSection.description),
      buttonLabel: str(cms.mapSection.buttonLabel, fb.mapSection.buttonLabel),
      buttonUrl: str(cms.mapSection.buttonUrl, fb.mapSection.buttonUrl),
      image: str(cms.mapSection.image, fb.mapSection.image),
      alt: str(cms.mapSection.alt || '', fb.mapSection.alt || ''),
    },
    regionMapImage: str(cms.regionMapImage || '', fb.regionMapImage || ''),
    regionMapImageAlt: cms.regionMapImage ? cms.regionMapImageAlt : undefined,
    finalCta: {
      title: str(cms.finalCta.title, fb.finalCta.title),
      description: str(cms.finalCta.description, fb.finalCta.description),
      buttonLabel: str(cms.finalCta.buttonLabel, fb.finalCta.buttonLabel),
      buttonLink: str(cms.finalCta.buttonLink, fb.finalCta.buttonLink),
    },
  };
}

const REGION_MAP_PLACEHOLDER = '/images/guide/route-loreto.svg';

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
    centerPoint: { lat: 25.51204, lng: -111.07577 },
    zoom: 12,
  },
  // Mock placeholder until the designer delivers the BCS/Loreto map (contract §8).
  regionMapImage: REGION_MAP_PLACEHOLDER,
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
    centerPoint: { lat: 25.51204, lng: -111.07577 },
    zoom: 12,
  },
  // Mock placeholder until the designer delivers the BCS/Loreto map (contract §8).
  regionMapImage: REGION_MAP_PLACEHOLDER,
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

// Re-export the transformer types so callers can type their own data.
export type { StrapiItem, CategoryAttributes, ListingAttributes, SiteContentAttributes, HomepageAttributes, CommunityMemberAttributes };

// ---------- dev-fallback aware wrappers ----------
//
// In development, if the CMS is unreachable the page can still render by
// falling back to local seed data. These wrappers centralize that policy.

import { getListingsFallback } from '../data/devFallback';

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
        name: (c?.name as any) || { 'es-MX': slug, en: slug },
        order: c?.order ?? 0,
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
export function getCategoriesWithFallback(locale: string = 'es-MX'): Category[] {
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
    return getListingsFallback(locale);
  })();

  listingsInFlight.set(key, promise);
  promise.finally(() => listingsInFlight.delete(key));
  return promise;
}

export async function getListingsWithFallback(locale: string = 'es-MX'): Promise<Listing[]> {
  return dedupedListingsFetch(locale);
}

/**
 * Lightweight slug-only fetcher for `getStaticPaths`. Returns the list of
 * published listing slugs for the given locale — a single slim CMS call
 * (no populates) regardless of how many listings exist. Detail pages then
 * call `getListingBySlugWithFallback(slug, locale)` per route for the full
 * view-model with all relations populated.
 */
export async function getListingSlugsWithFallback(locale: string = 'es-MX'): Promise<string[]> {
  const fromCms = await safe(async () => {
    const res = await strapiGet<ListingAttributes>('/listings', {
      'filters[publishedAt][$notNull]': 'true',
      sort: 'order:asc',
      'pagination[pageSize]': '100',
      locale,
      fields: 'slug',
    });
    return res.data
      .map((item) => unwrap(item).slug)
      .filter((s): s is string => typeof s === 'string' && s.length > 0);
  });

  if (fromCms && fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getListingsFallback(locale)
    .map((l) => l.slug)
    .filter((s): s is string => typeof s === 'string' && s.length > 0);
}

export async function getListingBySlugWithFallback(slug: string, locale: string = 'es-MX'): Promise<Listing | null> {
  const fromCms = await getListingBySlug(slug, locale);
  if (fromCms) return fromCms;
  if (!USE_DEV_FALLBACK) return null;
  return getListingsFallback(locale).find((l) => l.slug === slug) ?? null;
}

export async function getFeaturedListingsWithFallback(locale: string = 'es-MX', limit: number = 3): Promise<Listing[]> {
  const fromCms = await getFeaturedListings(locale, limit);
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getListingsFallback(locale).filter((l) => l.isFeatured).slice(0, limit);
}

