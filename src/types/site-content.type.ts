import type { LocalizedString } from './i18n.type';

export interface SiteContent {
  id: string;
  documentId?: string;
  key: string; // e.g. "about-intro", "guide-hero"
  title: LocalizedString;
  text: LocalizedString;
  order?: number;
  /**
   * Free-form JSON for structured content that doesn't fit the simple
   * title/text fields — used for about-values, guide-directions,
   * guide-amenities, etc.
   */
  extraData?: Record<string, any> | null;
}
