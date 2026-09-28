import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { getGoodPracticesPage } from "../goodPractices";
import { clearCmsCache } from "../../cms";
import {
  heroData,
  fishingData,
  protectedAreaData,
  influenceData,
  recommendationsData,
  directionsData,
  ctaData,
} from "../../../data/guideData";

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

describe("getGoodPracticesPage", () => {
  it("maps a complete CMS page with a single request", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk({
        id: 1,
        documentId: "gp-1",
        hero: {
          title: "CMS Hero",
          titleHighlight: "HL",
          description: "D",
          ctaLabel: "Go",
          ctaLink: "/sitios",
          images: [{ url: "/uploads/hero.jpg" }],
        },
        influenceHeader: { title: "CMS Influence" },
        influenceText: "CMS influence text",
        fishingHeader: { title: "CMS Fishing" },
        fishingText: "CMS fishing text",
        fishingRules: [{ text: "cms rule" }],
        recommendationsHeader: { title: "CMS Recs" },
        recommendations: [{ text: "cms rec" }],
        tipsHeader: { title: "CMS Tips" },
        tips: [{ text: "cms tip" }],
        protectedArea: { title: "CMS ANP", linkHref: "https://cms.example.com/" },
        conanpUrl: "https://cms.example.com/",
        campaign: { title: "CMS Campaign" },
        finalCta: { title: "CMS CTA", buttonLabel: "btn", buttonLink: "/x" },
      }),
    );

    const page = await getGoodPracticesPage("es-MX");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(page.hero?.title).toBe("CMS Hero");
    expect(page.protectedArea?.title).toBe("CMS ANP");
    expect(page.influenceHeader?.title).toBe("CMS Influence");
    expect(page.fishingRules).toEqual(["cms rule"]);
    expect(page.recommendations).toEqual(["cms rec"]);
    expect(page.tips).toEqual(["cms tip"]);
    expect(page.campaign?.title).toBe("CMS Campaign");
    expect(page.finalCta?.title).toBe("CMS CTA");
  });

  it("requests the contract §9 populate set with the mapped locale", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    await getGoodPracticesPage("es");
    const url = String(fetchMock.mock.calls[0][0]);
    const query = decodeURIComponent(url.split("?")[1] || "");
    expect(url).toContain("/api/good-practices-page");
    expect(query).toContain("locale=es-MX");
    for (const field of [
      "hero.images",
      "intro",
      "protectedArea",
      "anpMapImage",
      "influenceHeader",
      "fishingHeader",
      "fishingRules",
      "fishingRefugeMapImage",
      "recommendationsHeader",
      "recommendations",
      "tipsHeader",
      "tips",
      "campaign.logo",
      "finalCta",
    ]) {
      expect(query).toContain(`=${field}`);
    }
  });

  it("falls back to guideData.js values when the single type is missing", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());

    const page = await getGoodPracticesPage("es-MX");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(page.hero?.title).toBe("Buenas Prácticas y Turismo Sustentable");
    expect(page.hero?.titleHighlight).toBe("");
    expect(page.hero?.description).toBeTruthy();
    expect(page.hero?.images).toEqual([
      { url: heroData.image, alt: "Buenas Prácticas y Turismo Sustentable" },
    ]);
    expect(page.protectedArea?.title).toBe(protectedAreaData.title["es-MX"]);
    expect(page.protectedArea?.linkLabel).toBe(protectedAreaData.link.label["es-MX"]);
    expect(page.protectedArea?.linkHref).toBe(protectedAreaData.link.href);
    expect(page.conanpUrl).toBe(protectedAreaData.link.href);
    expect(page.influenceHeader?.title).toBe(influenceData.title["es-MX"]);
    expect(page.influenceText).toBe(influenceData.text["es-MX"]);
    expect(page.fishingHeader?.title).toBe(fishingData.title["es-MX"]);
    expect(page.fishingRules).toEqual(fishingData.rules["es-MX"]);
    expect(page.recommendations).toEqual(recommendationsData.items["es-MX"]);
    expect(page.tipsHeader?.title).toBe("Consejos al visitante");
    expect(page.tips).toEqual(directionsData.drivingTips["es-MX"]);
    expect(page.finalCta?.title).toBe(ctaData.title["es-MX"]);
    expect(page.finalCta?.buttonLabel).toBe(ctaData.btn["es-MX"]);
    expect(page.intro).toBeNull();
    expect(page.anpMapImage).toBeUndefined();
    expect(page.fishingRefugeMapImage).toBeUndefined();
  });

  it("uses English guideData slots for the en locale", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const page = await getGoodPracticesPage("en");
    expect(page.hero?.title).toBe("Good Practices and Sustainable Tourism");
    expect(page.fishingRules).toEqual(fishingData.rules.en);
    expect(page.tipsHeader?.title).toBe("Visitor tips");
    expect(page.tips).toEqual(directionsData.drivingTips.en);
  });

  it("always includes the Abracemos el Golfo campaign placeholder in the fallback", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const page = await getGoodPracticesPage("es-MX");
    expect(page.campaign?.title).toBe("Abracemos el Golfo");
    expect(page.campaign?.description).toBeTruthy();
  });

  it("gives the campaign placeholder no link until RED provides one", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const page = await getGoodPracticesPage("es-MX");
    expect(page.campaign?.url).toBeUndefined();
    expect(page.campaign?.linkLabel).toBeUndefined();
  });

  it("localizes the campaign placeholder description", async () => {
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const es = await getGoodPracticesPage("es-MX");
    fetchMock.mockResolvedValueOnce(strapiNotFound());
    const en = await getGoodPracticesPage("en");
    expect(en.campaign?.title).toBe("Abracemos el Golfo");
    expect(en.campaign?.description).toBeTruthy();
    expect(en.campaign?.description).not.toBe(es.campaign?.description);
  });

  it("fills only the empty sections of a partial CMS page from the static fallback", async () => {
    fetchMock.mockResolvedValueOnce(
      strapiOk({
        id: 1,
        documentId: "gp-partial",
        hero: { title: "CMS Hero", images: [{ url: "/uploads/h.jpg" }] },
        fishingRules: [], // empty → static fallback
        // no protectedArea, no campaign, no finalCta
      }),
    );

    const page = await getGoodPracticesPage("es-MX");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(page.hero?.title).toBe("CMS Hero"); // CMS wins
    expect(page.fishingRules).toEqual(fishingData.rules["es-MX"]); // per-section fallback
    expect(page.protectedArea?.title).toBe(protectedAreaData.title["es-MX"]);
    expect(page.campaign?.title).toBe("Abracemos el Golfo");
    expect(page.finalCta?.title).toBe(ctaData.title["es-MX"]);
  });

  it("never throws when the endpoint fails with 500", async () => {
    fetchMock.mockResolvedValueOnce(strapiError(500));
    const page = await getGoodPracticesPage("es-MX");
    expect(page.hero?.title).toBe("Buenas Prácticas y Turismo Sustentable");
    expect(page.campaign?.title).toBe("Abracemos el Golfo");
  });

  it("never throws on network exceptions", async () => {
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    const page = await getGoodPracticesPage("es-MX");
    expect(page.fishingRules.length).toBeGreaterThan(0);
  });
});
