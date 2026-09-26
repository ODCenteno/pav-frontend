import { describe, it, expect } from "vitest";
import { communityActions, ctaActionsOf } from "../ctaActions";
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

  it("drops actions without a label or a link and caps the list at two", () => {
    const actions = [
      { label: " ", href: "/a/" },
      { label: "A", href: "" },
      { label: "B", href: "/b/" },
      { label: "C", href: "/c/" },
      { label: "D", href: "/d/" },
    ];
    expect(ctaActionsOf(actions).map((a) => a.label)).toEqual(["B", "C"]);
  });
});
