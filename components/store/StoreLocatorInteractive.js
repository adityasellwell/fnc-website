"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  Store as StoreIcon,
  Navigation,
  CheckCircle2,
} from "lucide-react";
import Button from "@/components/ui/Button";

// Dynamically import Leaflet Map to avoid SSR errors
const StoreLocatorMap = dynamic(
  () => import("./StoreLocatorMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[350px] lg:min-h-[450px] bg-warmwhite flex flex-col items-center justify-center gap-3 font-body text-slate animate-pulse">
        <MapPin className="h-8 w-8 text-fnc-red animate-bounce" />
        <span>Loading interactive map...</span>
      </div>
    ),
  }
);

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function whatsAppLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function StoreLocatorInteractive({ activeStores = [] }) {
  const [activeStore, setActiveStore] = useState(activeStores[0] || null);
  const [userCoords, setUserCoords] = useState(null);
  const [locationState, setLocationState] = useState("idle"); // idle, prompting, granted, denied, error
  const [distances, setDistances] = useState({}); // storeId -> distance

  const requestLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationState("error");
      return;
    }

    setLocationState("prompting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        setLocationState("granted");

        const dists = {};
        activeStores.forEach((s) => {
          dists[s.id] = calculateDistance(lat, lng, s.geo.lat, s.geo.lng);
        });
        setDistances(dists);
      },
      (error) => {
        console.warn(`Geolocation unavailable (code ${error.code}): ${error.message}`);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
        } else {
          setLocationState("error");
        }
        setUserCoords(null);
        setDistances({});
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, [activeStores]);

  if (!activeStore) return null;

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-stretch w-full">
      {/* Left Column: Store Cards List */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {activeStores.map((s) => {
          const isActive = s.id === activeStore.id;
          const distance = distances[s.id];
          const directionsUrl = userCoords
            ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${s.geo.lat},${s.geo.lng}`
            : s.googleMapsLink;

          return (
            <div
              key={s.id}
              onClick={() => setActiveStore(s)}
              className={`bg-white border rounded-3xl p-6 transition-all duration-300 cursor-pointer shadow-sm relative overflow-hidden flex flex-col gap-4 ${
                isActive
                  ? "border-fnc-red ring-2 ring-fnc-red/20 scale-[1.01]"
                  : "border-bordergray hover:border-charcoal/40"
              }`}
            >
              {/* Active accent strip */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fnc-red" />
              )}

              {/* Title & Status */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-charcoal">
                    {s.name}
                  </h3>
                  <p className="font-body text-xs text-slate mt-0.5">
                    F&C Store Location
                  </p>
                </div>
                <span className="rounded-full bg-fnc-green/10 text-fnc-green font-body text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shrink-0">
                  Open Now
                </span>
              </div>

              {/* Location details */}
              <div className="flex flex-col gap-2.5 font-body text-sm text-slate">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-fnc-red shrink-0 mt-0.5" />
                  <span>
                    {s.address}, {s.city}, {s.state}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-fnc-red shrink-0" />
                  <span>{s.openingHours.mon}</span>
                </p>
                <a
                  href={`tel:${s.phone.replace(/\s+/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-fnc-red transition-colors w-fit"
                >
                  <Phone className="h-4 w-4 text-fnc-red shrink-0" />
                  <span>{s.phone}</span>
                </a>
              </div>

              {/* Geolocation status banner inside active card */}
              {isActive && (
                <div className="mt-1">
                  {locationState === "granted" && distance !== undefined && (
                    <div className="flex items-center gap-2 bg-fnc-green/10 border border-fnc-green/20 text-fnc-green rounded-xl p-3 font-body text-xs font-semibold">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        You are currently{" "}
                        <strong className="font-bold">{distance.toFixed(1)} km</strong>{" "}
                        away.
                      </span>
                    </div>
                  )}

                  {locationState === "prompting" && (
                    <div className="flex items-center gap-2 bg-fnc-blue/10 border border-fnc-blue/20 text-fnc-blue rounded-xl p-3 font-body text-xs font-semibold animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-fnc-blue animate-ping shrink-0 mr-0.5"></span>
                      <span>Detecting location...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons (Only visible on the active/expanded store card!) */}
              {isActive && (
                <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-dashed border-bordergray/60">
                  <Button
                    href={whatsAppLink(s.whatsapp, "Hi! I'd like to place an order.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    variant="primary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                    WhatsApp
                  </Button>
                  <Button
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                  >
                    <Navigation className="h-3.5 w-3.5 shrink-0 text-fnc-red" />
                    Directions
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Column: Separate Interactive Map Container */}
      <div className="lg:col-span-7 bg-white border border-bordergray rounded-3xl overflow-hidden shadow-sm h-[350px] lg:h-auto lg:min-h-[500px]">
        <StoreLocatorMap store={activeStore} userCoords={userCoords} />
      </div>
    </div>
  );
}
