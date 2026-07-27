"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { cn } from "@/lib/utils";

export default function WishlistButton({ product, image, className }) {
  const saved = useWishlistStore((s) => s.isSaved(product.id));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({
          id: product.id,
          slug: product.slug,
          name: product.name,
          unit: product.unit,
          price: product.price,
          image,
        });
      }}
      className={cn(
        "h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white",
        className
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-colors", saved ? "fill-fnc-red text-fnc-red" : "text-charcoal")}
      />
    </button>
  );
}
