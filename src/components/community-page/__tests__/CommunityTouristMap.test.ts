import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../../..");
const COMPONENT_PATH = resolve(__dirname, "../CommunityTouristMap.astro");
const CSS_PATH = resolve(__dirname, "../communityTouristMap.css");

let source: string;

beforeAll(() => {
  source = readFileSync(COMPONENT_PATH, "utf8");
});

describe("CommunityTouristMap (component smoke test)", () => {
  it("has a co-located CSS file that it imports", () => {
    expect(existsSync(CSS_PATH)).toBe(true);
    expect(source).toMatch(/import\s+["']\.\/communityTouristMap\.css["']/);
  });

  it("reuses the guide's fullscreen ExpandableImage viewer", () => {
    expect(source).toMatch(/import\s+ExpandableImage\s+from\s+["'][^"']*guide\/ExpandableImage["']/);
    expect(source).toMatch(/<ExpandableImage[\s\S]*client:visible/);
    expect(source).toContain('t("communityDetail.touristMap.expand")');
  });

  it("falls back to a bundled mock image while touristMapImage is empty", () => {
    const match = source.match(/MOCK_TOURIST_MAP\s*=\s*["']([^"']+)["']/);
    expect(match).not.toBeNull();
    expect(existsSync(resolve(ROOT, "public", `.${match![1]}`))).toBe(true);
    expect(source).toMatch(/image\?\.trim\(\)\s*\|\|\s*MOCK_TOURIST_MAP/);
  });

  it("renders the title and a figcaption with the caption", () => {
    expect(source).toMatch(/<h2[^>]*class="community-tourist-map__title"/);
    expect(source).toMatch(/<figcaption[^>]*class="community-tourist-map__caption"/);
  });
});
