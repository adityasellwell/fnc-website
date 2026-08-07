"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Minimal Leaflet preview — answers exactly one question, "where is the
 * customer?" No zoom controls, no routing, no layers. Navigation itself
 * is handed off to Google Maps (see the "Navigate" button next to this),
 * this is visualization only.
 */
export default function CustomerLocationMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: true,
      attributionControl: false,
    }).setView([lat, lng], 15);

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const customerIcon = L.divIcon({
      className: "custom-customer-pin",
      html: `
        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-fnc-red text-white border-2 border-white shadow-lg select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([lat, lng], { icon: customerIcon }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-40 rounded-xl overflow-hidden" />;
}
