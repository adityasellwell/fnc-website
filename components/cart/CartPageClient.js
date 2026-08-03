"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";

function CartLine({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-5 border-b border-bordergray last:border-b-0">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="relative h-16 w-16 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden bg-warmwhite border border-bordergray">
          {item.image && (
            <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/product/${item.slug}`}
            className="font-display font-semibold text-charcoal hover:text-fnc-red transition-colors truncate block"
          >
            {item.name}
          </Link>
          <p className="font-body text-xs text-slate mt-0.5">{item.unit}</p>
          <p className="font-display font-bold text-charcoal mt-1">₹{item.price}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0">
        <div className="flex items-center gap-1 rounded-full border border-bordergray">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => updateQty(item.productId, item.qty - 1)}
            className="h-9 w-9 flex items-center justify-center text-charcoal hover:bg-warmwhite rounded-full transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-body text-sm font-semibold w-6 text-center">{item.qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => updateQty(item.productId, item.qty + 1)}
            className="h-9 w-9 flex items-center justify-center text-charcoal hover:bg-warmwhite rounded-full transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          aria-label="Remove item"
          onClick={() => removeItem(item.productId)}
          className="h-9 w-9 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function CartPageClient() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <Section background="offwhite" spacing="md">
      <h1 className="font-display text-section-heading font-bold text-charcoal mb-8">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
          <div className="h-16 w-16 rounded-full bg-warmwhite flex items-center justify-center">
            <ShoppingBag className="h-7 w-7 text-slate" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-charcoal">Your cart is empty</p>
            <p className="font-body text-sm text-slate mt-1">
              Add some fresh proteins to get started.
            </p>
          </div>
          <Button href="/shop" size="lg" className="mt-2">
            Browse the Shop
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white border border-bordergray rounded-3xl px-5 sm:px-6">
            {items.map((item) => (
              <CartLine key={item.productId} item={item} />
            ))}
          </div>

          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4 lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold text-charcoal">Order Summary</h2>
            <div className="flex items-center justify-between font-body text-sm text-slate">
              <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
              <span className="font-semibold text-charcoal">₹{subtotal}</span>
            </div>
            <p className="font-body text-xs text-slate">
              Delivery charges are calculated at checkout based on fulfillment type.
            </p>
            <Button href="/checkout" size="lg" className="w-full">
              Proceed to Checkout
              <ArrowRight className="h-5 w-5" />
            </Button>
            <button
              type="button"
              onClick={clear}
              className="font-body text-xs text-slate hover:text-fnc-red transition-colors text-center"
            >
              Clear cart
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
