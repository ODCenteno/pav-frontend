import { describe, it, expect } from "vitest";
import {
  MAX_CTA_ACTIONS,
  communityActions,
  communityVisitKey,
  ctaActionsOf,
  favoritesAction,
  listingCtaActions,
} from "../ctaActions";
import type { Community } from "@/types/community.type";

function community(overrides: Partial<Community>): Community {
  return {
    id: "1",
    slug: "puerto-agua-verde",
    name: "Puerto Agua Verde",
    color: "#0CA58C",
    textColor: "#08806D",
    order: 1,
    historyMilestones: [],
    highlights: [],
    quickFacts: [],
    gallery: [],
    ...overrides,
  };
}

const pav = community({});
const rsc = community({ id: "2", slug: "rancho-san-cosme", name: "Rancho San Cosme", color: "#EC6E0B", textColor: "#B85206", order: 2 });
const href = (slug: string) => `/comunidades/${slug}/`;

describe("communityActions", () => {
  it("builds one themed action per community, ordered by community order", () => {
    expect(communityActions([rsc, pav], href)).toEqual([
      { label: "Puerto Agua Verde", href: "/comunidades/puerto-agua-verde/", community: pav },
      { label: "Rancho San Cosme", href: "/comunidades/rancho-san-cosme/", community: rsc },
    ]);
  });

  it("uses a custom label when given", () => {
    const [action] = communityActions([pav], href, (c) => `Visitar ${c.name}`);
    expect(action.label).toBe("Visitar Puerto Agua Verde");
  });
});

describe("ctaActionsOf", () => {
  it("keeps one or two actions with a label and a link", () => {
    const one = { label: "Ver mis favoritos", href: "/favoritos/" };
    expect(ctaActionsOf([one])).toEqual([one]);
    expect(ctaActionsOf(communityActions([pav, rsc], href))).toHaveLength(2);
  });

  it("keeps up to three actions", () => {
    const fav = favoritesAction("Ver mis favoritos", "/favoritos/");
    expect(ctaActionsOf([...communityActions([pav, rsc], href), fav])).toHaveLength(3);
    expect(MAX_CTA_ACTIONS).toBe(3);
  });

  it("drops actions without a label or a link and caps the list at three", () => {
    const actions = [
      { label: " ", href: "/a/" },
      { label: "A", href: "" },
      { label: "B", href: "/b/" },
      { label: "C", href: "/c/" },
      { label: "D", href: "/d/" },
    ];
    expect(ctaActionsOf(actions).map((a) => a.label)).toEqual(["B", "C", "D"]);
  });
});

describe("favoritesAction", () => {
  it("is a neutral action (no community) with the bookmark icon", () => {
    expect(favoritesAction("Ver mis favoritos", "/favoritos/")).toEqual({
      label: "Ver mis favoritos",
      href: "/favoritos/",
      icon: "bookmark",
    });
  });
});

describe("communityVisitKey", () => {
  it("maps each community to its own visit label", () => {
    expect(communityVisitKey("puerto-agua-verde")).toBe("finalCta.visitPort");
    expect(communityVisitKey("rancho-san-cosme")).toBe("finalCta.visitRanch");
  });

  it("returns undefined for an unknown community so callers can fall back", () => {
    expect(communityVisitKey("elsewhere")).toBeUndefined();
  });
});

describe("listingCtaActions", () => {
  const label = (c: { name: string }) => `Visitar ${c.name}`;

  it("links the listing's own community, themed with the full community entry", () => {
    const ref = { slug: "rancho-san-cosme" as const, name: "Rancho San Cosme", color: "#EC6E0B", textColor: "#B85206" };
    expect(listingCtaActions(ref, [pav, rsc], href, label)).toEqual([
      { label: "Visitar Rancho San Cosme", href: "/comunidades/rancho-san-cosme/", community: rsc },
    ]);
  });

  it("keeps the listing's community ref when the community list does not have it", () => {
    const ref = { slug: "puerto-agua-verde" as const, name: "Puerto Agua Verde", color: "#0CA58C", textColor: "#08806D" };
    expect(listingCtaActions(ref, [], href, label)).toEqual([
      { label: "Visitar Puerto Agua Verde", href: "/comunidades/puerto-agua-verde/", community: ref },
    ]);
  });

  it("falls back to both communities, by name, when the listing has none", () => {
    expect(listingCtaActions(undefined, [rsc, pav], href, label)).toEqual([
      { label: "Puerto Agua Verde", href: "/comunidades/puerto-agua-verde/", community: pav },
      { label: "Rancho San Cosme", href: "/comunidades/rancho-san-cosme/", community: rsc },
    ]);
  });
});
