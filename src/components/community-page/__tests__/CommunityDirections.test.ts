import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENT_PATH = resolve(__dirname, "../CommunityDirections.astro");
const CSS_PATH = resolve(__dirname, "../communityDirections.css");

let source: string;

beforeAll(() => {
  source = readFileSync(COMPONENT_PATH, "utf8");
});

describe("CommunityDirections (component smoke test)", () => {
  it("has a co-located CSS file that it imports", () => {
    expect(existsSync(CSS_PATH)).toBe(true);
    expect(source).toMatch(/import\s+["']\.\/communityDirections\.css["']/);
  });

  it("resolves the pin and the link through the tested helpers", () => {
    expect(source).toMatch(/resolveCommunityLocation\(/);
    expect(source).toMatch(/buildDirectionsUrl\(/);
  });

  it("renders the existing Leaflet MapView with a single pin", () => {
    expect(source).toMatch(/import\s+MapView\s+from\s+["'][^"']*maps\/MapView["']/);
    // Leaflet touches `window` on import: never server-render the map.
    expect(source).toMatch(/<MapView[\s\S]*client:only="react"/);
    expect(source).not.toMatch(/<MapView[\s\S]*client:visible/);
    expect(source).toMatch(/markers=\{\[marker\]\}/);
  });

  it("renders a heading and a short text from the communityDetail namespace", () => {
    expect(source).toMatch(/<h2[^>]*class="community-directions__title"/);
    expect(source).toContain('t("communityDetail.directions.title")');
    expect(source).toContain('t("communityDetail.directions.text"');
  });

  it("opens the directions link in a new tab with rel noopener", () => {
    expect(source).toMatch(/<a[\s\S]*class="community-directions__cta"[\s\S]*target="_blank"/);
    expect(source).toMatch(/rel="noopener noreferrer"/);
    expect(source).toContain('t("communityDetail.directions.cta")');
    expect(source).toContain('t("communityDetail.directions.newTab")');
  });

  it("uses the community text color (not the surface color) for the button", () => {
    const css = readFileSync(CSS_PATH, "utf8");
    expect(css).toMatch(/\.community-directions__cta\s*\{[^}]*background:\s*var\(--community-color-text/);
    expect(css).toMatch(/\.community-directions__cta:focus-visible/);
  });
});
