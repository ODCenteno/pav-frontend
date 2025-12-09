import type { LocalizedString } from './i18n.type';
import type { Category, ListingType } from './category.type';
import type { Location, ContactInfo, Pricing, Media } from './common.type';
import type { OrganizationMeta } from './organization.type';

export interface Listing {
  id: string;
  type: ListingType; // 'commerce' | 'service' | 'poi' | 'organization'
  slug: string;

  name: LocalizedString;
  shortDescription?: LocalizedString;
  description?: LocalizedString;

  categoryId: string;
  category?: Category; // opcional, si haces el join en frontend
  tags?: LocalizedString[];

  location?: Location;
  contact?: ContactInfo;
  pricing?: Pricing;
  media?: Media;

  isFeatured?: boolean;
  status?: 'published' | 'draft';

  organizationMeta?: OrganizationMeta;
}
