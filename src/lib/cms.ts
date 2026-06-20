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
import {
  transformCategory,
  transformListing,
  transformTeamMember,
  transformOrganization,
  transformSiteContent,
  type StrapiItem,
  type CategoryAttributes,
  type ListingAttributes,
  type TeamMemberAttributes,
  type OrganizationAttributes,
  type SiteContentAttributes,
} from '../utils/strapiTransformer';

const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN || '';

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

async function strapiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiList<T>> {
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
}

async function strapiGetOne<T>(path: string, params?: Record<string, string | number | undefined>): Promise<StrapiItem<T> | null> {
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
  const json = (await res.json()) as StrapiSingle<T>;
  return json.data;
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
        'populate[category]': '*',
        'populate[mainImage]': '*',
        'populate[gallery]': '*',
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
      'populate[category]': '*',
      'populate[mainImage]': '*',
      'populate[gallery]': '*',
      'populate[relatedListings]': '*',
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
        'filters[categoryId][$eq]': categorySlug,
        'filters[publishedAt][$notNull]': 'true',
        'populate[category]': '*',
        'populate[mainImage]': '*',
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
        'populate[category]': '*',
        'populate[mainImage]': '*',
        sort: 'order:asc',
        'pagination[pageSize]': String(limit),
        locale,
      });
      return res.data.map((item) => transformListing(item, locale));
    })) ?? []
  );
}

// ---------- team members ----------

export async function getTeamMembers(): Promise<TeamMember[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<TeamMemberAttributes>('/team-members', {
        'filters[publishedAt][$notNull]': 'true',
        'populate[photo]': '*',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
      });
      return res.data.map(transformTeamMember);
    })) ?? []
  );
}

// ---------- organizations ----------

export async function getOrganizations(): Promise<Organization[]> {
  return (
    (await safe(async () => {
      const res = await strapiGet<OrganizationAttributes>('/organizations', {
        'filters[publishedAt][$notNull]': 'true',
        'populate[logo]': '*',
        sort: 'order:asc',
        'pagination[pageSize]': '100',
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

export async function getSiteContents(keys: string[], locale: string = 'es'): Promise<(SiteContent | null)[]> {
  return Promise.all(keys.map((k) => getSiteContent(k, locale)));
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
}

export async function getGlobalSettings(): Promise<{
  contact: { email: string; phone: string; phoneRaw: string; whatsapp: string; address: string };
  social: { instagram: string; facebook: string; googleMaps: string };
  metadata: { siteName: string; defaultTitle: string; defaultDescription: string };
} | null> {
  return safe(async () => {
    const item = await strapiGetOne<GlobalAttributes>('/global', {});
    if (!item) return null;
    const a = unwrap(item);
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
    };
  });
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
  const [intro, values, community, collaboration, team, organizations] = await Promise.all([
    getSiteContent('about-intro', locale),
    getSiteContent('about-values', locale),
    getSiteContent('about-community', locale),
    getSiteContent('about-collaboration', locale),
    getTeamMembers(),
    getOrganizations(),
  ]);

  return {
    intro: intro
      ? { title: intro.title[locale.startsWith('en') ? 'en' : 'es'], text: intro.text[locale.startsWith('en') ? 'en' : 'es'] }
      : null,
    values: values?.extraData
      ? {
          mission: (values.extraData as any).mission,
          vision: (values.extraData as any).vision,
          values: (values.extraData as any).values,
        }
      : null,
    community: community
      ? { title: community.title[locale.startsWith('en') ? 'en' : 'es'], text: community.text[locale.startsWith('en') ? 'en' : 'es'] }
      : null,
    collaboration: collaboration?.extraData
      ? {
          title: (collaboration.extraData as any).title || collaboration.title[locale.startsWith('en') ? 'en' : 'es'],
          desc: (collaboration.extraData as any).desc || collaboration.text[locale.startsWith('en') ? 'en' : 'es'],
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

export function getCategoriesWithFallback(locale: string = 'es'): Category[] {
  // The dev fallback doesn't ship a separate categories file; derive it from
  // the listings collection.
  const listings = getListingsFallback();
  const seen = new Map<string, Category>();
  for (const l of listings) {
    if (l.categoryId && !seen.has(l.categoryId)) {
      const c = l.category;
      seen.set(l.categoryId, {
        id: l.categoryId,
        slug: l.categoryId,
        name: (c?.name as any) || { es: l.categoryId, en: l.categoryId },
        order: 0,
        isActive: true,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getListingsWithFallback(locale: string = 'es'): Promise<Listing[]> {
  const fromCms = await getListings(locale);
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getListingsFallback();
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

export async function getTeamWithFallback(): Promise<TeamMember[]> {
  const fromCms = await getTeamMembers();
  if (fromCms.length > 0) return fromCms;
  if (!USE_DEV_FALLBACK) return [];
  return getTeamFallback();
}

export async function getOrganizationsWithFallback(): Promise<Organization[]> {
  const fromCms = await getOrganizations();
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
