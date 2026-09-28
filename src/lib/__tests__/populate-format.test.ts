import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Contract §9 — Populate format rule (verified against Strapi 5.39):
 * never mix indexed entries (populate[0]=category) with named ones
 * (populate[community][fields][0]=name) in the same query. When both
 * appear, Strapi silently drops every indexed entry (status 200, no
 * error). Any query that needs a named entry must express EVERY entry
 * in the named form.
 */

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

import {
  LISTING_FULL_POPULATE,
  LISTING_SLIM_POPULATE,
  getCategories,
  getListings,
  getListingBySlug,
  getListingsByCategorySlug,
  getFeaturedListings,
  getCommunityMembers,
  getFeaturedCommunityMembers,
  getCommunityMemberBySlug,
  getSiteContent,
  getSiteContents,
  getLegalPage,
  getGlobalSettings,
  getHomepage,
  getCommunities,
  getCommunityBySlug,
  getGoodPracticesPage,
  clearCmsCache,
} from "../cms";

function strapiOkEmpty() {
  const body = JSON.stringify({ data: [] });
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(body),
    json: () => Promise.resolve({ data: [] }),
  } as any;
}

/** Classify the top-level populate segments of a request URL. */
function populateSegments(url: string): { indexed: string[]; named: string[] } {
  const indexed: string[] = [];
  const named: string[] = [];
  for (const [key] of new URL(url).searchParams.entries()) {
    if (!key.startsWith("populate[")) continue;
    const top = key.slice("populate[".length).split("]")[0];
    if (/^\d+$/.test(top)) indexed.push(key);
    else named.push(key);
  }
  return { indexed, named };
}

/** Contract §9 guard: a query may not mix both populate forms. */
function expectNoMixedPopulate(url: string) {
  const { indexed, named } = populateSegments(url);
  if (indexed.length > 0 && named.length > 0) {
    throw new Error(
      `Mixed populate forms (contract §9) in ${url}\n` +
        `  indexed: ${indexed.join(", ")}\n` +
        `  named: ${named.join(", ")}`,
    );
  }
}

/** Flat param map of a request URL (decoded). */
function paramsOf(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of new URL(url).searchParams.entries()) out[k] = v;
  return out;
}

/** The contract §9 community subset in named form. */
const COMMUNITY_POPULATE_NAMED = {
  "populate[community][fields][0]": "name",
  "populate[community][fields][1]": "slug",
  "populate[community][fields][2]": "color",
  "populate[community][fields][3]": "textColor",
  "populate[community][populate][0]": "badgeIcon",
} as const;

describe("populate constants (static guard)", () => {
  it("LISTING_FULL_POPULATE is the exact named-form set for the detail page", () => {
    expect(LISTING_FULL_POPULATE).toEqual({
      "populate[category]": "true",
      "populate[mainImage]": "true",
      "populate[gallery]": "true",
      "populate[logo]": "true",
      "populate[location]": "true",
      "populate[tags]": "true",
      "populate[contact]": "true",
      "populate[schedule]": "true",
      "populate[amenities]": "true",
      "populate[recommendations]": "true",
      "populate[relatedListings]": "true",
      "populate[members][populate][0]": "photo",
      "populate[members][populate][1]": "gallery",
      "populate[members][populate][2]": "contact",
      "populate[stories][populate][0]": "image",
      "populate[stories][populate][1]": "gallery",
      "populate[products]": "true",
      ...COMMUNITY_POPULATE_NAMED,
    });
  });

  it("LISTING_SLIM_POPULATE is the exact named-form set for list pages", () => {
    expect(LISTING_SLIM_POPULATE).toEqual({
      "populate[category]": "true",
      "populate[mainImage]": "true",
      "populate[gallery]": "true",
      "populate[location]": "true",
      "populate[tags]": "true",
      "populate[contact]": "true",
      ...COMMUNITY_POPULATE_NAMED,
    });
  });

  it("neither listing populate contains an indexed entry", () => {
    for (const constant of [LISTING_FULL_POPULATE, LISTING_SLIM_POPULATE]) {
      for (const key of Object.keys(constant)) {
        expect(key).not.toMatch(/^populate\[\d+\]$/);
      }
    }
  });
});

describe("populate format guard over every fetcher (contract §9)", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => Promise.resolve(strapiOkEmpty()));
    (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
    clearCmsCache();
  });

  // Every fetcher that sends populate params. Each entry runs the fetcher
  // against an empty CMS response and asserts none of its request URLs mix
  // the indexed and named populate forms.
  const cases: Array<[string, () => Promise<unknown>]> = [
    ["getCategories", () => getCategories("es-MX")],
    ["getListings", () => getListings("es-MX")],
    ["getListingBySlug (es)", () => getListingBySlug("x", "es-MX")],
    ["getListingBySlug (en + ES fallback)", () => getListingBySlug("x", "en")],
    ["getListingsByCategorySlug", () => getListingsByCategorySlug("services", "es-MX")],
    ["getFeaturedListings", () => getFeaturedListings("es-MX")],
    ["getCommunityMembers", () => getCommunityMembers("es-MX")],
    ["getFeaturedCommunityMembers", () => getFeaturedCommunityMembers("es-MX")],
    ["getCommunityMemberBySlug", () => getCommunityMemberBySlug("x", "es-MX")],
    ["getSiteContent", () => getSiteContent("key", "es-MX")],
    ["getSiteContents", () => getSiteContents(["a", "b"], "es-MX")],
    ["getLegalPage", () => getLegalPage("privacy-notice", "es-MX")],
    ["getGlobalSettings", () => getGlobalSettings()],
    ["getHomepage", () => getHomepage("es-MX")],
    ["getCommunities", () => getCommunities("es-MX")],
    ["getCommunityBySlug", () => getCommunityBySlug("puerto-agua-verde", "es-MX")],
    ["getGoodPracticesPage", () => getGoodPracticesPage("es-MX")],
  ];

  it.each(cases)("%s never mixes indexed and named populate entries", async (_name, run) => {
    await run();
    expect(fetchMock.mock.calls.length).toBeGreaterThan(0);
    for (const call of fetchMock.mock.calls) {
      expectNoMixedPopulate(String(call[0]));
    }
  });
});

describe("member fetches populate the full community subset (named form)", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => Promise.resolve(strapiOkEmpty()));
    (import.meta.env as any).STRAPI_URL = "http://localhost:1337";
    clearCmsCache();
  });

  it("getCommunityMembers populates photo, listings and community", async () => {
    await getCommunityMembers("es-MX");
    expect(paramsOf(String(fetchMock.mock.calls[0][0]))).toMatchObject({
      "populate[photo]": "true",
      "populate[listings]": "true",
      ...COMMUNITY_POPULATE_NAMED,
    });
  });

  it("getFeaturedCommunityMembers populates photo and community", async () => {
    await getFeaturedCommunityMembers("es-MX");
    expect(paramsOf(String(fetchMock.mock.calls[0][0]))).toMatchObject({
      "populate[photo]": "true",
      ...COMMUNITY_POPULATE_NAMED,
    });
  });

  it("getCommunityMemberBySlug populates the full detail set and community", async () => {
    await getCommunityMemberBySlug("x", "es-MX");
    expect(paramsOf(String(fetchMock.mock.calls[0][0]))).toMatchObject({
      "populate[photo]": "true",
      "populate[gallery]": "true",
      "populate[social]": "true",
      "populate[listings]": "true",
      "populate[relatedMembers][populate][0]": "photo",
      ...COMMUNITY_POPULATE_NAMED,
    });
  });
});
