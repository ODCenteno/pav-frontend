import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

vi.mock("astro:env", () => ({}));

import { LISTING_FULL_POPULATE, LISTING_SLIM_POPULATE, getListingBySlug } from "../cms";

function strapiOk<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify({ data })),
    json: () => Promise.resolve({ data }),
  } as any;
}

describe("LISTING populate constants", () => {
  it("LISTING_FULL_POPULATE contains every relation/component referenced by the detail page", () => {
    const expected = [
      "category",
      "mainImage",
      "gallery",
      "location",
      "tags",
      "contact",
      "schedule",
      "amenities",
      "recommendations",
      "relatedListings",
      "members.photo",
      "stories.image",
      "stories.gallery",
      "products",
      "social",
    ];
    for (const key of expected) {
      const populateValue = Object.values(LISTING_FULL_POPULATE);
      expect(populateValue).toContain(key);
    }
  });

  it("LISTING_SLIM_POPULATE is a strict subset of LISTING_FULL_POPULATE", () => {
    for (const v of Object.values(LISTING_SLIM_POPULATE)) {
      expect(Object.values(LISTING_FULL_POPULATE)).toContain(v);
    }
  });

  it("LISTING_FULL_POPULATE includes contact (instagram/facebook reach the page)", () => {
    expect(Object.values(LISTING_FULL_POPULATE)).toContain("contact");
  });

  it("LISTING_FULL_POPULATE indexes are sequential and zero-based", () => {
    // Sort numerically (Object.keys().sort() is lexicographic: "populate[10]"
    // would come before "populate[2]").
    const keys = Object.keys(LISTING_FULL_POPULATE).sort((a, b) => {
      const ai = Number(a.match(/\[(\d+)\]/)?.[1] ?? -1);
      const bi = Number(b.match(/\[(\d+)\]/)?.[1] ?? -1);
      return ai - bi;
    });
    for (let i = 0; i < keys.length; i++) {
      expect(keys[i]).toBe(`populate[${i}]`);
    }
  });
});

describe("getListingBySlug populates all relations", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
    (import.meta.env as any).STRAPI_TOKEN = "test-token";
  });

  it("sends every populate param from LISTING_FULL_POPULATE", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    await getListingBySlug("anything", "es");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    // The URL is encoded: `populate%5B${idx}%5D=${encodeURIComponent(value)}`.
    // Assert that each (idx, value) pair appears.
    for (const [paramKey, value] of Object.entries(LISTING_FULL_POPULATE)) {
      const idx = paramKey.match(/\[(\d+)\]/)?.[1] ?? "";
      const expected = `populate%5B${idx}%5D=${encodeURIComponent(value)}`;
      expect(url).toContain(expected);
    }
  });
});
