import { useEffect, useRef, useState } from "react";
import type { MarkerItem } from "./mapIcons";
import "leaflet/dist/leaflet.css";
import "./mapView.css";

interface MapViewProps {
  markers: MarkerItem[];
  center: [number, number];
  zoom?: number;
  height?: number | string;
  fullScreen?: boolean;
  className?: string;
}

export default function MapView({
  markers,
  center,
  zoom = 13,
  height = 250,
  fullScreen = false,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const { createCustomIcon, createPopupContent } = await import("./mapIcons");

      markers.forEach((marker) => {
        const icon = createCustomIcon(marker.categoryColor);
        const popupContent = createPopupContent(
          marker.title,
          marker.href ? `/${marker.href}` : undefined
        );

        L.marker([marker.lat, marker.lng], { icon })
          .bindPopup(popupContent)
          .addTo(map);
      });

      if (markers.length === 1) {
        map.setView(center, zoom);
      } else if (markers.length > 1) {
        const group = L.featureGroup(
          markers.map((m) =>
            L.marker([m.lat, m.lng], {
              icon: createCustomIcon(m.categoryColor),
            })
          )
        );
        map.fitBounds(group.getBounds().pad(0.1));
      }

      leafletMapRef.current = map;
      map.invalidateSize({ animate: false });
      setIsLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [markers, center, zoom]);

  const heightValue = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`map-container ${fullScreen ? "map-container--full" : ""} ${className}`}
      style={{ height: heightValue }}
    >
      <div
        ref={mapRef}
        className="leaflet-container"
        style={{ height: heightValue }}
      />
      {!isLoaded && (
        <div className="map-skeleton" style={{ height: heightValue, zIndex: 2 }}>
          <svg
            className="map-skeleton__icon"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
      )}
    </div>
  );
}