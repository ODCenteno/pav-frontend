import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CSS = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../globals.css"), "utf8");

/** The declarations of the first rule whose selector is exactly `selector`. */
function rule(selector: string, from = 0): string {
  const at = CSS.indexOf(`${selector} {`, from);
  expect(at, `${selector} rule`).toBeGreaterThan(-1);
  return CSS.slice(at, CSS.indexOf("}", at));
}

describe("shared section spacing", () => {
  it("defines mobile-first gutter and section tokens: small spacing, never under 16px", () => {
    const root = rule(":root");
    expect(root).toMatch(/--gutter:\s*max\(1rem, var\(--space-sm\)\)/);
    expect(root).toMatch(/--section-space:\s*var\(--space-sm\)/);
  });

  it("restores the roomier tablet and desktop spacing from 768px", () => {
    const tablet = CSS.slice(CSS.indexOf("@media (min-width: 768px) {\n    :root"));
    expect(tablet).toMatch(/--gutter:\s*var\(--space-md\)/);
    expect(tablet).toMatch(/--section-space:\s*var\(--space-lg\)/);
  });

  it("drives .container gutters and .section-padding from the tokens", () => {
    expect(rule(".container")).toMatch(/width:\s*100%/);
    // Raised specificity: a component rule such as `.product-list { padding:
    // X 0 }` or `.section-padding` on the same element must not drop the gutter.
    expect(rule(":root .container")).toMatch(/padding-inline:\s*var\(--gutter\)/);
    expect(rule(".section-padding")).toMatch(/padding:\s*var\(--section-space\) 0/);
  });
});
