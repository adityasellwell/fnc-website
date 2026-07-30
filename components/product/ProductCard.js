import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import Card from "@/components/ui/Card";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import WishlistButton from "@/components/product/WishlistButton";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

const toneOverlay = {
  red: "bg-fnc-red",
  green: "bg-fnc-green",
  blue: "bg-fnc-blue",
  neutral: "bg-charcoal",
};

/**
 * Shared between both homepage directions via `variant`:
 * "editorial" (Direction A, calm) or "kinetic" (Direction B, bolder).
 *
 * Photo-dominant, food-ecommerce-style card: a large square image carries
 * the appetite appeal, rating sits as a small badge on the photo, and only
 * name/unit/price sit below — no long description, so price stays the
 * most prominent text on the card.
 *
 * Two separate links (image, text block) both point to the PDP rather than
 * one link wrapping everything — that keeps WishlistButton a sibling
 * instead of nested inside an <a>, which HTML/React disallow.
 *
 * Shows the product's category photo as a stand-in until real
 * per-product photography exists (see CATEGORY_META in lib/constants.js).
 */
export default function ProductCard({ product, variant = "editorial", className }) {
  const categorySlug = product.categoryId.replace(/^cat-/, "");
  const meta = CATEGORY_META[categorySlug] ?? { icon: "Fish", tone: "red" };
  const isKinetic = variant === "kinetic";
  const href = `/product/${product.slug}`;

  return (
    <Card
      hoverLift
      className={cn(
        "group flex flex-col",
        isKinetic && "rounded-3xl border-transparent shadow-sm hover:shadow-xl",
        className
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-warmwhite">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          {meta.image ? (
            <Image
              src={meta.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 22vw, 45vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PlaceholderMedia
              icon={meta.icon}
              tone={meta.tone}
              label={product.name}
              className="absolute inset-0"
              iconClassName={isKinetic ? "h-14 w-14" : "h-10 w-10"}
            />
          )}
          {isKinetic && meta.image && (
            <div
              aria-hidden="true"
              className={cn(
                "absolute inset-0 mix-blend-multiply opacity-20",
                toneOverlay[meta.tone]
              )}
            />
          )}
        </Link>

        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 font-body text-xs font-semibold text-charcoal shadow-sm pointer-events-none">
          <Star className="h-3 w-3 fill-fnc-red text-fnc-red" />
          {product.rating}
        </div>

        <WishlistButton
          product={product}
          image={meta.image}
          className="absolute top-3 right-3 z-10"
        />
      </div>

      <Link href={href} className={cn("flex flex-col gap-1 p-4", isKinetic && "p-5")}>
        <h3
          className={cn(
            "font-display font-semibold text-charcoal truncate",
            isKinetic ? "text-lg" : "text-base"
          )}
        >
          {product.name}
        </h3>
        <p className="font-body text-xs text-slate">{product.unit}</p>
        <p
          className={cn(
            "font-display font-bold text-charcoal mt-1",
            isKinetic ? "text-2xl" : "text-xl"
          )}
        >
          ₹{product.price}
        </p>
      </Link>
    </Card>
  );
}
