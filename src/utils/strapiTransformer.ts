/**
 * Strapi v5 → frontend view-model transformers.
 *
 * Strapi v5 returns either a single `{ data: { id, documentId, ...attributes } }`
 * or a list `{ data: [...], meta: { pagination } }`. Localized string fields
 * come back as a single string when `?locale=` is set; we wrap that into a
 * `LocalizedString` with the same value in both `es` and `en` slots. To get
 * true per-locale content, the page would call Strapi twice (once per locale)
 * and merge — that's a future enhancement.
 */

import type { Category } from '../types/category.type';
import type { Listing } from '../types/listing.type';
import type { TeamMember, Organization } from '../types/about.type';
import type { SiteContent } from '../types/site-content.type';
import type { LocalizedString } from '../types/i18n.type';
import { navigation } from './navigation';

export interface StrapiItem<T = any> {
  id: number;
  documentId?: string;
  attributes?: T;
  [key: string]: any;
}

export interface StrapiMedia {
  data: {
    id: number;
    documentId?: string;
    attributes?: {
      url: string;
      alternativeText?: string;
      width?: number;
      height?: number;
      mime?: string;
    };
  } | null;
}

export interface StrapiMediaArray {
  data: Array<{
    id: number;
    documentId?: string;
    attributes?: {
      url: string;
      alternativeText?: string;
    };
  }>;
}

export interface StrapiRelation<T> {
  data: StrapiItem<T> | null;
}

// ---------- attribute shapes (Strapi v5) ----------

export interface CategoryAttributes {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
  description?: string;
}

