import type { CtaData, HeroData, SectionHeader } from './homepage.type';

/** Mirrors the new `campaign.campaign-block` component. */
export interface CampaignBlock {
  title: string;
  description?: string;
  /** Absolute media URL. */
  logo?: string;
  url?: string;
  linkLabel?: string;
}

/** Mirrors the `guide.protected-link` component. */
export interface ProtectedAreaBlock {
  title: string;
  text?: string;
  linkLabel?: string;
  linkHref?: string;
}

/**
 * `api::good-practices-page.good-practices-page` single type, resolved for one
 * locale. Served at /buenas-practicas (es) and /en/buenas-practicas (en).
 * List fields (`fishingRules`, `recommendations`, `tips`) come from the
 * `guide.text-list-item` component and are flattened to plain strings.
 */
export interface GoodPracticesPage {
  hero: HeroData | null;
  intro: SectionHeader | null;
  protectedArea: ProtectedAreaBlock | null;
  anpMapImage?: string;
  conanpUrl?: string;
  influenceHeader: SectionHeader | null;
  influenceText?: string;
  fishingHeader: SectionHeader | null;
  fishingText?: string;
  fishingRules: string[];
  fishingRefugeMapImage?: string;
  recommendationsHeader: SectionHeader | null;
  recommendations: string[];
  tipsHeader: SectionHeader | null;
  tips: string[];
  campaign: CampaignBlock | null;
  finalCta: CtaData | null;
}
