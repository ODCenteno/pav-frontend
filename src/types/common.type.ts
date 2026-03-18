import type { LocalizedString } from './i18n.type';


export interface Location {
  lat: number;
  lng: number;
  address: LocalizedString;
  locality?: string;
  name?: string;
  googleMapsUrl?: string;
  openStreetMapUrl?: string;
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
  price?: string | number; // Fallback for fixed display prices
  priceRange?: 1 | 2 | 3 | 4;
}

export interface Media {
  mainImageUrl?: string;
  galleryUrls: string[];
}

export interface Schedule {
  isAlwaysOpen?: boolean;
  text?: LocalizedString;
}

export interface Recommendations {
  bestTimeToVisit?: LocalizedString;
  whatToBring?: LocalizedString[];
  accessibilityNotes?: LocalizedString;
  connectivityNotes?: LocalizedString;
}
