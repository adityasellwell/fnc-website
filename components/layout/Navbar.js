"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Store as StoreIcon,
  Navigation,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Container from "./Container";
import Button from "@/components/ui/Button";
import { BRAND, NAV_LINKS, CURRENT_LOCATION, CATEGORY_META } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useLocationStore } from "@/lib/store/location";
import { reverseGeocode } from "@/lib/utils/geocode";
import { haversineDistanceKm } from "@/lib/utils/geo";

function SearchBar({ className, onSubmitted }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Search for fresh fish...",
    "Search for juicy chicken...",
    "Search for organic eggs...",
    "Search for ocean prawns...",
    "Search for ready-to-cook marinades...",
    "Search for mutton & chops...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    onSubmitted?.();
  }

  const showAnimatedPlaceholder = !query && !isFocused;

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-3 h-11 md:h-12 rounded-full border border-bordergray bg-white/90 backdrop-blur-sm px-5 relative ${className ?? ""}`}
    >
      <Search className="h-4 w-4 text-fnc-red shrink-0" />
      <div className="relative w-full h-full flex items-center">
        {showAnimatedPlaceholder && (
          <motion.div
            key={placeholderIndex}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute left-0 text-slate font-body text-sm pointer-events-none select-none"
          >
            {placeholders[placeholderIndex]}
          </motion.div>
        )}
        <input
          type="search"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-full bg-transparent font-body text-sm text-charcoal focus:outline-none z-10"
        />
      </div>
    </form>
  );
}

function CartIcon({ className }) {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className={`relative h-10 w-10 flex items-center justify-center rounded-full transition-colors text-charcoal hover:bg-warmwhite ${className ?? ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-fnc-red text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}

