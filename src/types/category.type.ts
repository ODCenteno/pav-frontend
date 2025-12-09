import type { LocalizedString } from './i18n.type';

export type ListingType = 'commerce' | 'service' | 'poi' | 'organization' | 'mixed';

export interface Category {
  id: string;
  slug: string;
  type: ListingType;
  name: LocalizedString;
  description?: LocalizedString;
  icon?: string;
  color?: string;
  order?: number;
}
