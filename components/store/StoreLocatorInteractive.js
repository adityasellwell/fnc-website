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
  AlertCircle,
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

export default function StoreLocatorInteractive({ store }) {
  const [userCoords, setUserCoords] = useState(null);
  const [locationState, setLocationState] = useState("idle"); // idle, prompting, granted, denied, error
  const [distance, setDistance] = useState(null);

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

        const dist = calculateDistance(lat, lng, store.geo.lat, store.geo.lng);
        setDistance(dist);
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState("denied");
        } else {
          setLocationState("error");
        }
        setUserCoords(null);
        setDistance(null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Request location automatically on mount
  useEffect(() => {
    requestLocation();
  }, [store]);

  const directionsUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${store.geo.lat},${store.geo.lng}`
    : store.googleMapsLink;

  return (
    <div className="bg-white border border-bordergray rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Map Header / Container */}
      <div className="relative z-0 w-full h-[350px] lg:h-[450px] bg-warmwhite border-b border-bordergray">
        <StoreLocatorMap store={store} userCoords={userCoords} />
      </div>

      {/* Store Info & Geolocation Controls */}
      <div className="p-6 sm:p-8 flex flex-col gap-5 flex-1">
        {/* Header and Open Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal">
              {store.name}
            </h3>
            <p className="font-body text-sm text-slate mt-0.5">
              F&C Flagship Store
            </p>
          </div>
          <span className="rounded-full bg-fnc-green/10 text-fnc-green font-body text-xs font-semibold px-3 py-1 shrink-0">
            Open Now
          </span>
        </div>

        {/* Location / Details list */}
        <div className="flex flex-col gap-3 font-body text-base text-slate">
          <p className="flex items-start gap-2.5">
            <MapPin className="h-5 w-5 text-fnc-red shrink-0 mt-0.5" />
            <span>
              {store.address}, {store.city}, {store.state}
            </span>
          </p>
          <p className="flex items-center gap-2.5">
            <Clock className="h-5 w-5 text-fnc-red shrink-0" />
            <span>{store.openingHours.mon}</span>
          </p>
          <a
            href={`tel:${store.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2.5 hover:text-fnc-red transition-colors w-fit"
          >
            <Phone className="h-5 w-5 text-fnc-red shrink-0" />
            <span>{store.phone}</span>
          </a>
        </div>

        {/* Dynamic Distance and Geolocation Status Banner */}
        <div className="mt-1">
          {locationState === "granted" && distance !== null && (
            <div className="flex items-center gap-2 bg-fnc-green/10 border border-fnc-green/20 text-fnc-green rounded-2xl p-4 font-body text-sm font-medium">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>
                You are currently{" "}
                <strong className="font-bold">{distance.toFixed(1)} km</strong>{" "}
                away from this store.
              </span>
            </div>
          )}

          {locationState === "prompting" && (
            <div className="flex items-center gap-2 bg-fnc-blue/10 border border-fnc-blue/20 text-fnc-blue rounded-2xl p-4 font-body text-sm font-medium animate-pulse">
              <span className="h-2 w-2 rounded-full bg-fnc-blue animate-ping shrink-0 mr-1"></span>
              <span>Requesting location permission...</span>
            </div>
          )}

          {(locationState === "denied" || locationState === "error") && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-charcoal/5 border border-bordergray text-slate rounded-2xl p-4 font-body text-sm">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertCircle className="h-5 w-5 text-slate shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  {locationState === "denied"
                    ? "Location permission denied. Distance is unavailable."
                    : "Unable to determine your location."}
                </span>
              </div>
              <button
                type="button"
                onClick={requestLocation}
                className="text-xs font-semibold text-fnc-red hover:underline text-left shrink-0"
              >
                Enable Location
              </button>
            </div>
          )}
        </div>

        {/* Fulfillment indicators */}
        <div className="flex flex-wrap gap-2.5 mt-1">
          {store.deliveryAvailable && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-fnc-blue/10 text-fnc-blue font-body text-xs sm:text-sm font-semibold px-3 py-1.5">
              <Truck className="h-4 w-4" />
              Delivery Available
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/5 text-charcoal font-body text-xs sm:text-sm font-semibold px-3 py-1.5">
            <StoreIcon className="h-4 w-4" />
            In-Store Pickup
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-3 mt-auto pt-2">
          <Button
            href={whatsAppLink(store.whatsapp, "Hi! I'd like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="md"
            className="w-full flex items-center justify-center gap-2"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            Order on WhatsApp
          </Button>
          <Button
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="md"
            className="w-full flex items-center justify-center gap-2"
          >
            <Navigation className="h-4 w-4 shrink-0 text-fnc-red" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  );
}
