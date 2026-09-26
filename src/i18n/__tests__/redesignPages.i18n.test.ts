import { describe, expect, it } from "vitest";
import es from "../es.json";
import en from "../en.json";

type JsonObject = Record<string, unknown>;

function get(obj: JsonObject, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as JsonObject)) {
      return (acc as JsonObject)[key];
    }
    return undefined;
  }, obj);
}

const KEYS = [
  "communityDetail.directions.title",
  "communityDetail.directions.text",
  "communityDetail.directions.cta",
  "communityDetail.directions.newTab",
  "communityDetail.touristMap.title",
  "communityDetail.touristMap.expand",
  "communityDetail.touristMap.defaultCaption",
  "communityGallery.title",
  "communityGallery.previous",
  "communityGallery.next",
  "communityGallery.openPhoto",
  "communityGallery.photoAlt",
  "memberCard.contact",
  "memberCard.photos",
  "memberCard.previousPhoto",
  "memberCard.nextPhoto",
  "memberCard.openPhoto",
  "goodPractices.seo.siteTitle",
  "goodPractices.seo.ogTitle",
  "goodPractices.seo.siteDescription",
  "goodPractices.seo.ogDescription",
  "goodPractices.anpMapTitle",
  "goodPractices.refugeMapTitle",
  "goodPractices.conanpCta",
  "goodPractices.expandMap",
  "goodPractices.newTab",
  "goodPractices.campaignLogoAlt",
];

describe("redesign page namespaces (agent C) i18n parity", () => {
  for (const key of KEYS) {
    it(`${key} is a non-empty string in es.json and en.json`, () => {
      for (const dict of [es, en]) {
        const value = get(dict as JsonObject, key);
        expect(typeof value).toBe("string");
        expect((value as string).trim().length).toBeGreaterThan(0);
      }
    });
  }

  it("keeps the same placeholders in both languages", () => {
    for (const key of KEYS) {
      const placeholders = (s: unknown) => String(s).match(/\{\{\w+\}\}/g)?.sort() ?? [];
      expect(placeholders(get(en as JsonObject, key)), key).toEqual(placeholders(get(es as JsonObject, key)));
    }
  });
});
