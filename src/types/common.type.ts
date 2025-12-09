import type { LocalizedString } from './i18n.type';


export interface Location {
  lat: number;
  lng: number;
  address: LocalizedString;
  locality?: string;
}

export interface ContactInfo {
  whatsapp?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

export interface Pricing {
  min?: number;
  max?: number;
  currency?: 'MXN' | 'USD';
}

export interface Media {
  mainImageUrl?: string;
  galleryUrls: string[];
}
