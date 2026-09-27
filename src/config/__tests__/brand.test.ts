import { describe, it, expect } from "vitest";
import { SITE_BRAND_NAME, brandLines } from "../brand";

describe("brandLines", () => {
  it("stacks the site brand on two lines like a logo", () => {
    expect(brandLines(SITE_BRAND_NAME)).toEqual(["Comunidades", "Loretanas"]);
  });

  it("keeps every word after the first on the second line", () => {
    expect(brandLines("Guía Comunitaria Loretana")).toEqual(["Guía", "Comunitaria Loretana"]);
  });

  it("returns a single line for a one-word name", () => {
    expect(brandLines("  Loreto ")).toEqual(["Loreto"]);
  });
});
