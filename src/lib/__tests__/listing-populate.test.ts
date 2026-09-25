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
    // Contract §9 named form: populate[key]=true for plain relations,
    // populate[key][populate][n]=sub for dotted paths.
    const expected = [
      "populate[category]",
      "populate[mainImage]",
      "populate[gallery]",
      "populate[logo]",
      "populate[location]",
      "populate[tags]",
      "populate[contact]",
      "populate[schedule]",
      "populate[amenities]",
      "populate[recommendations]",
      "populate[relatedListings]",
      "populate[members][populate][0]",
      "populate[members][populate][1]",
      "populate[members][populate][2]",
      "populate[stories][populate][0]",
      "populate[stories][populate][1]",
      "populate[products]",
    ];
    for (const key of expected) {
      expect(LISTING_FULL_POPULATE).toHaveProperty(key);
    }
  });

  it("LISTING_SLIM_POPULATE is a strict subset of LISTING_FULL_POPULATE", () => {
    for (const [key, value] of Object.entries(LISTING_SLIM_POPULATE)) {
      expect(LISTING_FULL_POPULATE[key]).toBe(value);
    }
  });

  it("LISTING_FULL_POPULATE includes contact (instagram/facebook reach the page)", () => {
    expect(LISTING_FULL_POPULATE).toHaveProperty("populate[contact]", "true");
  });

  it("both listing populates include the contract §9 community entries (named form)", () => {
    const communityEntries = {
      "populate[community][fields][0]": "name",
      "populate[community][fields][1]": "slug",
      "populate[community][fields][2]": "color",
      "populate[community][fields][3]": "textColor",
      "populate[community][populate][0]": "badgeIcon",
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
