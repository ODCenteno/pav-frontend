import L from "leaflet";

export interface MarkerItem {
  lat: number;
  lng: number;
  title: string;
  href?: string;
  categoryColor: string;
}

export function createCustomIcon(color: string): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" fill="none">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-map-marker",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

export function createPopupContent(title: string, href?: string): string {
  if (href) {
    return `
      <div class="map-popup">
        <span class="map-popup__title">${title}</span>
        <a href="${href}" class="map-popup__link">Ver sitio →</a>
      </div>
    `;
  }
  return `<div class="map-popup"><span class="map-popup__title">${title}</span></div>`;
}

export function getMarkersByCategory(
  items: MarkerItem[],
  locale: string = "es"
): L.Marker[] {
  return items.map((item) => {
    const icon = createCustomIcon(item.categoryColor);
    const marker = L.marker([item.lat, item.lng], { icon });

    const popupContent = createPopupContent(
      item.title,
      item.href ? `/${locale}${item.href}` : undefined
    );
    marker.bindPopup(popupContent);

    return marker;
  });
}