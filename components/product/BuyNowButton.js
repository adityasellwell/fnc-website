"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { useLocationStore } from "@/lib/store/location";

/**
 * Adds the item to cart and jumps straight to /checkout — a shortcut for
 * shoppers who already know what they want, sitting next to (not instead
 * of) AddToCartButton.
 */
export default function BuyNowButton({ product, image, className }) {
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const forceAddItem = useCartStore((s) => s.forceAddItem);
  const storeId = useLocationStore((s) => s.storeId);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storeInv = product.storeInventory?.find((i) => i.storeId === storeId);
  const isOutOfStock = mounted && storeId && (!storeInv || storeInv.stock <= 0);

  function handleBuyNow(force = false) {
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
      if (confirmed) handleBuyNow(true);
      return;
    }

    setPending(true);
    router.push("/checkout");
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="secondary"
      onClick={() => handleBuyNow()}
      disabled={pending || isOutOfStock}
      className={className}
    >
      {isOutOfStock ? (
        "Out of Stock"
      ) : (
        <>
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
          Buy Now
        </>
      )}
    </Button>
  );
}
