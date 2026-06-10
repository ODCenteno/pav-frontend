import { describe, it, expect } from "vitest";
import es from "../es.json";
import en from "../en.json";

type JsonObject = Record<string, any>;

const GUIDE_KEYS: (string | string[])[] = [
  "navLabel",
  ["hero", "title"],
  ["hero", "desc"],
  ["hero", "image"],
  ["intro", "ranchTitle"],
  ["intro", "ranchText"],
  ["intro", "portTitle"],
  ["intro", "portText"],
  ["history", "title"],
  ["history", "text"],
  ["protected", "title"],
  ["protected", "text"],
  ["protected", "linkLabel"],
  ["protected", "linkHref"],
  ["influence", "title"],
  ["influence", "text"],
  ["recommendations", "title"],
  ["directions", "title"],
  ["directions", "loreto", "label"],
  ["directions", "loreto", "desc"],
  ["directions", "loreto", "distance"],
  ["directions", "loreto", "time"],
  ["directions", "laPaz", "label"],
  ["directions", "laPaz", "desc"],
  ["directions", "laPaz", "distance"],
  ["directions", "laPaz", "time"],
  ["directions", "drivingTipsTitle"],
  ["amenities", "title"],
  ["touristMap", "title"],
  ["touristMap", "image"],
  ["touristMap", "caption"],
  ["cta", "title"],
  ["cta", "desc"],
  ["cta", "btn"],
];

function getByPath(obj: JsonObject, path: string[]): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as JsonObject)[key];
    }
    return undefined;
  }, obj);
}

describe("i18n/guidePage", () => {
  it("exists in both es.json and en.json", () => {
    expect(es.guidePage).toBeDefined();
    expect(en.guidePage).toBeDefined();
  });

  it.each(GUIDE_KEYS)("defines key %j in both locales", (...pathParts) => {
    const flat = pathParts.length === 1 ? pathParts[0] : pathParts;
    const path = Array.isArray(flat) ? flat : [flat];
    const esVal = getByPath(es.guidePage, path as string[]);
    const enVal = getByPath(en.guidePage, path as string[]);
    expect(esVal, `es.guidePage.${(path as string[]).join(".")} missing`).toBeTruthy();
    expect(enVal, `en.guidePage.${(path as string[]).join(".")} missing`).toBeTruthy();
  });

  it("provides a non-empty English translation for every long text key (not identical to Spanish)", () => {
    // Some keys are proper nouns or brand names that stay identical across
    // locales by design (e.g. "Rancho San Cosme"). For these, we only assert
    // presence + non-empty.
    const properNouns: Record<string, string> = {
      "ranchTitle": "Rancho San Cosme",
      "portTitle": "Puerto Agua Verde",
    };

    const translatableKeys: (string | { path: string[]; noun?: string })[] = [
      ["navLabel"],
      ["hero", "title"],
      ["hero", "desc"],
      ["intro", "ranchText"],
      ["intro", "portText"],
      ["history", "title"],
      ["history", "text"],
      ["protected", "title"],
      ["protected", "text"],
      ["protected", "linkLabel"],
      ["influence", "title"],
      ["influence", "text"],
      ["recommendations", "title"],
      ["directions", "title"],
      ["directions", "loreto", "label"],
      ["directions", "loreto", "desc"],
      ["directions", "laPaz", "label"],
      ["directions", "laPaz", "desc"],
      ["directions", "drivingTipsTitle"],
      ["amenities", "title"],
      ["touristMap", "title"],
      ["touristMap", "caption"],
      ["cta", "title"],
      ["cta", "desc"],
      ["cta", "btn"],
      // Proper nouns (kept identical on purpose)
      { path: ["intro", "ranchTitle"], noun: properNouns.ranchTitle },
      { path: ["intro", "portTitle"], noun: properNouns.portTitle },
    ];

    for (const entry of translatableKeys) {
      const path = Array.isArray(entry) ? entry : entry.path;
      const esVal = getByPath(es.guidePage, path) as string;
      const enVal = getByPath(en.guidePage, path) as string;
      expect(typeof esVal).toBe("string");
      expect(typeof enVal).toBe("string");
      expect(esVal.length, `es.${path.join(".")} non-empty`).toBeGreaterThan(0);
      expect(enVal.length, `en.${path.join(".")} non-empty`).toBeGreaterThan(0);
      if (!Array.isArray(entry)) continue; // proper noun — only check presence
      expect(enVal, `en.${path.join(".")} should differ from es`).not.toBe(esVal);
    }
  });

  it("keeps static values (distance/time/image) identical across locales", () => {
    expect(es.guidePage.directions.loreto.distance).toBe(en.guidePage.directions.loreto.distance);
    expect(es.guidePage.directions.loreto.time).toBe(en.guidePage.directions.loreto.time);
    expect(es.guidePage.directions.laPaz.distance).toBe(en.guidePage.directions.laPaz.distance);
    expect(es.guidePage.directions.laPaz.time).toBe(en.guidePage.directions.laPaz.time);
    expect(es.guidePage.touristMap.image).toBe(en.guidePage.touristMap.image);
  });

  it("uses the official CONANP URL in the protected area link", () => {
    expect(es.guidePage.protected.linkHref).toBe("https://descubreanp.conanp.gob.mx/");
    expect(en.guidePage.protected.linkHref).toBe("https://descubreanp.conanp.gob.mx/");
  });

  it("exposes a guide entry in nav for both locales", () => {
    expect(es.nav.guide).toBeTruthy();
    expect(en.nav.guide).toBeTruthy();
    expect(es.nav.guide).not.toBe(en.nav.guide);
  });

  it("exposes page.guide metadata in both locales", () => {
    expect(es.page.guide.siteTitle).toBeTruthy();
    expect(en.page.guide.siteTitle).toBeTruthy();
    expect(es.page.guide.ogTitle).toBeTruthy();
    expect(en.page.guide.ogTitle).toBeTruthy();
  });
});
