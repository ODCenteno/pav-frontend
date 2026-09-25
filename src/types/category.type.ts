import type { LocalizedString } from './i18n.type';

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  color?: string;
  order?: number;
}

/**
 * Category slugs of the redesign (see docs/contracts/redesign-data-contract.md).
 * One category per listing.
 */
export type CurrentCategorySlug = 'experiences' | 'gastronomy' | 'services' | 'crafts';

/**
 * Pre-redesign slugs. Still valid in Strapi until the contract (cleanup)
 * phase; the migration maps them to a CurrentCategorySlug.
 */
export type LegacyCategorySlug = 'sites' | 'accommodation' | 'restaurants';

export type CategorySlug = CurrentCategorySlug | LegacyCategorySlug;
