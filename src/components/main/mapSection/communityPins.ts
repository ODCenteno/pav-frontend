/**
 * Home map pins (contract §8): one per community, from `community.location`,
 * each linking to its community page.
 */
import type { Community } from "@/types/community.type";
import type { MarkerItem } from "@/components/maps/mapIcons";
import { communityPath } from "@/utils/navigation";
import { buildDirectionsUrl, resolveCommunityLocation } from "@/components/community-page/directions";

export function communityMapMarkers(communities: Community[], locale: string): MarkerItem[] {
  return communities.flatMap((community) => {
    const { location } = community;
    if (location?.lat == null || location?.lng == null) return [];
    return [
      {
        lat: location.lat,
        lng: location.lng,
        title: community.name,
        href: communityPath(community.slug, locale),
        categoryColor: community.color,
        description: community.tagline,
        image: community.heroImage,
      },
    ];
  });
}

export interface CommunityMapLink {
  slug: string;
  name: string;
  /** Google Maps: the editor's `googleMapsUrl`, or directions from the coordinates. */
  href: string;
  community: Community;
}

/**
 * One Google Maps link per community (home map buttons and legend), in
 * community order. The location falls back to the bundled fixture; a
 * community with neither a URL nor coordinates is skipped.
 */
export function communityMapLinks(communities: Community[]): CommunityMapLink[] {
  return [...communities]
    .sort((a, b) => a.order - b.order)
    .flatMap((community) => {
      const href = buildDirectionsUrl({
        googleMapsUrl: community.googleMapsUrl,
        location: resolveCommunityLocation(community),
      });
      return href ? [{ slug: community.slug, name: community.name, href, community }] : [];
    });
}
