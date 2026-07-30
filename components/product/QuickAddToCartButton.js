"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

/**
 * Compact icon-only add-to-cart for ProductCard's grid tile — sits in the
 * same overlay slot the old WhatsApp quick-order button used to.
 */
export default function QuickAddToCartButton({ product, image, className }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      price: product.price,
      image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add ${product.name} to cart`}
      className={cn(
        "flex items-center justify-center rounded-full bg-fnc-red text-white shadow-md hover:bg-fnc-red/90 transition-colors",
        className
      )}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" strokeWidth={2} />}
    </button>
  );
}
