import type { LocalizedString } from './i18n.type';

export interface TeamMember {
  id: string;
  name: string;
  role: LocalizedString;
  shortBio?: LocalizedString;
  photo?: string;
  links?: {
    email?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  order?: number;
  isFeatured?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type?: 'community' | 'institution' | 'partner' | 'collective' | 'business';
  shortDescription?: LocalizedString;
  logo?: string;
  links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  order?: number;
  isFeatured?: boolean;
}

export interface AboutPageViewModel {
  hero: {
    title: string;
    description: string;
    image?: string;
  };
  intro: {
    title: string;
    text: string;
  };
  mission: {
    title: string;
    text: string;
  };
  vision: {
    title: string;
    text: string;
  };
  values: {
    title: string;
    items: string[];
  };
  community: {
    title: string;
    text: string;
  };
  collaboration: {
    title: string;
    text: string;
    primaryAction?: {
      label: string;
      href: string;
    };
    secondaryAction?: {
      label: string;
      href: string;
    };
  };
  cta: {
    title: string;
    description: string;
    buttonLabel: string;
    href: string;
  };
}
