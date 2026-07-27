import { icons } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for real product/category/store photography, which hasn't
 * been shot yet. Renders a soft brand-gradient tile with a linework icon
 * so cards read as intentional, not broken images. Swap for next/image
 * once real photos land — the `image` field already exists on the data.
 */
const tones = {
  red: "from-fnc-red/20 via-fnc-red/5 to-transparent text-fnc-red",
  green: "from-fnc-green/20 via-fnc-green/5 to-transparent text-fnc-green",
  blue: "from-fnc-blue/20 via-fnc-blue/5 to-transparent text-fnc-blue",
  neutral: "from-charcoal/10 via-charcoal/[0.03] to-transparent text-charcoal/70",
};

export default function PlaceholderMedia({
  icon = "Fish",
  tone = "red",
  label,
  className,
  iconClassName,
}) {
  const Icon = icons[icon] ?? icons.Fish;

  return (
    <div
      role="img"
      aria-label={label ?? ""}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-warmwhite bg-gradient-to-br",
        tones[tone] ?? tones.neutral,
        className
      )}
    >
      <Icon
        className={cn("h-10 w-10", iconClassName)}
        strokeWidth={1.25}
        aria-hidden="true"
      />
    </div>
  );
}
