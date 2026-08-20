import { describe, it, expect } from "vitest";
import es from "../es.json";
import en from "../en.json";

type JsonObject = Record<string, any>;

function get(obj: JsonObject, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as JsonObject)) {
      return (acc as JsonObject)[key];
    }
    return undefined;
  }, obj);
}

describe("siteDetailPage i18n parity", () => {
  const keys = [
    "labels.about",
    "labels.gallery",
    "labels.info",
    "labels.hours",
    "labels.price",
    "labels.amenities",
    "labels.contact",
    "labels.tips",
    "labels.related",
    "labels.behind",
    "labels.stories",
    "labels.products",
    "labels.follow",
    "actions.directions",
    "actions.contact",
    "actions.favorite",
    "actions.favoriteActive",
    "actions.share",
  ];

  for (const key of keys) {
    it(`es.json siteDetailPage.${key} exists and is a non-empty string`, () => {
      const v = get(es, `siteDetailPage.${key}`);
      expect(typeof v).toBe("string");
      expect((v as string).length).toBeGreaterThan(0);
    });

    it(`en.json siteDetailPage.${key} exists and is a non-empty string`, () => {
      const v = get(en, `siteDetailPage.${key}`);
      expect(typeof v).toBe("string");
      expect((v as string).length).toBeGreaterThan(0);
    });
  }

  it("recommendation labels are no longer i18n keys (they are CMS data now)", () => {
    expect(get(es, "siteDetailPage.labels.bestTime")).toBeUndefined();
    expect(get(en, "siteDetailPage.labels.bestTime")).toBeUndefined();
    expect(get(es, "siteDetailPage.labels.whatToBring")).toBeUndefined();
    expect(get(en, "siteDetailPage.labels.whatToBring")).toBeUndefined();
    expect(get(es, "siteDetailPage.labels.accessibility")).toBeUndefined();
    expect(get(en, "siteDetailPage.labels.accessibility")).toBeUndefined();
    expect(get(es, "siteDetailPage.labels.connectivity")).toBeUndefined();
    expect(get(en, "siteDetailPage.labels.connectivity")).toBeUndefined();
  });

  it("keeps the tips section heading in both locales", () => {
    expect(get(es, "siteDetailPage.labels.tips")).toBeTruthy();
    expect(get(en, "siteDetailPage.labels.tips")).toBeTruthy();
  });
});
