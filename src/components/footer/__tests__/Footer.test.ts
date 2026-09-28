import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(resolve(DIR, rel), "utf8");

let footer: string;
let css: string;
let es: any;
let en: any;

beforeAll(() => {
  footer = read("../Footer.astro");
  css = read("../footer.css");
  es = JSON.parse(read("../../../i18n/es.json"));
  en = JSON.parse(read("../../../i18n/en.json"));
});

describe("F1 footer", () => {
  it("removes the Contáctanos column", () => {
    for (const gone of ["footer.contactTitle", "footer-contact", "footer-social", "tel", "whatsappHref", "mailto:", "footer.note"]) {
      expect(footer).not.toContain(gone);
    }
  });

  it("lists the quick links in the agreed order", () => {
    const order = [
      "goodPracticesPath(locale)",
      "communities.map",
      "favoritesPath(locale)",
      "navigation.sites(locale)",
    ];
    const positions = order.map((needle) => footer.indexOf(needle));
    expect(positions.every((p) => p > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("links each community page", () => {
    expect(footer).toMatch(/communityPath\(community\.slug, locale\)/);
  });

  it("drops the old home-anchor, experiences, guide and about links", () => {
    expect(footer).not.toContain("navigation.experiences");
    expect(footer).not.toContain("navigation.homeAnchor");
    expect(footer).not.toContain("navigation.guide");
    expect(footer).not.toContain("navigation.about");
  });

  it("labels the quick links as a navigation landmark", () => {
    expect(footer).toMatch(/<nav class="footer-col"[^>]*aria-label=\{t\("footer\.title"\)\}/);
  });

  it("lays out two columns on desktop", () => {
    expect(css).toMatch(/\.footer-grid\s*\{[^}]*grid-template-columns:\s*1\.5fr 1fr;/);
  });

  it("defines footer.goodPractices in both locales", () => {
    expect(es.footer.goodPractices).toBe("Buenas prácticas");
    expect(en.footer.goodPractices).toBe("Good practices");
  });
});
