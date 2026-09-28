/**
 * Category definitions for the redesign data contract.
 * Canonical spec: docs/contracts/redesign-data-contract.md
 *
 * Contract phase (§10/§11): the legacy category slugs (`sites`,
 * `accommodation`, `restaurants`) and the `community-member.locality` →
 * `community.slug` mapping are gone. Categories are now exactly
 * `experiences`, `gastronomy`, `services`, `crafts`, and members get their
 * community only from the `community` relation.
 */
import type { LocalizedString } from '../types/i18n.type';
import type { CurrentCategorySlug } from '../types/category.type';

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

/** Normalizes a current category slug; undefined if unknown. */
export function toCurrentCategorySlug(slug: string): CurrentCategorySlug | undefined {
  if ((CURRENT_CATEGORY_SLUGS as readonly string[]).includes(slug)) return slug as CurrentCategorySlug;
  return undefined;
}
