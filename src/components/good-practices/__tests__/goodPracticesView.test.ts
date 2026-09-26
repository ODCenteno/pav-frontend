import { describe, expect, it } from "vitest";
import type { GoodPracticesPage } from "@/types/good-practices.type";
import {
  CONANP_FALLBACK_URL,
  escapeHtml,
  resolveConanpButtonHref,
  sameInBothLocales,
  toFishingProps,
  toInfluenceProps,
  toProtectedAreaProps,
  toRecommendationsProps,
} from "../goodPracticesView";

function page(overrides: Partial<GoodPracticesPage> = {}): GoodPracticesPage {
  return {
    hero: null,
    intro: null,
    protectedArea: { title: "ANP", text: "Protected", linkLabel: "More", linkHref: "https://anp.test" },
    conanpUrl: "https://conanp.test",
    influenceHeader: { title: "Influence", subtitle: "" },
    influenceText: "Influence text",
    fishingHeader: { title: "Refuge", subtitle: "" },
    fishingText: "Refuge text",
    fishingRules: ["No nets"],
    recommendationsHeader: { title: "Code of conduct", subtitle: "" },
    recommendations: ["Take your trash"],
    tipsHeader: { title: "Tips", subtitle: "" },
    tips: ["Bring water"],
    campaign: null,
    finalCta: null,
    ...overrides,
  };
}

describe("sameInBothLocales", () => {
  it("wraps an already-resolved value for the guide components' locale lookup", () => {
    expect(sameInBothLocales("Hola")).toEqual({ "es-MX": "Hola", en: "Hola" });
  });
});

describe("toProtectedAreaProps", () => {
  it("maps the protected-area block to the GuideProtectedArea shape", () => {
    expect(toProtectedAreaProps(page())).toEqual({
      title: { "es-MX": "ANP", en: "ANP" },
      text: { "es-MX": "Protected", en: "Protected" },
      link: { label: { "es-MX": "More", en: "More" }, href: "https://anp.test" },
    });
  });

  it("falls back to conanpUrl, then the public CONANP site, for the link", () => {
    const noLink = { title: "ANP" };
    expect(toProtectedAreaProps(page({ protectedArea: noLink }))!.link.href).toBe("https://conanp.test");
    expect(toProtectedAreaProps(page({ protectedArea: noLink, conanpUrl: "" }))!.link.href).toBe(
      CONANP_FALLBACK_URL
    );
  });

  it("uses the link href as label when the label is empty", () => {
    expect(toProtectedAreaProps(page({ protectedArea: { title: "ANP" } }))!.link.label.en).toBe("CONANP");
  });

  it("returns null without a title", () => {
    expect(toProtectedAreaProps(page({ protectedArea: null }))).toBeNull();
    expect(toProtectedAreaProps(page({ protectedArea: { title: " " } }))).toBeNull();
  });
});

describe("toInfluenceProps", () => {
  it("maps header and text", () => {
    expect(toInfluenceProps(page())).toEqual({
      title: { "es-MX": "Influence", en: "Influence" },
      text: { "es-MX": "Influence text", en: "Influence text" },
    });
  });

  it("returns null without a header title", () => {
    expect(toInfluenceProps(page({ influenceHeader: null }))).toBeNull();
  });
});

describe("toFishingProps", () => {
  it("maps header, text and rules", () => {
    expect(toFishingProps(page())).toEqual({
      title: { "es-MX": "Refuge", en: "Refuge" },
      text: { "es-MX": "Refuge text", en: "Refuge text" },
      rules: { "es-MX": ["No nets"], en: ["No nets"] },
    });
  });

  it("returns null without a header title", () => {
    expect(toFishingProps(page({ fishingHeader: null }))).toBeNull();
  });
});

describe("toRecommendationsProps", () => {
  it("maps header and items", () => {
    expect(toRecommendationsProps(page())).toEqual({
      title: { "es-MX": "Code of conduct", en: "Code of conduct" },
      items: { "es-MX": ["Take your trash"], en: ["Take your trash"] },
    });
  });

  it("returns null without a header title or items", () => {
    expect(toRecommendationsProps(page({ recommendationsHeader: null }))).toBeNull();
    expect(toRecommendationsProps(page({ recommendations: [] }))).toBeNull();
  });
});

describe("resolveConanpButtonHref", () => {
  it("returns conanpUrl when it differs from the protected-area link", () => {
    expect(resolveConanpButtonHref(page())).toBe("https://conanp.test");
  });

  it("skips the button when the protected-area section already links there", () => {
    const same = page({ protectedArea: { title: "ANP", linkHref: "https://conanp.test" } });
    expect(resolveConanpButtonHref(same)).toBeUndefined();
  });

  it("falls back to the public CONANP site when conanpUrl is empty", () => {
    expect(resolveConanpButtonHref(page({ conanpUrl: "" }))).toBe(CONANP_FALLBACK_URL);
  });
});

describe("escapeHtml", () => {
  it("escapes markup so a CMS title is safe for set:html", () => {
    expect(escapeHtml(`<b onclick="x">A & 'B'</b>`)).toBe(
      "&lt;b onclick=&quot;x&quot;&gt;A &amp; &#39;B&#39;&lt;/b&gt;"
    );
  });
});