export interface ListingAttributes {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string | any[];
  mainImage?: StrapiMedia;
  gallery?: StrapiMediaArray;
  price?: string;
  isFeatured?: boolean;
  order?: number;
  category?: StrapiRelation<CategoryAttributes>;
  categoryId?: string;
  tags?: string[];
  contact?: {
    whatsapp?: string;
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  locationURL?: string;
  location?: {
    lat?: number;
    lng?: number;
    name?: string | { es: string; en: string };
    address?: string | { es: string; en: string };
    locality?: string;
    googleMapsUrl?: string;
    openStreetMapUrl?: string;
  };
  schedule?: {
    isAlwaysOpen?: boolean;
    text?: string | { es: string; en: string };
  };
  amenities?: string[];
  recommendations?: {
    bestTimeToVisit?: string | { es: string; en: string };
    whatToBring?: string[] | { es: string[]; en: string[] };
    accessibilityNotes?: string | { es: string; en: string };
    connectivityNotes?: string | { es: string; en: string };
  };
  relatedListings?: { data: StrapiItem<ListingAttributes>[] };
}

export interface TeamMemberAttributes {
  name: string;
  role?: { es: string; en: string };
  shortBio?: { es: string; en: string };
  photo?: StrapiMedia;
  links?: {
    email?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  order?: number;
  isFeatured?: boolean;
}

export interface OrganizationAttributes {
  name: string;
  type?: 'community' | 'institution' | 'partner' | 'collective' | 'business';
  shortDescription?: { es: string; en: string };
  logo?: StrapiMedia;
  links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  order?: number;
  isFeatured?: boolean;
}

export interface SiteContentAttributes {
  key: string;
  title?: string;
  text?: string;
  order?: number;
  extraData?: any;
}

// ---------- helpers ----------

const STRAPI_BASE_URL = (import.meta.env.STRAPI_URL || 'http://localhost:1337').replace(/\/$/, '');

export function unwrap<T>(item: StrapiItem<T>): T {
  // Strapi v5 returns either { attributes: {...} } or the fields directly on
  // the item. Support both.
  if (item && typeof item === 'object' && 'attributes' in item && item.attributes) {
    return item.attributes as T;
  }
  return item as unknown as T;
}

function localized(value: string | { es: string; en: string } | undefined, locale: string = 'es'): LocalizedString {
  // When Strapi returns a single localized value, mirror it in both slots so
  // the frontend's `useTranslations` helper can pick by language. A more
  // sophisticated pipeline would call Strapi twice and merge.
  if (value && typeof value === 'object') {
    // Already a LocalizedString — pass through.
    return { es: (value as any).es || '', en: (value as any).en || '' };
  }
  const v = (value as string) || '';
  if (locale.startsWith('en')) {
    return { es: v, en: v };
  }
  return { es: v, en: v };
}

/**
 * Strapi v5 may return `location` as either a structured object
 * `{ lat, lng, name, address, ... }` or a positional array `[lat, lng]`
 * depending on how the record was authored. This helper normalises both
 * shapes into the canonical `Location` interface.
 */
/**
 * Build a LocalizedString from a Strapi JSON field using locale-suffixed
 * keys (e.g. `bestTime_es`, `bestTime_en`). Falls back `_en` → `_es`.
 */
function localeSuffixed(obj: any, key: string): LocalizedString | undefined {
  if (!obj) return undefined;
  const es = obj[`${key}_es`];
  const en = obj[`${key}_en`] ?? es;
  if (es == null && en == null) return undefined;
  return { es: String(es ?? ''), en: String(en ?? '') };
}

/**
 * Build a LocalizedString[] from locale-suffixed array keys
 * (e.g. `bring_es`, `bring_en`).
 */
function localeSuffixedArray(obj: any, key: string): LocalizedString[] | undefined {
  if (!obj) return undefined;
  const es: string[] = Array.isArray(obj[`${key}_es`]) ? obj[`${key}_es`] : [];
  const en: string[] = Array.isArray(obj[`${key}_en`]) ? obj[`${key}_en`] : es;
  if (es.length === 0) return undefined;
  return es.map((item, i) => ({ es: item, en: en[i] ?? item }));
}

function normalizeLocation(raw: any, locale: string): any {
  if (!raw) return undefined;

  // Positional array shape: [lat, lng] or [lat, lng, ...]
  if (Array.isArray(raw)) {
    const [lat, lng] = raw;
    if (typeof lat !== 'number' || typeof lng !== 'number') return undefined;
    return {
      lat: lat || 0,
      lng: lng || 0,
      name: undefined,
      address: { es: '', en: '' },
    };
  }

  // Object shape
  return {
    lat: typeof raw.lat === 'number' ? raw.lat : 0,
    lng: typeof raw.lng === 'number' ? raw.lng : 0,
    name: raw.name
      ? typeof raw.name === 'string'
        ? localized(raw.name, locale)
        : raw.name
      : undefined,
    address: raw.address
      ? typeof raw.address === 'string'
        ? localized(raw.address, locale)
        : raw.address
      : { es: '', en: '' },
    locality: raw.locality,
    googleMapsUrl: raw.googleMapsUrl,
    openStreetMapUrl: raw.openStreetMapUrl,
  };
}

function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_BASE_URL}${url}`;
}

function mediaUrl(media: StrapiMedia | undefined): string {
  if (!media?.data) return '';
  return resolveMediaUrl(media.data.attributes?.url || '');
}

function mediaUrls(media: StrapiMediaArray | undefined): string[] {
  if (!media?.data) return [];
  return media.data
    .map((m) => resolveMediaUrl(m.attributes?.url || ''))
    .filter(Boolean);
}

// ---------- transformers ----------

export function transformCategory(item: StrapiItem<CategoryAttributes>): Category {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.slug);
  return {
    id,
    slug: a.slug,
    name: localized(a.name),
    description: a.description ? localized(a.description) : undefined,
    icon: a.icon,
    color: a.color,
    order: a.order,
    isActive: a.isActive ?? true,
  };
}

export function transformListing(item: StrapiItem<ListingAttributes>, locale: string = 'es'): Listing {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.slug);
  const slug = a.slug;
  const mainImageUrl = mediaUrl(a.mainImage);
  const galleryUrls = mediaUrls(a.gallery);

  return {
    id,
    slug,
    name: localized(a.title, locale),
    shortDescription: a.shortDescription ? localized(a.shortDescription, locale) : undefined,
    description: a.description ? localized(asString(a.description), locale) : undefined,
    categoryId: a.categoryId || a.category?.data?.attributes?.slug || '',
    category: a.category?.data ? transformCategory(a.category.data) : undefined,
    tags: (a.tags || []).map((t) => localized(t, locale)),
    locationURL: a.locationURL || undefined,
    location: normalizeLocation(a.location, locale),
    contact: a.contact,
    pricing: a.price ? { price: a.price } : undefined,
    media: mainImageUrl || galleryUrls.length > 0
      ? { mainImageUrl, galleryUrls }
      : undefined,
    image: mainImageUrl,
    isFeatured: a.isFeatured,
    order: a.order,
    status: 'published',
    schedule: a.schedule
      ? {
          isAlwaysOpen: a.schedule.isAlwaysOpen,
          text: localeSuffixed(a.schedule, 'text'),
        }
      : undefined,
    amenities: (a.amenities || []).map((t) => localized(t, locale)),
    recommendations: a.recommendations
      ? {
          bestTimeToVisit: localeSuffixed(a.recommendations, 'bestTime'),
          whatToBring: localeSuffixedArray(a.recommendations, 'bring'),
          accessibilityNotes: localeSuffixed(a.recommendations, 'accessibilityNotes'),
          connectivityNotes: localeSuffixed(a.recommendations, 'connectivityNotes'),
        }
      : undefined,
    relatedSites: a.relatedListings?.data?.map((r) => String(r.id ?? r.documentId)) ?? undefined,
    href: {
      es: navigation.siteDetail(slug, 'es'),
      en: navigation.siteDetail(slug, 'en'),
    },
  };
}

function asString(value: string | any[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    // Strapi v5 richtext is a blocks array. Convert to plain text for now;
    // pages that need HTML can switch to a richtext renderer later.
    return value
      .map((block: any) => {
        if (typeof block === 'string') return block;
        if (block?.children) {
          return block.children
            .map((child: any) => child?.text || '')
            .join('');
        }
        return '';
      })
      .join('\n\n');
  }
  return '';
}

export function transformTeamMember(item: StrapiItem<TeamMemberAttributes>): TeamMember {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.name);
  return {
    id,
    name: a.name,
    role: a.role || { es: '', en: '' },
    shortBio: a.shortBio,
    photo: mediaUrl(a.photo) || undefined,
    links: a.links,
    order: a.order,
    isFeatured: a.isFeatured,
  };
}

export function transformOrganization(item: StrapiItem<OrganizationAttributes>): Organization {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.name);
  return {
    id,
    name: a.name,
    type: a.type,
    shortDescription: a.shortDescription,
    logo: mediaUrl(a.logo) || undefined,
    links: a.links,
    order: a.order,
    isFeatured: a.isFeatured,
  };
}

export function transformSiteContent(item: StrapiItem<SiteContentAttributes>, locale: string = 'es'): SiteContent {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.key);
  return {
    id,
    documentId: item.documentId,
    key: a.key,
    title: localized(a.title, locale),
    text: localized(a.text, locale),
    order: a.order,
    extraData: a.extraData || null,
  };
}
