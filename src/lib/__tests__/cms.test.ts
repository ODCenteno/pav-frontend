import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

// Mock global fetch before importing the module under test
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

vi.mock("astro:env", () => ({}));

import {
  getListings,
  getListingBySlug,
  getListingsByCategorySlug,
  getFeaturedListings,
  getCategories,
  getTeamMembers,
  getOrganizations,
  getAboutPage,
  getGuidePage,
  getListingsWithFallback,
  getAboutPageWithFallback,
  getHomepage,
  getHomepageWithFallback,
  clearCmsCache,
  CmsError,
} from "../cms";

function strapiOk<T>(data: T, meta?: any) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify({ data, meta })),
    json: () => Promise.resolve({ data, meta }),
  } as any;
}

function strapiNotFound() {
  return {
    ok: false,
    status: 404,
    statusText: "Not Found",
    text: () => Promise.resolve("not found"),
    json: () => Promise.resolve({}),
  } as any;
}

function strapiError(status: number = 500) {
  return {
    ok: false,
    status,
    statusText: "Server Error",
    text: () => Promise.resolve("oops"),
    json: () => Promise.resolve({}),
  } as any;
}

const originalEnv = { ...import.meta.env };
beforeEach(() => {
  fetchMock.mockReset();
  clearCmsCache();
});
afterEach(() => {
  // Reset env stub
  for (const k of Object.keys(import.meta.env)) {
    if (k.startsWith("STRAPI_")) delete (import.meta.env as any)[k];
  }
  Object.assign(import.meta.env, originalEnv);
});

