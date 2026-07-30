"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";

/**
 * Adds the item to cart and jumps straight to /checkout — a shortcut for
 * shoppers who already know what they want, sitting next to (not instead
 * of) AddToCartButton.
 */
export default function BuyNowButton({ product, image, className }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  function handleBuyNow() {
    setPending(true);
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      price: product.price,
      image,
    });
    router.push("/checkout");
  }

  return (
    <Button
      type="button"
      size="lg"
      variant="secondary"
      onClick={handleBuyNow}
      disabled={pending}
      className={className}
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
      Buy Now
    </Button>
  );
}
