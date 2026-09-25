import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock style copied from src/lib/__tests__/cms.test.ts.
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

import { getCommunities, getCommunityBySlug } from "../community";
import { clearCmsCache } from "../../cms";
import { communities } from "../../../data/communities";

function strapiOk<T>(data: T) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    text: () => Promise.resolve(JSON.stringify({ data })),
    json: () => Promise.resolve({ data }),
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

beforeEach(() => {
  fetchMock.mockReset();
  clearCmsCache();
});

describe("getCommunities", () => {
  it("passes CMS fields through when the CMS returns data", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk([
        {
          id: 1,
          attributes: {
            slug: "puerto-agua-verde",
            name: "Puerto Agua Verde",
            tagline: "CMS tagline",
            color: "#0CA58C",
            textColor: "#08806D",
            order: 1,
          },
        },
      ]),
    );
    const result = await getCommunities("es-MX");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("puerto-agua-verde");
    expect(result[0].tagline).toBe("CMS tagline");
    expect(result[0].color).toBe("#0CA58C");
  });

  it("keeps the CMS order (sort=order:asc forwarded)", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk([
        { id: 1, attributes: { slug: "rancho-san-cosme", order: 1 } },
        { id: 2, attributes: { slug: "puerto-agua-verde", order: 2 } },
      ]),
    );
    const result = await getCommunities("es-MX");
    expect(result.map((c) => c.slug)).toEqual(["rancho-san-cosme", "puerto-agua-verde"]);
  });

  it("requests the contract §9 populate set and locale", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    await getCommunities("es");
    const url = String(fetchMock.mock.calls[0][0]);
    const query = decodeURIComponent(url.split("?")[1] || "");
    expect(url).toContain("/api/communities");
    expect(query).toContain("locale=es-MX"); // toStrapiLocale maps es → es-MX
    expect(query).toContain("sort=order:asc");
    for (const field of [
      "badgeIcon",
      "heroImage",
      "location",
      "historyHeader",
      "historyMilestones",
      "touristMapImage",
      "highlightsHeader",
      "highlights.image",
      "quickFactsHeader",
      "quickFacts",
      "gallery",
      "finalCta",
    ]) {
      expect(query).toContain(`=${field}`);
    }
  });

  it("returns fixture-derived communities for both slugs when the CMS list is empty", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    const result = await getCommunities("es-MX");
    expect(result.map((c) => c.slug)).toEqual(["puerto-agua-verde", "rancho-san-cosme"]);
    for (const c of result) {
      const fixture = communities.find((f) => f.slug === c.slug)!;
      expect(c.name).toBe(fixture.name["es-MX"]);
      expect(c.color).toBe(fixture.color);
      expect(c.textColor).toBe(fixture.textColor);
      expect(c.order).toBe(fixture.order);
      expect(c.location).toEqual(fixture.location);
      expect(c.badgeIcon).toBe(fixture.iconPath);
    }
  });

  it("returns fixture-derived communities for both slugs on a 500 (never throws)", async () => {
    fetchMock.mockResolvedValueOnce(strapiError(500));
    const result = await getCommunities("es-MX");
    expect(result.map((c) => c.slug)).toEqual(["puerto-agua-verde", "rancho-san-cosme"]);
  });

  it("returns fixture-derived communities on a network exception", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const result = await getCommunities("en");
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe(communities[0].name.en);
  });

  it("per-field fallback applies through the fetcher (missing color/heroImage/badgeIcon)", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk([{ id: 1, attributes: { slug: "puerto-agua-verde", name: "" } }]),
    );
    const result = await getCommunities("es-MX");
    expect(result[0].name).toBe(communities[0].name["es-MX"]);
    expect(result[0].color).toBe(communities[0].color);
    expect(result[0].badgeIcon).toBe("/images/communities/fish.png");
    expect(result[0].heroImage).toBe("/images/PAV-Letrero-.webp");
  });

  it("maps a CMS community whose slug is not in the fixtures", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk([{ id: 9, attributes: { slug: "loreto", name: "Loreto", color: "#ABCDEF", textColor: "#123456", order: 3 } }]),
    );
    const result = await getCommunities("es-MX");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("loreto");
    expect(result[0].name).toBe("Loreto");
    expect(result[0].highlights).toEqual([]);
  });
});

describe("getCommunityBySlug", () => {
  it("filters by slug and returns the mapped community", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk([
        { id: 2, attributes: { slug: "rancho-san-cosme", name: "Rancho San Cosme", color: "#EC6E0B", textColor: "#B85206" } },
      ]),
    );
    const result = await getCommunityBySlug("rancho-san-cosme", "es-MX");
    expect(result?.slug).toBe("rancho-san-cosme");
    const url = String(fetchMock.mock.calls[0][0]);
    expect(decodeURIComponent(url)).toContain("filters[slug][$eq]=rancho-san-cosme");
  });

  it("returns the fixture-derived community when the CMS is down and the slug is known", async () => {
    fetchMock.mockResolvedValueOnce(strapiError(500));
    const result = await getCommunityBySlug("puerto-agua-verde", "es-MX");
    expect(result?.slug).toBe("puerto-agua-verde");
    expect(result?.color).toBe(communities[0].color);
    expect(result?.heroImage).toBe("/images/PAV-Letrero-.webp");
  });

  it("returns the fixture-derived community on 404 (single type absent)", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const result = await getCommunityBySlug("rancho-san-cosme", "en");
    expect(result?.slug).toBe("rancho-san-cosme");
    expect(result?.name).toBe(communities[1].name.en);
  });

  it("returns null for an unknown slug when the CMS is down", async () => {
    fetchMock.mockResolvedValueOnce(strapiError(500));
    const result = await getCommunityBySlug("la-paz", "es-MX");
    expect(result).toBeNull();
  });

  it("returns null when the CMS is up but has no match", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    const result = await getCommunityBySlug("does-not-exist", "es-MX");
    expect(result).toBeNull();
  });

  it("forwards the mapped locale param", async () => {
    fetchMock.mockResolvedValueOnce(strapiOk([]));
    fetchMock.mockResolvedValueOnce(strapiOk([])); // (fixture lookup path needs no second call)
    await getCommunityBySlug("x", "en");
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("locale=en");
  });
});
