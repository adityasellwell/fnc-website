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

      setLocation: ({ storeId, label, isServiceable }) =>
        set({ storeId, label, isServiceable }),
    }),
    { name: "fnc-location" }
  )
);
