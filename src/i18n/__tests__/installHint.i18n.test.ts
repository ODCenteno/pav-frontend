import { describe, it, expect } from "vitest";
import es from "../es.json";
import en from "../en.json";

type JsonObject = Record<string, any>;

function get(obj: JsonObject, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as JsonObject)) {
      return (acc as JsonObject)[key];
    }
    return undefined;
  }, obj);
}

describe("installHint i18n parity", () => {
  it("has matching keys in Spanish and English", () => {
    const esBody = get(es, "installHint.body") as string | undefined;
    const enBody = get(en, "installHint.body") as string | undefined;
    expect(esBody).toBeTruthy();
    expect(enBody).toBeTruthy();
    expect(typeof esBody).toBe("string");
    expect(typeof enBody).toBe("string");
  });

  it("body text is non-empty and short enough to fit in 2 lines", () => {
    const esBody = (get(es, "installHint.body") as string) || "";
    const enBody = (get(en, "installHint.body") as string) || "";
    expect(esBody.length).toBeGreaterThan(20);
    expect(esBody.length).toBeLessThan(160);
    expect(enBody.length).toBeGreaterThan(20);
    expect(enBody.length).toBeLessThan(160);
  });

  it("Spanish hint mentions offline + favorites (value props)", () => {
    const esBody = ((get(es, "installHint.body") as string) || "").toLowerCase();
    expect(esBody).toContain("sin conexi");
    expect(esBody).toContain("favorit");
  });

  it("English hint mentions offline + favorites (value props)", () => {
    const enBody = ((get(en, "installHint.body") as string) || "").toLowerCase();
    expect(enBody).toContain("offline");
    expect(enBody).toContain("favorite");
  });
});
