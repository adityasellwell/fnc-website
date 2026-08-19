"use client";

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";
import BuyNowButton from "./BuyNowButton";
import { cn } from "@/lib/utils";

/**
 * Owns the selected-variant state and renders the price block + Add to
 * Cart/Order Now buttons together, since both need to react to whichever
 * variant (if any) is currently picked. A product with no variants renders
 * exactly the old static Price/Unit block, unchanged.
 */
export default function ProductPurchasePanel({ product, image }) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

  const activePrice = hasVariants ? selectedVariant?.price : product.price;
  const activeUnit = hasVariants ? selectedVariant?.label : product.unit;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 pb-6 border-b border-bordergray">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-extrabold text-fnc-red">
            ₹{activePrice}
          </span>
          <span className="font-body text-base text-slate">/ {activeUnit}</span>
        </div>

        {hasVariants && (
          <div className="flex flex-wrap gap-2 mt-1">
            {variants.map((v) => {
              const isActive = selectedVariant?.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={cn(
                    "rounded-xl border-2 px-4 py-2 flex flex-col items-start min-w-[88px] transition-colors",
                    isActive
                      ? "border-fnc-red bg-fnc-red/5"
                      : "border-bordergray hover:border-charcoal/40"
                  )}
                >
                  <span className={cn("font-body text-sm font-bold", isActive ? "text-fnc-red" : "text-charcoal")}>
                    {v.label}
                  </span>
                  <span className="font-body text-xs text-slate">₹{v.price}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <AddToCartButton product={product} image={image} variant={hasVariants ? selectedVariant : null} className="w-full sm:w-auto" />
        <BuyNowButton product={product} image={image} variant={hasVariants ? selectedVariant : null} className="w-full sm:w-auto" />
      </div>
    </div>
  );
}
