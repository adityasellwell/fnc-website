"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-side wishlist, persisted to localStorage. Mirrors the cart store's
 * shape/pattern — guest-only until Firebase auth syncs it to the Wishlist model.
 */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      isSaved: (productId) => get().items.some((i) => i.productId === productId),

      toggle: (product) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === product.id);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== product.id) };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                price: product.price,
                image: product.image,
              },
            ],
          };
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      count: () => get().items.length,

      // Replaces the whole list wholesale — used to load a signed-in
      // customer's real DB-backed wishlist over whatever was in
      // localStorage (guest state), so it stays in sync across devices.
      hydrate: (items) => set({ items }),
    }),
    { name: "fnc-wishlist" }
  )
);
