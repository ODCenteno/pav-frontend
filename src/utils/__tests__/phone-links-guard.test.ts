import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Contract §5b: every tel: / wa.me link goes through `src/utils/phone.ts`.
 * This guard fails when a source file builds one by hand.
 */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Files still building links by hand, owned by another agent. Each entry is
 * tracked as a request in the milestone report; remove it once switched.
 */
const PENDING_OWNER_SWITCH = new Set(["components/community-page/memberCard.ts"]);

const HAND_BUILT_LINK = /(tel:\$\{|wa\.me\/\$\{)/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "__tests__" ? [] : sourceFiles(path);
    return /\.(ts|tsx|astro|js|jsx)$/.test(name) ? [path] : [];
  });
}

describe("phone link guard", () => {
  it("builds tel: and wa.me links only through utils/phone.ts", () => {
    const offenders = sourceFiles(SRC)
      .map((path) => relative(SRC, path))
      .filter((rel) => rel !== "utils/phone.ts" && !PENDING_OWNER_SWITCH.has(rel))
      .filter((rel) => HAND_BUILT_LINK.test(readFileSync(join(SRC, rel), "utf8")));
    expect(offenders).toEqual([]);
  });
});
