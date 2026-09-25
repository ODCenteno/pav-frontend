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
      "logo",
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
    // would come before "populate[2]"). Only the indexed populate[N] keys
    // participate — the contract §9 community entries use named keys
    // (populate[community][...]) alongside the indexed ones.
    const keys = Object.keys(LISTING_FULL_POPULATE)
      .filter((k) => /^populate\[\d+\]$/.test(k))
      .sort((a, b) => {
        const ai = Number(a.match(/\[(\d+)\]/)?.[1] ?? -1);
        const bi = Number(b.match(/\[(\d+)\]/)?.[1] ?? -1);
        return ai - bi;
      });
    for (let i = 0; i < keys.length; i++) {
      expect(keys[i]).toBe(`populate[${i}]`);
    }
  });

  it("both listing populates include the contract §9 community entries", () => {
    const communityEntries = {
      "populate[community][fields]": "name,slug,color,textColor",
      "populate[community][populate]": "badgeIcon",
    };
    expect(LISTING_FULL_POPULATE).toMatchObject(communityEntries);
    expect(LISTING_SLIM_POPULATE).toMatchObject(communityEntries);
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
    // Every (paramKey, value) pair must appear URL-encoded. Covers the
    // indexed populate[N] entries and the named populate[community][*] ones.
    for (const [paramKey, value] of Object.entries(LISTING_FULL_POPULATE)) {
      const expected = `${encodeURIComponent(paramKey)}=${encodeURIComponent(value)}`;
      expect(url).toContain(expected);
    }
  });

  it("EN locale re-fetches the ES entry with every fallback component populated", async () => {
    // First call: EN entry. Second call: ES fallback entry.
    fetchMock.mockResolvedValueOnce(strapiOk([{ id: 1, title: "EN", slug: "s" }]));
    fetchMock.mockResolvedValueOnce(strapiOk([{ id: 2, title: "ES", slug: "s" }]));
    await getListingBySlug("s", "en");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const esUrl = String(fetchMock.mock.calls[1][0]);
    expect(esUrl).toContain("locale=es-MX");
    for (const field of ["stories", "products", "tags", "schedule", "amenities", "recommendations"]) {
      expect(decodeURIComponent(esUrl)).toContain(field);
    }
  });

  it("ES locale does not trigger a second fetch", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([{ id: 1, title: "ES", slug: "s" }]));
    await getListingBySlug("s", "es-MX");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
