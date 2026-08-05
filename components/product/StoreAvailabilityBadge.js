"use client";

import { useEffect, useState } from "react";
import { MapPin, ArrowRightLeft } from "lucide-react";
import { useLocationStore } from "@/lib/store/location";
import { ENFORCE_STOCK_GATING } from "@/lib/constants";

/**
 * "Unavailable at Thane — Available at Powai" cross-store messaging.
 * Only renders once ENFORCE_STOCK_GATING is on and real per-store stock
 * numbers exist — otherwise every product would falsely show as
 * unavailable everywhere, which is worse than showing nothing.
 */
export default function StoreAvailabilityBadge({ storeInventory = [] }) {
  const storeId = useLocationStore((s) => s.storeId);
  const setLocation = useLocationStore((s) => s.setLocation);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- standard hydration guard for a persisted (localStorage) client store
  useEffect(() => setMounted(true), []);

  if (!ENFORCE_STOCK_GATING || !mounted || !storeId) return null;

  const currentInv = storeInventory.find((i) => i.storeId === storeId);
  const inStockHere = currentInv && currentInv.stock > 0;
  if (inStockHere) return null;

  const alternative = storeInventory.find(
    (i) => i.storeId !== storeId && i.stock > 0 && i.store?.status === "ACTIVE"
  );
  if (!alternative) return null;

  function handleSwitch() {
    setLocation({
      storeId: alternative.storeId,
      label: alternative.store?.name || "Selected store",
      isServiceable: true,
    });
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
      <p className="font-body text-sm text-charcoal flex items-center gap-2">
        <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
        Unavailable at {currentInv?.store?.name || "your store"} — available at{" "}
        <span className="font-semibold">{alternative.store?.name}</span>
      </p>
      <button
        type="button"
        onClick={handleSwitch}
        className="h-9 px-4 rounded-full bg-charcoal text-white font-body text-xs font-bold hover:bg-charcoal/90 transition-colors flex items-center gap-1.5 shrink-0"
      >
        <ArrowRightLeft className="h-3.5 w-3.5" />
        Switch Store
      </button>
    </div>
  );
}
