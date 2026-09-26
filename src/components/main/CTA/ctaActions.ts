/**
 * Pure helpers for the CTA panel (`CtaSection.astro`). No Astro and no
 * navigation module: callers pass resolved URLs and labels in.
 */
import type { CommunityRef } from "@/types/community.type";

export interface CtaAction {
  label: string;
  href: string;
  /** Themes the action with the community color and badge. */
  community?: CommunityRef;
  /** Optional leading icon for an unthemed action. */
  icon?: "bookmark";
}

/** The panel lays out at most two actions. */
export const MAX_CTA_ACTIONS = 2;

/** One themed action per community, ordered by `order`. */
export function communityActions<C extends CommunityRef & { order: number }>(
  communities: C[],
  hrefFor: (slug: string) => string,
  labelFor: (community: C) => string = (community) => community.name,
): CtaAction[] {
  return [...communities]
    .sort((a, b) => a.order - b.order)
    .map((community) => ({ label: labelFor(community), href: hrefFor(community.slug), community }));
}

/** Actions the panel can render: labelled, linked, and at most two. */
export function ctaActionsOf(actions: CtaAction[]): CtaAction[] {
  return actions.filter((a) => a.label.trim() && a.href.trim()).slice(0, MAX_CTA_ACTIONS);
}
