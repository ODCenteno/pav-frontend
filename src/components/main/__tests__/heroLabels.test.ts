import { describe, it, expect } from "vitest";
import { heroCtaKey } from "../hero/heroLabels";
import es from "@/i18n/es.json";
import en from "@/i18n/en.json";

describe("heroCtaKey", () => {
  it("maps each community to its own explore label", () => {
    expect(heroCtaKey("puerto-agua-verde")).toBe("hero.explorePort");
    expect(heroCtaKey("rancho-san-cosme")).toBe("hero.exploreRanch");
  });

  it("falls back to the generic label for an unknown community", () => {
    expect(heroCtaKey("somewhere-else")).toBe("hero.cta");
  });

  it("has the agreed copy in both locales", () => {
    expect(es.hero.explorePort).toBe("Explorar el Puerto");
    expect(es.hero.exploreRanch).toBe("Explorar el Rancho");
    expect(en.hero.explorePort).toBe("Explore the Port");
    expect(en.hero.exploreRanch).toBe("Explore the Ranch");
  });
});
