import type { LocalizedString } from './i18n.type';
import type { Category } from './category.type';
import type { Location, ContactInfo, Pricing, Media, Schedule, SocialLink } from './common.type';
import type { ResponsiveImageMap } from '../utils/responsiveImage';
import type { CommunityMember, CommunityRef, StoryBlock, ProductItem, AmenityItem, RecommendationItem } from './community.type';

export interface Listing {
  id: string;
  slug: string;

  name: LocalizedString;
  shortDescription?: LocalizedString;
  description?: LocalizedString;

  categoryId: string;
  category?: Category;
  tags?: string[];

  location?: Location;
  contact?: ContactInfo;
  pricing?: Pricing;
  media?: Media;

  /** Drives the home carousel. */
  isFeatured?: boolean;

  community?: CommunityRef;
  /** When true the UI hides contact info (default for the `services` category). */
  hideContact?: boolean;

  type?: string;

  image?: string;
  /** Strapi `formats` of main, gallery and story images, keyed by URL. */
  imageSources?: ResponsiveImageMap;

  schedule?: Schedule;
  amenities?: AmenityItem[];
  recommendations?: RecommendationItem[];
  relatedSites?: string[];

  href?: {
    'es-MX': string;
    en: string;
  };

  members?: CommunityMember[];
  stories?: StoryBlock[];
  products?: ProductItem[];
  social?: SocialLink[];
}