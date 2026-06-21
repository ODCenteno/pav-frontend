import type { LocalizedString } from './i18n.type';
import type { Category } from './category.type';
import type { Location, ContactInfo, Pricing, Media, Schedule, Recommendations } from './common.type';
import type { OrganizationMeta } from './organization.type';

export interface Listing {
  id: string;
  slug: string;

  name: LocalizedString;
  shortDescription?: LocalizedString;
  description?: LocalizedString;

  categoryId: string; // matches category.slug
  category?: Category;
  tags?: LocalizedString[];

  location?: Location;
  locationURL?: string;
  contact?: ContactInfo;
  pricing?: Pricing;
  media?: Media;

  isFeatured?: boolean;
  status?: 'published' | 'draft';

  image?: string; // legacy field, prefer media.mainImageUrl
  organizationMeta?: OrganizationMeta;

  // New fields for detail page
  schedule?: Schedule;
  amenities?: LocalizedString[];
  recommendations?: Recommendations;
  relatedSites?: string[];
  order?: number;

  // Localized URLs calculated during transformation
  href?: {
    es: string;
    en: string;
  };
}
