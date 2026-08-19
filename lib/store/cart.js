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

        // A product with variants (e.g. "250 g" vs "1 kg") needs each
        // variant to be its own cart line at its own price — matching by
        // productId alone would silently merge two different variants'
        // quantities together. variantLabel is undefined for a normal
        // non-variant product, so this is fully backward compatible: two
        // undefineds are still treated as the same line, same as before.
        const sameLine = (i) => i.productId === product.id && (i.variantLabel ?? null) === (product.variantLabel ?? null);

        set((s) => {
          const existing = s.items.find(sameLine);
          if (existing) {
            return {
              items: s.items.map((i) =>
                sameLine(i) ? { ...i, qty: i.qty + qty } : i
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
                variantLabel: product.variantLabel ?? null,
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

      // variantLabel is optional — omitting it (existing call sites) keeps
      // matching any variant-less line exactly as before. Passing it
      // targets one specific variant line without touching the product's
      // other variant lines that might also be in the cart.
      removeItem: (productId, variantLabel = null) =>
        set((state) => {
          const items = state.items.filter(
            (i) => !(i.productId === productId && (i.variantLabel ?? null) === variantLabel)
          );
          return { items, storeId: items.length === 0 ? null : state.storeId };
        }),

      updateQty: (productId, qty, variantLabel = null) =>
        set((state) => {
          const matches = (i) => i.productId === productId && (i.variantLabel ?? null) === variantLabel;
          const items =
            qty <= 0
              ? state.items.filter((i) => !matches(i))
              : state.items.map((i) =>
                  matches(i) ? { ...i, qty } : i
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
