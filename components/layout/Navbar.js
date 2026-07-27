"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
import { BRAND, NAV_LINKS, CURRENT_LOCATION } from "@/lib/constants";
import { getStores } from "@/lib/data/stores";

const CART_COUNT = 0;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function SearchBar({ className }) {
  return (
    <div className={`flex items-center gap-3 h-11 md:h-12 rounded-full border border-[#E5E3DD] bg-white/90 backdrop-blur-sm px-5 ${className ?? ""}`}>
      <Search className="h-4 w-4 text-[#6B6B6B] shrink-0" />
      <input
        type="text"
        placeholder="Search for fish, chicken, eggs..."
        disabled
        className="w-full bg-transparent font-body text-sm text-[#1E1E1E] placeholder:text-[#6B6B6B] focus:outline-none"
      />
    </div>
  );
}

function CartIcon({ className, scrolled }) {
  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className={`relative h-10 w-10 flex items-center justify-center rounded-full transition-colors ${
        scrolled
          ? "text-white hover:bg-white/20"
          : "text-[#1E1E1E] hover:bg-[#F3F1EC]"
      } ${className ?? ""}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {CART_COUNT > 0 && (
        <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-fnc-red text-white text-[10px] font-bold flex items-center justify-center leading-none">
          {CART_COUNT}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [locationLabel, setLocationLabel] = useState(CURRENT_LOCATION.label);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locState, setLocState] = useState("idle");
  const [pincodeQuery, setPincodeQuery] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [storeList, setStoreList] = useState([]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    getStores().then(setStoreList);
    const saved = localStorage.getItem("fnc_delivery_location");
    if (saved) setLocationLabel(saved);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) { setLocState("error"); return; }
    setLocState("detecting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        const activeStores = storeList.filter((s) => s.status === "active");
        if (activeStores.length === 0) {
          const label = "Jubilee Hills, HYD";
          setLocationLabel(label);
          localStorage.setItem("fnc_delivery_location", label);
          setLocState("success");
          setTimeout(() => { setIsModalOpen(false); setLocState("idle"); }, 800);
          return;
        }
        let nearest = activeStores[0];
        let minDist = Infinity;
        activeStores.forEach((s) => {
          const dist = getDistance(uLat, uLng, s.geo.lat, s.geo.lng);
          if (dist < minDist) { minDist = dist; nearest = s; }
        });
        const namePart = nearest.name.replace("F&C ", "");
        const cityAbbr = nearest.city === "Hyderabad" ? "HYD" : nearest.city === "Bengaluru" ? "BLR" : "BOM";
        const label = `${namePart}, ${cityAbbr}`;
        setLocationLabel(label);
        localStorage.setItem("fnc_delivery_location", label);
        setLocState("success");
        setTimeout(() => { setIsModalOpen(false); setLocState("idle"); }, 1000);
      },
      () => { setLocState("error"); },
      { timeout: 6000 }
    );
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (!pincodeQuery.trim()) return;
    const query = pincodeQuery.toLowerCase().trim();
    let label = null;
    if (query === "hyderabad" || query === "hyd" || query.startsWith("500")) label = "Jubilee Hills, HYD";
    else if (query === "bengaluru" || query === "blr" || query === "bangalore" || query.startsWith("560")) label = "Indiranagar, BLR (Soon)";
    else if (query === "mumbai" || query === "bom" || query.startsWith("400")) label = "Bandra, BOM (Soon)";
    if (label) {
      setLocationLabel(label);
      localStorage.setItem("fnc_delivery_location", label);
      setIsModalOpen(false);
      setPincodeQuery("");
      setPincodeError("");
    } else {
      setPincodeError("F&C delivery is not yet serviceable here.");
    }
  };

  const selectPredefined = (label) => {
    setLocationLabel(label);
    localStorage.setItem("fnc_delivery_location", label);
    setIsModalOpen(false);
    setPincodeError("");
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
          <div className="flex h-20 md:h-24 items-center gap-4 md:gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              onClick={() => setOpen(false)}
            >
              <Image
                src={BRAND.logo}
                alt={`${BRAND.fullName} logo`}
                width={120}
                height={120}
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
                priority
              />
            </Link>

            {/* Location Selector */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 shrink-0 border-l border-bordergray pl-4 h-10 hover:opacity-75 transition-opacity"
            >
              <MapPin className="h-4 w-4 text-fnc-red shrink-0" />
              <span className="flex flex-col items-start leading-tight text-left">
                <span className={`font-body text-[10px] ${subTextColor}`}>Deliver to</span>
                <span className={`font-body text-sm font-bold ${textColor} flex items-center gap-0.5`}>
                  {locationLabel}
                  <ChevronDown className={`h-3 w-3 ${subTextColor}`} />
                </span>
              </span>
            </button>

            {/* Search */}
            <SearchBar className="hidden md:flex flex-1" />

            {/* Desktop right actions */}
            <div className="hidden lg:flex items-center gap-1 ml-auto shrink-0">
              <Link
                href="/stores"
                className={`group h-10 flex items-center gap-1.5 px-4 rounded-full font-body text-sm font-semibold transition-colors border border-transparent ${textColor} ${iconHover} relative`}
              >
                <StoreIcon className="h-4 w-4 text-fnc-red shrink-0" />
                <span>Stores</span>
                <span className="absolute bottom-1 left-4 right-4 h-px bg-fnc-red scale-x-0 group-hover:scale-x-100 transition-transform duration-250 origin-left rounded-full" />
              </Link>
              <Link
                href="/account"
                aria-label="Account"
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover}`}
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${textColor} ${iconHover}`}
              >
                <Heart className="h-5 w-5" />
              </Link>
              <CartIcon scrolled={scrolled} />
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
              <CartIcon scrolled={scrolled} />
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
          <div className="lg:hidden border-t border-[#E5E3DD] bg-[#FAF9F6]">
            <Container className="flex flex-col gap-5 py-6">
              <SearchBar />

              <button
                type="button"
                onClick={() => { setOpen(false); setIsModalOpen(true); }}
                className="flex items-center gap-2 font-body text-base text-[#1E1E1E] w-fit"
              >
                <MapPin className="h-5 w-5 text-fnc-red" />
                Deliver to <span className="font-bold">{locationLabel}</span>
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
                <Link href="/account" className="font-body text-lg font-semibold text-charcoal/80 hover:text-fnc-red transition-colors py-3 flex items-center gap-3" onClick={() => setOpen(false)}>
                  <User className="h-5 w-5" /> Account
                </Link>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#E5E3DD] shadow-2xl p-6 relative">
            <button
              onClick={() => { setIsModalOpen(false); setPincodeError(""); }}
              className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full text-[#6B6B6B] hover:bg-[#F3F1EC] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-xl font-bold text-[#1E1E1E] mb-1">Select Delivery Location</h3>
            <p className="font-body text-sm text-[#6B6B6B] mb-5">Detect your location or search by city / pincode.</p>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locState === "detecting"}
              className="w-full flex items-center justify-center gap-2.5 h-12 rounded-2xl bg-fnc-red text-white font-body text-base font-semibold hover:bg-fnc-red/90 disabled:opacity-50 transition-colors shadow-sm mb-4"
            >
              {locState === "detecting" ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Detecting location...</>
              ) : locState === "success" ? (
                <><Navigation className="h-5 w-5" /> Location Detected!</>
              ) : (
                <><Navigation className="h-5 w-5" /> Use Current Location</>
              )}
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-[#E5E3DD]" />
              <span className="flex-shrink mx-4 text-xs text-[#6B6B6B] font-body uppercase font-semibold">Or Search</span>
              <div className="flex-grow border-t border-[#E5E3DD]" />
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
                <button type="submit" className="absolute right-2 top-2 h-8 px-3 rounded-lg bg-[#1E1E1E] text-white font-body text-xs font-semibold hover:bg-black transition-colors">
                  Apply
                </button>
              </div>
              {pincodeError && (
                <p className="font-body text-xs text-fnc-red font-semibold">⚠️ {pincodeError}</p>
              )}
            </form>

            <div className="mt-5 pt-4 border-t border-[#E5E3DD]">
              <p className="font-body text-xs font-semibold text-[#6B6B6B] uppercase mb-2.5">Available Locations</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Jubilee Hills, HYD", city: "Hyderabad", area: "Jubilee Hills & nearby", status: "Active" },
                  { label: "Indiranagar, BLR (Soon)", city: "Bengaluru", area: "Indiranagar & nearby", status: "Soon" },
                  { label: "Bandra, BOM (Soon)", city: "Mumbai", area: "Bandra & nearby", status: "Soon" },
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
