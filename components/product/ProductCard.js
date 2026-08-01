"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Card from "@/components/ui/Card";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import WishlistButton from "@/components/product/WishlistButton";
import { CATEGORY_META, ENFORCE_STOCK_GATING } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocationStore } from "@/lib/store/location";
import { useCartStore } from "@/lib/store/cart";

export default function ProductCard({ product, className }) {
  const storeId = useLocationStore((s) => s.storeId);
  const [mounted, setMounted] = useState(false);

  // Cart operations
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const cartItems = useCartStore((s) => s.items);
  const cartItem = cartItems.find((i) => i.productId === product.id);
  const qty = cartItem?.qty ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const categorySlug = product.categoryId.replace(/^cat-/, "");
  const meta = CATEGORY_META[categorySlug] ?? { icon: "Fish", tone: "red" };
  const href = `/product/${product.slug}`;

  // Check store-specific stock
  const storeInv = product.storeInventory?.find((i) => i.storeId === storeId);
  const isOutOfStock = ENFORCE_STOCK_GATING && mounted && storeId && (!storeInv || storeInv.stock <= 0);

  const [imgError, setImgError] = useState(false);
  const primaryImage = imgError ? meta.image : (product.images && product.images[0]) || meta.image;

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      price: product.price,
      image: primaryImage,
      availableAtStores: product.availableAtStores,
    };
    const result = addItem(item);
    if (!result.ok && result.reason === "UNAVAILABLE") {
      alert("Sorry, this item isn't available at your delivery location.");
      return;
    }
    if (!result.ok && result.reason === "STORE_CONFLICT") {
      const confirmed = window.confirm(
        "Your cart has items from a different store. Switching stores will clear your cart. Continue?"
      );
      if (confirmed) {
        useCartStore.getState().clear();
        addItem(item);
      }
    }
  }

  function handleDecrement(e) {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product.id, qty - 1);
  }

  function handleIncrement(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: product.unit,
      price: product.price,
      image: primaryImage,
      availableAtStores: product.availableAtStores,
    };
    const result = addItem(item);
    if (!result.ok && result.reason === "UNAVAILABLE") {
      alert("Sorry, this item isn't available at your delivery location.");
      return;
    }
    if (!result.ok && result.reason === "STORE_CONFLICT") {
      const confirmed = window.confirm(
        "Your cart has items from a different store. Switching stores will clear your cart. Continue?"
      );
      if (confirmed) {
        useCartStore.getState().clear();
        addItem(item);
      }
    }
  }

  return (
    <Card
      hoverLift
      className={cn(
        "group flex flex-col h-full bg-white border border-bordergray/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative",
        isOutOfStock && "opacity-85",
        className
      )}
    >
      {/* Image Block */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-warmwhite">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <PlaceholderMedia
              icon={meta.icon}
              tone={meta.tone}
              label={product.name}
              className="absolute inset-0"
              iconClassName="h-10 w-10"
            />
          )}
        </Link>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none z-10">
            <span className="bg-charcoal text-white font-display text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 font-body text-[10px] font-bold text-charcoal shadow-sm pointer-events-none z-10">
          <Star className="h-3 w-3 fill-fnc-red text-fnc-red" />
          {product.rating}
        </div>

        <WishlistButton
          product={product}
          image={primaryImage}
          className="absolute top-2.5 right-2.5 z-10"
        />
      </div>

      {/* Details Block */}
      <div className="flex-1 flex flex-col p-3 sm:p-4">
        <Link href={href} className="flex flex-col gap-0.5">
          <h3 className="font-display font-bold text-sm sm:text-base text-charcoal line-clamp-1 group-hover:text-fnc-red transition-colors">
            {product.name}
          </h3>
          <p className="font-body text-xs text-slate line-clamp-1 mt-0.5 leading-tight">
            {product.description || `Freshly cleaned and cut ${product.name.toLowerCase()} premium choice.`}
          </p>
        </Link>

        {/* Weight / Pieces Row */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-body">
          <span className="bg-fnc-green/5 text-fnc-green border border-fnc-green/15 px-2 py-0.5 rounded font-bold">
            {product.unit}
          </span>
        </div>

        {/* Price & Add to Cart Action Row */}
        <div className="mt-auto pt-2.5 border-t border-dashed border-bordergray/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg text-fnc-red">
              ₹{product.price}
            </span>
          </div>

          <div className="shrink-0">
            {isOutOfStock ? (
              <span className="font-display text-[10px] font-bold uppercase tracking-wider text-slate bg-bordergray px-2.5 py-1.5 rounded-lg">
                Sold Out
              </span>
            ) : qty > 0 ? (
              <div className="flex items-center bg-fnc-red text-white rounded-lg overflow-hidden h-8 sm:h-9 border border-fnc-red shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-2.5 h-full hover:bg-black/10 flex items-center justify-center font-bold text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-1.5 font-display text-xs sm:text-sm font-bold min-w-5 text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-2.5 h-full hover:bg-black/10 flex items-center justify-center font-bold text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="h-8 sm:h-9 px-4 sm:px-5 font-display text-xs sm:text-sm font-bold text-fnc-red border-2 border-fnc-red hover:bg-fnc-red hover:text-white rounded-lg transition-all duration-200"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
