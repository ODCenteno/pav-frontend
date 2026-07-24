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
  if ('data' in media && Array.isArray(media.data)) {
    return media.data.map((m: any) => resolveMediaUrl(getUrlFromMedia(m))).filter(Boolean);
  }
  return [];
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
  label_es?: string;
  label_en?: string;
}

export interface ContactInfoAttributes {
  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
}

export interface GeoPointAttributes {
  geoPoint?: { lat?: number; lng?: number };
}

export interface HoursAttributes {
  text_es?: string;
  text_en?: string;
}

export interface VisitInfoAttributes {
  bestTime_es?: string;
  bestTime_en?: string;
  bring_es?: string;
  bring_en?: string;
  accessibilityNotes_es?: string;
  accessibilityNotes_en?: string;
  connectivityNotes_es?: string;
  connectivityNotes_en?: string;
}

export interface LocalizedTextAttributes {
  text_es?: string;
  text_en?: string;
}

export interface LinksAttributes {
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
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
  category?: StrapiRelation<CategoryAttributes>;
  tags?: TagItemAttributes[];
  contact?: ContactInfoAttributes;
  location?: GeoPointAttributes;
  schedule?: HoursAttributes;
  amenities?: TagItemAttributes[];
  recommendations?: VisitInfoAttributes;
  // Strapi v4 wraps relations as `{ data: [...] }`; Strapi v5 returns a bare
  // array / object. The transformer handles both shapes via `relationArray`.
  relatedListings?: { data: StrapiItem<ListingAttributes>[] } | StrapiItem<ListingAttributes>[];
  members?: { data: StrapiItem<CommunityMemberAttributes>[] } | StrapiItem<CommunityMemberAttributes>[];
  stories?: StoryBlockAttributes[];
  products?: ProductItemAttributes[];
  social?: SocialLinkAttributes[];
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
  platform: string;
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
  locality?: string;
  bio?: string | any[];
  pullQuote?: string | { 'es-MX': string; en: string };
  photo?: StrapiMedia;
  gallery?: StrapiMediaArray;
  social?: SocialLinkAttributes[];
  phone?: string;
  whatsapp?: string;
  listings?: { data: StrapiItem<ListingAttributes>[] };
  relatedMembers?: { data: StrapiItem<CommunityMemberAttributes>[] };
  legacyNote?: string | { 'es-MX': string; en: string };
  isFeatured?: boolean;
  order?: number;
}

export interface TeamMemberAttributes {
  name: string;
  role?: LocalizedTextAttributes;
  shortBio?: LocalizedTextAttributes;
  photo?: StrapiMedia;
  links?: LinksAttributes;
  order?: number;
  isFeatured?: boolean;
}

export interface OrganizationAttributes {
  name: string;
  type?: 'community' | 'institution' | 'partner' | 'collective' | 'business';
  shortDescription?: LocalizedTextAttributes;
  logo?: StrapiMedia;
  links?: LinksAttributes;
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
  return { 'es-MX': String(es ?? ''), en: String(en ?? '') };
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
  return es.map((item, i) => ({ 'es-MX': item, en: en[i] ?? item }));
}

/**
 * Build a LocalizedString[] from locale-suffixed text fields where each line
 * is a separate item (one item per line).
 */
function textLinesToLocalized(obj: any, key: string): LocalizedString[] | undefined {
  if (!obj) return undefined;
  const esText = obj[`${key}_es`] || '';
  const enText = obj[`${key}_en`] || esText;
  const esLines = esText.split('\n').map((s: string) => s.trim()).filter(Boolean);
  const enLines = enText.split('\n').map((s: string) => s.trim()).filter(Boolean);
  if (esLines.length === 0) return undefined;
  return esLines.map((item: string, i: number) => ({ 'es-MX': item, en: enLines[i] ?? item }));
}

/**
 * Convert a LocalizedText component ({ text_es, text_en }) to a LocalizedString.
 */
