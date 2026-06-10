import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENT_PATH = resolve(__dirname, "../GuideAmenities.astro");
const CSS_PATH = resolve(__dirname, "../guideAmenities.css");

let source: string;

beforeAll(() => {
  source = readFileSync(COMPONENT_PATH, "utf8");
});

describe("GuideAmenities (component smoke test)", () => {
  it("component file exists", () => {
    expect(existsSync(COMPONENT_PATH)).toBe(true);
  });

  it("co-located CSS file exists", () => {
    expect(existsSync(CSS_PATH)).toBe(true);
  });

  it("imports the co-located CSS file", () => {
    expect(source).toMatch(/import\s+["']\.\/guideAmenities\.css["']/);
  });

  it("imports the SvgIcon component", () => {
    expect(source).toMatch(/import\s+SvgIcon\s+from\s+["'][^"']*icons\/SvgIcon\.astro["']/);
  });

  it("declares a Props interface with localized title and items shape", () => {
    expect(source).toMatch(/interface\s+Props/);
    expect(source).toMatch(/title:\s*\{\s*es:\s*string;\s*en:\s*string/);
    expect(source).toMatch(/items:\s*AmenityItem\[\]/);
  });

  it("renders a section with a heading bound to data.title", () => {
    expect(source).toMatch(/<section[^>]*class="guide-amenities/);
    expect(source).toMatch(/<h2[^>]*class="guide-amenities__title">/);
    expect(source).toMatch(/\{data\.title\[lang\]\}/);
  });

  it("renders one tile per item with the SvgIcon component for the icon", () => {
    expect(source).toMatch(/\{items\.map\(\(item\)\s*=>/);
    expect(source).toMatch(/<SvgIcon\s+name=\{item\.icon\}/);
    expect(source).toMatch(/\{item\.title\[lang\]\}/);
    expect(source).toMatch(/\{item\.text\[lang\]\}/);
  });

  it("picks the language from a locale prop defaulting to 'es'", () => {
    expect(source).toMatch(/locale\s*=\s*"es"/);
    expect(source).toMatch(/lang\s*=\s*locale\?\.startsWith\(\s*"en"\s*\)\s*\?\s*"en"\s*:\s*"es"/);
  });

  it("references all required amenity icon names in its source", () => {
    // The component itself does not need to mention each icon name, but the
    // data it consumes is documented by the prop type. We verify the union
    // is present so renaming an icon at the data layer will fail type-check.
    expect(source).toMatch(/"wifi"\s*\|\s*"signal"\s*\|\s*"toilet"\s*\|\s*"parking"\s*\|\s*"water"/);
  });

  it("CSS uses BEM-like classes that the template relies on", () => {
    const css = readFileSync(CSS_PATH, "utf8");
    for (const cls of [
      ".guide-amenities",
      ".guide-amenities__grid",
      ".guide-amenities__tile",
      ".guide-amenities__icon",
      ".guide-amenities__tile-title",
      ".guide-amenities__tile-text",
    ]) {
      expect(css).toContain(cls);
    }
  });
});
