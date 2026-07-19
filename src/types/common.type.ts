import type { LocalizedString } from './i18n.type';


export interface Location {
  lat: number;
  lng: number;
}

export interface ContactInfo {
  whatsapp?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
}

export interface Pricing {
  price?: string | number;
}

export interface Media {
  mainImageUrl?: string;
  galleryUrls: string[];
}

export interface Schedule {
  text?: LocalizedString;
}

export interface Recommendations {
  bestTimeToVisit?: LocalizedString;
  whatToBring?: LocalizedString[];
  accessibilityNotes?: LocalizedString;
  connectivityNotes?: LocalizedString;
}

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'whatsapp' | 'web' | 'other';
  handle?: string;
  url?: string;
}