describe("cms client", () => {
  describe("getCategories", () => {
    it("returns transformed categories on success", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      (import.meta.env as any).STRAPI_TOKEN = "tok";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          {
            id: 1,
            attributes: { name: "Experiencias", slug: "experiences", order: 1 },
          },
        ])
      );
      const cats = await getCategories("es-MX");
      expect(cats).toHaveLength(1);
      expect(cats[0].slug).toBe("experiences");
      expect(cats[0].name['es-MX']).toBe("Experiencias");
    });

    it("returns [] when fetch fails (no throw)", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiError());
      const cats = await getCategories("es-MX");
      expect(cats).toEqual([]);
    });
  });

  describe("getListings", () => {
    it("transforms and returns listings", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          {
            id: 10,
            attributes: {
              title: "Tour A",
              slug: "tour-a",
              category: {
                data: { id: 1, attributes: { name: "Experiencias", slug: "experiences" } },
              },
            },
          },
        ])
      );
      const items = await getListings("es-MX");
      expect(items).toHaveLength(1);
      expect(items[0].slug).toBe("tour-a");
      expect(items[0].href?.['es-MX']).toContain("/sitios/tour-a");
    });

    it("returns [] on error", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiError());
      const items = await getListings("es-MX");
      expect(items).toEqual([]);
    });
  });

  describe("getListingBySlug", () => {
    it("returns null when listing not found (404)", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiNotFound());
      const item = await getListingBySlug("nonexistent", "es-MX");
      expect(item).toBeNull();
    });

    it("returns the listing when found", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          { id: 5, attributes: { title: "X", slug: "x" } },
        ])
      );
      const item = await getListingBySlug("x", "es-MX");
      expect(item?.slug).toBe("x");
    });

    it("returns null on network error", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiError());
      const item = await getListingBySlug("x", "es-MX");
      expect(item).toBeNull();
    });
  });

  describe("getAboutPage", () => {
    it("assembles a partial result when some sections are missing", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // First three calls (intro/values/community) return null
      fetchMock.mockResolvedValueOnce(strapiNotFound()); // intro
      fetchMock.mockResolvedValueOnce(strapiNotFound()); // values
      fetchMock.mockResolvedValueOnce(strapiNotFound()); // community
      fetchMock.mockResolvedValueOnce(strapiNotFound()); // collaboration
      // team + orgs
      fetchMock.mockResolvedValueOnce(strapiOk([]));
      fetchMock.mockResolvedValueOnce(strapiOk([]));
      const data = await getAboutPage("es-MX");
      expect(data.intro).toBeNull();
      expect(data.values).toBeNull();
      expect(data.community).toBeNull();
      expect(data.team).toEqual([]);
      expect(data.organizations).toEqual([]);
    });
  });

  describe("getGuidePage", () => {
    it("returns null fields when no entries exist", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // getGuidePage now uses a single batched request via getSiteContents
      fetchMock.mockResolvedValueOnce(strapiNotFound());
      const data = await getGuidePage("es-MX");
      expect(data.hero).toBeNull();
      expect(data.intro).toBeNull();
      expect(data.directions).toBeNull();
    });

    it("builds view model from single-type API", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk({
          id: 1,
          documentId: "guide-1",
          attributes: {
            hero: { title: "GH", description: "GD", images: [{ url: "/img.png", alternativeText: "Hero" }] },
            intro: {
              ranchTitle: { es: "RS", en: "RE" },
              ranchText: { es: "RS-T", en: "RE-T" },
              portTitle: { es: "PS", en: "PE" },
              portText: { es: "PS-T", en: "PE-T" },
            },
            historyHeader: { title: { es: "HT", en: "HT" }, subtitle: { es: "HS", en: "HS" } },
            historyMilestones: [{ year: "1900", text: { es: "ES", en: "EN" } }],
            historyText: { es: "H-T", en: "H-T" },
            fishingHeader: { title: { es: "FT", en: "FT" }, subtitle: { es: "FS", en: "FS" } },
            fishingText: { es: "F-T", en: "F-T" },
            fishingRules: [{ text: { es: "r1", en: "r1-en" } }],
            protectedArea: { title: { es: "PT", en: "PT" }, text: { es: "C-T", en: "C-T" }, linkLabel: { es: "L", en: "L" }, linkHref: "https://example.com" },
            influenceHeader: { title: { es: "IT", en: "IT" }, subtitle: { es: "IS", en: "IS" } },
            influenceText: { es: "I-T", en: "I-T" },
            recommendationsHeader: { title: { es: "RT", en: "RT" }, subtitle: { es: "RS", en: "RS" } },
            recommendations: [{ text: { es: "a", en: "a-en" } }],
            directionsHeader: { title: { es: "DT", en: "DT" }, subtitle: { es: "DS", en: "DS" } },
            directions: [
              { label: { es: "Loreto", en: "Loreto" }, description: { es: "L-D", en: "L-D" }, distance: "98 km", time: "~2 h", image: { url: "/loreto.png", alternativeText: "Loreto" } },
              { label: { es: "La Paz", en: "La Paz" }, description: { es: "LP-D", en: "LP-D" }, distance: "360 km", time: "~5 h", image: { url: "/lapaz.png", alternativeText: "La Paz" } },
            ],
            drivingTipsHeader: { es: "T", en: "T" },
            drivingTips: [{ text: { es: "t1", en: "t1-en" } }],
            amenitiesHeader: { title: { es: "AT", en: "AT" }, subtitle: { es: "AS", en: "AS" } },
            amenities: [{ icon: "wifi", title: { es: "W", en: "W" }, text: { es: "WT", en: "WT" } }],
            touristMapHeader: { title: { es: "MT", en: "MT" }, subtitle: { es: "MS", en: "MS" } },
            touristMapImage: { url: "/map.png", alternativeText: "Map" },
            touristMapCaption: { es: "C", en: "C" },
            finalCta: { title: { es: "CT", en: "CT" }, description: { es: "CD", en: "CD" }, buttonLabel: { es: "B", en: "B" }, buttonLink: "/contact" },
          },
        })
      );

      const data = await getGuidePage("es-MX");
      expect(data.hero?.image).toBe("http://localhost:1337/img.png");
      expect(data.intro?.ranchTitle).toBe("RS");
      expect(data.history?.milestones[0]['es-MX']).toBe("ES");
      expect(data.fishing?.rules[0]).toBe("r1");
      expect(data.protected?.linkHref).toBe("https://example.com");
      expect(data.influence?.title).toBe("IT");
      expect(data.recommendations?.items[0]).toBe("a");
      expect(data.directions?.loreto.distance).toBe("98 km");
      expect(data.amenities?.items[0].icon).toBe("wifi");
      expect(data.touristMap?.image).toBe("http://localhost:1337/map.png");
      expect(data.cta?.btn).toBe("B");
    });
  });

  describe("CmsError", () => {
    it("carries the status code", () => {
      const err = new CmsError("boom", 404);
      expect(err.status).toBe(404);
      expect(err.name).toBe("CmsError");
      expect(err.message).toBe("boom");
    });
  });

  describe("getListingsByCategorySlug", () => {
    it("returns filtered listings", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          { id: 1, attributes: { title: "X", slug: "x", category: { data: { id: 1, attributes: { name: "Experiencias", slug: "experiences" } } } } },
        ])
      );
      const items = await getListingsByCategorySlug("experiences", "es-MX");
      expect(items).toHaveLength(1);
      expect(items[0].slug).toBe("x");
    });

    it("returns [] on error", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiError());
      const items = await getListingsByCategorySlug("x", "es-MX");
      expect(items).toEqual([]);
    });
  });

  describe("getFeaturedListings", () => {
    it("returns featured listings up to limit", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          { id: 1, attributes: { title: "F1", slug: "f1", isFeatured: true } },
          { id: 2, attributes: { title: "F2", slug: "f2", isFeatured: true } },
        ])
      );
      const items = await getFeaturedListings("es-MX", 2);
      expect(items).toHaveLength(2);
    });
  });

  describe("getTeamMembers", () => {
    it("returns transformed team members", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          { id: 1, attributes: { name: "A", role: { es: "x", en: "x" } } },
        ])
      );
      const team = await getTeamMembers();
      expect(team).toHaveLength(1);
      expect(team[0].name).toBe("A");
    });

    it("returns [] on error", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiError());
      const team = await getTeamMembers();
      expect(team).toEqual([]);
    });
  });

  describe("getOrganizations", () => {
    it("returns transformed organizations", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          { id: 1, attributes: { name: "Org", type: "community" } },
        ])
      );
      const orgs = await getOrganizations();
      expect(orgs).toHaveLength(1);
      expect(orgs[0].name).toBe("Org");
    });
  });

  describe("getAboutPage", () => {
    it("builds view model from single-type API", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // about-page single type
      fetchMock.mockResolvedValueOnce(
        strapiOk({
          id: 1,
          documentId: "about-1",
          attributes: {
            introTitle: { es: "T", en: "T" },
            introText: { es: "Txt", en: "Txt" },
            values: {
              missionTitle: { es: "M", en: "M" },
              missionText: { es: "MT", en: "MT" },
              visionTitle: { es: "V", en: "V" },
              visionText: { es: "VT", en: "VT" },
              valuesTitle: { es: "VAL", en: "VAL" },
              valuesItems: [{ es: "a", en: "a" }, { es: "b", en: "b" }],
            },
            communityTitle: { es: "C", en: "C" },
            communityText: { es: "CT", en: "CT" },
            collaboration: {
              title: { es: "CO2", en: "CO2" },
              description: { es: "COT2", en: "COT2" },
              primaryButtonLabel: { es: "BP", en: "BP" },
              primaryButtonLink: "/a",
              secondaryButtonLabel: { es: "BS", en: "BS" },
              secondaryButtonLink: "/b",
            },
          },
        })
      );
      // team
      fetchMock.mockResolvedValueOnce(strapiOk([{ id: 1, attributes: { name: "M1" } }]));
      // orgs
      fetchMock.mockResolvedValueOnce(strapiOk([{ id: 1, attributes: { name: "O1" } }]));

      const data = await getAboutPage("es-MX");
      expect(data.intro?.title).toBe("T");
      expect(data.intro?.text).toBe("Txt");
      expect(data.values?.mission.title).toBe("M");
      expect(data.values?.values.items).toEqual(["a", "b"]);
      expect(data.community?.title).toBe("C");
      expect(data.collaboration?.links.primary).toBe("/a");
      expect(data.team).toHaveLength(1);
      expect(data.organizations).toHaveLength(1);
    });
  });

  describe("getListingsWithFallback", () => {
    it("returns local fallback when CMS returns empty", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      (import.meta.env as any).STRAPI_USE_DEV_FALLBACK = "true";
      // getListingsWithFallback now fetches listings + categories in parallel.
      // Both must return empty so the dev fallback path triggers.
      fetchMock.mockResolvedValueOnce(strapiOk([]));
      fetchMock.mockResolvedValueOnce(strapiOk([]));
      const items = await getListingsWithFallback("es-MX");
      expect(items.length).toBeGreaterThan(0); // falls back to local
    });

    it("populates category from Strapi relation", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // listing with a populated category relation
      fetchMock.mockResolvedValueOnce(
        strapiOk([
          {
            id: 1,
            attributes: {
              title: "Tour A",
              slug: "tour-a",
              category: {
                data: { id: 1, attributes: { name: "Experiencias", slug: "experiences" } },
              },
            },
          },
        ])
      );
      const items = await getListingsWithFallback("es-MX");
      expect(items).toHaveLength(1);
      expect(items[0].category).toBeDefined();
      expect(items[0].category?.slug).toBe("experiences");
      expect(items[0].categoryId).toBe("experiences");
    });
  });

  describe("getAboutPageWithFallback", () => {
    it("returns fallback data when CMS is empty", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      (import.meta.env as any).STRAPI_USE_DEV_FALLBACK = "true";
      // getAboutPage now uses 1 batched request + team + orgs = 3 calls
      for (let i = 0; i < 3; i++) {
        fetchMock.mockResolvedValueOnce(strapiNotFound());
      }
      const data = await getAboutPageWithFallback("es-MX");
      expect(data.intro).toBeTruthy();
      expect(data.values).toBeTruthy();
      expect(data.community).toBeTruthy();
      expect(data.collaboration).toBeTruthy();
    });
  });

  describe("getListingBySlug additional cases", () => {
    it("returns null when Strapi response has data:null", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(""), json: () => Promise.resolve({ data: null }) } as any);
      const item = await getListingBySlug("x", "es-MX");
      expect(item).toBeNull();
    });
  });

  describe("error path coverage", () => {
    it("getCategories returns [] on network exception", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
      const cats = await getCategories("es-MX");
      expect(cats).toEqual([]);
    });

    it("getListings returns [] on network exception", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
      const items = await getListings("es-MX");
      expect(items).toEqual([]);
    });
  });

  describe("getHomepage", () => {
    it("requests all component fields via populate (regression: v5 omits unpopulated components)", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(
        strapiOk({ id: 1, hero: { title: "T" } })
      );
      await getHomepage("es");
      const url = fetchMock.mock.calls[0][0] as string;
      const required = [
        "hero.images",
        "destinations.image",
        "highlights.image",
        "quickFactsImage1",
        "quickFactsImage2",
        "mapSection.image",
        "destinationsHeader",
        "highlightsHeader",
        "quickFactsHeader",
        "quickFacts",
        "finalCta",
      ];
      // The populate params should include the component-only fields
      const queryString = decodeURIComponent(url.split("?")[1] || "");
      for (const field of required) {
        expect(queryString).toContain(field);
      }
    });

    it("returns null when homepage not found", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiNotFound());
      const data = await getHomepage("es");
      expect(data).toBeNull();
    });
  });

  describe("getHomepageWithFallback", () => {
    it("returns full fallback when CMS is unreachable", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiNotFound());
      const data = await getHomepageWithFallback("es");
      expect(data.hero.title).toBeTruthy();
      expect(data.quickFacts.items.length).toBeGreaterThan(0);
      expect(data.finalCta.title).toBeTruthy();
      expect(data.destinations.header.title).toBeTruthy();
    });

    it("fills empty CMS fields from fallback (field-level merge)", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // CMS returns hero + destinations but leaves headers/quickFacts/finalCta empty
      fetchMock.mockResolvedValueOnce(
        strapiOk({
          id: 1,
          hero: {
            title: "CMS Hero",
            titleHighlight: "Highlight",
            description: "Desc",
            ctaLabel: "Go",
            ctaLink: "/go",
            images: {
              data: [{ id: 1, attributes: { url: "/uploads/hero.jpg", alternativeText: "H" } }],
            },
          },
          // destinations present with text but image missing
          destinations: [
            { id: 1, title: "PAV", text: "Text" },
          ],
          // These components are missing (as they were before the populate fix)
          destinationsHeader: null,
          highlightsHeader: null,
          quickFactsHeader: null,
          quickFacts: null,
          quickFactsImage1: null,
          quickFactsImage2: null,
          finalCta: null,
        })
      );
      const data = await getHomepageWithFallback("es");

      // CMS values preserved
      expect(data.hero.title).toBe("CMS Hero");
      expect(data.hero.images[0].url).toContain("/uploads/hero.jpg");
      expect(data.destinations.items[0].title).toBe("PAV");

      // Empty fields fall back to local
      expect(data.destinations.header.title).toBeTruthy(); // fallback
      expect(data.destinations.items[0].image).toBeTruthy(); // fallback image
      expect(data.quickFacts.items.length).toBeGreaterThan(0); // fallback
      expect(data.quickFacts.images[0]).toMatch(/^\/images\//); // fallback image
      expect(data.finalCta.title).toBeTruthy(); // fallback
      expect(data.highlights.items.length).toBeGreaterThan(0); // fallback
    });

    it("returns English fallback for en locale when CMS empty", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      fetchMock.mockResolvedValueOnce(strapiNotFound());
      const data = await getHomepageWithFallback("en");
      expect(data.hero.ctaLink).toContain("/en/");
      expect(data.finalCta.buttonLink).toContain("/en/");
    });
  });
});
