import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENT_PATH = resolve(__dirname, "../CommunityBadge.astro");
const CSS_PATH = resolve(__dirname, "../communityBadge.css");

let source: string;

beforeAll(() => {
  source = readFileSync(COMPONENT_PATH, "utf8");
});

describe("CommunityBadge (component smoke test)", () => {
  it("component file exists", () => {
    expect(existsSync(COMPONENT_PATH)).toBe(true);
  });

  it("co-located CSS file exists and is imported", () => {
    expect(existsSync(CSS_PATH)).toBe(true);
    expect(source).toMatch(/import\s+["']\.\/communityBadge\.css["']/);
  });

  it("declares a Props interface with community, size, showName and locale", () => {
    expect(source).toMatch(/interface\s+Props/);
    expect(source).toMatch(/community\??:\s*CommunityRef\s*\|\s*null/);
    expect(source).toMatch(/size\??:\s*"sm"\s*\|\s*"lg"/);
    expect(source).toMatch(/showName\??:\s*boolean/);
    expect(source).toMatch(/locale\??:\s*string/);
  });

  it("defaults size to sm, showName to false and locale to es-MX", () => {
    expect(source).toMatch(/size\s*=\s*"sm"/);
    expect(source).toMatch(/showName\s*=\s*false/);
    expect(source).toMatch(/locale\s*=\s*"es-MX"/);
  });

  it("renders nothing without a community", () => {
    expect(source).toMatch(/\{\s*community\s*&&\s*\(/);
  });

  it("exposes an accessible label naming the community via the i18n key", () => {
    expect(source).toMatch(/aria-label=\{decorative \? undefined : ariaLabel\}/);
    expect(source).toMatch(/communityBadge\.ariaLabel/);
    expect(source).toMatch(/name:\s*community\.name/);
  });

  it("can render as decorative inside a link that already names the community", () => {
    expect(source).toMatch(/decorative\??:\s*boolean/);
    expect(source).toMatch(/decorative\s*=\s*false/);
    expect(source).toMatch(/role=\{decorative \? undefined : "img"\}/);
    expect(source).toMatch(/aria-label=\{decorative \? undefined : ariaLabel\}/);
    expect(source).toMatch(/aria-hidden=\{decorative \? "true" : undefined\}/);
  });

  it("renders the icon image as decorative (empty alt, aria-hidden)", () => {
    expect(source).toMatch(/alt=""/);
    expect(source).toMatch(/aria-hidden="true"/);
    expect(source).toMatch(/<img[^>]*class="community-badge__icon"/);
  });

  it("sets explicit width/height on the icon to avoid layout shift", () => {
    expect(source).toMatch(/<img[^>]*width=/);
    expect(source).toMatch(/<img[^>]*height=/);
    expect(source).toMatch(/width=\{BADGE_ICON_SIZE\.width\}/);
    expect(source).toMatch(/height=\{BADGE_ICON_SIZE\.height\}/);
  });

  it("uses communityStyle for the theme custom properties", () => {
    expect(source).toMatch(/communityStyle\(/);
  });

  it("applies the size modifier class from the size prop", () => {
    expect(source).toMatch(/community-badge--\$\{size\}/);
  });

  it("shows the community name only when showName is set", () => {
    expect(source).toMatch(/\{\s*showName\s*&&\s*</);
    expect(source).toMatch(/community-badge__name/);
  });

  it("CSS defines the BEM classes and consumes the theme custom properties", () => {
    const css = readFileSync(CSS_PATH, "utf8");
    for (const cls of [
      ".community-badge",
      ".community-badge__icon",
      ".community-badge__name",
      ".community-badge--sm",
      ".community-badge--lg",
    ]) {
      expect(css).toContain(cls);
    }
    expect(css).toContain("var(--community-color-text)");
  });
});

describe("communityBadge i18n keys", () => {
  const es = JSON.parse(readFileSync(resolve(__dirname, "../../../i18n/es.json"), "utf8"));
  const en = JSON.parse(readFileSync(resolve(__dirname, "../../../i18n/en.json"), "utf8"));

  it("defines ariaLabel with a {{name}} placeholder in both locales", () => {
    expect(typeof es.communityBadge.ariaLabel).toBe("string");
    expect(typeof en.communityBadge.ariaLabel).toBe("string");
    expect(es.communityBadge.ariaLabel).toContain("{{name}}");
    expect(en.communityBadge.ariaLabel).toContain("{{name}}");
    expect(es.communityBadge.ariaLabel).not.toBe(en.communityBadge.ariaLabel);
  });

  it("keeps the _note key and does not touch the agent C namespaces", () => {
    expect(es.communityBadge._note).toBeDefined();
    expect(en.communityBadge._note).toBeDefined();
    expect(es.communityDetail._note).toBeDefined();
    expect(en.goodPractices._note).toBeDefined();
  });
});
