"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The customer's resolved delivery store — the id backing Navbar's
 * "Deliver to" label. Separate from the label/address text Navbar already
 * tracks in localStorage, so cart/checkout can key off a real storeId
 * instead of re-deriving it from a display string.
 */
export const useLocationStore = create(
  persist(
    (set) => ({
      storeId: null,
      label: null,
      isServiceable: null,
      // The nearest active store even when it's outside the delivery
      // radius (storeId stays null in that case) — lets the UI still
      // offer a "order via Swiggy/Zomato from your nearest store"
      // fallback instead of showing nothing at all.
      nearestStoreId: null,

      setLocation: ({ storeId, label, isServiceable, nearestStoreId }) =>
        set({ storeId, label, isServiceable, nearestStoreId: nearestStoreId ?? storeId ?? null }),
    }),
    { name: "fnc-location" }
  )
);
