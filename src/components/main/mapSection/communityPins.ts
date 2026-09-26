/**
 * Home map pins (contract §8): one per community, from `community.location`,
 * each linking to its community page.
 */
import type { Community } from "@/types/community.type";
import type { MarkerItem } from "@/components/maps/mapIcons";
import { communityPath } from "@/utils/navigation";

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
