/**
 * Global site settings.
 * This structure mirrors what we expect to receive from Strapi's "Global" single type.
 * Falls back to local defaults when CMS is unavailable.
 */
import { getGlobalSettings } from "@/lib/cms";
import type { GlobalSettings } from "@/types/site-content.type";

export const siteSettings: GlobalSettings = {
  contact: {
    email: "info@guiacomunidadesloretanas.com",
    phone: "+52 614 123 4567",
    phoneRaw: "+526141234567",
    whatsapp: "526141234567",
    address: "Puerto Agua Verde, BCS, México",
  },
  social: {
    instagram: "https://instagram.com/guiacomunidadesloretanas",
    facebook: "https://facebook.com/guiacomunidadesloretanas",
    googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde",
  },
  metadata: {
    siteName: "Puerto Agua Verde",
    defaultTitle: "Puerto Agua Verde - Community Directory",
    defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme.",
  },
  seo: {
    keywords: "BCS, Puerto Agua Verde, Rancho San Cosme, Directorio, Turismo, Servicios",
    ogImage: "",
    ogUrl: "https://guiacomunidadesloretanas.com",
    author: "ODCenteno",
    themeColor: "#5A8A80",
  },
  branding: {
    logoImage: "",
    logoShortName: "Agua Verde",
  },
};

/**
 * Helper to get settings. Fetches from Strapi with fallback to local settings.
 */
export async function getSiteSettings(): Promise<GlobalSettings> {
  try {
    const globalSettings = await getGlobalSettings();
    if (globalSettings) {
      return globalSettings;
    }
  } catch (error) {
    console.warn('[siteSettings] Failed to fetch from Strapi, using defaults:', error);
  }
  return siteSettings;
}
