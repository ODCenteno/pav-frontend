declare module "leaflet" {
  export interface DivIconOptions {
    html?: string;
    className?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  }

  export interface DivIcon {
    options: DivIconOptions;
  }

  export interface LatLngBounds {
    isValid(): boolean;
  }

  export interface Map {
    remove(): void;
    invalidateSize(options?: { animate?: boolean }): void;
    setView(latlng: [number, number], zoom: number): Map;
    fitBounds(bounds: LatLngBounds, options?: { padding?: [number, number]; maxZoom?: number }): Map;
  }

  export interface Marker {
    bindPopup(content: string, options?: { maxWidth?: number; className?: string }): Marker;
    addTo(map: Map): Marker;
  }

  export interface FeatureGroup {
    getBounds(): LatLngBounds;
  }

  export interface MapFactory {
    map(element: HTMLElement, options?: Record<string, unknown>): Map;
    tileLayer(url: string, options?: Record<string, unknown>): { addTo: (map: Map) => void };
    marker(latlng: [number, number], options?: { icon?: DivIcon }): Marker;
    featureGroup(markers: Marker[]): FeatureGroup;
    divIcon(options: DivIconOptions): DivIcon;
  }

  const L: MapFactory;
  export default L;
}
