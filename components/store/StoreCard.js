import { MapPin, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import PlaceholderMedia from "@/components/ui/PlaceholderMedia";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Shared between both homepage directions via `variant`:
 * "editorial" (Direction A, calm) or "kinetic" (Direction B, bolder).
 */
export default function StoreCard({ store, variant = "editorial", className }) {
  const isKinetic = variant === "kinetic";
  const comingSoon = store.status === "coming-soon";

  return (
    <Card
      className={cn(
        "flex flex-col",
        isKinetic && "rounded-3xl border-transparent",
        className
      )}
    >
      <PlaceholderMedia
        icon="Store"
        tone={comingSoon ? "neutral" : "green"}
        label={store.name}
        className={cn("aspect-[16/9] w-full", isKinetic && "aspect-[4/3]")}
      />
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-charcoal">
            {store.name}
          </h3>
          <span
            className={cn(
              "font-body text-xs font-medium rounded-full px-2.5 py-1 whitespace-nowrap",
              comingSoon
                ? "text-fnc-blue bg-fnc-blue/10"
                : "text-fnc-green bg-fnc-green/10"
            )}
          >
            {comingSoon ? "Opening Soon" : "Open Now"}
          </span>
        </div>

        <p className="font-body text-sm text-slate flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
          {store.address}, {store.city}, {store.state}
        </p>

        {!comingSoon && (
          <p className="font-body text-sm text-slate flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            {store.openingHours.mon}
          </p>
        )}

        <div className="flex gap-3 mt-2">
          {comingSoon ? (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-60 pointer-events-none"
            >
              Coming Soon
            </Button>
          ) : (
            <>
              <Button href={`/store/${store.slug}`} size="sm">
                View Store
              </Button>
              <Button
                href={store.googleMapsLink}
                size="sm"
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Directions
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
