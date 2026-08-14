"use client";

import { useSyncExternalStore } from "react";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { useLocationStore } from "@/lib/store/location";
import { ENFORCE_STOCK_GATING } from "@/lib/constants";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

export default function AddToCartButton({ product, image, className }) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const addItem = useCartStore((s) => s.addItem);
  const forceAddItem = useCartStore((s) => s.forceAddItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const cartItems = useCartStore((s) => s.items);
  const storeId = useLocationStore((s) => s.storeId);

  const cartItem = cartItems.find((i) => i.id === product.id || i.productId === product.id);
  const qty = cartItem?.qty ?? 0;

  const storeInv = product.storeInventory?.find((i) => i.storeId === storeId);
  const isOutOfStock = ENFORCE_STOCK_GATING && mounted && storeId && (!storeInv || storeInv.stock <= 0);

  function handleAddToCart(force = false) {
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      price: product.price,
      image,
      availableAtStores: product.availableAtStores,
    };
    const result = force ? forceAddItem(item) : addItem(item);

    if (!result.ok && result.reason === "UNAVAILABLE") {
      alert("Sorry, this item isn't available at your delivery location.");
      return;
    }
    if (!result.ok && result.reason === "STORE_CONFLICT") {
      const confirmed = window.confirm(
        "Your cart has items from a different store. Switching stores will clear your cart. Continue?"
      );
      if (confirmed) handleAddToCart(true);
      return;
    }
  }

  if (mounted && qty > 0) {
    return (
      <div className={cn("flex items-center bg-fnc-red text-white rounded-xl overflow-hidden h-12 border border-fnc-red shadow-md font-display font-bold text-base sm:text-lg", className)}>
        <button
          type="button"
          onClick={() => updateQty(product.id, qty - 1)}
          className="px-5 h-full hover:bg-black/10 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Decrease quantity"
        >
          -
        </button>
        <span className="px-4 text-center min-w-8">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => handleAddToCart()}
          className="px-5 h-full hover:bg-black/10 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => handleAddToCart()}
      disabled={isOutOfStock}
      aria-live="polite"
      className={className}
    >
      {isOutOfStock ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
