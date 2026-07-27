"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Leaflet Map Component - renders on client side only (due to SSR disabled).
 * Plots the active store location and the visitor's location (if coords provided).
 */
export default function StoreLocatorMap({ store, userCoords }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create Leaflet map instance centered on store
    const map = L.map(mapRef.current, {
      zoomControl: false, // Position zoom control customly
      scrollWheelZoom: false, // Prevent zoom on page scroll
    }).setView([store.geo.lat, store.geo.lng], 14);

    mapInstanceRef.current = map;

    // Custom styled Zoom Control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // OpenStreetMap tiles (standard free map tiles)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create custom F&C Store Marker using Tailwind design system classes
    const storeIcon = L.divIcon({
      className: "custom-store-pin",
      html: `
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-fnc-red text-white border-2 border-white shadow-lg select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const storeMarker = L.marker([store.geo.lat, store.geo.lng], { icon: storeIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-1">
          <strong class="font-display font-bold text-sm text-charcoal block mb-0.5">${store.name}</strong>
          <span class="font-body text-xs text-slate block leading-tight">${store.address}, ${store.city}</span>
         </div>`
      );

    storeMarkerRef.current = storeMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [store]);

  // Handle User Coordinates Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      const { lat, lng } = userCoords;

      // Update or create user marker
      if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
          className: "custom-user-pin",
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-fnc-blue text-white border-2 border-white shadow-md select-none">
              <span class="absolute inset-0 rounded-full bg-fnc-blue animate-ping opacity-45"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-white shadow-inner"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<strong class="font-body text-xs text-charcoal px-1 py-0.5 block">Your Location</strong>`);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
      }

      // Pan & Zoom to fit both store and visitor markers
      const bounds = L.latLngBounds([
        [store.geo.lat, store.geo.lng],
        [lat, lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      // Remove user marker if it exists and reset view to store
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.setView([store.geo.lat, store.geo.lng], 14);
    }
  }, [userCoords, store]);

  return <div ref={mapRef} className="w-full h-full min-h-[350px] lg:min-h-[450px]" />;
}
