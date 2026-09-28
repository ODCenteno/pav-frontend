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

  it("removes the experiences, guide, acerca and comunidad pages but keeps sitios", () => {
    for (const page of ["experiencias.astro", "en/experiencias.astro", "guide.astro", "en/guide.astro", "acerca.astro", "en/acerca.astro", "comunidad.astro", "en/comunidad.astro"]) {
      expect(existsSync(resolve(ROOT, "src/pages", page))).toBe(false);
    }
    for (const page of ["sitios"]) {
      expect(existsSync(resolve(ROOT, "src/pages", `${page}.astro`))).toBe(true);
      expect(existsSync(resolve(ROOT, "src/pages/en", `${page}.astro`))).toBe(true);
    }
  });

  it("sends /guide, /acerca and /comunidad (and their /en/ copies) to their contract-phase destinations", () => {
    // No separate trailing-slash entries: astro.config.mjs's default
    // trailingSlash: "ignore" matches a request with or without one, and a
    // duplicate "/path/" key would collide with "/path" as the same route.
    expect(redirects["/guide"]).toEqual({ status: 301, destination: "/buenas-practicas/" });
    expect(redirects["/en/guide"]).toEqual({ status: 301, destination: "/en/buenas-practicas/" });

    expect(redirects["/acerca"]).toEqual({ status: 301, destination: "/" });
    expect(redirects["/en/acerca"]).toEqual({ status: 301, destination: "/en/" });

    expect(redirects["/comunidad"]).toEqual({ status: 301, destination: "/" });
    expect(redirects["/en/comunidad"]).toEqual({ status: 301, destination: "/en/" });
  });

  it("does not define trailing-slash duplicate keys (router collision)", () => {
    for (const key of Object.keys(redirects)) {
      expect(key.endsWith("/") && key !== "/").toBe(false);
    }
  });
});
