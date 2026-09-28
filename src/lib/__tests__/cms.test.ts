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
  getListingsWithFallback,
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
        "highlights.image",
        "quickFactsImage1",
        "quickFactsImage2",
        "mapSection.image",
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
    });

    it("fills empty CMS fields from fallback (field-level merge)", async () => {
      (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
      // CMS returns hero but leaves headers/quickFacts/finalCta empty
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
          // These components are missing (as they were before the populate fix)
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

      // Empty fields fall back to local
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
