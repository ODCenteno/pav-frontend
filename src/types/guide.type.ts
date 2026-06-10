import type { LocalizedString } from './i18n.type';

export interface RouteInfo {
  label: LocalizedString;
  desc: LocalizedString;
  distance: string;
  time: string;
  image: string;
}

export interface AmenityItem {
  icon: 'wifi' | 'signal' | 'toilet' | 'parking' | 'water';
  title: LocalizedString;
  text: LocalizedString;
}

export interface HistoryMilestone {
  year: string;
  text: LocalizedString;
}

export interface ProtectedLink {
  label: LocalizedString;
  href: string;
}

export interface GuideViewModel {
  hero: {
    title: LocalizedString;
    desc: LocalizedString;
    image: string;
  };
  intro: {
    ranchTitle: LocalizedString;
    ranchText: LocalizedString;
    portTitle: LocalizedString;
    portText: LocalizedString;
  };
  history: {
    title: LocalizedString;
    text: LocalizedString;
    milestones: HistoryMilestone[];
  };
  fishing: {
    title: LocalizedString;
    text: LocalizedString;
    rules: LocalizedString[];
  };
  protected: {
    title: LocalizedString;
    text: LocalizedString;
    link: ProtectedLink;
  };
  influence: {
    title: LocalizedString;
    text: LocalizedString;
  };
  recommendations: {
    title: LocalizedString;
    items: LocalizedString[];
  };
  directions: {
    title: LocalizedString;
    loreto: RouteInfo;
    laPaz: RouteInfo;
    drivingTipsTitle: LocalizedString;
    drivingTips: LocalizedString[];
  };
  amenities: {
    title: LocalizedString;
    items: AmenityItem[];
  };
  touristMap: {
    title: LocalizedString;
    image: string;
    caption: LocalizedString;
  };
  cta: {
    title: LocalizedString;
    desc: LocalizedString;
    btn: LocalizedString;
  };
}
