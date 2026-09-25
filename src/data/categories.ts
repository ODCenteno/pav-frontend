/**
 * Category and community mappings for the redesign data contract.
 * Canonical spec: docs/contracts/redesign-data-contract.md
 *
 * LEGACY_CATEGORY_MAP and LOCALITY_TO_COMMUNITY are the data the backend
 * migration script uses; keep them in sync with the contract doc.
 */
import type { LocalizedString } from '../types/i18n.type';
import type { CurrentCategorySlug, LegacyCategorySlug } from '../types/category.type';
import type { CommunitySlug, Locality } from '../types/community.type';

export interface CategoryDefinition {
  slug: CurrentCategorySlug;
  name: LocalizedString;
  order: number;
  /** Listings in this category hide contact info (`listing.hideContact`). */
  hideContact: boolean;
}

export const categories: readonly CategoryDefinition[] = [
  {
    slug: 'experiences',
    name: { 'es-MX': 'Experiencias turísticas comunitarias', en: 'Community tourism experiences' },
    order: 1,
    hideContact: false,
  },
  {
    slug: 'gastronomy',
    name: { 'es-MX': 'Gastronomía regional', en: 'Regional gastronomy' },
    order: 2,
    hideContact: false,
  },
  {
    slug: 'services',
    name: { 'es-MX': 'Servicios', en: 'Services' },
    order: 3,
    hideContact: true,
  },
  {
    slug: 'crafts',
    name: { 'es-MX': 'Artesanías y productos locales', en: 'Crafts and local products' },
    order: 4,
    hideContact: false,
  },
];

export const CURRENT_CATEGORY_SLUGS: readonly CurrentCategorySlug[] = categories.map((c) => c.slug);

export const HIDE_CONTACT_CATEGORY_SLUGS: readonly CurrentCategorySlug[] = categories
  .filter((c) => c.hideContact)
  .map((c) => c.slug);

/** Legacy slugs stay valid until the contract (cleanup) phase. */
export const LEGACY_CATEGORY_MAP: Readonly<Record<LegacyCategorySlug, CurrentCategorySlug>> = {
  sites: 'experiences',
  accommodation: 'experiences',
  restaurants: 'gastronomy',
};

export const LEGACY_CATEGORY_SLUGS = Object.keys(LEGACY_CATEGORY_MAP) as LegacyCategorySlug[];

/** `community-member.locality` (deprecated enum) → `community.slug`. */
export const LOCALITY_TO_COMMUNITY: Readonly<Record<Locality, CommunitySlug>> = {
  'agua-verde': 'puerto-agua-verde',
  'rancho-san-cosme': 'rancho-san-cosme',
};

/** Normalizes a current or legacy slug to a current one; undefined if unknown. */
export function toCurrentCategorySlug(slug: string): CurrentCategorySlug | undefined {
  if ((CURRENT_CATEGORY_SLUGS as readonly string[]).includes(slug)) return slug as CurrentCategorySlug;
  return LEGACY_CATEGORY_MAP[slug as LegacyCategorySlug];
}
