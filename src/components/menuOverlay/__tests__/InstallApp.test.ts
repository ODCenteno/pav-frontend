import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../InstallApp.astro"),
  "utf8",
);

describe("InstallApp heading order", () => {
  it("renders no heading, so each page outline starts with its h1", () => {
    expect(source).not.toMatch(/<h[1-6][\s>]/);
  });

  it("keeps the title element and its visual style", () => {
    expect(source).toMatch(/<p class="install-prompt__title">\{t\("installPrompt\.title"\)\}<\/p>/);
    expect(source).toMatch(/\.install-prompt__title\s*\{[^}]*font-weight:\s*700/);
  });
});
