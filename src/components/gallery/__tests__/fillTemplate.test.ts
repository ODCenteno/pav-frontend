import { describe, expect, it } from "vitest";
import { fillTemplate } from "../fillTemplate";

describe("fillTemplate", () => {
  it("replaces every {{key}} placeholder with its value", () => {
    expect(fillTemplate("Photo {{index}} of {{total}}", { index: 2, total: 5 })).toBe("Photo 2 of 5");
  });

  it("replaces repeated placeholders", () => {
    expect(fillTemplate("{{name}} / {{name}}", { name: "PAV" })).toBe("PAV / PAV");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(fillTemplate("{{name}} {{missing}}", { name: "PAV" })).toBe("PAV {{missing}}");
  });
});
