"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Dynamically import Leaflet map with SSR disabled
const StoreLocatorMap = dynamic(
  () => import("./StoreLocatorMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-warmwhite rounded-3xl flex flex-col items-center justify-center gap-3 font-body text-slate animate-pulse">
        <MapPin className="h-8 w-8 text-fnc-red animate-bounce" />
        <span>Loading store location map...</span>
      </div>
    ),
  }
);

/**
 * Client component wrapper for the Leaflet Map on the Store Detail page,
 * preventing SSR compilation errors for Leaflet.
 */
export default function StoreDetailMapWrapper({ store }) {
  return (
    <div className="relative z-0 w-full h-full min-h-[400px] sm:min-h-[500px]">
      <StoreLocatorMap store={store} />
    </div>
  );
}
