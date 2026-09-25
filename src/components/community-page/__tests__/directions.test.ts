import { describe, expect, it } from "vitest";
import { buildDirectionsUrl, resolveCommunityLocation } from "../directions";

describe("resolveCommunityLocation", () => {
  it("prefers the CMS location", () => {
    expect(resolveCommunityLocation({ slug: "puerto-agua-verde", location: { lat: 1, lng: 2 } })).toEqual({
      lat: 1,
      lng: 2,
    });
  });

  it("falls back to the bundled fixture coordinates", () => {
    expect(resolveCommunityLocation({ slug: "rancho-san-cosme" })).toEqual({
      lat: 25.5784138,
      lng: -111.1694027,
    });
  });

  it("returns undefined for an unknown slug without a location", () => {
    expect(resolveCommunityLocation({ slug: "unknown" })).toBeUndefined();
  });
});

describe("buildDirectionsUrl", () => {
  it("uses googleMapsUrl when it is set", () => {
    expect(
      buildDirectionsUrl({ googleMapsUrl: " https://maps.app.goo.gl/abc ", location: { lat: 1, lng: 2 } })
    ).toBe("https://maps.app.goo.gl/abc");
  });

  it("builds a Google Maps directions URL from lat/lng when googleMapsUrl is empty", () => {
    expect(buildDirectionsUrl({ googleMapsUrl: "", location: { lat: 25.51204, lng: -111.07577 } })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=25.51204,-111.07577"
    );
  });

  it("returns undefined when there is neither a URL nor a location", () => {
    expect(buildDirectionsUrl({})).toBeUndefined();
  });
});
