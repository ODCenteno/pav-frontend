import type { LocalizedString } from './i18n.type';

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  description?: LocalizedString;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}
