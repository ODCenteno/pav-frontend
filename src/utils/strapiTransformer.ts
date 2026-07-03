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
import type { HomepageData } from '../types/homepage.type';
import type { LocalizedString } from '../types/i18n.type';
import type {
  CommunityMember,
  CommunityMemberSummary,
  StoryBlock,
  StoryTheme,
  ProductItem,
  RelatedMemberRef,
} from '../types/community.type';
import type { SocialLink } from '../types/common.type';
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
  members?: { data: StrapiItem<CommunityMemberAttributes>[] };
  stories?: StoryBlockAttributes[];
  products?: ProductItemAttributes[];
  social?: SocialLinkAttributes[];
}

export interface SocialLinkAttributes {
  platform: string;
  handle?: string;
  url?: string;
}

export interface StoryBlockAttributes {
  title?: string | { es: string; en: string };
  narrative?: string | any[];
  highlightQuote?: string | { es: string; en: string };
  era?: string;
  theme?: string;
  storyteller?: string;
  image?: StrapiMedia;
  gallery?: StrapiMediaArray;
}

export interface ProductItemAttributes {
  name?: string | { es: string; en: string };
  description?: string | { es: string; en: string };
}

export interface CommunityMemberAttributes {
  name: string;
  slug: string;
  role?: string | { es: string; en: string };
  locality?: string;
  bio?: string | any[];
  pullQuote?: string | { es: string; en: string };
  photo?: StrapiMedia;
  gallery?: StrapiMediaArray;
  social?: SocialLinkAttributes[];
  phone?: string;
  whatsapp?: string;
  listings?: { data: StrapiItem<ListingAttributes>[] };
  relatedMembers?: { data: StrapiItem<CommunityMemberAttributes>[] };
  legacyNote?: string | { es: string; en: string };
  isFeatured?: boolean;
  order?: number;
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

export interface HeroSectionAttributes {
  title?: string;
  titleHighlight?: string;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  images?: StrapiMediaArray;
}

export interface SectionHeaderAttributes {
  title?: string;
  subtitle?: string;
}

export interface DestinationStoryAttributes {
  title?: string;
  text?: string;
  image?: StrapiMedia;
}

export interface HighlightCardAttributes {
  title?: string;
  description?: string;
  image?: StrapiMedia;
  link?: string;
}

export interface QuickFactAttributes {
  title?: string;
  value?: string;
  description?: string;
}

export interface MapSectionAttributes {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  image?: StrapiMedia;
}

export interface CtaSectionAttributes {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonLink?: string;
}

export interface HomepageAttributes {
  hero?: HeroSectionAttributes;
  destinationsHeader?: SectionHeaderAttributes;
  destinations?: DestinationStoryAttributes[];
  highlightsHeader?: SectionHeaderAttributes;
  highlights?: HighlightCardAttributes[];
  quickFactsHeader?: SectionHeaderAttributes;
  quickFacts?: QuickFactAttributes[];
  quickFactsImage1?: StrapiMedia;
  quickFactsImage2?: StrapiMedia;
  mapSection?: MapSectionAttributes;
  finalCta?: CtaSectionAttributes;
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

export function transformListing(
  item: StrapiItem<ListingAttributes>,
  locale: string = 'es',
  esItem?: StrapiItem<ListingAttributes> | null,
): Listing {
  const a = unwrap(item);
  const esAttrs = esItem ? unwrap(esItem) : null;
  const id = String(item.id ?? item.documentId ?? a.slug);
  const slug = a.slug;
  const mainImageUrl = mediaUrl(a.mainImage);
  const galleryUrls = mediaUrls(a.gallery);
  const storiesRaw = a.stories || [];
  const productsRaw = a.products || [];

  // Extract category relation - handle both Strapi v4 wrapped {data: ...} and v5 flat format
  const catRaw = a.category as any;
  const catItem: StrapiItem<CategoryAttributes> | null | undefined =
    catRaw && 'data' in catRaw ? (catRaw.data ?? null) : catRaw;

  return {
    id,
    slug,
    name: localized(a.title, locale),
    shortDescription: a.shortDescription ? localized(a.shortDescription, locale) : undefined,
    description: a.description ? localized(asString(a.description), locale) : undefined,
    categoryId: catItem ? (unwrap(catItem) as any).slug || '' : '',
    category: catItem ? transformCategory(catItem) : undefined,
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
    members: a.members?.data?.length
      ? a.members.data.map((m) => transformCommunityMemberSummary(m, locale))
      : undefined,
    stories: storiesRaw.length
      ? storiesRaw.map((s, i) => transformStory(s, locale, esAttrs?.stories?.[i]))
      : undefined,
    products: productsRaw.length
      ? productsRaw.map((p, i) => transformProduct(p, locale, esAttrs?.products?.[i]))
      : undefined,
    social: a.social?.length ? transformSocialLinks(a.social) : undefined,
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

function strFallback(value: string | undefined, fallback: string | undefined): string {
  const v = (value || '').trim();
  return v || (fallback || '').trim();
}

function pickLocalized(
  value: string | { es: string; en: string } | undefined,
  locale: string,
  fallback?: string | { es: string; en: string },
): string {
  const current = typeof value === 'object' ? (locale.startsWith('en') ? value.en : value.es) : (value || '');
  const fb = typeof fallback === 'object'
    ? (locale.startsWith('en') ? fallback.en : fallback.es)
    : (fallback || '');
  return strFallback(current, fb);
}

export function transformSocialLinks(raw: SocialLinkAttributes[]): SocialLink[] {
  return (raw || []).map((s) => ({
    platform: (s.platform as SocialLink['platform']) || 'other',
    handle: s.handle || undefined,
    url: s.url || undefined,
  }));
}

export function transformStory(
  raw: StoryBlockAttributes,
  locale: string = 'es',
  esRaw?: StoryBlockAttributes,
): StoryBlock {
  return {
    title: pickLocalized(raw.title, locale, esRaw?.title),
    narrative: strFallback(asString(raw.narrative), asString(esRaw?.narrative)),
    highlightQuote: pickLocalized(raw.highlightQuote, locale, esRaw?.highlightQuote) || undefined,
    era: raw.era || undefined,
    theme: (raw.theme as StoryTheme) || undefined,
    storyteller: raw.storyteller || undefined,
    imageUrl: mediaUrl(raw.image) || undefined,
    galleryUrls: mediaUrls(raw.gallery),
  };
}

export function transformProduct(
  raw: ProductItemAttributes,
  locale: string = 'es',
  esRaw?: ProductItemAttributes,
): ProductItem {
  return {
    name: pickLocalized(raw.name, locale, esRaw?.name),
    description: pickLocalized(raw.description, locale, esRaw?.description) || undefined,
  };
}

export function transformCommunityMemberSummary(
  item: StrapiItem<CommunityMemberAttributes>,
  locale: string = 'es',
): CommunityMemberSummary {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.slug);
  return {
    id,
    slug: a.slug,
    name: a.name || '',
    role: pickLocalized(a.role, locale) || undefined,
    pullQuote: pickLocalized(a.pullQuote, locale) || undefined,
    legacyNote: pickLocalized(a.legacyNote, locale) || undefined,
    photo: mediaUrl(a.photo) || undefined,
  };
}

export function transformCommunityMember(
  item: StrapiItem<CommunityMemberAttributes>,
  locale: string = 'es',
  esItem?: StrapiItem<CommunityMemberAttributes> | null,
): CommunityMember {
  const a = unwrap(item);
  const es = esItem ? unwrap(esItem) : null;
  const id = String(item.id ?? item.documentId ?? a.slug);

  const listingSlugs = (a.listings?.data || []).map((l) => {
    const la = unwrap(l);
    return la.slug || String(l.id ?? l.documentId);
  });

  const relatedMembers: RelatedMemberRef[] = (a.relatedMembers?.data || []).map((m) => {
    const ma = unwrap(m);
    return {
      id: String(m.id ?? m.documentId ?? ma.slug),
      name: ma.name || '',
      slug: ma.slug || undefined,
      legacyNote: pickLocalized(ma.legacyNote, locale) || undefined,
    };
  });

  return {
    id,
    slug: a.slug,
    name: a.name || '',
    role: pickLocalized(a.role, locale, es?.role) || undefined,
    locality: (a.locality as CommunityMember['locality']) || undefined,
    bio: strFallback(asString(a.bio), asString(es?.bio)),
    pullQuote: pickLocalized(a.pullQuote, locale, es?.pullQuote) || undefined,
    legacyNote: pickLocalized(a.legacyNote, locale, es?.legacyNote) || undefined,
    photo: mediaUrl(a.photo) || undefined,
    galleryUrls: mediaUrls(a.gallery),
    social: a.social?.length ? transformSocialLinks(a.social) : [],
    phone: a.phone || undefined,
    whatsapp: a.whatsapp || undefined,
    listingSlugs,
    relatedMembers,
    isFeatured: a.isFeatured,
    order: a.order,
  };
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

export function transformHomepage(item: StrapiItem<HomepageAttributes>, locale: string = 'es'): HomepageData {
  const a = unwrap(item);

  const hero = a.hero || {};
  const heroImages = hero.images?.data || [];

  const destinationsHeader = a.destinationsHeader || {};
  const destinationsItems = (a.destinations || []).map((d: any) => ({
    title: localized(d.title, locale).es,
    text: localized(d.text, locale).es,
    image: d.image?.data ? resolveMediaUrl(d.image.data.attributes?.url || '') : '',
    alt: d.image?.data?.attributes?.alternativeText || '',
  }));

  const highlightsHeader = a.highlightsHeader || {};
  const highlightsItems = (a.highlights || []).map((h: any) => ({
    title: localized(h.title, locale).es,
    description: localized(h.description, locale).es,
    image: h.image?.data ? resolveMediaUrl(h.image.data.attributes?.url || '') : '',
    alt: h.image?.data?.attributes?.alternativeText || '',
    link: h.link || undefined,
  }));

  const quickFactsHeader = a.quickFactsHeader || {};
  const quickFactsItems = (a.quickFacts || []).map((q: any) => ({
    title: localized(q.title, locale).es,
    value: localized(q.value, locale).es,
    description: localized(q.description, locale).es,
  }));
  const quickFactsImages = [
    a.quickFactsImage1?.data ? resolveMediaUrl(a.quickFactsImage1.data.attributes?.url || '') : '',
    a.quickFactsImage2?.data ? resolveMediaUrl(a.quickFactsImage2.data.attributes?.url || '') : '',
  ];

  const mapSection = a.mapSection || {};
  const mapImage = mapSection.image?.data
    ? resolveMediaUrl(mapSection.image.data.attributes?.url || '')
    : '';

  const finalCta = a.finalCta || {};

  return {
    hero: {
      title: localized(hero.title, locale).es,
      titleHighlight: localized(hero.titleHighlight, locale).es,
      description: localized(hero.description, locale).es,
      ctaLabel: localized(hero.ctaLabel, locale).es,
      ctaLink: hero.ctaLink || '/sitios',
      images: heroImages.map((img: any) => ({
        url: resolveMediaUrl(img.attributes?.url || ''),
        alt: img.attributes?.alternativeText || '',
      })),
    },
    destinations: {
      header: {
        title: localized(destinationsHeader.title, locale).es,
        subtitle: localized(destinationsHeader.subtitle, locale).es,
      },
      items: destinationsItems,
    },
    highlights: {
      header: {
        title: localized(highlightsHeader.title, locale).es,
        subtitle: localized(highlightsHeader.subtitle, locale).es,
      },
      items: highlightsItems,
    },
    quickFacts: {
      header: {
        title: localized(quickFactsHeader.title, locale).es,
        subtitle: localized(quickFactsHeader.subtitle, locale).es,
      },
      items: quickFactsItems,
      images: quickFactsImages,
    },
    mapSection: {
      title: localized(mapSection.title, locale).es,
      description: localized(mapSection.description, locale).es,
      buttonLabel: localized(mapSection.buttonLabel, locale).es,
      buttonUrl: mapSection.buttonUrl || '',
      image: mapImage,
      alt: mapSection.image?.data?.attributes?.alternativeText || '',
    },
    finalCta: {
      title: localized(finalCta.title, locale).es,
      description: localized(finalCta.description, locale).es,
      buttonLabel: localized(finalCta.buttonLabel, locale).es,
      buttonLink: finalCta.buttonLink || '#',
    },
  };
}
