/**
 * Maps utilities - build Google Maps embed URLs from listing data.
 *
 * The Strapi `locationURL` field (when present) holds a full Google Maps
 * embed URL like `https://www.google.com/maps/embed?pb=...`. When absent
 * we generate one from the listing's lat/lng so the iframe still works.
 *
 * Returns `undefined` when there is neither a stored URL nor valid
 * coordinates, so callers can hide the map container entirely.
 */

export interface MapsLocation {
  lat?: number;
  lng?: number;
}

export function buildMapsEmbedUrl(
  location: MapsLocation | undefined | null,
  locationURL: string | undefined | null,
  locale: string = "es"
): string | undefined {
  if (locationURL && locationURL.trim().length > 0) {
    return locationURL;
  }

  if (location?.lat != null && location?.lng != null) {
    const lang = locale.toLowerCase().startsWith("en") ? "en" : "es";
    return `https://www.google.com/maps?q=${location.lat},${location.lng}&hl=${lang}&z=14&output=embed`;
  }

  return undefined;
}
