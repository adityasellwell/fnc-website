"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Home, Store, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";

const BASE_TABS = [
  { href: "/", label: "Home", icon: Home, match: (p) => p === "/" },
  { href: "/shop", label: "Shop", icon: Store, match: (p) => p.startsWith("/shop") || p.startsWith("/product") },
  { href: "/cart", label: "Cart", icon: ShoppingCart, match: (p) => p.startsWith("/cart"), badgeKey: "cart" },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: (p) => p.startsWith("/wishlist"), badgeKey: "wishlist" },
];

/**
 * App-style bottom tab bar, mobile only. Sits above safe-area inset so it
 * clears home-indicator gestures on iOS. Hidden at lg+ where the Navbar's
 * own icon row already covers these destinations.
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const badges = { cart: cartCount, wishlist: wishlistCount };

  const TABS = [
    ...BASE_TABS,
    isSignedIn
      ? { href: "/account", label: "Account", icon: User, match: (p) => p.startsWith("/account") }
      : { href: "/sign-in", label: "Account", icon: User, match: (p) => p.startsWith("/sign-in") || p.startsWith("/account") },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-bordergray shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {TABS.map(({ href, label, icon: Icon, match, badgeKey }) => {
          const active = match(pathname);
          const badge = badgeKey ? badges[badgeKey] : undefined;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-1 group"
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative">
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-fnc-red" : "text-slate group-active:text-charcoal"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {typeof badge === "number" && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 w-4 rounded-full bg-fnc-red text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge}
                  </span>
                )}
              </span>
              <span
                className={`font-body text-[11px] leading-none transition-colors ${
                  active ? "text-fnc-red font-semibold" : "text-slate"
                }`}
              >
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-fnc-red" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
