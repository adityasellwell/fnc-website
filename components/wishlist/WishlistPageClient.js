"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useCartStore } from "@/lib/store/cart";

function WishlistCard({ item }) {
  const remove = useWishlistStore((s) => s.remove);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="bg-white border border-bordergray rounded-2xl overflow-hidden flex flex-col">
      <div className="relative aspect-square w-full bg-warmwhite">
        {item.image && (
          <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
        )}
        <button
          type="button"
          aria-label="Remove from wishlist"
          onClick={() => remove(item.productId)}
          className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
        >
          <Trash2 className="h-4 w-4 text-fnc-red" />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <Link href={`/product/${item.slug}`} className="font-display font-semibold text-charcoal hover:text-fnc-red transition-colors truncate">
          {item.name}
        </Link>
        <p className="font-body text-xs text-slate">{item.unit}</p>
        <p className="font-display font-bold text-charcoal mt-1">₹{item.price}</p>
        <Button
          type="button"
          size="sm"
          className="w-full mt-3"
          onClick={() => addItem({ id: item.productId, slug: item.slug, name: item.name, unit: item.unit, price: item.price, image: item.image })}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

export default function WishlistPageClient() {
  const items = useWishlistStore((s) => s.items);

  return (
    <Section background="offwhite" spacing="md">
      <h1 className="font-display text-section-heading font-bold text-charcoal mb-8">
        Your Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="h-16 w-16 rounded-full bg-warmwhite flex items-center justify-center">
            <Heart className="h-7 w-7 text-slate" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-charcoal">Your wishlist is empty</p>
            <p className="font-body text-sm text-slate mt-1">
              Tap the heart on any product to save it here for later.
            </p>
          </div>
          <Button href="/shop" size="lg" className="mt-2">
            Browse the Shop
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <WishlistCard key={item.productId} item={item} />
          ))}
        </div>
      )}
    </Section>
  );
}
