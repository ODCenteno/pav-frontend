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

    it("converts tags to LocalizedString[]", () => {
      const items = getListingsFallback();
      const withTags = items.find((i) => i.tags && i.tags.length > 0);
      expect(withTags).toBeDefined();
      expect(typeof withTags!.tags![0]['es-MX']).toBe("string");
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