function WishlistIcon({ className, textColor, iconHover }) {
  const count = useWishlistStore((s) => s.items.length);
  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className={`relative h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover} ${className ?? ""}`}
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-fnc-red text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const storeId = useLocationStore((s) => s.storeId);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [locationLabel, setLocationLabel] = useState(CURRENT_LOCATION.label);
  const [fullAddress, setFullAddress] = useState(null);
  const [serviceable, setServiceable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locState, setLocState] = useState("idle");
  const [pincodeQuery, setPincodeQuery] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [storeList, setStoreList] = useState([]);
  const [deliveryRadius, setDeliveryRadius] = useState(5.0);

  const applyDetectedLocation = (uLat, uLng, geocoded, stores, radius = deliveryRadius) => {
    const activeStores = stores.filter((s) => s.status === "active");
    let nearest = null;
    let minDist = Infinity;
    activeStores.forEach((s) => {
      const dist = haversineDistanceKm(uLat, uLng, s.geo.lat, s.geo.lng);
      if (dist < minDist) { minDist = dist; nearest = s; }
    });
    const isServiceable = nearest !== null && minDist <= radius;
    const label = geocoded?.short ?? (nearest ? nearest.name.replace("F&C ", "") : "Detected Location");

    setLocationLabel(label);
    setFullAddress(geocoded?.full ?? null);
    setServiceable(isServiceable);
    localStorage.setItem("fnc_delivery_location", label);
    localStorage.setItem("fnc_delivery_address", geocoded?.full ?? label);
    useLocationStore.getState().setLocation({
      storeId: isServiceable ? nearest.id : null,
      label,
      isServiceable,
    });
  };

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    const saved = localStorage.getItem("fnc_delivery_location");
    const savedAddress = localStorage.getItem("fnc_delivery_address");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only API (localStorage) on mount, not a plain derived-state setState
    if (saved) setLocationLabel(saved);
    if (savedAddress) setFullAddress(savedAddress);

    fetch("/api/stores")
      .then((res) => res.json())
      .then((payload) => {
        const stores = payload.data || [];
        const radius = payload.deliveryRadiusKm || 5.0;
        setDeliveryRadius(radius);
        setStoreList(stores);

        if (!saved && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const geocoded = await reverseGeocode(
                position.coords.latitude,
                position.coords.longitude
              );
              applyDetectedLocation(position.coords.latitude, position.coords.longitude, geocoded, stores, radius);
            },
            () => {},
            { timeout: 8000, maximumAge: 300000 }
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch stores in Navbar:", err);
      });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The store actually serving the customer's resolved location — looked
  // up from the already-fetched store list, so it stays accurate across
  // modal open/close instead of only flashing right after detection.
  const resolvedStore = storeList.find((s) => s.id === storeId) || null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocState("error"); return; }
    setLocState("detecting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;

        // Show the shopper's real detected address, not a nearby store's
        // name — serviceability is checked separately below.
        const geocoded = await reverseGeocode(uLat, uLng);
        applyDetectedLocation(uLat, uLng, geocoded, storeList);

        setLocState("success");
        setTimeout(() => setIsModalOpen(false), 1200);
      },
      () => { setLocState("error"); },
      { timeout: 8000 }
    );
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (!pincodeQuery.trim()) return;
    const query = pincodeQuery.toLowerCase().trim();
    let label = null;
    if (query === "thane" || query.startsWith("400607") || query.startsWith("4006")) label = "Hiranandani Estate, Thane";
    else if (query === "mumbai" || query === "bombay" || query.startsWith("400")) label = "Thane (nearby) — Coming Soon";
    if (label) {
      const isServiceable = !label.includes("Soon");
      setLocationLabel(label);
      setFullAddress(null);
      setServiceable(isServiceable);
      localStorage.setItem("fnc_delivery_location", label);
      localStorage.removeItem("fnc_delivery_address");
      setIsModalOpen(false);
      setPincodeQuery("");
      setPincodeError("");
      const activeStore = storeList.find((s) => s.status === "active");
      useLocationStore.getState().setLocation({
        storeId: isServiceable ? (activeStore?.id ?? null) : null,
        label,
        isServiceable,
      });
    } else {
      setPincodeError("F&C delivery is not yet serviceable here.");
    }
  };

  const selectPredefined = (label) => {
    const isServiceable = !label.includes("Soon");
    setLocationLabel(label);
    setFullAddress(null);
    setServiceable(isServiceable);
    localStorage.setItem("fnc_delivery_location", label);
    localStorage.removeItem("fnc_delivery_address");
    setIsModalOpen(false);
    setPincodeError("");
    const activeStore = storeList.find((s) => s.status === "active");
    useLocationStore.getState().setLocation({
      storeId: isServiceable ? (activeStore?.id ?? null) : null,
      label,
      isServiceable,
    });
  };

  // Navbar is always solid offwhite — matches homepage background, never
  // goes transparent/dark on scroll (per user requirement).
  const headerBg = "bg-offwhite border-bordergray shadow-sm";
  const textColor = "text-charcoal";
  const subTextColor = "text-slate";
  const iconHover = "hover:bg-warmwhite";

  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.header
        initial={shouldReduceMotion ? false : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${headerBg}`}
      >
        <Container>
          <div className="flex h-28 md:h-32 items-center gap-4 md:gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              onClick={() => setOpen(false)}
            >
              <Image
                src={BRAND.logo}
                alt={`${BRAND.fullName} logo`}
                width={220}
                height={220}
                className="h-24 w-28 md:h-28 md:w-36 object-contain"
                priority
              />
            </Link>

            {/* Location Selector */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 shrink-0 border-l border-bordergray pl-4 h-12 hover:opacity-75 transition-opacity"
            >
              <MapPin className="h-4.5 w-4.5 text-fnc-red shrink-0" />
              <span className="flex flex-col items-start leading-tight text-left max-w-48">
                <span className={`font-body text-[10px] ${subTextColor} truncate w-full`}>
                  {storeId && storeList.find((s) => s.id === storeId)
                    ? `Delivering from ${storeList.find((s) => s.id === storeId).name.replace("F&C ", "")}`
                    : "Deliver to"}
                </span>
                <span className={`font-body text-sm font-bold ${textColor} flex items-center gap-0.5 truncate w-full`}>
                  <span className="truncate">{locationLabel}</span>
                  <ChevronDown className={`h-3 w-3 ${subTextColor} shrink-0`} />
                </span>
                {storeId && storeList.find((s) => s.id === storeId) && (
                  <span className="font-body text-[9px] text-fnc-green font-bold">
                    Open till 9:00 PM
                  </span>
                )}
              </span>
            </button>

            {/* Search */}
            <SearchBar className="hidden md:flex flex-1" />

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-1 ml-auto shrink-0">
              <Link
                href="/shop"
                className={`group h-10 flex items-center gap-1.5 px-4 rounded-full font-body text-sm font-semibold transition-colors border border-transparent ${textColor} ${iconHover} relative`}
              >
                <span>Shop</span>
                <span className="absolute bottom-1 left-4 right-4 h-px bg-fnc-red scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left rounded-full" />
              </Link>
              <Link
                href="/stores"
                className={`group h-10 flex items-center gap-1.5 px-4 rounded-full font-body text-sm font-semibold transition-colors border border-transparent ${textColor} ${iconHover} relative`}
              >
                <StoreIcon className="h-4 w-4 text-fnc-red shrink-0" />
                <span>Stores</span>
                <span className="absolute bottom-1 left-4 right-4 h-px bg-fnc-red scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left rounded-full" />
              </Link>
              {isSignedIn ? (
                <Link
                  href="/account"
                  aria-label="Account"
                  className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover}`}
                >
                  <User className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  aria-label="Sign in"
                  className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover}`}
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
              <WishlistIcon textColor={textColor} iconHover={iconHover} />
              <CartIcon />
            </div>

            <Button
              href="/shop"
              size="md"
              className="hidden lg:inline-flex shrink-0 ml-2"
            >
              Order Now
            </Button>

            {/* Mobile right */}
            <div className="flex items-center gap-1 ml-auto lg:hidden">
              <CartIcon />
              <button
                type="button"
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover}`}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden border-t border-bordergray bg-offwhite">
            <Container className="flex flex-col gap-5 py-6">
              <SearchBar onSubmitted={() => setOpen(false)} />

              <button
                type="button"
                onClick={() => { setOpen(false); setIsModalOpen(true); }}
                className="flex flex-col items-start gap-1 w-full text-left"
              >
                <div className="flex items-center gap-2 font-body text-base text-charcoal">
                  <MapPin className="h-5 w-5 text-fnc-red shrink-0" />
                  <span>Deliver to <span className="font-bold">{locationLabel}</span></span>
                </div>
                {storeId && storeList.find((s) => s.id === storeId) && (
                  <div className="pl-7 flex flex-col items-start gap-0.5">
                    <p className="font-body text-xs text-slate">
                      Delivering from <span className="font-semibold text-charcoal">{storeList.find((s) => s.id === storeId).name}</span>
                    </p>
                    <p className="font-body text-[10px] text-fnc-green font-bold">
                      Open till 9:00 PM
                    </p>
                  </div>
                )}
              </button>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="font-body text-lg font-semibold text-charcoal/80 hover:text-fnc-red transition-colors py-3 flex items-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      {link.label === "Stores" && <StoreIcon className="h-5 w-5 text-fnc-red" />}
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {isSignedIn ? (
                  <Link href="/account" className="font-body text-lg font-semibold text-charcoal/80 hover:text-fnc-red transition-colors py-3 flex items-center gap-3" onClick={() => setOpen(false)}>
                    <User className="h-5 w-5" /> Account
                  </Link>
                ) : (
                  <Link href="/sign-in" className="font-body text-lg font-semibold text-charcoal/80 hover:text-fnc-red transition-colors py-3 flex items-center gap-3" onClick={() => setOpen(false)}>
                    <User className="h-5 w-5" /> Sign In
                  </Link>
                )}
                <Link href="/wishlist" className="font-body text-lg font-semibold text-charcoal/80 hover:text-fnc-red transition-colors py-3 flex items-center gap-3" onClick={() => setOpen(false)}>
                  <Heart className="h-5 w-5" /> Wishlist
                </Link>
              </nav>

              <Button href="/shop" size="lg" className="w-full">Order Now</Button>
            </Container>
          </div>
        )}


      </motion.header>

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-bordergray shadow-2xl p-6 relative">
            <button
              onClick={() => { setIsModalOpen(false); setPincodeError(""); }}
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full text-slate hover:bg-warmwhite transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-xl font-bold text-charcoal mb-1">Select Delivery Location</h3>
            <p className="font-body text-sm text-slate mb-5">Detect your location or search by city / pincode.</p>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locState === "detecting"}
              className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-fnc-red text-white font-body text-base font-semibold hover:bg-fnc-red/90 disabled:opacity-50 transition-colors shadow-sm"
            >
              {locState === "detecting" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Detecting location...</>
              ) : locState === "success" ? (
                <><Navigation className="h-5 w-5" /> Location Detected!</>
              ) : fullAddress ? (
                <><Navigation className="h-5 w-5" /> Update My Location</>
              ) : (
                <><Navigation className="h-5 w-5" /> Use Current Location</>
              )}
            </button>

            {/* Persists across modal reopens — driven by fullAddress state,
                not the transient locState, so it stays visible instead of
                only flashing right after granting permission once. */}
            {fullAddress && locState !== "detecting" && (
              <div className="mt-3 rounded-xl border border-bordergray bg-warmwhite px-4 py-3">
                <p className="font-body text-xs font-semibold text-slate uppercase mb-1">Your Location</p>
                <p className="font-body text-sm text-charcoal">{fullAddress}</p>
                <p className={`font-body text-xs font-semibold mt-1.5 ${serviceable ? "text-fnc-green" : "text-fnc-blue"}`}>
                  {serviceable
                    ? `✓ Ordering from ${resolvedStore?.name || "your nearest F&C store"}`
                    : "Delivery is coming soon to your area — orders can still be placed via WhatsApp"}
                </p>
              </div>
            )}

            <div className="mt-4" />

            <div className="relative flex py-3 items-center">
              <div className="grow border-t border-bordergray" />
              <span className="shrink mx-4 text-xs text-slate font-body uppercase font-semibold">Or Search</span>
              <div className="grow border-t border-bordergray" />
            </div>

            <form onSubmit={handlePincodeSubmit} className="mt-2 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter City or Pincode (e.g. 500033)"
                  value={pincodeQuery}
                  onChange={(e) => setPincodeQuery(e.target.value)}
                  className="w-full h-12 pl-4 pr-20 rounded-xl border border-bordergray font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors"
                />
                <button type="submit" className="absolute right-2 top-2 h-8 px-3 rounded-lg bg-charcoal text-white font-body text-xs font-semibold hover:bg-black transition-colors">
                  Apply
                </button>
              </div>
              {pincodeError && (
                <p className="font-body text-xs text-fnc-red font-semibold">⚠️ {pincodeError}</p>
              )}
            </form>

            <div className="mt-5 pt-4 border-t border-bordergray">
              <p className="font-body text-xs font-semibold text-slate uppercase mb-2.5">Available Locations</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Hiranandani Estate, Thane", city: "Thane", area: "Hiranandani Estate & nearby", status: "Active" },
                ].map((loc) => (
                  <button
                    key={loc.label}
                    onClick={() => selectPredefined(loc.label)}
                    className="flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl border border-bordergray hover:border-fnc-red transition-colors"
                  >
                    <div>
                      <span className="font-body text-sm font-bold text-charcoal">{loc.city}</span>
                      <p className="font-body text-xs text-slate">{loc.area}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${loc.status === "Active" ? "text-fnc-green bg-fnc-green/10" : "text-fnc-blue bg-fnc-blue/10"}`}>
                      {loc.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
