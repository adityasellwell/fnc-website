import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
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
 */
export default function CategoryCard({ category, variant = "editorial", className }) {
  const meta = CATEGORY_META[category.slug] ?? { icon: "Leaf", tone: "neutral" };
  const isKinetic = variant === "kinetic";

  return (
    <Card
      as={Link}
      href={`/shop/${category.slug}`}
      hoverLift
      className={cn(
        "group flex flex-col",
        isKinetic && "rounded-3xl border-transparent",
        className
      )}
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-warmwhite">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 20vw, 45vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderMedia
            icon={meta.icon}
            tone={meta.tone}
            label={category.name}
            className="absolute inset-0"
            iconClassName={isKinetic ? "h-16 w-16" : "h-12 w-12"}
          />
        )}
        {isKinetic && category.image && (
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 mix-blend-multiply opacity-20",
              toneOverlay[meta.tone]
            )}
          />
        )}
      </div>
      <div className={cn("p-4", isKinetic && "p-5")}>
        <h3
          className={cn(
            "font-display font-semibold text-charcoal",
            isKinetic ? "text-xl" : "text-lg"
          )}
        >
          {category.name}
        </h3>
        <p className="font-body text-xs text-slate mt-0.5 line-clamp-1">
          {category.description}
        </p>
      </div>
    </Card>
  );
}
