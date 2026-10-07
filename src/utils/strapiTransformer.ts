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
import type { SiteContent } from '../types/site-content.type';
import type { HomepageData } from '../types/homepage.type';
import type { GoodPracticesPage } from '../types/good-practices.type';
import type { LocalizedString } from '../types/i18n.type';
import type {
  Community,
  CommunityRef,
  CommunityMember,
  CommunityMemberSummary,
  StoryBlock,
  StoryTheme,
  ProductItem,
  AmenityItem,
  RecommendationItem,
  RelatedMemberRef,
} from '../types/community.type';
import type { ContactInfo, SocialLink } from '../types/common.type';
import { navigation } from './navigation';
import { composePhone, formatPhone, normalizePhone, telHref, whatsappHref } from './phone';
import { getCommunityBySlug } from '../data/communities';
import { responsiveImageFromMedia, type ResponsiveImageMap } from './responsiveImage';

export interface StrapiItem<T = any> {
  id: number;
  documentId?: string;
  attributes?: T;
  [key: string]: any;
}

export interface StrapiFile {
  id: number;
  documentId?: string;
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
  [key: string]: any;
}

export interface StrapiMedia {
  data?: {
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
  id?: number;
  url?: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: Record<string, { url: string; width?: number; height?: number }>;
  [key: string]: any;
}

export interface StrapiMediaArray {
  data?: Array<{
    id: number;
    documentId?: string;
    attributes?: {
      url: string;
      alternativeText?: string;
    };
  }>;
  id?: number;
  url?: string;
  alternativeText?: string;
  [key: string]: any;
}

export interface StrapiMediaFlat {
  id: number;
  documentId?: string;
  url?: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: Record<string, { url: string; width?: number; height?: number }>;
  [key: string]: any;
}

function getUrlFromMedia(media: StrapiMediaFlat | StrapiMedia | StrapiMediaArray | any): string {
  if (!media) return '';
  if (typeof media === 'object') {
    if ('url' in media && media.url) return media.url;
    if ('attributes' in media && typeof (media as any).attributes === 'object') {
      const a = (media as any).attributes;
      if (a && typeof a === 'object' && 'url' in a && a.url) return a.url;
    }
    if ('data' in media) {
      const d = (media as any).data;
      if (Array.isArray(d)) {
        return d[0]?.attributes?.url || d[0]?.url || '';
      }
      if (d && typeof d === 'object') {
        return (d as any).attributes?.url || (d as any).url || '';
      }
    }
  }
  return '';
}

function getAltFromMedia(media: StrapiMediaFlat | StrapiMedia | StrapiMediaArray | any): string {
  if (!media) return '';
  if ('alternativeText' in media && media.alternativeText) return media.alternativeText;
  if ('attributes' in media && typeof (media as any).attributes === 'object') {
    const a = (media as any).attributes;
    if (a && typeof a === 'object' && 'alternativeText' in a && a.alternativeText) return a.alternativeText;
  }
  if ('data' in media) {
    const d = (media as any).data;
    if (Array.isArray(d)) return d[0]?.alternativeText || d[0]?.attributes?.alternativeText || '';
    if (d && typeof d === 'object') return (d as any).alternativeText || (d as any).attributes?.alternativeText || '';
  }
  return '';
}

function mediaUrl(media: StrapiMedia | StrapiMediaFlat | undefined): string {
  const url = getUrlFromMedia(media);
  return resolveMediaUrl(url);
}

function mediaUrls(media: StrapiMediaArray | StrapiMediaFlat[] | undefined): string[] {
  if (!media) return [];
  if (Array.isArray(media)) {
    return media.map(m => resolveMediaUrl(getUrlFromMedia(m))).filter(Boolean);
  }
  if (typeof media === 'object' && 'data' in media) {
    const d = (media as any).data;
    if (Array.isArray(d)) {
      return d.map((m: any) => resolveMediaUrl(getUrlFromMedia(m))).filter(Boolean);
    }
    if (d && typeof d === 'object') {
      const url = resolveMediaUrl(getUrlFromMedia(d));
      return url ? [url] : [];
    }
  }
  if (typeof media === 'object' && ('url' in media || 'attributes' in media)) {
    const url = resolveMediaUrl(getUrlFromMedia(media));
    return url ? [url] : [];
  }
  return [];
}

/** Single media objects of a media field (v5 flat, v5 array or v4 wrapped). */
function mediaList(media: unknown): unknown[] {
  if (!media) return [];
  if (Array.isArray(media)) return media;
  if (typeof media === 'object' && 'data' in media) {
    const d = (media as { data: unknown }).data;
    if (Array.isArray(d)) return d;
    return d ? [d] : [];
  }
  return [media];
}

/**
 * Responsive sources (Strapi `formats`) of every image in the given media
 * fields, keyed by the same resolved URL the view model carries. Undefined
 * when no image has formats.
 */
function collectImageSources(...fields: unknown[]): ResponsiveImageMap | undefined {
  const map: ResponsiveImageMap = {};
  for (const field of fields) {
    for (const m of mediaList(field)) {
      const url = resolveMediaUrl(getUrlFromMedia(m));
      const sources = responsiveImageFromMedia(m, resolveMediaUrl);
      if (url && sources) map[url] = sources;
    }
  }
  return Object.keys(map).length > 0 ? map : undefined;
}

export interface StrapiRelation<T> {
  data: StrapiItem<T> | null;
}

// ---------- attribute shapes (Strapi v5) ----------

export interface CategoryAttributes {
  name: string;
  slug: string;
  color?: string;
}

export interface TagItemAttributes {
  label?: string;
  /**
   * Temporary expand/contract bridge: the pre-migration API returns dual
   * `label_es`/`label_en` fields, and an entry's own-locale value always
   * lives in the `_es` column. Remove once the backend contract deploy is
   * stable in production.
   */
  label_es?: string;
}

export interface ContactInfoAttributes {
  phoneCountryCode?: string;
  phoneNumber?: string;
  whatsappCountryCode?: string;
  whatsappNumber?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
}

export interface GeoPointAttributes {
  geoPoint?: { lat?: number; lng?: number };
}

export interface HoursAttributes {
  text?: string;
  /** Temporary expand/contract bridge (see TagItemAttributes.label_es). */
  text_es?: string;
}

export interface AmenityItemAttributes {
  label?: string;
  content?: string;
  /** Temporary expand/contract bridge (see TagItemAttributes.label_es). */
  label_es?: string;
}

export interface RecommendationItemAttributes {
  label?: string;
  description?: string;
}

/**
 * Legacy pre-migration shape of `listing.recommendations`: a single
 * visit-info component with fixed dual fields instead of flexible items.
 * As with all dual-field components, an entry's own-locale values live in
 * the `_es` columns. Temporary bridge until the backend contract deploy is
 * stable in production.
 */
export interface LegacyVisitInfoAttributes {
  bestTime_es?: string;
  bring_es?: string;
  accessibilityNotes_es?: string;
  connectivityNotes_es?: string;
}

const LEGACY_REC_LABELS = {
  'es-MX': {
    bestTime: 'Mejor época para visitar',
    bring: 'Qué llevar',
    accessibility: 'Accesibilidad',
    connectivity: 'Conectividad',
  },
  en: {
    bestTime: 'Best time to visit',
    bring: 'What to bring',
    accessibility: 'Accessibility',
    connectivity: 'Connectivity',
  },
} as const;

function legacyVisitInfoToItems(
  v: LegacyVisitInfoAttributes,
  locale: string,
): RecommendationItemAttributes[] {
  const labels = locale.startsWith('en') ? LEGACY_REC_LABELS.en : LEGACY_REC_LABELS['es-MX'];
  return [
    { label: labels.bestTime, description: v.bestTime_es },
    { label: labels.bring, description: v.bring_es },
    { label: labels.accessibility, description: v.accessibilityNotes_es },
    { label: labels.connectivity, description: v.connectivityNotes_es },
  ].filter((r) => strFallback(r.description, '') !== '');
}

function normalizeRecommendations(
  raw: ListingAttributes['recommendations'],
  locale: string,
): RecommendationItemAttributes[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return legacyVisitInfoToItems(raw, locale);
}

export interface ListingAttributes {
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string | any[];
  mainImage?: StrapiMedia;
  gallery?: StrapiMediaArray;
  logo?: StrapiMediaArray;
  price?: string;
  isFeatured?: boolean;
  category?: StrapiRelation<CategoryAttributes>;
  tags?: TagItemAttributes[];
  contact?: ContactInfoAttributes;
  location?: GeoPointAttributes;
  schedule?: HoursAttributes;
  amenities?: AmenityItemAttributes[];
  recommendations?: RecommendationItemAttributes[] | LegacyVisitInfoAttributes;
  // Contract §5 additions. `community` arrives as the §9 populate subset
  // (name, slug, color, textColor + badgeIcon media).
  community?: StrapiRelation<Partial<CommunityAttributes>> | StrapiItem<Partial<CommunityAttributes>>;
  hideContact?: boolean;
  // Strapi v4 wraps relations as `{ data: [...] }`; Strapi v5 returns a bare
  // array / object. The transformer handles both shapes via `relationArray`.
  relatedListings?: { data: StrapiItem<ListingAttributes>[] } | StrapiItem<ListingAttributes>[];
  members?: { data: StrapiItem<CommunityMemberAttributes>[] } | StrapiItem<CommunityMemberAttributes>[];
  stories?: StoryBlockAttributes[];
  products?: ProductItemAttributes[];
}

/**
 * Normalise Strapi v4 (`{ data: [...] }`) and v5 (bare array) relation shapes.
 * Returns `undefined` when the input is empty so callers can skip rendering.
 */
function relationArray<T>(raw: unknown): T[] | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)) {
    const data = (raw as { data: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return undefined;
}

export interface SocialLinkAttributes {
  platform: 'whatsapp' | 'phone' | 'email' | 'instagram' | 'facebook' | 'tiktok' | 'web';
  handle?: string;
  url?: string;
}

export interface StoryBlockAttributes {
  title?: string | { 'es-MX': string; en: string };
  narrative?: string | any[];
  highlightQuote?: string | { 'es-MX': string; en: string };
  era?: string;
  theme?: string;
  storyteller?: string;
  image?: StrapiMedia;
  gallery?: StrapiMediaArray;
}

export interface ProductItemAttributes {
  name?: string | { 'es-MX': string; en: string };
  description?: string | { 'es-MX': string; en: string };
}

export interface CommunityMemberAttributes {
  name: string;
  slug: string;
  role?: string | { 'es-MX': string; en: string };
  /**
   * Strapi `richtext` field. At runtime it arrives as an array of rich-text
   * blocks (flattened via `asString`), a plain string, or — defensively — a
   * LocalizedString object. The type includes all three shapes.
   */
  bio?: string | { 'es-MX': string; en: string } | any[];
  pullQuote?: string | { 'es-MX': string; en: string };
  photo?: StrapiMedia;
  gallery?: StrapiMediaArray;
  contact?: ContactInfoAttributes;
  // Repeatable social component (platform/handle/url), populated by detail
  // fetches; used as the phone/whatsapp fallback when contact is absent.
  social?: SocialLinkAttributes[];
  listings?: { data: StrapiItem<ListingAttributes>[] };
  relatedMembers?: { data: StrapiItem<CommunityMemberAttributes>[] };
  legacyNote?: string | { 'es-MX': string; en: string };
  isFeatured?: boolean;
  order?: number;
  // Contract §6 additions.
  community?: StrapiRelation<Partial<CommunityAttributes>> | StrapiItem<Partial<CommunityAttributes>>;
  shortDescription?: string | { 'es-MX': string; en: string };
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
  centerPoint?: GeoPointAttributes;
  zoom?: number;
}

export interface CtaSectionAttributes {
  title?: string;
  description?: string;
  buttonLabel?: string;
  buttonLink?: string;
}

export interface HomepageAttributes {
  hero?: HeroSectionAttributes;
  highlightsHeader?: SectionHeaderAttributes;
  highlights?: HighlightCardAttributes[];
  quickFactsHeader?: SectionHeaderAttributes;
  quickFacts?: QuickFactAttributes[];
  quickFactsImage1?: StrapiMedia;
  quickFactsImage2?: StrapiMedia;
  mapSection?: MapSectionAttributes;
  finalCta?: CtaSectionAttributes;
  /** Contract §8. */
  regionMapImage?: StrapiMedia;
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

function localized(value: string | { 'es-MX': string; en: string } | null | undefined, locale: string = 'es-MX'): LocalizedString {
  if (Array.isArray(value)) {
    const text = asString(value);
    return { 'es-MX': text, en: text };
  }
  if (value && typeof value === 'object') {
    return { 'es-MX': (value as any)['es-MX'] || (value as any).es || '', en: (value as any).en || '' };
  }
  const v = (value as string) || '';
  return { 'es-MX': v, en: v };
}

function normalizeLocation(raw: any): any {
  if (!raw) return undefined;

  if (raw.attributes != null) {
    return normalizeLocation(raw.attributes);
  }

  const coords = raw.geoPoint ?? { lat: raw.lat, lng: raw.lng };
  const numLat = Number(coords.lat);
  const numLng = Number(coords.lng);

  if (isNaN(numLat) || isNaN(numLng)) return undefined;
  return {
    lat: numLat,
    lng: numLng,
  };
}

function resolveMediaUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STRAPI_BASE_URL}${url}`;
}

// ---------- transformers ----------

export function transformCategory(item: StrapiItem<CategoryAttributes>): Category {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.slug);
  return {
    id,
    slug: a.slug,
    name: localized(a.name),
    color: a.color,
  };
}

/**
 * Build a `CommunityRef` from a community slug, completing empty identity
 * fields from the per-slug fixture (contract encoding). Unknown slugs yield
 * a ref with empty strings rather than undefined so CMS-only communities
 * still render.
 */
function communityRefFromSlug(slug: string, locale: string): CommunityRef | undefined {
  if (!slug) return undefined;
  const l = locale.startsWith('en') ? 'en' : 'es-MX';
  const fixture = getCommunityBySlug(slug);
  return {
    slug: slug as CommunityRef['slug'],
    name: fixture?.name[l] || '',
    color: fixture?.color || '',
    textColor: fixture?.textColor || '',
    badgeIcon: fixture?.iconPath || '',
  };
}

/**
 * Map a `community` relation (contract §9 populate subset: name, slug,
 * color, textColor + badgeIcon) to a `CommunityRef`, completing empty
 * fields from the per-slug fixture. Absent/empty relation → undefined.
 */
function communityRefFromRelation(raw: unknown, locale: string): CommunityRef | undefined {
  if (raw == null) return undefined;
  const item =
    typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)
      ? ((raw as { data: unknown }).data as StrapiItem<Partial<CommunityAttributes>> | null)
      : (raw as StrapiItem<Partial<CommunityAttributes>>);
  if (!item) return undefined;

  const a = unwrap(item) || {};
  const slug = a.slug || '';
  if (!slug) return undefined;

  const ref = communityRefFromSlug(slug, locale);
  const badgeIconUrl = mediaUrl(a.badgeIcon as StrapiMedia | undefined);
  return {
    slug: ref!.slug,
    name: pickLocalized(a.name, locale) || ref!.name,
    color: (a.color || '').trim() || ref!.color,
    textColor: (a.textColor || '').trim() || ref!.textColor,
    badgeIcon: badgeIconUrl || ref!.badgeIcon || '',
  };
}

export function transformListing(
  item: StrapiItem<ListingAttributes>,
  locale: string = 'es-MX',
  esItem?: StrapiItem<ListingAttributes> | null,
): Listing {
  const a = unwrap(item);
  const esAttrs = esItem ? unwrap(esItem) : null;
  const id = String(item.id ?? item.documentId ?? a.slug);
  const slug = a.slug;
  const mainImageUrl = mediaUrl(a.mainImage);
  const galleryUrls = mediaUrls(a.gallery);
  const logoUrls = mediaUrls(a.logo);
  const storiesRaw = a.stories || [];
  const productsRaw = a.products || [];
  const membersRaw = relationArray<StrapiItem<CommunityMemberAttributes>>(a.members) ?? [];
  const esMembersRaw = relationArray<StrapiItem<CommunityMemberAttributes>>(esAttrs?.members) ?? [];
  const relatedRaw = relationArray<StrapiItem<ListingAttributes>>(a.relatedListings) ?? [];

  // Localized listing components (tags, schedule, amenities, recommendations)
  // arrive as single-locale values. EN entries may have empty component
  // arrays — same policy as stories/products: fall back to the ES entry's
  // values, wholesale when the EN array is empty, per-item otherwise.
  // During the expand/contract window the API may still return the legacy
  // dual-field shapes; the `?? _es` bridges below keep both deploy orders
  // safe until the backend contract is stable in production.
  const tagsRaw = a.tags?.length ? a.tags : esAttrs?.tags || [];
  const amenitiesRaw = a.amenities?.length ? a.amenities : esAttrs?.amenities || [];
  const recItems = normalizeRecommendations(a.recommendations, locale);
  const esRecItems = normalizeRecommendations(esAttrs?.recommendations, 'es-MX');
  const recommendationsRaw = recItems.length ? recItems : esRecItems;

  // Extract category relation - handle both Strapi v4 wrapped {data: ...} and v5 flat format
  const catRaw = a.category as any;
  const catItem: StrapiItem<CategoryAttributes> | null | undefined =
    catRaw && 'data' in catRaw ? (catRaw.data ?? null) : catRaw;

  const contact = normalizeContact(a.contact);
  const derivedSocial = contactToSocialLinks(contact);

  // Contract §5: community relation (fixture-completed). hideContact comes
  // only from the listing flag — the migration sets it for services, and
  // deriving it from the category would stop editors from overriding it.
  const community = communityRefFromRelation(a.community, locale);
  const hideContact = a.hideContact === true;

  return {
    id,
    slug,
    name: localized(a.title, locale),
    shortDescription: a.shortDescription ? localized(a.shortDescription, locale) : undefined,
    description: a.description ? localized(asString(a.description), locale) : undefined,
    categoryId: catItem ? (unwrap(catItem) as any).slug || '' : '',
    category: catItem ? transformCategory(catItem) : undefined,
    community,
    hideContact,
    tags: tagsRaw.map((t, i) =>
      strFallback(t.label || t.label_es, esAttrs?.tags?.[i]?.label || esAttrs?.tags?.[i]?.label_es),
    ),
    location: normalizeLocation(a.location),
    contact,
    pricing: a.price ? { price: a.price } : undefined,
    media: mainImageUrl || galleryUrls.length > 0 || logoUrls.length > 0
      ? { mainImageUrl, galleryUrls, logoUrls }
      : undefined,
    image: mainImageUrl,
    imageSources: collectImageSources(a.mainImage, a.gallery, ...storiesRaw.map((s) => s.image)),
    isFeatured: a.isFeatured,
    schedule: a.schedule || esAttrs?.schedule
      ? {
          text:
            strFallback(
              a.schedule?.text || a.schedule?.text_es,
              esAttrs?.schedule?.text || esAttrs?.schedule?.text_es,
            ) || undefined,
        }
      : undefined,
    amenities: amenitiesRaw.map((am, i) => transformAmenity(am, esAttrs?.amenities?.[i])),
    recommendations: recommendationsRaw.length
      ? recommendationsRaw.map((r, i) => transformRecommendation(r, esRecItems[i]))
      : undefined,
    relatedSites: relatedRaw.length
      ? relatedRaw.map((r) => String(r.id ?? r.documentId))
      : undefined,
    href: {
      'es-MX': navigation.siteDetail(slug, 'es-MX'),
      en: navigation.siteDetail(slug, 'en'),
    },
    members: membersRaw.length
      ? membersRaw.map((m, i) => transformCommunityMember(m, locale, esMembersRaw[i]))
      : undefined,
    stories: storiesRaw.length
      ? storiesRaw.map((s, i) => transformStory(s, locale, esAttrs?.stories?.[i]))
      : undefined,
    products: productsRaw.length
      ? productsRaw.map((p, i) => transformProduct(p, locale, esAttrs?.products?.[i]))
      : undefined,
    social: derivedSocial.length ? derivedSocial : undefined,
  };
}

function asString(value: string | LocalizedString | any[] | undefined): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value) && ('es-MX' in value || 'en' in value)) {
    return (value as LocalizedString)['es-MX'] || (value as LocalizedString).en || '';
  }
  if (Array.isArray(value)) {
    return value
      .map((block: any) => {
        if (typeof block === 'string') return block;
        return extractTextFromBlock(block);
      })
      .filter(Boolean)
      .join('\n\n');
  }
  return '';
}

function extractTextFromBlock(block: any): string {
  if (!block) return '';
  if (typeof block === 'string') return block;
  if (block.text !== undefined) return String(block.text ?? '');
  if (block.children) {
    return block.children.map(extractTextFromBlock).join('');
  }
  return '';
}

function strFallback(value: string | undefined, fallback: string | undefined): string {
  const v = (value || '').trim();
  return v || (fallback || '').trim();
}

function pickLocalized(
  value: string | { 'es-MX': string; en: string } | null | undefined,
  locale: string,
  fallback?: string | { 'es-MX': string; en: string } | null,
): string {
  const current = value && typeof value === 'object'
    ? (locale.startsWith('en') ? value.en : value['es-MX'])
    : (value || '');
  const fb = fallback && typeof fallback === 'object'
    ? (locale.startsWith('en') ? fallback.en : fallback['es-MX'])
    : (fallback || '');
  return strFallback(current, fb);
}

/**
 * Null-safe extraction of a localized text field that may be a plain string,
 * a LocalizedString object (`{ 'es-MX', en }`), or `null`.
 *
 * Strapi returns `null` for empty optional fields. The previous inline
 * pattern `typeof x === 'object' ? x[l] ... : ...` crashed on `null` because
 * `typeof null === 'object'` is true in JavaScript, so `null[l]` threw a
 * TypeError. This helper guards that whole class of crash while preserving
 * the existing behavior for string and object inputs: it picks the requested
 * locale slot and falls back to `es-MX`.
 */
function locText(value: any, l: string): string {
  if (value == null) return '';
  if (typeof value === 'object') return value[l] || value['es-MX'] || '';
  return String(value);
}

/**
 * Contract §5b: resolve `phone` / `whatsapp` to E.164 from the
 * `*CountryCode` + `*Number` fields only. The legacy free-text `phone` /
 * `whatsapp` fields are gone from the backend (contract §10), so there is no
 * fallback left; values that cannot be composed are dropped, and the raw
 * contract fields stay out of the view model.
 */
function normalizeContact(contact?: ContactInfoAttributes): ContactInfo | undefined {
  if (!contact) return undefined;
  const { phoneCountryCode, phoneNumber, whatsappCountryCode, whatsappNumber, ...rest } = contact;
  return {
    ...rest,
    phone: composePhone(phoneCountryCode, phoneNumber),
    whatsapp: composePhone(whatsappCountryCode, whatsappNumber),
  };
}

/**
 * Convert a listing's normalized `contact` (see `normalizeContact`) into SocialLink entries so a
 * single `item.social` array feeds every UI surface (cards, detail page,
 * "Follow us" block). Empty / falsy values are skipped. The `handle` and
 * `url` fields are accepted as either bare handles/usernames (no leading @)
 * or full URLs — the URL is synthesized with a sensible platform prefix
 * when only the handle is provided.
 *
 *   - `whatsapp` → `https://wa.me/52XXXXXXXXXX` (handle `+52 XXX XXX XXXX`)
 *   - `phone`    → `tel:+52XXXXXXXXXX`         (handle `+52 XXX XXX XXXX`)
 *   - `email`    → `mailto:<email>`
 *   - `instagram`→ `https://instagram.com/<handle>`
 *   - `facebook` → `https://facebook.com/<handle or URL>`
 *   - `tiktok`   → `https://tiktok.com/@<handle>`
 *   - `website`  → URL as-is
 */
function contactToSocialLinks(contact?: ContactInfo): SocialLinkAttributes[] {
  if (!contact) return [];
  const out: SocialLinkAttributes[] = [];

  const whatsappUrl = whatsappHref(contact.whatsapp);
  if (whatsappUrl) {
    out.push({ platform: 'whatsapp', handle: formatPhone(contact.whatsapp), url: whatsappUrl });
  }

  const phoneUrl = telHref(contact.phone);
  if (phoneUrl) {
    out.push({ platform: 'phone', handle: formatPhone(contact.phone), url: phoneUrl });
  }

  const email = (contact.email || '').trim();
  if (email) {
    out.push({
      platform: 'email',
      handle: email,
      url: `mailto:${email}`,
    });
  }

  const instagram = (contact.instagram || '').trim();
  if (instagram) {
    const handle = instagram.replace(/^@/, '');
    out.push({
      platform: 'instagram',
      handle,
      url: instagram.startsWith('http')
        ? instagram
        : `https://instagram.com/${handle}`,
    });
  }

  const facebook = (contact.facebook || '').trim();
  if (facebook) {
    out.push({
      platform: 'facebook',
      handle: facebook,
      url: facebook.startsWith('http')
        ? facebook
        : `https://facebook.com/${facebook}`,
    });
  }

  const tiktok = (contact.tiktok || '').trim();
  if (tiktok) {
    const handle = tiktok.replace(/^@/, '');
    out.push({
      platform: 'tiktok',
      handle,
      url: tiktok.startsWith('http') ? tiktok : `https://tiktok.com/@${handle}`,
    });
  }

  const website = (contact.website || '').trim();
  if (website) {
    out.push({
      platform: 'web',
      url: website.startsWith('http') ? website : `https://${website}`,
    });
  }

  return out;
}

export function transformStory(
  raw: StoryBlockAttributes,
  locale: string = 'es-MX',
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
  locale: string = 'es-MX',
  esRaw?: ProductItemAttributes,
): ProductItem {
  return {
    name: pickLocalized(raw.name, locale, esRaw?.name),
    description: pickLocalized(raw.description, locale, esRaw?.description) || undefined,
  };
}

export function transformAmenity(
  raw: AmenityItemAttributes,
  esRaw?: AmenityItemAttributes,
): AmenityItem {
  return {
    label: strFallback(raw.label || raw.label_es, esRaw?.label || esRaw?.label_es),
    content: strFallback(raw.content, esRaw?.content) || undefined,
  };
}

export function transformRecommendation(
  raw: RecommendationItemAttributes,
  esRaw?: RecommendationItemAttributes,
): RecommendationItem {
  return {
    label: strFallback(raw.label, esRaw?.label),
    description: strFallback(raw.description, esRaw?.description) || undefined,
  };
}

export function transformCommunityMemberSummary(
  item: StrapiItem<CommunityMemberAttributes>,
  locale: string = 'es-MX',
): CommunityMemberSummary {
  const a = unwrap(item);
  const id = String(item.id ?? item.documentId ?? a.slug);
  return {
    id,
    slug: a.slug,
    name: a.name || '',
    role: pickLocalized(a.role, locale) || undefined,
    // `bio` is a Strapi rich-text field → flatten via asString (same as the
    // full transformCommunityMember); pickLocalized can't handle block arrays.
    bio: asString(a.bio) || undefined,
    pullQuote: pickLocalized(a.pullQuote, locale) || undefined,
    legacyNote: pickLocalized(a.legacyNote, locale) || undefined,
    photo: mediaUrl(a.photo) || undefined,
  };
}

export function transformCommunityMember(
  item: StrapiItem<CommunityMemberAttributes>,
  locale: string = 'es-MX',
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

  // Contract §6: members get their community only from the relation
  // (the deprecated `locality` fallback was removed in the contract phase).
  const community = communityRefFromRelation(a.community, locale);

  // Phone/whatsapp (contract §5b): E.164 from the contact component; when
  // it has none, fall back to the social links with the matching platform,
  // normalized with the same rules.
  const contact = normalizeContact(a.contact);
  const derivedSocial = contactToSocialLinks(contact);
  const rawSocial = Array.isArray(a.social) ? a.social : [];
  const fromSocial = (platform: 'phone' | 'whatsapp'): string | undefined => {
    const link = rawSocial.find((s) => s.platform === platform);
    return normalizePhone(link?.handle) ?? normalizePhone(link?.url);
  };
  const phone = contact?.phone ?? fromSocial('phone');
  const whatsapp = contact?.whatsapp ?? fromSocial('whatsapp');

  return {
    id,
    slug: a.slug,
    name: a.name || '',
    role: pickLocalized(a.role, locale, es?.role) || undefined,
    community,
    shortDescription: pickLocalized(a.shortDescription, locale) || undefined,
    phone,
    whatsapp,
    // `bio` is a Strapi rich-text field, so it goes through `asString` (which
    // flattens rich-text blocks) rather than `pickLocalized`. Each item is
    // already fetched per-locale, so flattening yields the correct language;
    // `es?.bio` provides the ES fallback when the localized bio is empty.
    bio: strFallback(asString(a.bio), asString(es?.bio)),
    pullQuote: pickLocalized(a.pullQuote, locale, es?.pullQuote) || undefined,
    legacyNote: pickLocalized(a.legacyNote, locale, es?.legacyNote) || undefined,
    photo: mediaUrl(a.photo) || undefined,
    galleryUrls: mediaUrls(a.gallery),
    imageSources: collectImageSources(a.photo, a.gallery),
    social: derivedSocial,
    listingSlugs,
    relatedMembers,
    isFeatured: a.isFeatured,
    order: a.order,
  };
}


export function transformSiteContent(item: StrapiItem<SiteContentAttributes>, locale: string = 'es-MX'): SiteContent {
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

export function transformHomepage(item: StrapiItem<HomepageAttributes>, locale: string = 'es-MX'): HomepageData {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';

  const hero = a.hero || {};
  const heroImagesRaw: any[] = (
    Array.isArray(hero.images)
      ? hero.images
      : hero.images?.data || []
  ) as any[];

  const highlightsHeader = a.highlightsHeader || {};
  const highlightsItems = (a.highlights || []).map((h: any) => ({
    title: localized(h.title, locale)[l],
    description: localized(h.description, locale)[l],
    image: resolveMediaUrl(getUrlFromMedia(h.image)),
    alt: getAltFromMedia(h.image),
    link: h.link || undefined,
  }));

  const quickFactsHeader = a.quickFactsHeader || {};
  const quickFactsItems = (a.quickFacts || []).map((q: any) => ({
    title: localized(q.title, locale)[l],
    value: localized(q.value, locale)[l],
    description: localized(q.description, locale)[l],
  }));
  const quickFactsImages = [
    resolveMediaUrl(getUrlFromMedia(a.quickFactsImage1)),
    resolveMediaUrl(getUrlFromMedia(a.quickFactsImage2)),
  ];

  const mapSection = a.mapSection || {};
  const mapImage = resolveMediaUrl(getUrlFromMedia(mapSection.image));

  const finalCta = a.finalCta || {};

  return {
    hero: {
      title: localized(hero.title, locale)[l],
      titleHighlight: localized(hero.titleHighlight, locale)[l],
      description: localized(hero.description, locale)[l],
      ctaLabel: localized(hero.ctaLabel, locale)[l],
      ctaLink: hero.ctaLink || '/sitios',
      images: heroImagesRaw.map((img: any) => ({
        url: resolveMediaUrl(getUrlFromMedia(img)),
        alt: getAltFromMedia(img),
      })),
    },
    highlights: {
      header: {
        title: localized(highlightsHeader.title, locale)[l],
        subtitle: localized(highlightsHeader.subtitle, locale)[l],
      },
      items: highlightsItems,
    },
    quickFacts: {
      header: {
        title: localized(quickFactsHeader.title, locale)[l],
        subtitle: localized(quickFactsHeader.subtitle, locale)[l],
      },
      items: quickFactsItems,
      images: quickFactsImages,
    },
    mapSection: {
      title: localized(mapSection.title, locale)[l],
      description: localized(mapSection.description, locale)[l],
      buttonLabel: localized(mapSection.buttonLabel, locale)[l],
      buttonUrl: mapSection.buttonUrl || '',
      image: mapImage,
      alt: getAltFromMedia(mapSection.image),
      centerPoint: (() => {
        const cp = mapSection.centerPoint?.geoPoint;
        if (cp?.lat != null && cp?.lng != null) return { lat: cp.lat, lng: cp.lng };
        return undefined;
      })(),
      zoom: mapSection.zoom,
    },
    regionMapImage: resolveMediaUrl(getUrlFromMedia(a.regionMapImage)) || undefined,
    regionMapImageAlt: getAltFromMedia(a.regionMapImage) || undefined,
    finalCta: {
      title: localized(finalCta.title, locale)[l],
      description: localized(finalCta.description, locale)[l],
      buttonLabel: localized(finalCta.buttonLabel, locale)[l],
      buttonLink: finalCta.buttonLink || '#',
    },
  };
}

// ---------- community ----------

/**
 * Raw shape of `api::community.community` (contract §4). The FE reads
 * listings/members through their own `community` relations, so the inverse
 * relations are not part of this view.
 */
export interface CommunityAttributes {
  name?: string | { 'es-MX': string; en: string };
  slug: string;
  tagline?: string | { 'es-MX': string; en: string };
  description?: string | { 'es-MX': string; en: string };
  order?: number;
  color?: string;
  textColor?: string;
  badgeIcon?: StrapiMedia;
  heroImage?: StrapiMedia;
  location?: GeoPointAttributes;
  googleMapsUrl?: string;
  historyHeader?: SectionHeaderAttributes;
  historyMilestones?: Array<{ year?: string; text?: string | { 'es-MX': string; en: string } }>;
  historyText?: string | { 'es-MX': string; en: string };
  touristMapImage?: StrapiMedia;
  touristMapCaption?: string | { 'es-MX': string; en: string };
  highlightsHeader?: SectionHeaderAttributes;
  highlights?: HighlightCardAttributes[];
  quickFactsHeader?: SectionHeaderAttributes;
  quickFacts?: QuickFactAttributes[];
  gallery?: StrapiMediaArray;
  finalCta?: CtaSectionAttributes;
}

/**
 * Per-community landscape fallback for `community.heroImage` when the CMS
 * media is empty: the coastal sign for Puerto Agua Verde and the sierra /
 * desert landscape for Rancho San Cosme — the same photos the current home
 * fallback uses for each community.
 */
export const COMMUNITY_HERO_FALLBACK: Record<string, string> = {
  'puerto-agua-verde': '/images/PAV-Letrero-.webp',
  'rancho-san-cosme': '/images/pav-landscape-12.webp',
};

function toSectionHeader(
  raw: SectionHeaderAttributes | undefined,
  locale: string,
  l: string,
): { title: string; subtitle: string } | undefined {
  if (!raw) return undefined;
  return {
    title: localized(raw.title, locale)[l],
    subtitle: localized(raw.subtitle, locale)[l],
  };
}

/**
 * Map a `community` item to the `Community` view model for one locale.
 *
 * Merge policy (contract encoding): a non-empty CMS value always wins; for
 * empty identity fields (name, color, textColor, order, location, tagline,
 * badgeIcon) the per-slug fixture from `src/data/communities.ts` completes
 * the value. An empty `heroImage` falls back to the per-community landscape
 * above. Communities whose slug is not in the fixtures map as-is (no crash);
 * their `badgeIcon`/`heroImage` stay empty for the UI to handle.
 */
export function transformCommunity(
  item: StrapiItem<CommunityAttributes>,
  locale: string = 'es-MX',
): Community {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';
  const id = String(item.id ?? item.documentId ?? a.slug);
  const fixture = getCommunityBySlug(a.slug);

  const name = pickLocalized(a.name, locale) || fixture?.name[l] || '';
  const heroFromCms = mediaUrl(a.heroImage);

  return {
    id,
    // Runtime may carry slugs beyond the union (unknown CMS entries).
    slug: a.slug as Community['slug'],
    name,
    tagline: pickLocalized(a.tagline, locale) || fixture?.tagline[l] || undefined,
    description: pickLocalized(a.description, locale) || undefined,
    order: a.order ?? fixture?.order ?? 0,
    color: (a.color || '').trim() || fixture?.color || '',
    textColor: (a.textColor || '').trim() || fixture?.textColor || '',
    badgeIcon: mediaUrl(a.badgeIcon) || fixture?.iconPath || '',
    heroImage: heroFromCms || COMMUNITY_HERO_FALLBACK[a.slug] || undefined,
    location: normalizeLocation(a.location) ?? fixture?.location,
    googleMapsUrl: a.googleMapsUrl || undefined,
    historyHeader: toSectionHeader(a.historyHeader, locale, l),
    historyMilestones: (a.historyMilestones || []).map((m) => ({
      year: m.year || '',
      text: locText(m.text, l),
    })),
    historyText: pickLocalized(a.historyText, locale) || undefined,
    touristMapImage: a.touristMapImage ? mediaUrl(a.touristMapImage) : undefined,
    touristMapCaption: pickLocalized(a.touristMapCaption, locale) || undefined,
    highlightsHeader: toSectionHeader(a.highlightsHeader, locale, l),
    highlights: (a.highlights || []).map((h) => ({
      title: localized(h.title, locale)[l],
      description: localized(h.description, locale)[l],
      image: mediaUrl(h.image),
      alt: getAltFromMedia(h.image),
      link: h.link || undefined,
    })),
    quickFactsHeader: toSectionHeader(a.quickFactsHeader, locale, l),
    quickFacts: (a.quickFacts || []).map((q) => ({
      title: localized(q.title, locale)[l],
      value: localized(q.value, locale)[l],
      description: localized(q.description, locale)[l],
    })),
    gallery: mediaUrls(a.gallery),
    finalCta: a.finalCta
      ? {
          title: localized(a.finalCta.title, locale)[l],
          description: localized(a.finalCta.description, locale)[l],
          buttonLabel: localized(a.finalCta.buttonLabel, locale)[l],
          buttonLink: a.finalCta.buttonLink || '#',
        }
      : undefined,
    imageSources: collectImageSources(a.heroImage, a.gallery, ...(a.highlights || []).map((h) => h.image)),
  };
}

// ---------- good practices page ----------

/** Mirrors the new `campaign.campaign-block` component (contract §7). */
export interface CampaignBlockAttributes {
  title?: string | { 'es-MX': string; en: string };
  description?: string | { 'es-MX': string; en: string };
  logo?: StrapiMedia;
  url?: string;
  linkLabel?: string | { 'es-MX': string; en: string };
}

/**
 * Raw shape of the `api::good-practices-page.good-practices-page` single
 * type (contract §7). List fields come from `guide.text-list-item` and are
 * flattened to plain strings.
 */
export interface GoodPracticesPageAttributes {
  hero?: HeroSectionAttributes;
  intro?: SectionHeaderAttributes;
  protectedArea?: {
    title?: string | { 'es-MX': string; en: string };
    text?: string | { 'es-MX': string; en: string };
    linkLabel?: string | { 'es-MX': string; en: string };
    linkHref?: string;
  };
  anpMapImage?: StrapiMedia;
  conanpUrl?: string;
  influenceHeader?: SectionHeaderAttributes;
  influenceText?: string | { 'es-MX': string; en: string };
  fishingHeader?: SectionHeaderAttributes;
  fishingText?: string | { 'es-MX': string; en: string };
  fishingRules?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  fishingRefugeMapImage?: StrapiMedia;
  recommendationsHeader?: SectionHeaderAttributes;
  recommendations?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  tipsHeader?: SectionHeaderAttributes;
  tips?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  campaign?: CampaignBlockAttributes;
  finalCta?: CtaSectionAttributes;
}

/**
 * Map the good-practices single type to its view model. Pure mapping only —
 * the guide-content fallback policy lives in the fetcher
 * (`src/lib/cms/goodPractices.ts`). A hero without a title maps to null so
 * the fetcher can detect the "section empty" case.
 */
export function transformGoodPracticesPage(
  item: StrapiItem<GoodPracticesPageAttributes>,
  locale: string = 'es-MX',
): GoodPracticesPage {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';

  const hero = a.hero || {};
  const heroImagesRaw: any[] = (
    Array.isArray(hero.images)
      ? hero.images
      : hero.images?.data || []
  ) as any[];
  const heroTitle = localized(hero.title, locale)[l];

  return {
    hero: heroTitle
      ? {
          title: heroTitle,
          titleHighlight: localized(hero.titleHighlight, locale)[l],
          description: localized(hero.description, locale)[l],
          ctaLabel: localized(hero.ctaLabel, locale)[l],
          ctaLink: hero.ctaLink || '',
          images: heroImagesRaw.map((img: any) => ({
            url: resolveMediaUrl(getUrlFromMedia(img)),
            alt: getAltFromMedia(img),
          })),
        }
      : null,
    intro: toSectionHeader(a.intro, locale, l) ?? null,
    protectedArea: a.protectedArea
      ? {
          title: localized(a.protectedArea.title, locale)[l],
          text: localized(a.protectedArea.text, locale)[l] || undefined,
          linkLabel: localized(a.protectedArea.linkLabel, locale)[l] || undefined,
          linkHref: a.protectedArea.linkHref || undefined,
        }
      : null,
    anpMapImage: a.anpMapImage ? mediaUrl(a.anpMapImage) : undefined,
    conanpUrl: a.conanpUrl || undefined,
    influenceHeader: toSectionHeader(a.influenceHeader, locale, l) ?? null,
    influenceText: localized(a.influenceText, locale)[l] || undefined,
    fishingHeader: toSectionHeader(a.fishingHeader, locale, l) ?? null,
    fishingText: localized(a.fishingText, locale)[l] || undefined,
    fishingRules: (a.fishingRules || []).map((r) => locText(r.text, l)),
    fishingRefugeMapImage: a.fishingRefugeMapImage ? mediaUrl(a.fishingRefugeMapImage) : undefined,
    recommendationsHeader: toSectionHeader(a.recommendationsHeader, locale, l) ?? null,
    recommendations: (a.recommendations || []).map((r) => locText(r.text, l)),
    tipsHeader: toSectionHeader(a.tipsHeader, locale, l) ?? null,
    tips: (a.tips || []).map((r) => locText(r.text, l)),
    campaign: a.campaign
      ? {
          title: localized(a.campaign.title, locale)[l],
          description: localized(a.campaign.description, locale)[l] || undefined,
          logo: a.campaign.logo ? mediaUrl(a.campaign.logo) : undefined,
          url: a.campaign.url || undefined,
          linkLabel: localized(a.campaign.linkLabel, locale)[l] || undefined,
        }
      : null,
    finalCta: a.finalCta
      ? {
          title: localized(a.finalCta.title, locale)[l],
          description: localized(a.finalCta.description, locale)[l],
          buttonLabel: localized(a.finalCta.buttonLabel, locale)[l],
          buttonLink: a.finalCta.buttonLink || '#',
        }
      : null,
  };
}

