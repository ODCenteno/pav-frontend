import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { redirects } from "../redirects";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("F10 redirects", () => {
  it("sends /experiencias and /en/experiencias home with a permanent redirect", () => {
    expect(redirects["/experiencias"]).toEqual({ status: 301, destination: "/" });
    expect(redirects["/en/experiencias"]).toEqual({ status: 301, destination: "/en/" });
  });

  it("is wired into the Astro config", () => {
    const config = readFileSync(resolve(ROOT, "astro.config.mjs"), "utf8");
    expect(config).toMatch(/import \{ redirects \} from "\.\/src\/config\/redirects"/);
    expect(config).toMatch(/^\s*redirects,$/m);
  });

  it("removes the experiences pages but keeps guide, acerca, comunidad and sitios", () => {
    for (const page of ["experiencias.astro", "en/experiencias.astro"]) {
      expect(existsSync(resolve(ROOT, "src/pages", page))).toBe(false);
    }
    for (const page of ["guide", "acerca", "comunidad", "sitios"]) {
      expect(existsSync(resolve(ROOT, "src/pages", `${page}.astro`))).toBe(true);
      expect(existsSync(resolve(ROOT, "src/pages/en", `${page}.astro`))).toBe(true);
    }
  });
});
