"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";

/**
 * Small client island so the product detail page (mostly static content)
 * doesn't need "use client" for the whole tree — same pattern as
 * QuickOrderButton sitting alongside ProductCard.
 */
export default function AddToCartButton({ product, image, className }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const forceAddItem = useCartStore((s) => s.forceAddItem);

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

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={() => handleAddToCart()}
      aria-live="polite"
      className={className}
    >
      {added ? (
        <>
          <Check className="h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
