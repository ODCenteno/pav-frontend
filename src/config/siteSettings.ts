/**
 * Global site settings.
 * This structure mirrors what we expect to receive from Strapi's "Global" single type.
 * Falls back to local defaults when CMS is unavailable.
 */
import { getGlobalSettings } from "@/lib/cms";

export const siteSettings = {
  contact: {
    email: "info@puertoaguaverde.mx",
    phone: "+52 614 123 4567",
    phoneRaw: "+526141234567",
    whatsapp: "526141234567",
    address: "Puerto Agua Verde, BCS, México",
  },
  social: {
    instagram: "https://instagram.com/puertoaguaverde",
    facebook: "https://facebook.com/puertoaguaverde",
    googleMaps: "https://maps.google.com/?q=Puerto+Agua+Verde",
  },
  metadata: {
    siteName: "Puerto Agua Verde",
    defaultTitle: "Puerto Agua Verde - Community Directory",
    defaultDescription: "Directory for services and points of interest in Puerto Agua Verde and Rancho San Cosme.",
  }
};

/**
 * Helper to get settings. Fetches from Strapi with fallback to local settings.
 */
export async function getSiteSettings() {
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
