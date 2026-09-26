/**
 * Pure helpers for the community page (brief C3 · F4). No Astro, no
 * navigation module: callers pass resolved URLs and labels in.
 */
import type { Community } from "@/types/community.type";
import type { CtaData, SectionHeader } from "@/types/homepage.type";
import type { Listing } from "@/types/listing.type";

/** Listings linked to the community through `listing.community` (contract §5). */
export function listingsForCommunity(listings: Listing[], slug: string): Listing[] {
  return listings.filter((l) => l.community?.slug === slug);
}

/** The first other community by `order`, target of the final CTA. */
export function otherCommunity(communities: Community[], slug: string): Community | undefined {
  return [...communities].sort((a, b) => a.order - b.order).find((c) => c.slug !== slug);
}

/** CMS section header, with a translated title when the CMS left it empty. */
export function sectionHeader(header: SectionHeader | undefined, fallbackTitle: string): SectionHeader {
  return {
    title: header?.title?.trim() || fallbackTitle,
    subtitle: header?.subtitle ?? "",
  };
}

const both = (value: string) => ({ "es-MX": value, en: value });

/**
 * Props for the reused `guide/GuideHistory` (which reads `{ 'es-MX', en }`
 * pairs). Null when the community has neither milestones nor text.
 */
export function historyProps(community: Community, fallbackTitle: string) {
  const text = community.historyText?.trim() || community.historyHeader?.subtitle?.trim() || "";
  if (community.historyMilestones.length === 0 && !text) return null;
  const { title } = sectionHeader(community.historyHeader, fallbackTitle);
  return {
    title: both(title),
    text: both(text),
    milestones: community.historyMilestones.map((m) => ({ year: m.year, ...both(m.text) })),
  };
}

/** The CMS final CTA, or the fallback link to the other community. */
export function finalCtaFor(community: Community, fallback: CtaData | null): CtaData | null {
  return community.finalCta?.title?.trim() ? community.finalCta : fallback;
}
