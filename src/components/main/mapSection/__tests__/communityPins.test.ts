import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) =>
    locale === "en" ? `/en/${path.replace(/^\/+/, "")}/` : `/${path.replace(/^\/+/, "")}/`,
}));

import { communityMapMarkers } from "../communityPins";
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

describe("communityMapMarkers", () => {
  const pav = community({ tagline: "Mar", heroImage: "/pav.jpg", location: { lat: 25.51204, lng: -111.07577 } });
  const rsc = community({
    id: "2",
    slug: "rancho-san-cosme",
    name: "Rancho San Cosme",
    color: "#EC6E0B",
    order: 2,
    location: { lat: 25.5784138, lng: -111.1694027 },
  });

  it("builds one pin per community from community.location, linking its page", () => {
    expect(communityMapMarkers([pav, rsc], "es-MX")).toEqual([
      {
        lat: 25.51204,
        lng: -111.07577,
        title: "Puerto Agua Verde",
        href: "/comunidades/puerto-agua-verde/",
        categoryColor: "#0CA58C",
        description: "Mar",
        image: "/pav.jpg",
      },
      {
        lat: 25.5784138,
        lng: -111.1694027,
        title: "Rancho San Cosme",
        href: "/comunidades/rancho-san-cosme/",
        categoryColor: "#EC6E0B",
        description: undefined,
        image: undefined,
      },
    ]);
  });

  it("uses locale-prefixed community links", () => {
    expect(communityMapMarkers([pav], "en")[0].href).toBe("/en/comunidades/puerto-agua-verde/");
  });

  it("skips communities without a location", () => {
    expect(communityMapMarkers([community({ location: undefined }), rsc], "es-MX")).toHaveLength(1);
  });
});
