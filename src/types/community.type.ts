import type { Location, SocialLink } from './common.type';
import type { CtaData, HighlightCard, QuickFact, SectionHeader } from './homepage.type';

export type StoryTheme = 'origin' | 'craft' | 'legacy' | 'sustainability' | 'community';

/** Slugs of the `api::community.community` collection type. */
export type CommunitySlug = 'puerto-agua-verde' | 'rancho-san-cosme';

/**
 * Subset of a community populated on listings and community members
 * (populate fields: name, slug, color, textColor, badgeIcon).
 */
export interface CommunityRef {
  slug: CommunitySlug;
  name: string;
  /** Hex. Large surfaces, icons and borders (>= 3:1 on white). */
  color: string;
  /** Hex. Small text and tags (>= 4.5:1 on white, WCAG AA). */
  textColor: string;
  /** Absolute media URL. When empty the FE falls back to the bundled icon. */
  badgeIcon?: string;
}

/** Mirrors the `guide.milestone` component, resolved for one locale. */
export interface CommunityHistoryMilestone {
  year: string;
  text: string;
}

/**
 * `api::community.community`, resolved for one locale (like HomepageData).
 * Inverse relations (listings, members) are not part of this view model;
 * they are fetched through listings/members filtered by community slug.
 */
export interface Community extends CommunityRef {
  id: string;
  tagline?: string;
  description?: string;
  order: number;
  heroImage?: string;
  location?: Location;
  googleMapsUrl?: string;
  historyHeader?: SectionHeader;
  historyMilestones: CommunityHistoryMilestone[];
  historyText?: string;
  touristMapImage?: string;
  touristMapCaption?: string;
  /** Rendered as "Experiencias destacadas". */
  highlightsHeader?: SectionHeader;
  highlights: HighlightCard[];
  quickFactsHeader?: SectionHeader;
  quickFacts: QuickFact[];
  /** Photos only. */
  gallery: string[];
  /** Links to the other community. */
  finalCta?: CtaData;
}

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

export interface AmenityItem {
  label: string;
  content?: string;
}

export interface RecommendationItem {
  label: string;
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
  bio?: string;
  pullQuote?: string;
  legacyNote?: string;
  photo?: string;
}

export interface CommunityMember extends CommunityMemberSummary {
  community?: CommunityRef;
  /** Plain text, max 200 characters. */
  shortDescription?: string;
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
