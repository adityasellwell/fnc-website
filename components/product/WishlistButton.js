"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useAuth } from "@/components/auth/AuthProvider";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import { cn } from "@/lib/utils";

export default function WishlistButton({ product, image, className }) {
  const saved = useWishlistStore((s) => s.isSaved(product.id));
  const toggle = useWishlistStore((s) => s.toggle);
  const { isSignedIn } = useAuth();

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
        // Optimistic locally; persisted server-side too so it follows a
        // signed-in shopper across devices, not just this browser.
        if (isSignedIn) {
          toggleWishlistAction(product.id).catch(() => {});
        }
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
