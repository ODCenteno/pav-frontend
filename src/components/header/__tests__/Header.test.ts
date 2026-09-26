import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(resolve(DIR, rel), "utf8");

let header: string;
let css: string;
let menuScript: string;
let overlay: string;
let es: any;
let en: any;

beforeAll(() => {
  header = read("../Header.astro");
  css = read("../header.css");
  menuScript = read("../communityMenu.ts");
  overlay = read("../../menuOverlay/MenuOverlay.astro");
  es = JSON.parse(read("../../../i18n/es.json"));
  en = JSON.parse(read("../../../i18n/en.json"));
});

describe("F1 header (desktop)", () => {
  it("links good practices, the communities submenu and favorites, in that order", () => {
    const gp = header.indexOf("goodPracticesPath(locale)");
    const communities = header.indexOf('t("nav.communities")');
    const favorites = header.indexOf("favoritesPath(locale)");
    expect(gp).toBeGreaterThan(-1);
    expect(communities).toBeGreaterThan(gp);
    expect(favorites).toBeGreaterThan(communities);
  });

  it("drops the old experiences, sites, guide and about items", () => {
    for (const old of ["navigation.experiences", "navigation.sites", "navigation.guide", "navigation.about"]) {
      expect(header).not.toContain(old);
    }
  });

  it("toggles the submenu with a button carrying aria-expanded and aria-controls", () => {
    expect(header).toMatch(
      /<button[^>]*type="button"[^>]*aria-expanded="false"[^>]*aria-controls="community-submenu"/,
    );
    expect(header).toMatch(/<ul[^>]*id="community-submenu"/);
  });

  it("lists each community with its badge and community page link", () => {
    expect(header).toMatch(/communities\.map/);
    expect(header).toMatch(/communityPath\(community\.slug, locale\)/);
    expect(header).toMatch(/<CommunityBadge\s+community=\{community\}/);
  });

  it("keeps the EN switch", () => {
    expect(header).toContain('id="i18n-toggle"');
  });

  it("wires the submenu behavior from communityMenu.ts", () => {
    expect(header).toMatch(/import \{ initCommunityMenu \} from "\.\/communityMenu"/);
  });

  it("opens on hover and focus, closes on Escape and syncs aria-expanded", () => {
    for (const event of ["mouseenter", "mouseleave", "focusin", "focusout", "keydown", "click"]) {
      expect(menuScript).toContain(`"${event}"`);
    }
    expect(menuScript).toContain('"Escape"');
    expect(menuScript).toContain('setAttribute("aria-expanded"');
  });

  it("shows the submenu only in the open state and gives it a focus style", () => {
    expect(css).toMatch(/\.main-nav--submenu\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/\.is-open\s*>\s*\.main-nav--submenu\s*\{[^}]*display:\s*(flex|block|grid)/);
    expect(css).toMatch(/:focus-visible/);
  });
});

describe("F1 mobile menu", () => {
  it("shows both community links directly, with no toggle", () => {
    expect(overlay).toMatch(/communities\.map/);
    expect(overlay).toMatch(/communityPath\(community\.slug, locale\)/);
    expect(overlay).not.toContain("aria-controls=\"community-submenu\"");
  });

  it("links good practices and favorites and keeps the EN switch", () => {
    expect(overlay).toContain("goodPracticesPath(locale)");
    expect(overlay).toContain("favoritesPath(locale)");
    expect(overlay).toContain('id="i18n-toggle-mobile"');
  });

  it("drops the experiences link", () => {
    expect(overlay).not.toContain("navigation.experiences");
  });
});

describe("nav i18n keys", () => {
  it.each(["goodPractices", "communities", "favorites", "mainLabel", "openMenu", "closeMenu", "mobileMenu"])(
    "defines nav.%s in both locales",
    (key) => {
      expect(typeof es.nav[key]).toBe("string");
      expect(typeof en.nav[key]).toBe("string");
    },
  );

  it("uses the agreed labels", () => {
    expect(es.nav.goodPractices).toBe("Buenas Prácticas y Turismo Sustentable");
    expect(es.nav.communities).toBe("Nuestras Comunidades");
    expect(es.nav.favorites).toBe("Favoritos");
    expect(en.nav.goodPractices).toBe("Good Practices and Sustainable Tourism");
    expect(en.nav.communities).toBe("Our Communities");
    expect(en.nav.favorites).toBe("Favorites");
  });
});
