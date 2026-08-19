"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { Star, ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Card from "@/components/ui/Card";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import WishlistButton from "@/components/product/WishlistButton";
import { CATEGORY_META, ENFORCE_STOCK_GATING } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useLocationStore } from "@/lib/store/location";
import { useCartStore } from "@/lib/store/cart";

const emptySubscribe = () => () => {};

export default function ProductCard({ product, className }) {
  const storeId = useLocationStore((s) => s.storeId);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Cart operations
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const cartItems = useCartStore((s) => s.items);

  // A card has no room for a variant picker — if the product has
  // variants, quick-add here always uses the default one (same price the
  // customer would see pre-selected on the product page).
  const variants = product.variants ?? [];
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  const activePrice = defaultVariant ? defaultVariant.price : product.price;
  const activeUnit = defaultVariant ? defaultVariant.label : product.unit;
  const activeVariantLabel = defaultVariant?.label ?? null;

  const cartItem = cartItems.find(
    (i) => i.productId === product.id && (i.variantLabel ?? null) === activeVariantLabel
  );
  const qty = cartItem?.qty ?? 0;

  const categorySlug = (product?.categoryId || "").replace(/^cat-/, "");
  const meta = CATEGORY_META[categorySlug] ?? { icon: "Fish", tone: "red" };
  const href = `/product/${product?.slug || ""}`;

  // Check store-specific stock
  const storeInv = product.storeInventory?.find((i) => i.storeId === storeId);
  const isOutOfStock = ENFORCE_STOCK_GATING && mounted && storeId && (!storeInv || storeInv.stock <= 0);

  const [imgError, setImgError] = useState(false);
  const primaryImage = imgError ? meta.image : (product.images && product.images[0]) || meta.image;

  // Real media (images + video) uploaded for this product, falling back to
  // the single legacy image/category-photo chain when none exists yet.
  const mediaItems =
    product.media && product.media.length > 0
      ? product.media
      : primaryImage
      ? [{ id: "fallback", type: "IMAGE", url: primaryImage }]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const activeItem = mediaItems[activeIndex];

  function goTo(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(idx);
  }
  function goPrev(e) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);
  }
  function goNext(e) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % mediaItems.length);
  }

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: activeUnit,
      price: activePrice,
      variantLabel: activeVariantLabel,
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
    updateQty(product.id, qty - 1, activeVariantLabel);
  }

  function handleIncrement(e) {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      unit: activeUnit,
      price: activePrice,
      variantLabel: activeVariantLabel,
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
      {/* Media Block */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-warmwhite">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {activeItem ? (
            <AnimatePresence initial={false} mode="wait">
              {activeItem.type === "VIDEO" ? (
                <motion.div
                  key={activeItem.id ?? activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <video
                    src={activeItem.url}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                </motion.div>
              ) : (
                <motion.div
                  key={activeItem.id ?? activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeItem.url}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                      if (activeIndex === 0) setImgError(true);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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

        {/* Video mute toggle */}
        {activeItem?.type === "VIDEO" && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMuted((m) => !m);
            }}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="absolute bottom-2.5 right-2.5 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        )}

        {/* Prev/next arrows — desktop hover only, hidden with a single item */}
        {mediaItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous media"
              className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next media"
              className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
              {mediaItems.map((item, idx) => (
                <button
                  key={item.id ?? idx}
                  type="button"
                  onClick={(e) => goTo(e, idx)}
                  aria-label={`Show media ${idx + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-200 shadow-sm",
                    idx === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  )}
                >
                  {item.type === "VIDEO" && idx !== activeIndex && (
                    <Play className="h-1.5 w-1.5 text-charcoal" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
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
            {activeUnit}
          </span>
          {variants.length > 1 && (
            <span className="text-slate font-medium">+{variants.length - 1} more size{variants.length > 2 ? "s" : ""}</span>
          )}
        </div>

        {/* Price & Add to Cart Action Row */}
        <div className="mt-auto pt-2.5 border-t border-dashed border-bordergray/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg text-fnc-red">
              ₹{activePrice}
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
