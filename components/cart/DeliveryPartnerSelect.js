"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useLocationStore } from "@/lib/store/location";

const PARTNERS = [
  { key: "fnc", label: "F&C Delivery" },
  { key: "swiggy", label: "Swiggy", urlField: "swiggyUrl" },
  { key: "zomato", label: "Zomato", urlField: "zomatoUrl" },
];

/**
 * Lets a customer route their order to F&C's own checkout (default,
 * unchanged flow) or open the resolved store's Swiggy/Zomato listing in
 * a new tab instead — same pattern as nbcindia.in's delivery-partner
 * dropdowns. Only shows platforms the resolved store actually has a URL
 * for, so picking one never lands on a dead link.
 */
export default function DeliveryPartnerSelect() {
  const storeId = useLocationStore((s) => s.storeId);
  const [store, setStore] = useState(null);

  useEffect(() => {
    if (!storeId) return;
    fetch("/api/stores")
      .then((res) => res.json())
      .then((payload) => {
        const found = (payload.data || []).find((s) => s.id === storeId);
        if (found) setStore(found);
      })
      .catch(() => {});
  }, [storeId]);

  const options = PARTNERS.filter((p) => !p.urlField || store?.[p.urlField]);
  if (options.length <= 1) return null;

  function handleChange(e) {
    const key = e.target.value;
    const partner = PARTNERS.find((p) => p.key === key);
    if (partner?.urlField && store?.[partner.urlField]) {
      window.open(store[partner.urlField], "_blank");
    }
    e.target.value = "fnc";
  }

  return (
    <div className="bg-white border border-bordergray rounded-2xl p-4 flex flex-col gap-2">
      <label className="font-body text-xs font-semibold text-charcoal flex items-center gap-1.5">
        How would you like this delivered?
      </label>
      <div className="relative">
        <select
          defaultValue="fnc"
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
      <p className="font-body text-xs text-slate">
        F&C Delivery continues your order on this site. Swiggy/Zomato opens that platform in a new tab.
      </p>
    </div>
  );
}
