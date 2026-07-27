"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Small client island so the product detail page (mostly static content)
 * doesn't need "use client" for the whole tree — same pattern as
 * QuickOrderButton sitting alongside ProductCard.
 *
 * Visual + interactive only for now. Real cart state (Zustand store,
 * persisted cart, quantity, totals) is Phase 5 work — this button just
 * gives instant feedback so the page doesn't feel dead.
 */
export default function AddToCartButton({ product, className }) {
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    // TODO: wire to Zustand cart store in Phase 5 — add { productId: product.id, qty: 1 }
    console.log("Add to cart:", product.id, product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleAddToCart}
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
