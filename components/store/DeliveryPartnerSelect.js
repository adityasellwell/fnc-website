"use client";

import { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { useLocationStore } from "@/lib/store/location";

const THIRD_PARTY = [
  { key: "swiggy", label: "Swiggy", urlField: "swiggyUrl" },
  { key: "zomato", label: "Zomato", urlField: "zomatoUrl" },
];

/**
 * Lets a customer route their order to F&C's own checkout (default,
 * unchanged flow) or open a store's Swiggy/Zomato listing in a new tab
 * instead — same pattern as nbcindia.in's delivery-partner dropdowns.
 *
 * When the customer is OUTSIDE the delivery radius (storeId is null but
 * a nearest store still exists), F&C Delivery is not offered — instead
 * this shows only the third-party options for the nearest store, so
 * there's still a way to order rather than the selector just vanishing.
 */
export default function DeliveryPartnerSelect() {
  const storeId = useLocationStore((s) => s.storeId);
  const nearestStoreId = useLocationStore((s) => s.nearestStoreId);
  const [store, setStore] = useState(null);

  const effectiveStoreId = storeId || nearestStoreId;

  useEffect(() => {
    if (!effectiveStoreId) return;
    fetch("/api/stores")
      .then((res) => res.json())
      .then((payload) => {
        const found = (payload.data || []).find((s) => s.id === effectiveStoreId);
        if (found) setStore(found);
      })
      .catch(() => {});
  }, [effectiveStoreId]);

  if (!store) return null;

  const outOfRadius = !storeId && !!nearestStoreId;
  const thirdPartyOptions = THIRD_PARTY.filter((p) => store[p.urlField]);

  const options = outOfRadius
    ? thirdPartyOptions
    : [{ key: "fnc", label: "F&C Delivery" }, ...thirdPartyOptions];

  // Nothing to show: serviceable with no third-party listings (just use
  // the normal checkout, no dropdown needed), or out of radius with no
  // third-party listings either (genuinely nothing we can offer).
  if (outOfRadius ? options.length === 0 : options.length <= 1) return null;

  function handleChange(e) {
    const key = e.target.value;
    const partner = THIRD_PARTY.find((p) => p.key === key);
    if (partner && store[partner.urlField]) {
      window.open(store[partner.urlField], "_blank");
    }
    e.target.value = options[0].key;
  }

  return (
    <div className="bg-white border border-bordergray rounded-2xl p-4 flex flex-col gap-2">
      {outOfRadius && (
        <p className="font-body text-xs text-fnc-red font-semibold flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {store.name} doesn&apos;t deliver directly to you — order via a partner instead:
        </p>
      )}
      {!outOfRadius && (
        <label className="font-body text-xs font-semibold text-charcoal">
          How would you like this delivered?
        </label>
      )}
      <div className="relative">
        <select
          defaultValue={options[0].key}
          onChange={handleChange}
          className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none appearance-none"
        >
          {options.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate pointer-events-none" />
      </div>
      {!outOfRadius && (
        <p className="font-body text-xs text-slate">
          F&C Delivery continues your order on this site. Swiggy/Zomato opens that platform in a new tab.
        </p>
      )}
    </div>
  );
}
