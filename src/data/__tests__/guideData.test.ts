import { describe, it, expect } from "vitest";
import {
  heroData,
  fishingData,
  protectedAreaData,
  influenceData,
  recommendationsData,
  directionsData,
  ctaData,
} from "../guideData";

const LOCALES = ["es-MX", "en"] as const;

function expectLocalized(value: unknown, key: string) {
  expect(value, `${key} should be defined`).toBeTruthy();
  expect(typeof value).toBe("object");
  const v = value as { 'es-MX'?: string; en?: string };
  for (const loc of LOCALES) {
    expect(typeof v[loc], `${key}.${loc} should be a string`).toBe("string");
    expect((v[loc] as string).length, `${key}.${loc} should be non-empty`).toBeGreaterThan(0);
  }
}

describe("data/guideData", () => {
  describe("heroData", () => {
    it("has an image path", () => {
      expect(heroData.image).toMatch(/^\/images\//);
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
    it("has at least 2 driving tips per locale", () => {
      for (const loc of LOCALES) {
        expect(directionsData.drivingTips[loc].length).toBeGreaterThanOrEqual(2);
      }
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