function fromLocalizedText(comp: any): LocalizedString | undefined {
  if (!comp) return undefined;
  const es = comp.text_es || '';
  const en = comp.text_en || es;
  if (!es && !en) return undefined;
  return { 'es-MX': es, en };
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
  const storiesRaw = a.stories || [];
  const productsRaw = a.products || [];
  const membersRaw = relationArray<StrapiItem<CommunityMemberAttributes>>(a.members) ?? [];
  const relatedRaw = relationArray<StrapiItem<ListingAttributes>>(a.relatedListings) ?? [];

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
    tags: (a.tags || []).map((t) => localized({ es: t.label_es || '', en: t.label_en || t.label_es || '' }, locale)),
    location: normalizeLocation(a.location),
    contact: a.contact,
    pricing: a.price ? { price: a.price } : undefined,
    media: mainImageUrl || galleryUrls.length > 0
      ? { mainImageUrl, galleryUrls }
      : undefined,
    image: mainImageUrl,
    isFeatured: a.isFeatured,
    schedule: a.schedule
      ? {
          text: localeSuffixed(a.schedule, 'text'),
        }
      : undefined,
    amenities: (a.amenities || []).map((t) => localized({ 'es-MX': t.label_es || '', en: t.label_en || t.label_es || '' }, locale)),
    recommendations: a.recommendations
      ? {
          bestTimeToVisit: localeSuffixed(a.recommendations, 'bestTime'),
          whatToBring: textLinesToLocalized(a.recommendations, 'bring'),
          accessibilityNotes: localeSuffixed(a.recommendations, 'accessibilityNotes'),
          connectivityNotes: localeSuffixed(a.recommendations, 'connectivityNotes'),
        }
      : undefined,
    relatedSites: relatedRaw.length
      ? relatedRaw.map((r) => String(r.id ?? r.documentId))
      : undefined,
    href: {
      'es-MX': navigation.siteDetail(slug, 'es-MX'),
      en: navigation.siteDetail(slug, 'en'),
    },
    members: membersRaw.length
      ? membersRaw.map((m) => transformCommunityMemberSummary(m, locale))
      : undefined,
    stories: storiesRaw.length
      ? storiesRaw.map((s, i) => transformStory(s, locale, esAttrs?.stories?.[i]))
      : undefined,
    products: productsRaw.length
      ? productsRaw.map((p, i) => transformProduct(p, locale, esAttrs?.products?.[i]))
      : undefined,
    social: (() => {
      // Merge explicit `social` entries with any contact-derived links so a
      // listing always surfaces every reachable handle in one place.
      //   - Empty explicit entries (handle=null AND url=null) are dropped so
      //     stale placeholders from prior CMS edits don't render empty icons.
      //   - Dedup by (platform, resolved-url) so a non-empty explicit entry
      //     for the same (platform, url) as a contact-derived entry wins and
      //     the duplicate is filtered out. Explicit entries are kept first.
      const explicit = (a.social ?? []).filter(
        (s) => !!(s?.handle?.trim() || s?.url?.trim()),
      );
      const contactDerived = contactToSocialLinks(a.contact);
      const merged = [...explicit, ...contactDerived];
      const seen = new Set<string>();
      const deduped = merged.filter((link) => {
        const resolved = (link.url || '').trim() || (link.handle || '').trim();
        const key = `${link.platform}::${resolved}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return deduped.length ? transformSocialLinks(deduped) : undefined;
    })(),
  };
}

function asString(value: string | any[] | undefined): string {
  if (typeof value === 'string') return value;
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

export function transformSocialLinks(raw: SocialLinkAttributes[]): SocialLink[] {
  return (raw || []).map((s) => ({
    platform: (s.platform as SocialLink['platform']) || 'other',
    handle: s.handle || undefined,
    url: s.url || undefined,
  }));
}

/**
 * Convert a listing's `contact` component fields into SocialLink entries so a
 * single `item.social` array feeds every UI surface (cards, detail page,
 * "Follow us" block). Empty / falsy values are skipped. The `handle` and
 * `url` fields are accepted as either bare handles/usernames (no leading @)
 * or full URLs — the URL is synthesized with a sensible platform prefix
 * when only the handle is provided.
 *
 *   - `whatsapp` → `https://wa.me/<digits>`
 *   - `phone`    → `tel:<digits>`
 *   - `email`    → `mailto:<email>`
 *   - `instagram`→ `https://instagram.com/<handle>`
 *   - `facebook` → `https://facebook.com/<handle or URL>`
 */
function contactToSocialLinks(contact?: ContactInfoAttributes): SocialLinkAttributes[] {
  if (!contact) return [];
  const out: SocialLinkAttributes[] = [];

  const whatsapp = (contact.whatsapp || '').trim();
  if (whatsapp) {
    const digits = whatsapp.replace(/\D/g, '');
    out.push({
      platform: 'whatsapp',
      handle: digits,
      url: `https://wa.me/${digits}`,
    });
  }

  const phone = (contact.phone || '').trim();
  if (phone) {
    out.push({
      platform: 'phone',
      handle: phone,
      url: `tel:${phone.replace(/\s+/g, '')}`,
    });
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
    role: fromLocalizedText(a.role) || { 'es-MX': '', en: '' },
    shortBio: fromLocalizedText(a.shortBio),
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
    shortDescription: fromLocalizedText(a.shortDescription),
    logo: mediaUrl(a.logo) || undefined,
    links: a.links,
    order: a.order,
    isFeatured: a.isFeatured,
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

  const destinationsHeader = a.destinationsHeader || {};
  const destinationsItems = (a.destinations || []).map((d: any) => ({
    title: localized(d.title, locale)[l],
    text: localized(d.text, locale)[l],
    image: resolveMediaUrl(getUrlFromMedia(d.image)),
    alt: getAltFromMedia(d.image),
  }));

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
    destinations: {
      header: {
        title: localized(destinationsHeader.title, locale)[l],
        subtitle: localized(destinationsHeader.subtitle, locale)[l],
      },
      items: destinationsItems,
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
    finalCta: {
      title: localized(finalCta.title, locale)[l],
      description: localized(finalCta.description, locale)[l],
      buttonLabel: localized(finalCta.buttonLabel, locale)[l],
      buttonLink: finalCta.buttonLink || '#',
    },
  };
}

// ---------- about page ----------

export interface AboutPageAttributes {
  internalLabel?: string;
  hero?: {
    title?: string | { 'es-MX': string; en: string };
    titleHighlight?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    ctaLabel?: string | { 'es-MX': string; en: string };
    ctaLink?: string;
    images?: any;
  };
  introTitle?: string | { 'es-MX': string; en: string };
  introText?: string | { 'es-MX': string; en: string };
  values?: {
    missionTitle?: string | { 'es-MX': string; en: string };
    missionText?: string | { 'es-MX': string; en: string };
    visionTitle?: string | { 'es-MX': string; en: string };
    visionText?: string | { 'es-MX': string; en: string };
    valuesTitle?: string | { 'es-MX': string; en: string };
    valuesItems?: Array<string | { 'es-MX': string; en: string }>;
  };
  communityTitle?: string | { 'es-MX': string; en: string };
  communityText?: string | { 'es-MX': string; en: string };
  collaboration?: {
    title?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    primaryButtonLabel?: string | { 'es-MX': string; en: string };
    primaryButtonLink?: string;
    secondaryButtonLabel?: string | { 'es-MX': string; en: string };
    secondaryButtonLink?: string;
  };
  finalCta?: {
    title?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    buttonLabel?: string | { 'es-MX': string; en: string };
    buttonLink?: string;
  };
}

export function transformAboutPage(item: StrapiItem<AboutPageAttributes>, locale: string = 'es-MX') {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';

  const hero = a.hero || {};
  const heroImagesRaw: any[] = (
    Array.isArray(hero.images)
      ? hero.images
      : hero.images?.data || []
  ) as any[];

  const values = a.values || {};

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
    intro: {
      title: localized(a.introTitle, locale)[l],
      text: localized(a.introText, locale)[l],
    },
    values: {
      mission: {
        title: localized(values.missionTitle, locale)[l],
        text: localized(values.missionText, locale)[l],
      },
      vision: {
        title: localized(values.visionTitle, locale)[l],
        text: localized(values.visionText, locale)[l],
      },
      values: {
        title: localized(values.valuesTitle, locale)[l],
        items: (values.valuesItems || []).map((item) =>
          typeof item === 'object' ? (item as any)[l] || (item as any)['es-MX'] || '' : item || ''
        ),
      },
    },
    community: {
      title: localized(a.communityTitle, locale)[l],
      text: localized(a.communityText, locale)[l],
    },
    collaboration: a.collaboration
      ? {
          title: localized(a.collaboration.title, locale)[l],
          desc: localized(a.collaboration.description, locale)[l],
          btnPrimary: localized(a.collaboration.primaryButtonLabel, locale)[l],
          btnSecondary: localized(a.collaboration.secondaryButtonLabel, locale)[l],
          links: {
            primary: a.collaboration.primaryButtonLink || '#',
            secondary: a.collaboration.secondaryButtonLink || '#',
          },
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

// ---------- guide page ----------

export interface GuidePageAttributes {
  internalLabel?: string;
  hero?: {
    title?: string | { 'es-MX': string; en: string };
    titleHighlight?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    ctaLabel?: string | { 'es-MX': string; en: string };
    ctaLink?: string;
    images?: any;
  };
  intro?: {
    ranchTitle?: string | { 'es-MX': string; en: string };
    ranchText?: string | { 'es-MX': string; en: string };
    portTitle?: string | { 'es-MX': string; en: string };
    portText?: string | { 'es-MX': string; en: string };
  };
  historyHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  historyMilestones?: Array<{ year?: string; text?: string | { 'es-MX': string; en: string } }>;
  historyText?: string | { 'es-MX': string; en: string };
  fishingHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  fishingText?: string | { 'es-MX': string; en: string };
  fishingRules?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  protectedArea?: {
    title?: string | { 'es-MX': string; en: string };
    text?: string | { 'es-MX': string; en: string };
    linkLabel?: string | { 'es-MX': string; en: string };
    linkHref?: string;
  };
  influenceHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  influenceText?: string | { 'es-MX': string; en: string };
  recommendationsHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  recommendations?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  directionsHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  directions?: Array<{
    label?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    distance?: string;
    time?: string;
    image?: any;
  }>;
  drivingTipsHeader?: string | { 'es-MX': string; en: string };
  drivingTips?: Array<{ text?: string | { 'es-MX': string; en: string } }>;
  amenitiesHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  amenities?: Array<{
    icon?: 'wifi' | 'signal' | 'toilet' | 'parking' | 'water';
    title?: string | { 'es-MX': string; en: string };
    text?: string | { 'es-MX': string; en: string };
  }>;
  touristMapHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  touristMapImage?: any;
  touristMapCaption?: string | { 'es-MX': string; en: string };
  finalCta?: {
    title?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    buttonLabel?: string | { 'es-MX': string; en: string };
    buttonLink?: string;
  };
}

export function transformGuidePage(item: StrapiItem<GuidePageAttributes>, locale: string = 'es-MX') {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';

  const hero = a.hero || {};
  const heroImagesRaw: any[] = (
    Array.isArray(hero.images)
      ? hero.images
      : hero.images?.data || []
  ) as any[];

  return {
    hero: {
      title: localized(hero.title, locale)[l],
      desc: localized(hero.description, locale)[l],
      image: heroImagesRaw[0]
        ? resolveMediaUrl(getUrlFromMedia(heroImagesRaw[0]))
        : '',
    },
    intro: a.intro
      ? {
          ranchTitle: localized(a.intro.ranchTitle, locale)[l],
          ranchText: localized(a.intro.ranchText, locale)[l],
          portTitle: localized(a.intro.portTitle, locale)[l],
          portText: localized(a.intro.portText, locale)[l],
        }
      : null,
    history: {
      title: localized(a.historyHeader?.title, locale)[l],
      text: localized(a.historyText, locale)[l],
      milestones: (a.historyMilestones || []).map((m) => ({
        year: m.year || '',
        'es-MX': typeof m.text === 'object' ? (m.text as any)['es-MX'] || '' : typeof m.text === 'string' ? m.text : '',
        en: typeof m.text === 'object' ? (m.text as any).en || (m.text as any)['es-MX'] || '' : typeof m.text === 'string' ? m.text : '',
      })),
    },
    fishing: {
      title: localized(a.fishingHeader?.title, locale)[l],
      text: localized(a.fishingText, locale)[l],
      rules: (a.fishingRules || []).map((r) =>
        typeof r.text === 'object' ? (r.text as any)[l] || (r.text as any)['es-MX'] || '' : r.text || ''
      ),
    },
    protected: a.protectedArea
      ? {
          title: localized(a.protectedArea.title, locale)[l],
          text: localized(a.protectedArea.text, locale)[l],
          linkLabel: localized(a.protectedArea.linkLabel, locale)[l],
          linkHref: a.protectedArea.linkHref || '#',
        }
      : null,
    influence: {
      title: localized(a.influenceHeader?.title, locale)[l],
      text: localized(a.influenceText, locale)[l],
    },
    recommendations: {
      title: localized(a.recommendationsHeader?.title, locale)[l],
      items: (a.recommendations || []).map((r) =>
        typeof r.text === 'object' ? (r.text as any)[l] || (r.text as any)['es-MX'] || '' : r.text || ''
      ),
    },
    directions: {
      title: localized(a.directionsHeader?.title, locale)[l],
      loreto: (() => {
        const r = (a.directions || [])[0];
        return r
          ? {
              label: typeof r.label === 'object' ? (r.label as any)[l] || (r.label as any)['es-MX'] || '' : r.label || '',
              desc: typeof r.description === 'object' ? (r.description as any)[l] || (r.description as any)['es-MX'] || '' : r.description || '',
              distance: r.distance || '',
              time: r.time || '',
              image: r.image ? resolveMediaUrl(getUrlFromMedia(r.image)) : '',
            }
          : { label: '', desc: '', distance: '', time: '', image: '' };
      })(),
      laPaz: (() => {
        const r = (a.directions || [])[1];
        return r
          ? {
              label: typeof r.label === 'object' ? (r.label as any)[l] || (r.label as any)['es-MX'] || '' : r.label || '',
              desc: typeof r.description === 'object' ? (r.description as any)[l] || (r.description as any)['es-MX'] || '' : r.description || '',
              distance: r.distance || '',
              time: r.time || '',
              image: r.image ? resolveMediaUrl(getUrlFromMedia(r.image)) : '',
            }
          : { label: '', desc: '', distance: '', time: '', image: '' };
      })(),
      drivingTipsTitle: localized(a.drivingTipsHeader, locale)[l],
      drivingTips: (a.drivingTips || []).map((t) =>
        typeof t.text === 'object' ? (t.text as any)[l] || (t.text as any)['es-MX'] || '' : t.text || ''
      ),
    },
    amenities: {
      title: localized(a.amenitiesHeader?.title, locale)[l],
      items: (a.amenities || []).map((am) => ({
        icon: am.icon || 'wifi',
        title: typeof am.title === 'object' ? (am.title as any)[l] || (am.title as any)['es-MX'] || '' : am.title || '',
        text: typeof am.text === 'object' ? (am.text as any)[l] || (am.text as any)['es-MX'] || '' : am.text || '',
      })),
    },
    touristMap: {
      title: localized(a.touristMapHeader?.title, locale)[l],
      image: a.touristMapImage ? resolveMediaUrl(getUrlFromMedia(a.touristMapImage)) : '',
      caption: localized(a.touristMapCaption, locale)[l],
    },
    cta: a.finalCta
      ? {
          title: localized(a.finalCta.title, locale)[l],
          desc: localized(a.finalCta.description, locale)[l],
          btn: localized(a.finalCta.buttonLabel, locale)[l],
        }
      : null,
  };
}

// ---------- experiences page ----------

export interface ExperiencesPageAttributes {
  internalLabel?: string;
  hero?: {
    title?: string | { 'es-MX': string; en: string };
    titleHighlight?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    ctaLabel?: string | { 'es-MX': string; en: string };
    ctaLink?: string;
    images?: any;
  };
  introHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  featuredHeader?: { title?: string | { 'es-MX': string; en: string }; subtitle?: string | { 'es-MX': string; en: string } };
  finalCta?: {
    title?: string | { 'es-MX': string; en: string };
    description?: string | { 'es-MX': string; en: string };
    buttonLabel?: string | { 'es-MX': string; en: string };
    buttonLink?: string;
  };
}

export function transformExperiencesPage(item: StrapiItem<ExperiencesPageAttributes>, locale: string = 'es-MX') {
  const a = unwrap(item);
  const l = locale.startsWith('en') ? 'en' : 'es-MX';

  const hero = a.hero || {};
  const heroImagesRaw: any[] = (
    Array.isArray(hero.images)
      ? hero.images
      : hero.images?.data || []
  ) as any[];

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
    introHeader: a.introHeader
      ? {
          title: localized(a.introHeader.title, locale)[l],
          subtitle: localized(a.introHeader.subtitle, locale)[l],
        }
      : null,
    featuredHeader: a.featuredHeader
      ? {
          title: localized(a.featuredHeader.title, locale)[l],
          subtitle: localized(a.featuredHeader.subtitle, locale)[l],
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
