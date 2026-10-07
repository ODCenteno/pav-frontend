import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Cloudflare `_headers`: a URL pattern line followed by indented `Name: value`
 * lines. A `! Name` line detaches that header from every other matching rule;
 * it is recorded under the `!name` key.
 */
function parseHeaders(text: string): Map<string, Record<string, string>> {
  const rules = new Map<string, Record<string, string>>();
  let current: Record<string, string> | null = null;
  for (const line of text.split("\n")) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      current = rules.get(line.trim()) ?? {};
      rules.set(line.trim(), current);
    } else if (current) {
      const entry = line.trim();
      if (entry.startsWith("!")) {
        current[`!${entry.slice(1).trim().toLowerCase()}`] = "";
        continue;
      }
      const i = entry.indexOf(":");
      current[entry.slice(0, i).trim().toLowerCase()] = entry.slice(i + 1).trim();
    }
  }
  return rules;
}

describe("public/_headers caching", () => {
  const rules = parseHeaders(readFileSync(resolve(ROOT, "public/_headers"), "utf8"));

  it("caches unhashed /images/* for 30 days, revalidating in the background", () => {
    const cache = rules.get("/images/*")?.["cache-control"] ?? "";
    expect(cache).toContain("public");
    expect(cache).toContain("max-age=2592000");
    expect(cache).toContain("stale-while-revalidate=86400");
    // Unhashed names can change content: never immutable.
    expect(cache).not.toContain("immutable");
  });

  it("keeps the service worker uncached", () => {
    expect(rules.get("/sw.js")?.["cache-control"]).toBe("no-cache, no-store, must-revalidate");
  });

  it("detaches the immutable /*.js cache header from the service worker", () => {
    // /sw.js also matches /*.js; without the detach Cloudflare merges both
    // values into "public, max-age=31536000, immutable, no-cache, no-store, ...".
    expect(rules.get("/*.js")?.["cache-control"]).toContain("immutable");
    expect(rules.get("/sw.js")).toHaveProperty("!cache-control");
  });
});
