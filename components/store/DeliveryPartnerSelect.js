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

// Real platform brand colors so each button is instantly recognizable —
// a generic outline pill reads as "just another form field," a filled
// brand-colored button reads as "tap here to order." Any other custom
// platform the admin adds (Dunzo, ONDC...) falls back to solid charcoal.
const BRAND_STYLES = {
  Swiggy: "bg-[#FC8019] hover:bg-[#e57316] text-white",
  Zomato: "bg-[#E23744] hover:bg-[#cc2f3b] text-white",
};
const DEFAULT_STYLE = "bg-charcoal hover:bg-charcoal/90 text-white";

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
  if (thirdPartyOptions.length === 0) return null;

  return (
    <div className="bg-white border-2 border-bordergray rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5">
      {outOfRadius ? (
        <p className="font-body text-sm text-fnc-red font-bold">
          {store.name} {"doesn't deliver directly to you — order via a partner instead:"}
        </p>
      ) : (
        <p className="font-display text-base font-bold text-charcoal">
          How would you like this delivered?
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {!outOfRadius && (
          <div
            className={cn(
              "h-16 px-4 rounded-2xl bg-fnc-red shadow-md",
              "flex items-center gap-3 font-display text-base font-bold text-white"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              F&C Delivery
              <span className="font-body text-[11px] font-medium text-white/85">Fastest, ordered here</span>
            </div>
          </div>
        )}
        {thirdPartyOptions.map((p) => (
          <a
            key={p.key}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "h-16 px-4 rounded-2xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]",
              "flex items-center justify-between gap-3 font-display text-base font-bold",
              BRAND_STYLES[p.label] || DEFAULT_STYLE
            )}
          >
            {p.label}
            <ExternalLink className="h-5 w-5 shrink-0 opacity-90" />
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
