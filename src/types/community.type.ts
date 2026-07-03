import type { SocialLink } from './common.type';

export type StoryTheme = 'origin' | 'craft' | 'legacy' | 'sustainability' | 'community';

export type Locality = 'agua-verde' | 'rancho-san-cosme';

export interface StoryBlock {
  title: string;
  narrative: string;
  highlightQuote?: string;
  era?: string;
  theme?: StoryTheme;
  storyteller?: string;
  imageUrl?: string;
  galleryUrls: string[];
}

export interface ProductItem {
  name: string;
  description?: string;
}

export interface RelatedMemberRef {
  id: string;
  name: string;
  slug?: string;
  legacyNote?: string;
}

export interface CommunityMemberSummary {
  id: string;
  slug: string;
  name: string;
  role?: string;
  pullQuote?: string;
  legacyNote?: string;
  photo?: string;
}

export interface CommunityMember extends CommunityMemberSummary {
  locality?: Locality;
  bio?: string;
  galleryUrls: string[];
  social: SocialLink[];
  phone?: string;
  whatsapp?: string;
  listingSlugs: string[];
  relatedMembers: RelatedMemberRef[];
  isFeatured?: boolean;
  order?: number;
}
