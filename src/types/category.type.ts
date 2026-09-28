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
 * One category per listing. The legacy pre-redesign slugs (`sites`,
 * `accommodation`, `restaurants`) are gone as of the contract (cleanup) phase.
 */
export type CurrentCategorySlug = 'experiences' | 'gastronomy' | 'services' | 'crafts';
