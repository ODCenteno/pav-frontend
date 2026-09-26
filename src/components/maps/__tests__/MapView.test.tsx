import { describe, it, expect, vi } from "vitest";

// mapMarker.ts imports Leaflet, which needs `window`; the label test never draws a marker.
vi.mock("../mapMarker", () => ({ createCustomIcon: () => null }));
import { renderToStaticMarkup } from "react-dom/server";
import MapView from "../MapView";

const base = { markers: [], center: [25.5, -111.1] as [number, number] };

describe("MapView accessible label", () => {
  it("announces a Spanish label by default", () => {
    expect(renderToStaticMarkup(<MapView {...base} />)).toContain('aria-label="Mapa interactivo de ubicaciones"');
  });

  it("announces an English label on English pages", () => {
    expect(renderToStaticMarkup(<MapView {...base} locale="en" />)).toContain(
      'aria-label="Interactive map of locations"',
    );
  });

  it("accepts an explicit label", () => {
    expect(renderToStaticMarkup(<MapView {...base} locale="en" ariaLabel="Community map" />)).toContain(
      'aria-label="Community map"',
    );
  });
});

describe("MapView fitBounds padding", () => {
  it("leaves room above the top-most pin, which is drawn upward from its anchor (36px icon)", async () => {
    const { FIT_BOUNDS_OPTIONS } = await import("../MapView");
    expect(FIT_BOUNDS_OPTIONS.paddingTopLeft[1]).toBeGreaterThanOrEqual(36 + 24);
    expect(FIT_BOUNDS_OPTIONS.maxZoom).toBe(14);
  });
});
