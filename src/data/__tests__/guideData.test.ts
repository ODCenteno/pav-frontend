import { describe, it, expect } from "vitest";
import {
  heroData,
  introData,
  historyData,
  fishingData,
  protectedAreaData,
  influenceData,
  recommendationsData,
  directionsData,
  amenitiesData,
  touristMapData,
  ctaData,
} from "../guideData";

const LOCALES = ["es", "en"] as const;

function expectLocalized(value: unknown, key: string) {
  expect(value, `${key} should be defined`).toBeTruthy();
  expect(typeof value).toBe("object");
  const v = value as { es?: string; en?: string };
  for (const loc of LOCALES) {
    expect(typeof v[loc], `${key}.${loc} should be a string`).toBe("string");
    expect((v[loc] as string).length, `${key}.${loc} should be non-empty`).toBeGreaterThan(0);
  }
}

describe("data/guideData", () => {
  describe("heroData", () => {
    it("has localized title and description plus an image path", () => {
      expectLocalized(heroData.title, "heroData.title");
      expectLocalized(heroData.desc, "heroData.desc");
      expect(heroData.image).toMatch(/^\/images\//);
    });
  });

  describe("introData", () => {
    it("has localized ranch and port titles and texts", () => {
      expectLocalized(introData.ranchTitle, "introData.ranchTitle");
      expectLocalized(introData.ranchText, "introData.ranchText");
      expectLocalized(introData.portTitle, "introData.portTitle");
      expectLocalized(introData.portText, "introData.portText");
    });
  });

  describe("historyData", () => {
    it("has title, text, and at least 3 milestones", () => {
      expectLocalized(historyData.title, "historyData.title");
      expectLocalized(historyData.text, "historyData.text");
      expect(Array.isArray(historyData.milestones)).toBe(true);
      expect(historyData.milestones.length).toBeGreaterThanOrEqual(3);
    });

    it("each milestone has a year and localized text", () => {
      for (const m of historyData.milestones) {
        expect(typeof m.year).toBe("string");
        expect(m.year.length).toBeGreaterThan(0);
        expectLocalized(m, "milestone");
      }
    });
  });

  describe("fishingData", () => {
    it("has title, text, and rules per locale", () => {
      expectLocalized(fishingData.title, "fishingData.title");
      expectLocalized(fishingData.text, "fishingData.text");
      for (const loc of LOCALES) {
        expect(Array.isArray(fishingData.rules[loc])).toBe(true);
        expect(fishingData.rules[loc].length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("protectedAreaData", () => {
    it("points to the official CONANP URL", () => {
      expect(protectedAreaData.link.href).toBe("https://descubreanp.conanp.gob.mx/");
      expectLocalized(protectedAreaData.link.label, "protectedAreaData.link.label");
    });
  });

  describe("directionsData", () => {
    it("has routes for both Loreto and La Paz with image, distance, and time", () => {
      for (const route of [directionsData.loreto, directionsData.laPaz]) {
        expectLocalized(route.label, "route.label");
        expectLocalized(route.desc, "route.desc");
        expect(route.distance).toMatch(/\d+\s*km/);
        expect(route.time).toMatch(/~/);
        expect(route.image).toMatch(/^\/images\//);
      }
    });

    it("has at least 2 driving tips per locale", () => {
      for (const loc of LOCALES) {
        expect(directionsData.drivingTips[loc].length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("amenitiesData", () => {
    it("contains at least wifi, signal, and toilet", () => {
      const icons = amenitiesData.items.map((i) => i.icon);
      expect(icons).toContain("wifi");
      expect(icons).toContain("signal");
      expect(icons).toContain("toilet");
    });

    it.each(amenitiesData.items)("amenity $icon has localized title and text", (item) => {
      expectLocalized(item.title, `amenity[${item.icon}].title`);
      expectLocalized(item.text, `amenity[${item.icon}].text`);
    });
  });

  describe("touristMapData", () => {
    it("references a valid image path", () => {
      expect(touristMapData.image).toMatch(/^\/images\//);
      expectLocalized(touristMapData.title, "touristMapData.title");
      expectLocalized(touristMapData.caption, "touristMapData.caption");
    });
  });

  describe("ctaData", () => {
    it("has localized title, description, and button label", () => {
      expectLocalized(ctaData.title, "ctaData.title");
      expectLocalized(ctaData.desc, "ctaData.desc");
      expectLocalized(ctaData.btn, "ctaData.btn");
    });
  });

  describe("recommendationsData & influenceData", () => {
    it("has title and at least 4 recommendations per locale", () => {
      expectLocalized(recommendationsData.title, "recommendationsData.title");
      for (const loc of LOCALES) {
        expect(recommendationsData.items[loc].length).toBeGreaterThanOrEqual(4);
      }
    });

    it("has localized influence title and text", () => {
      expectLocalized(influenceData.title, "influenceData.title");
      expectLocalized(influenceData.text, "influenceData.text");
    });
  });
});
