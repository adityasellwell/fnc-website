"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useLocationStore } from "@/lib/store/location";

/**
 * Client-side cart, persisted to localStorage. Guest-only for now — once
 * Firebase auth (Phase 6) lands, this same shape gets synced to the server-side
 * Order/cart tables on login instead of just localStorage.
 *
 * The cart belongs to whichever store its items came from (`storeId`) —
 * mirrors how the customer-facing store resolves in Navbar. `addItem`
 * returns a result object instead of throwing/silently succeeding, so
 * callers can react (show an "unavailable here" message, or confirm
 * clearing the cart before switching stores) without the store itself
 * owning any UI concerns like `confirm()` dialogs.
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (product, qty = 1) => {
        const { storeId: currentLocationStoreId } = useLocationStore.getState();
        const state = get();

        if (
          currentLocationStoreId &&
          Array.isArray(product.availableAtStores) &&
          product.availableAtStores.length > 0 &&
          !product.availableAtStores.includes(currentLocationStoreId)
        ) {
          return { ok: false, reason: "UNAVAILABLE" };
        }

        if (
          state.items.length > 0 &&
          state.storeId &&
          currentLocationStoreId &&
          state.storeId !== currentLocationStoreId
        ) {
          return { ok: false, reason: "STORE_CONFLICT" };
        }

        set((s) => {
          const existing = s.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.id ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return {
            storeId: s.storeId ?? currentLocationStoreId ?? null,
            items: [
              ...s.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                price: product.price,
                image: product.image,
                qty,
              },
            ],
          };
        });
        return { ok: true };
      },

      // Clears the cart before adding — used after the caller has already
      // confirmed a STORE_CONFLICT with the shopper.
      forceAddItem: (product, qty = 1) => {
        get().clear();
        return get().addItem(product, qty);
      },

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, storeId: items.length === 0 ? null : state.storeId };
        }),

      updateQty: (productId, qty) =>
        set((state) => {
          const items =
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, qty } : i
                );
          return { items, storeId: items.length === 0 ? null : state.storeId };
        }),

      clear: () => set({ items: [], storeId: null }),

      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "fnc-cart" }
  )
);
