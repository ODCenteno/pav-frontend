/**
 * Map marker icon factory — browser-only (imports Leaflet).
 *
 * Kept in a separate file from `mapIcons.ts` so the popup HTML builder
 * has no Leaflet dependency and can be unit-tested in a Node environment.
 *
 * `import type { MarkerItem } from "./mapIcons"` gives the marker factory
 * strong typing without dragging Leaflet into the testable module.
 */
import type L from "leaflet";
import type { MarkerItem } from "./mapIcons";

export function createCustomIcon(color: string): L.DivIcon {
  const safeColor = escapeAttr(color);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" fill="none" aria-hidden="true">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${safeColor}"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  `;
  return (L as unknown as { divIcon: (opts: unknown) => L.DivIcon }).divIcon({
    html: svg,
    className: "custom-map-marker",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
