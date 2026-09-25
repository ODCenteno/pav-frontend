import { getCommunityBySlug } from "@/data/communities";
import type { Location } from "@/types/common.type";

/**
 * CMS `community.location`, or the bundled fixture coordinates while the
 * community collection type is not reachable.
 */
export function resolveCommunityLocation(community: { slug: string; location?: Location }): Location | undefined {
  return community.location ?? getCommunityBySlug(community.slug)?.location;
}

/**
 * "Get directions" target: the editor's `googleMapsUrl` when set, otherwise
 * a Google Maps directions URL built from the coordinates.
 */
export function buildDirectionsUrl(community: { googleMapsUrl?: string; location?: Location }): string | undefined {
  const url = community.googleMapsUrl?.trim();
  if (url) return url;
  const { location } = community;
  if (!location) return undefined;
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
}
