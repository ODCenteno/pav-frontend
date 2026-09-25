import { describe, it, expect, vi } from "vitest";

vi.mock("astro:i18n", () => ({
  getRelativeLocaleUrl: (locale: string, path: string) => {
    const normalized = (path || "").replace(/^\/+/, "");
    if (!normalized) return locale === "en" ? "/en" : "/";
    return locale === "en" ? `/en/${normalized}` : `/${normalized}`;
  },
}));

import {
  transformGoodPracticesPage,
  type GoodPracticesPageAttributes,
  type StrapiItem,
} from "../strapiTransformer";

function gpItem(attributes: Partial<GoodPracticesPageAttributes>): StrapiItem<GoodPracticesPageAttributes> {
  return { id: 1, documentId: "gp-1", attributes: attributes as GoodPracticesPageAttributes };
}

describe("transformGoodPracticesPage", () => {
  it("maps a full CMS single type", () => {
    const out = transformGoodPracticesPage(
      gpItem({
        hero: {
          title: "Buenas prácticas",
          titleHighlight: "Turismo sustentable",
          description: "Desc",
          ctaLabel: "Ver más",
          ctaLink: "/sitios",
          images: [{ url: "/uploads/hero.jpg", alternativeText: "Hero" }],
        },
        intro: { title: "Intro", subtitle: "Sub" },
        protectedArea: {
          title: "ANP",
          text: "Texto",
          linkLabel: "CONANP",
          linkHref: "https://descubreanp.conanp.gob.mx/",
        },
        anpMapImage: { url: "/uploads/anp.png" },
        conanpUrl: "https://descubreanp.conanp.gob.mx/",
        influenceHeader: { title: "Influencia", subtitle: "Sub" },
        influenceText: "Texto influencia",
        fishingHeader: { title: "Pesca", subtitle: "Sub" },
        fishingText: "Texto pesca",
        fishingRules: [{ text: { "es-MX": "r1", en: "r1-en" } }, { text: "r2" }],
        fishingRefugeMapImage: { url: "/uploads/refuge.png" },
        recommendationsHeader: { title: "Recomendaciones", subtitle: "Sub" },
        recommendations: [{ text: "a" }, { text: "b" }],
        tipsHeader: { title: "Tips", subtitle: "Sub" },
        tips: [{ text: "t1" }],
        campaign: {
          title: "Abracemos el Golfo",
          description: "Campaña",
          logo: { url: "/uploads/logo.png" },
          url: "https://example.com",
          linkLabel: "Visitar",
        },
        finalCta: {
          title: "CTA",
          description: "Desc",
          buttonLabel: "Ir",
          buttonLink: "/comunidades",
        },
      }),
      "es-MX",
    );

    expect(out.hero).toEqual({
      title: "Buenas prácticas",
      titleHighlight: "Turismo sustentable",
      description: "Desc",
      ctaLabel: "Ver más",
      ctaLink: "/sitios",
      images: [{ url: "http://localhost:1337/uploads/hero.jpg", alt: "Hero" }],
    });
    expect(out.intro).toEqual({ title: "Intro", subtitle: "Sub" });
    expect(out.protectedArea).toEqual({
      title: "ANP",
      text: "Texto",
      linkLabel: "CONANP",
      linkHref: "https://descubreanp.conanp.gob.mx/",
    });
    expect(out.anpMapImage).toBe("http://localhost:1337/uploads/anp.png");
    expect(out.conanpUrl).toBe("https://descubreanp.conanp.gob.mx/");
    expect(out.influenceHeader).toEqual({ title: "Influencia", subtitle: "Sub" });
    expect(out.influenceText).toBe("Texto influencia");
    expect(out.fishingHeader).toEqual({ title: "Pesca", subtitle: "Sub" });
    expect(out.fishingText).toBe("Texto pesca");
    expect(out.fishingRules).toEqual(["r1", "r2"]);
    expect(out.fishingRefugeMapImage).toBe("http://localhost:1337/uploads/refuge.png");
    expect(out.recommendationsHeader).toEqual({ title: "Recomendaciones", subtitle: "Sub" });
    expect(out.recommendations).toEqual(["a", "b"]);
    expect(out.tipsHeader).toEqual({ title: "Tips", subtitle: "Sub" });
    expect(out.tips).toEqual(["t1"]);
    expect(out.campaign).toEqual({
      title: "Abracemos el Golfo",
      description: "Campaña",
      logo: "http://localhost:1337/uploads/logo.png",
      url: "https://example.com",
      linkLabel: "Visitar",
    });
    expect(out.finalCta).toEqual({
      title: "CTA",
      description: "Desc",
      buttonLabel: "Ir",
      buttonLink: "/comunidades",
    });
  });

  it("picks localized slots for the en locale", () => {
    const out = transformGoodPracticesPage(
      gpItem({
        fishingRules: [{ text: { "es-MX": "regla", en: "rule" } }],
        fishingText: { "es-MX": "texto", en: "text" },
      }),
      "en",
    );
    expect(out.fishingRules).toEqual(["rule"]);
    expect(out.fishingText).toBe("text");
  });

  it("defaults every optional section when the single type is empty", () => {
    const out = transformGoodPracticesPage(gpItem({}), "es-MX");
    expect(out.hero).toBeNull();
    expect(out.intro).toBeNull();
    expect(out.protectedArea).toBeNull();
    expect(out.anpMapImage).toBeUndefined();
    expect(out.conanpUrl).toBeUndefined();
    expect(out.influenceHeader).toBeNull();
    expect(out.influenceText).toBeUndefined();
    expect(out.fishingHeader).toBeNull();
    expect(out.fishingText).toBeUndefined();
    expect(out.fishingRules).toEqual([]);
    expect(out.fishingRefugeMapImage).toBeUndefined();
    expect(out.recommendationsHeader).toBeNull();
    expect(out.recommendations).toEqual([]);
    expect(out.tipsHeader).toBeNull();
    expect(out.tips).toEqual([]);
    expect(out.campaign).toBeNull();
    expect(out.finalCta).toBeNull();
  });

  it("treats a hero without a title as absent (fallback trigger)", () => {
    const out = transformGoodPracticesPage(
      gpItem({ hero: { description: "only description" } }),
      "es-MX",
    );
    expect(out.hero).toBeNull();
  });
});
