import { describe, it, expect } from "vitest";
import { buildMapsEmbedUrl } from "../maps";

describe("buildMapsEmbedUrl", () => {
  it("returns the provided locationURL when available", () => {
    const url = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3";
    expect(
      buildMapsEmbedUrl({ lat: 25.5, lng: -111.0 }, url, "es")
    ).toBe(url);
  });

  it("ignores blank strings in locationURL and falls back to coords", () => {
    expect(
      buildMapsEmbedUrl({ lat: 25.5, lng: -111.0 }, "   ", "es")
    ).toBe("https://www.google.com/maps?q=25.5,-111&hl=es&z=14&output=embed");
  });

  it("falls back to a coords-based embed URL when locationURL is undefined", () => {
    expect(
      buildMapsEmbedUrl({ lat: 25.5123, lng: -111.0456 }, undefined, "es")
    ).toBe(
      "https://www.google.com/maps?q=25.5123,-111.0456&hl=es&z=14&output=embed"
    );
  });

  it("uses English locale param when locale starts with 'en'", () => {
    expect(
      buildMapsEmbedUrl({ lat: 25.5, lng: -111.0 }, undefined, "en")
    ).toBe("https://www.google.com/maps?q=25.5,-111&hl=en&z=14&output=embed");
  });

  it("returns undefined when neither locationURL nor coords are available", () => {
    expect(buildMapsEmbedUrl(undefined, undefined, "es")).toBeUndefined();
    expect(buildMapsEmbedUrl({}, null, "es")).toBeUndefined();
  });

  it("returns undefined when lat or lng is missing", () => {
    expect(buildMapsEmbedUrl({ lat: 25.5 }, undefined, "es")).toBeUndefined();
    expect(buildMapsEmbedUrl({ lng: -111.0 }, undefined, "es")).toBeUndefined();
  });
});
