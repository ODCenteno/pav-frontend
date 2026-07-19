import type { LocalizedString } from './i18n.type';
import type { Category } from './category.type';
import type { Location, ContactInfo, Pricing, Media, Schedule, Recommendations, SocialLink } from './common.type';
import type { CommunityMemberSummary, StoryBlock, ProductItem } from './community.type';

export interface Listing {
  id: string;
  slug: string;

  name: LocalizedString;
  shortDescription?: LocalizedString;
  description?: LocalizedString;

  categoryId: string;
  category?: Category;
  tags?: LocalizedString[];

  location?: Location;
  contact?: ContactInfo;
  pricing?: Pricing;
  media?: Media;

  isFeatured?: boolean;

  image?: string;

  schedule?: Schedule;
  amenities?: LocalizedString[];
  recommendations?: Recommendations;
  relatedSites?: string[];

  href?: {
    es: string;
    en: string;
  };

  members?: CommunityMemberSummary[];
  stories?: StoryBlock[];
  products?: ProductItem[];
  social?: SocialLink[];
}