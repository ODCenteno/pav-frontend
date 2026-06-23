export interface HeroData {
  title: string;
  titleHighlight: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  images: { url: string; alt: string }[];
}

export interface SectionHeader {
  title: string;
  subtitle: string;
}

export interface DestinationStory {
  title: string;
  text: string;
  image: string;
  alt: string;
}

export interface HighlightCard {
  title: string;
  description: string;
  image: string;
  alt: string;
  link?: string;
}

export interface QuickFact {
  title: string;
  value: string;
  description: string;
}

export interface MapSectionData {
  title: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
  image: string;
  alt?: string;
}

export interface CtaData {
  title: string;
  description: string;
  buttonLabel: string;
  buttonLink: string;
}

export interface HomepageData {
  hero: HeroData;
  destinations: {
    header: SectionHeader;
    items: DestinationStory[];
  };
  highlights: {
    header: SectionHeader;
    items: HighlightCard[];
  };
  quickFacts: {
    header: SectionHeader;
    items: QuickFact[];
    images: string[];
  };
  mapSection: MapSectionData;
  finalCta: CtaData;
}

export interface FooterData {
  aboutTitle: string;
  aboutText: string;
  thanks: string;
  rights: string;
  legal: string;
  contactTitle: string;
  note: string;
}
