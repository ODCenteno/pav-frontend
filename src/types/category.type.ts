import type { LocalizedString } from './i18n.type';

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  color?: string;
  order?: number;
}