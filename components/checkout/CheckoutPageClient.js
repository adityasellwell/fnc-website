"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  Store as StoreIcon,
  UserCircle2,
  ExternalLink,
  Navigation,
  MapPin,
  Tag,
} from "lucide-react";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { useLocationStore } from "@/lib/store/location";
import { reverseGeocode, geocodeAddress } from "@/lib/utils/geocode";
import { validatePromoCodeAction } from "@/app/checkout/actions";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

const inputClasses =
  "w-full h-12 px-4 rounded-xl border border-bordergray bg-white font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
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

function validate(values, fulfillmentType, settings, subtotal) {
  const errors = {};
  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^[\d+\s-]{7,15}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (fulfillmentType === "DELIVERY") {
    if (settings && settings.minOrderValue && subtotal < settings.minOrderValue) {
      errors.subtotal = `Order subtotal must be at least ₹${settings.minOrderValue} for delivery.`;
    }
    if (!values.line1.trim()) errors.line1 = "Please enter your address.";
    if (!values.city.trim()) errors.city = "Please enter your city.";
    if (!values.state.trim()) errors.state = "Please enter your state.";
    if (!values.pincode.trim()) errors.pincode = "Please enter your pincode.";
  }
  return errors;
}

export default function CheckoutPageClient({ stores = [], settings = {}, savedProfile = null }) {
  const { user, isSignedIn, loading } = useAuth();
  const isLoaded = !loading;
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const [fulfillmentType, setFulfillmentType] = useState("DELIVERY");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Delivery radius & charge verification states
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  // Promo code
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, discount, title }
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  async function handleApplyPromo() {
    setCheckingPromo(true);
    setPromoError("");
    const result = await validatePromoCodeAction(promoInput, subtotal);
    setCheckingPromo(false);
    if (!result.ok) {
      setPromoError(result.error);
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(result);
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  // Auto-apply a code left behind by a /promo/[code] campaign page visit —
  // one-shot, cleared immediately so it doesn't reapply on a later, unrelated visit.
  useEffect(() => {
    const pending = localStorage.getItem("fnc_pending_promo");
    if (!pending || subtotal <= 0) return;
    localStorage.removeItem("fnc_pending_promo");
    setPromoInput(pending);
    validatePromoCodeAction(pending, subtotal).then((result) => {
      if (result.ok) setAppliedPromo(result);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartStoreId = useCartStore((s) => s.storeId);
  const locationStoreId = useLocationStore((s) => s.storeId);
  const initialStoreId = cartStoreId || locationStoreId || (stores[0]?.id || null);
  const initialStore = stores.find((s) => s.id === initialStoreId) || stores[0] || null;
  const [selectedStore, setSelectedStore] = useState(initialStore);

  const store = selectedStore;

  const handleFulfillmentChange = (type) => {
    setFulfillmentType(type);
    if (type === "PICKUP") {
      const targetId = cartStoreId || locationStoreId || (stores[0]?.id || null);
      const target = stores.find((s) => s.id === targetId) || stores[0] || null;
      setSelectedStore(target);
    } else {
      if (coords) {
        applyDistanceCheck(coords.lat, coords.lng);
      } else {
        const locationStore = stores.find((s) => s.id === locationStoreId);
        if (locationStore) {
          setSelectedStore(locationStore);
        }
      }
    }
  };

  const deliveryFee =
    fulfillmentType === "DELIVERY" && !deliveryError && deliveryDistance !== null
      ? subtotal >= (settings.freeDeliveryThreshold ?? 500)
        ? 0
        : settings.deliveryCharge ?? 50
      : 0;

  // Prefill from the saved Customer record first (the phone number typed at
  // signup lives there, not on the Firebase user — Firebase's own
  // `user.phoneNumber` is only ever set for actual Phone-Auth sign-ins),
  // falling back to the Firebase profile, then whatever's already typed.
  // Still fully editable — this only sets the initial value.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues((v) => ({
      ...v,
      name: v.name || savedProfile?.name || user.displayName || "",
      email: v.email || user.email || "",
      phone: v.phone || savedProfile?.phone || user.phoneNumber || "",
    }));
  }, [isSignedIn, user, savedProfile]);

  // Shared by both verification paths: typed-address forward-geocoding and
  // live "Use My Current Location" — either way, once we have coordinates,
  // checking them against the store's radius is identical.
  function applyDistanceCheck(lat, lng) {
    setCoords({ lat, lng });

    let nearest = null;
    let minDist = Infinity;
    stores.forEach((s) => {
      if (!s.deliveryAvailable) return;
      const dist = calculateDistance(s.geo.lat, s.geo.lng, lat, lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    });

    if (!nearest) {
      setDeliveryError("No active store found to handle delivery.");
      setSelectedStore(null);
      setDeliveryDistance(null);
      return null;
    }

    setDeliveryDistance(minDist);
    setSelectedStore(nearest);

    const radius = settings.deliveryRadiusKm ?? 5.0;
    if (minDist > radius) {
      setDeliveryError(
        `Sorry, we can't deliver this far — your location is ${minDist.toFixed(1)} km from ${nearest.name}, outside our ${radius} km delivery area. Please choose Store Pickup or visit us in person.`
      );
      return null;
    }
    setDeliveryError("");
    return { lat, lng, dist: minDist };
  }

  async function checkDeliveryServiceability(addressObj) {
    if (!addressObj.line1.trim() || !addressObj.city.trim() || !addressObj.state.trim() || !addressObj.pincode.trim()) {
      return null;
    }

    setCheckingDelivery(true);
    setDeliveryError("");

    const addressStr = `${addressObj.line1}, ${addressObj.line2 || ""}, ${addressObj.city}, ${addressObj.state} ${addressObj.pincode}`;

    try {
      const coords = await geocodeAddress(addressStr, {
        line1: addressObj.line1,
        line2: addressObj.line2,
        city: addressObj.city,
        state: addressObj.state,
        pincode: addressObj.pincode,
      });

      if (!coords) {
        setDeliveryError("We couldn't verify this address. Please refine your address or choose Store Pickup.");
        setDeliveryDistance(null);
        setCoords(null);
        return null;
      }

      return applyDistanceCheck(coords.lat, coords.lng);
    } catch (err) {
      setDeliveryError("Address verification failed. Please check your internet connection, or choose Store Pickup.");
      setDeliveryDistance(null);
      setCoords(null);
      return null;
    } finally {
      setCheckingDelivery(false);
    }
  }

  const handleAddressBlur = () => {
    if (values.line1.trim() && values.city.trim() && values.state.trim() && values.pincode.trim()) {
      checkDeliveryServiceability(values);
    }
  };

  // "Use My Current Location" — fetches the browser's live position,
  // reverse-geocodes it into a real street address (same Nominatim helper
  // the Navbar's location picker uses), prefills the form, and immediately
  // checks it against the store's delivery radius — no need to also type
  // the address out, since we already have exact coordinates.
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocateError("Your browser doesn't support location detection — please enter your address manually.");
      return;
    }

    setLocating(true);
    setLocateError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);

        if (!address) {
          setLocateError("Couldn't determine your address from your location — please enter it manually.");
          setLocating(false);
          return;
        }

        setValues((v) => ({
          ...v,
          line1: address.line1 || v.line1,
          city: address.city || v.city,
          state: address.state || v.state,
          pincode: address.postcode || v.pincode,
        }));

        applyDistanceCheck(latitude, longitude);
        setLocating(false);
      },
      (error) => {
        setLocateError(
          error.code === error.PERMISSION_DENIED
            ? "Location access was denied — please enter your address manually or allow location access and try again."
            : "Couldn't get your location — please enter your address manually."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  useEffect(() => {
    if (fulfillmentType === "DELIVERY" && typeof window !== "undefined" && navigator.geolocation) {
      handleUseCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentType]);

  function handleChange(field) {
    return (e) => {
      const val = e.target.value;
      setValues((v) => {
        const next = { ...v, [field]: val };
        // Clear verification if any address components are updated
        if (["line1", "city", "state", "pincode"].includes(field)) {
          setDeliveryDistance(null);
          setCoords(null);
          setDeliveryError("");
        }
        return next;
      });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    let currentCoords = coords;
    if (fulfillmentType === "DELIVERY" && !currentCoords) {
      const result = await checkDeliveryServiceability(values);
      if (!result) {
        setServerError("Please resolve address verification errors before placing your order.");
        return;
      }
      currentCoords = result;
    }

    if (fulfillmentType === "DELIVERY" && deliveryError) {
      setServerError(deliveryError);
      return;
    }

    const nextErrors = validate(values, fulfillmentType, settings, subtotal);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.subtotal) {
        setServerError(nextErrors.subtotal);
      }
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
          fulfillmentType,
          storeId: fulfillmentType === "PICKUP" ? store?.id : undefined,
          couponCode: appliedPromo?.code || undefined,
          deliveryAddress:
            fulfillmentType === "DELIVERY"
              ? {
                  line1: values.line1,
                  line2: values.line2 || undefined,
                  city: values.city,
                  state: values.state,
                  pincode: values.pincode,
                }
              : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Request failed");
      }

      const orderData = json.data;
      const razorpayData = json.razorpay;

      if (!razorpayData) {
        throw new Error("Payment gateway could not be initialized.");
      }

      setStatus("paying");

      const options = {
        key: razorpayData.keyId,
        amount: razorpayData.amount,
        currency: "INR",
        name: "F&C — Fresh Proteins & More",
        description: `Order #${orderData.id.slice(-8)}`,
        order_id: razorpayData.orderId,
        handler: async function (response) {
          setStatus("verifying");

          let verified = false;
          const maxAttempts = 15;
          const pollInterval = 1500; // 1.5 seconds

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              const verifyRes = await fetch(`/api/orders/${orderData.id}/verify-payment`);
              const verifyJson = await verifyRes.json();
              if (verifyRes.ok && verifyJson.success) {
                verified = true;
                break;
              }
            } catch (err) {
              console.error("Verification poll error:", err);
            }
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }

          if (verified) {
            setOrderId(orderData.id);
            setStatus("success");
            clear();
          } else {
            setStatus("error");
            setServerError(
              "We received your payment, but are still confirming details. Please check your account dashboard in a few minutes or contact support."
            );
          }
        },
        prefill: {
          name: values.name || user?.displayName || "",
          email: values.email || user?.email || "",
          contact: values.phone,
        },
        modal: {
          ondismiss: function () {
            setStatus("error");
            setServerError("Payment was cancelled. You can try placing the order again.");
          },
        },
        theme: {
          color: "#DC2F26", // F&C brand red Hex color
        },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error("Razorpay SDK could not be loaded. Please reload the page and try again.");
      }
    } catch (err) {
      setStatus("error");
      setServerError(err.message || "We couldn't place your order right now. Please try again.");
    }
  }

  if (items.length === 0 && status !== "success") {
    return (
      <Section background="offwhite" spacing="md">
        <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
          <p className="font-display text-lg font-bold text-charcoal">Your cart is empty</p>
          <Button href="/shop" size="lg">
            Browse the Shop
          </Button>
        </div>
      </Section>
    );
  }

  if (isLoaded && !isSignedIn) {
    return (
      <Section background="offwhite" spacing="md">
        <div className="max-w-md mx-auto flex flex-col items-center text-center gap-4 bg-white border border-bordergray rounded-3xl p-10">
          <div className="h-14 w-14 rounded-full bg-fnc-red/10 flex items-center justify-center">
            <UserCircle2 className="h-7 w-7 text-fnc-red" />
          </div>
          <h1 className="font-display text-xl font-bold text-charcoal">Sign in to check out</h1>
          <p className="font-body text-sm text-slate">
            Please sign in or create an account to place your order — this keeps your order
            history, addresses, and payment confirmation all in one place.
          </p>
          <Button href="/sign-in?redirect=/checkout" size="lg" className="w-full">
            Sign In to Continue
          </Button>
          <Link href="/cart" className="font-body text-xs text-slate hover:text-fnc-red transition-colors">
            Back to cart
          </Link>
        </div>
      </Section>
    );
  }

  if (status === "success") {
    return (
      <Section background="offwhite" spacing="md">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center gap-3 bg-fnc-green/5 border border-fnc-green/20 rounded-3xl p-10">
          <CheckCircle2 className="h-14 w-14 text-fnc-green" />
          <h1 className="font-display text-2xl font-bold text-charcoal">Order placed!</h1>
          <p className="font-body text-sm text-slate">
            Order #{orderId?.slice(-8)} has been received. Our team will contact you shortly
            at {values.phone} to confirm payment and {fulfillmentType === "DELIVERY" ? "delivery" : "pickup"} details.
          </p>
          <Button href="/shop" size="lg" className="mt-2">
            Continue Shopping
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section background="offwhite" spacing="md">
      <h1 className="font-display text-section-heading font-bold text-charcoal mb-8">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 flex flex-col gap-6">
          {/* Fulfillment type */}
          <div className="bg-white border border-bordergray rounded-3xl p-6">
            <h2 className="font-display text-lg font-bold text-charcoal mb-4">
              How would you like your order?
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleFulfillmentChange("DELIVERY")}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                  fulfillmentType === "DELIVERY"
                    ? "border-fnc-red bg-fnc-red/5"
                    : "border-bordergray hover:border-charcoal/30"
                }`}
              >
                <Truck className="h-5 w-5 text-fnc-red shrink-0" />
                <div>
                  <p className="font-display font-semibold text-charcoal">Delivery</p>
                  <p className="font-body text-xs text-slate">Delivered to your address</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleFulfillmentChange("PICKUP")}
                disabled={stores.length === 0}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  fulfillmentType === "PICKUP"
                    ? "border-fnc-red bg-fnc-red/5"
                    : "border-bordergray hover:border-charcoal/30"
                }`}
              >
                <StoreIcon className="h-5 w-5 text-fnc-red shrink-0" />
                <div>
                  <p className="font-display font-semibold text-charcoal">Store Pickup</p>
                  <p className="font-body text-xs text-slate">
                    {store ? store.name : "No store available"}
                  </p>
                </div>
              </button>
            </div>

            {fulfillmentType === "PICKUP" && stores.length > 1 && (
              <div className="mt-5 pt-5 border-t border-bordergray flex flex-col gap-3">
                <p className="font-display text-sm font-bold text-charcoal">Select pickup location:</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedStore(s)}
                      className={`flex flex-col gap-1.5 rounded-2xl border-2 p-4 text-left transition-colors ${
                        selectedStore?.id === s.id
                          ? "border-fnc-red bg-fnc-red/5"
                          : "border-bordergray hover:border-charcoal/30"
                      }`}
                    >
                      <p className="font-display font-semibold text-charcoal text-sm">{s.name}</p>
                      <p className="font-body text-xs text-slate">{s.address}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact details */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
            <h2 className="font-display text-lg font-bold text-charcoal">Your Details</h2>

            <div className="flex items-center gap-3 rounded-2xl bg-warmwhite px-4 py-3">
              <UserCircle2 className="h-5 w-5 text-fnc-red shrink-0" />
              <p className="font-body text-sm text-charcoal">
                Ordering as <span className="font-semibold">{values.name}</span> ({values.email})
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="font-body text-sm font-semibold text-charcoal">
                Phone number
              </label>
              <input id="phone" type="tel" value={values.phone} onChange={handleChange("phone")} placeholder="+91 98765 43210" className={inputClasses} />
              {errors.phone && <p className="font-body text-xs text-fnc-red">{errors.phone}</p>}
            </div>
          </div>

          {/* Delivery address */}
          {fulfillmentType === "DELIVERY" && (
            <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2 className="font-display text-lg font-bold text-charcoal">Delivery Address</h2>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-fnc-red text-fnc-red font-body text-xs font-semibold hover:bg-fnc-red/5 transition-colors disabled:opacity-60"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
                  {locating ? "Detecting..." : "Use My Current Location"}
                </button>
              </div>

              {locateError && (
                <p className="font-body text-xs text-fnc-red flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 shrink-0" />
                  {locateError}
                </p>
              )}

              {store && (
                <div className="bg-warmwhite/50 border border-bordergray/60 rounded-2xl p-4 flex flex-col gap-4 font-body text-sm mt-1 shadow-inner w-full">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-fnc-red animate-pulse shrink-0"></div>
                    <p className="text-[10px] font-bold text-fnc-red uppercase tracking-wider">Active Route Routing</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 relative">
                    {/* Left node */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Ordered From (Store)</span>
                      <span className="font-display font-bold text-charcoal">{store.name}</span>
                      <span className="text-xs text-slate truncate">{store.address}</span>
                    </div>

                    {/* Right node */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate uppercase tracking-wider">Deliver To (Your Address)</span>
                      <span className="font-display font-bold text-charcoal">
                        {values.line1 ? values.line1 : "Detecting Address..."}
                      </span>
                      <span className="text-xs text-slate truncate">
                        {values.city ? `${values.city}, ${values.pincode}` : "Awaiting location verification"}
                      </span>
                    </div>
                  </div>

                  {deliveryDistance !== null && (
                    <div className="pt-3 border-t border-dashed border-bordergray/80 flex items-center justify-between text-xs">
                      <span className="text-slate font-medium">Estimated Delivery Distance:</span>
                      <span className="font-bold text-charcoal">{deliveryDistance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="line1" className="font-body text-sm font-semibold text-charcoal">
                  Address line 1
                </label>
                <input id="line1" type="text" value={values.line1} onChange={handleChange("line1")} onBlur={handleAddressBlur} placeholder="House/flat no., street" className={inputClasses} />
                {errors.line1 && <p className="font-body text-xs text-fnc-red">{errors.line1}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="line2" className="font-body text-sm font-semibold text-charcoal">
                  Address line 2 (optional)
                </label>
                <input id="line2" type="text" value={values.line2} onChange={handleChange("line2")} onBlur={handleAddressBlur} placeholder="Landmark, apartment, etc." className={inputClasses} />
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="font-body text-sm font-semibold text-charcoal">
                    City
                  </label>
                  <input id="city" type="text" value={values.city} onChange={handleChange("city")} onBlur={handleAddressBlur} placeholder="City" className={inputClasses} />
                  {errors.city && <p className="font-body text-xs text-fnc-red">{errors.city}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="state" className="font-body text-sm font-semibold text-charcoal">
                    State
                  </label>
                  <input id="state" type="text" value={values.state} onChange={handleChange("state")} onBlur={handleAddressBlur} placeholder="State" className={inputClasses} />
                  {errors.state && <p className="font-body text-xs text-fnc-red">{errors.state}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pincode" className="font-body text-sm font-semibold text-charcoal">
                    Pincode
                  </label>
                  <input id="pincode" type="text" value={values.pincode} onChange={handleChange("pincode")} onBlur={handleAddressBlur} placeholder="400607" className={inputClasses} />
                  {errors.pincode && <p className="font-body text-xs text-fnc-red">{errors.pincode}</p>}
                </div>
              </div>

              {/* Address Serviceability / Geocoding Status */}
              {(checkingDelivery || deliveryError || (deliveryDistance !== null && !deliveryError)) && (
                <div className="pt-4 border-t border-bordergray flex flex-col gap-1.5 font-body text-sm">
                  {checkingDelivery && (
                    <span className="text-slate flex items-center gap-1.5">
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Verifying delivery address serviceability...
                    </span>
                  )}
                  {deliveryError && (
                    <span className="text-fnc-red flex items-center gap-1.5">
                      <XCircle className="h-4.5 w-4.5 shrink-0" />
                      {deliveryError}
                    </span>
                  )}
                  {deliveryDistance !== null && !deliveryError && (
                    <span className="text-fnc-green flex items-center gap-1.5">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      Address verified! Distance to store: {deliveryDistance.toFixed(1)} km.
                      {deliveryFee === 0 ? " (Free Delivery)" : ` (Delivery Fee: ₹${deliveryFee})`}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "error" && (
            <p className="font-body text-sm text-fnc-red flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={status === "submitting" || status === "paying" || status === "verifying" || !isLoaded} className="w-full sm:w-fit">
            {status === "submitting" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing order...
              </>
            )}
            {status === "paying" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Waiting for payment...
              </>
            )}
            {status === "verifying" && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying payment...
              </>
            )}
            {status !== "submitting" && status !== "paying" && status !== "verifying" && "Place Order & Pay"}
          </Button>
          <p className="font-body text-xs text-slate">
            Secure payment powered by Razorpay. Cards, UPI, Netbanking, and Wallets are accepted.
          </p>
        </form>

        {/* Order summary */}
        <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-bold text-charcoal">Order Summary</h2>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 font-body text-sm">
                <span className="text-charcoal truncate">
                  {item.name} <span className="text-slate">x{item.qty}</span>
                </span>
                <span className="font-semibold text-charcoal shrink-0">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between font-body text-sm text-slate pt-3 border-t border-bordergray">
            <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span className="font-semibold text-charcoal">₹{subtotal}</span>
          </div>
          {fulfillmentType === "DELIVERY" && (
            <div className="flex items-center justify-between font-body text-sm text-slate">
              <span>Delivery Fee</span>
              <span className="font-semibold text-charcoal">
                {deliveryDistance === null ? (
                  <span className="text-xs text-slate font-normal italic">Pending verification</span>
                ) : deliveryFee === 0 ? (
                  "Free"
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
          )}

          {/* Promo code */}
          <div className="border-t border-bordergray pt-3">
            {appliedPromo ? (
              <div className="flex items-center justify-between font-body text-sm">
                <span className="flex items-center gap-1.5 text-fnc-green font-semibold">
                  <Tag className="h-3.5 w-3.5" />
                  {appliedPromo.code} applied
                </span>
                <button type="button" onClick={handleRemovePromo} className="text-xs text-slate hover:text-fnc-red transition-colors">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="flex-1 h-10 px-3 rounded-lg border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={checkingPromo || !promoInput.trim()}
                    className="h-10 px-4 rounded-lg border border-charcoal text-charcoal font-body text-xs font-semibold hover:bg-warmwhite transition-colors disabled:opacity-50"
                  >
                    {checkingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {promoError && <p className="font-body text-xs text-fnc-red">{promoError}</p>}
              </div>
            )}
          </div>

          {appliedPromo && (
            <div className="flex items-center justify-between font-body text-sm text-fnc-green font-semibold">
              <span>Discount</span>
              <span>-₹{appliedPromo.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between font-display text-base font-bold text-charcoal pt-3 border-t border-bordergray">
            <span>Order Total</span>
            <span>
              ₹{Math.max(0, subtotal + (fulfillmentType === "DELIVERY" ? deliveryFee : 0) - (appliedPromo?.discount ?? 0)).toFixed(2)}
            </span>
          </div>
          <Link href="/cart" className="font-body text-xs text-slate hover:text-fnc-red transition-colors text-center">
            Edit cart
          </Link>

          {(settings.zomatoUrl || settings.swiggyUrl) && (
            <div className="pt-4 border-t border-bordergray flex flex-col gap-2">
              <p className="font-body text-xs text-slate text-center">Prefer ordering elsewhere?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {settings.zomatoUrl && (
                  <a
                    href={settings.zomatoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-charcoal transition-colors"
                  >
                    Order on Zomato
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {settings.swiggyUrl && (
                  <a
                    href={settings.swiggyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-bordergray font-body text-xs font-semibold text-charcoal hover:border-charcoal transition-colors"
                  >
                    Order on Swiggy
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
