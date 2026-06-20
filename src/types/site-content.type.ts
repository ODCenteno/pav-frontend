import type { LocalizedString } from './i18n.type';

export interface SiteContent {
  id: string;
  documentId?: string;
  key: string;
  title: LocalizedString;
  text: LocalizedString;
  order?: number;
  extraData?: Record<string, any> | null;
}

export interface LegalPage {
  id: string;
  documentId?: string;
  slug: string;
  title: LocalizedString;
  content: LocalizedString;
  publishedAt?: string;
}

export interface GlobalSettings {
  contact: {
    email: string;
    phone: string;
    phoneRaw: string;
    whatsapp: string;
    address: string;
  };
  social: {
    instagram: string;
    facebook: string;
    googleMaps: string;
  };
  metadata: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
  };
}
