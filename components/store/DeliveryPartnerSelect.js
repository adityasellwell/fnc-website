"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Truck } from "lucide-react";
import { useLocationStore } from "@/lib/store/location";
import { cn } from "@/lib/utils";

/**
 * Builds the third-party option list from the store's open-ended
 * deliveryPartnerLinks (admin can add as many platforms as they want),
 * falling back to the legacy fixed swiggyUrl/zomatoUrl fields for stores
 * that only have those set.
 */
function thirdPartyOptionsFor(store) {
  if (Array.isArray(store?.deliveryPartnerLinks) && store.deliveryPartnerLinks.length > 0) {
    return store.deliveryPartnerLinks
      .filter((l) => l.label && l.url)
      .map((l) => ({ key: l.label, label: l.label, url: l.url }));
  }
  const legacy = [];
  if (store?.swiggyUrl) legacy.push({ key: "Swiggy", label: "Swiggy", url: store.swiggyUrl });
  if (store?.zomatoUrl) legacy.push({ key: "Zomato", label: "Zomato", url: store.zomatoUrl });
  return legacy;
}

/**
 * Lets a customer route their order to F&C's own checkout (default,
 * unchanged flow) or open one of the store's admin-configured platform
 * listings in a new tab instead.
 *
 * Direct clickable buttons, not a <select>: a native <select> whose first
 * option is already the default value never fires onChange if that's the
 * option the customer actually wants — clicking "Swiggy" when it's already
 * shown as selected does nothing, silently. Buttons don't have that
 * failure mode — every click is a real click.
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
  const thirdPartyOptions = thirdPartyOptionsFor(store);

  // Nothing to show: serviceable with no third-party listings (just use
  // the normal checkout, no picker needed), or out of radius with no
  // third-party listings either (genuinely nothing we can offer).
  if (outOfRadius ? thirdPartyOptions.length === 0 : thirdPartyOptions.length === 0) return null;

  return (
    <div className="bg-white border border-bordergray rounded-2xl p-4 flex flex-col gap-3">
      {outOfRadius ? (
        <p className="font-body text-xs text-fnc-red font-semibold">
          {store.name} doesn&apos;t deliver directly to you — order via a partner instead:
        </p>
      ) : (
        <label className="font-body text-xs font-semibold text-charcoal">
          How would you like this delivered?
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {!outOfRadius && (
          <div
            className={cn(
              "flex-1 h-11 px-3.5 rounded-xl border-2 border-fnc-red bg-fnc-red/5",
              "flex items-center gap-2 font-body text-sm font-semibold text-fnc-red"
            )}
          >
            <Truck className="h-4 w-4 shrink-0" />
            F&C Delivery
          </div>
        )}
        {thirdPartyOptions.map((p) => (
          <a
            key={p.key}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 px-3.5 rounded-xl border border-bordergray bg-white hover:border-charcoal transition-colors flex items-center justify-between gap-2 font-body text-sm font-semibold text-charcoal"
          >
            {p.label}
            <ExternalLink className="h-3.5 w-3.5 text-slate shrink-0" />
          </a>
        ))}
      </div>

      {!outOfRadius && (
        <p className="font-body text-xs text-slate">
          F&C Delivery continues your order on this site. Swiggy/Zomato opens that platform in a new tab.
        </p>
      )}
    </div>
  );
}
