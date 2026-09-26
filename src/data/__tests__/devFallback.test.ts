import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));
import {
  getListingsFallback,
  getTeamFallback,
  getOrganizationsFallback,
  getAboutFallback,
} from "../devFallback";

describe("data/devFallback", () => {
  describe("getListingsFallback", () => {
    it("returns an array of Listing-shaped items", () => {
      const items = getListingsFallback();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(10);
    });

    it("each item has LocalizedString name, description, slug, href", () => {
      const items = getListingsFallback();
      for (const item of items.slice(0, 5)) {
        expect(item.name).toBeDefined();
        expect(typeof item.name['es-MX']).toBe("string");
        expect(typeof item.name.en).toBe("string");
        expect(typeof item.slug).toBe("string");
        expect(item.href?.['es-MX']).toContain("/sitios/");
        expect(item.href?.en).toContain("/en/sitios/");
      }
    });

    it("converts tags to plain string[] for the requested locale", () => {
      const items = getListingsFallback();
      const withTags = items.find((i) => i.tags && i.tags.length > 0);
      expect(withTags).toBeDefined();
      expect(typeof withTags!.tags![0]).toBe("string");
      expect(withTags!.tags).toContain("Aventura");

      const itemsEn = getListingsFallback("en");
      const withTagsEn = itemsEn.find((i) => i.slug === withTags!.slug);
      expect(withTagsEn!.tags).toContain("Adventure");
    });

    it("builds schedule/amenities/recommendations in the migrated view-model shape", () => {
      const items = getListingsFallback();
      const withSchedule = items.find((i) => i.schedule?.text);
      expect(typeof withSchedule!.schedule!.text).toBe("string");

      const withAmenities = items.find((i) => i.amenities && i.amenities.length > 0);
      expect(typeof withAmenities!.amenities![0].label).toBe("string");

      const withRecs = items.find((i) => i.recommendations && i.recommendations.length > 0);
      expect(withRecs).toBeDefined();
      for (const rec of withRecs!.recommendations!) {
        expect(typeof rec.label).toBe("string");
        expect((rec.description || "").trim().length).toBeGreaterThan(0);
      }
      const bring = withRecs!.recommendations!.find((r) => r.label === "Qué llevar");
      expect(bring?.description).toContain("\n");
    });

    it("builds media with mainImageUrl and galleryUrls", () => {
      const items = getListingsFallback();
      const withImage = items.find((i) => i.media?.mainImageUrl);
      expect(withImage).toBeDefined();
      expect(withImage!.media!.mainImageUrl).toMatch(/^\/images\//);
    });

    it("builds a Location with lat/lng when present", () => {
      const items = getListingsFallback();
      const withLoc = items.find((i) => i.location?.lat);
      expect(withLoc).toBeDefined();
      expect(withLoc!.location!.lat).toBeDefined();
      expect(withLoc!.location!.lng).toBeDefined();
    });
  });

  describe("getTeamFallback", () => {
    it("returns TeamMember array", () => {
      const team = getTeamFallback();
      expect(team.length).toBeGreaterThan(0);
      expect(team[0].name).toBeTruthy();
      expect(team[0].role).toBeDefined();
    });
  });

  describe("getOrganizationsFallback", () => {
    it("returns Organization array", () => {
      const orgs = getOrganizationsFallback();
      expect(orgs.length).toBeGreaterThan(0);
      expect(orgs[0].name).toBeTruthy();
    });
  });

  describe("getAboutFallback", () => {
    it("returns the about page sections", () => {
      const fb = getAboutFallback();
      expect(fb.introData).toBeDefined();
      expect(fb.valuesData).toBeDefined();
      expect(fb.teamData).toBeDefined();
      expect(fb.organizationsData).toBeDefined();
      expect(fb.communityMessageData).toBeDefined();
      expect(fb.collaborationData).toBeDefined();
    });
  });
});

import { communities as communityFixtures } from "../communities";

describe("getListingsFallback — community tags (offline community carousel)", () => {
  it("tags every seed listing with a fixture community ref", () => {
    const items = getListingsFallback("es-MX");
    for (const item of items) {
      const fixture = communityFixtures.find((c) => c.slug === item.community?.slug);
      expect(fixture, item.slug).toBeDefined();
      expect(item.community).toEqual({
        slug: fixture!.slug,
        name: fixture!.name["es-MX"],
        color: fixture!.color,
        textColor: fixture!.textColor,
        badgeIcon: fixture!.iconPath,
      });
    }
  });

  it("features listings from both communities", () => {
    const featured = getListingsFallback("es-MX").filter((i) => i.isFeatured);
    const slugs = new Set(featured.map((i) => i.community?.slug));
    expect(slugs).toEqual(new Set(["puerto-agua-verde", "rancho-san-cosme"]));
  });

  it("puts the San Cosme beach seed in Rancho San Cosme", () => {
    const beach = getListingsFallback("en").find((i) => i.slug === "playa-san-cosme");
    expect(beach?.community?.slug).toBe("rancho-san-cosme");
    expect(beach?.community?.name).toBe("Rancho San Cosme");
  });
});
