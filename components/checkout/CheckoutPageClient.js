"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Loader2, CheckCircle2, XCircle, Truck, Store as StoreIcon, UserCircle2, ExternalLink } from "lucide-react";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";

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

function validate(values, fulfillmentType, isSignedIn, settings, subtotal) {
  const errors = {};
  if (!isSignedIn) {
    if (!values.name.trim()) errors.name = "Please enter your full name.";
    if (!values.email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Please enter a valid email address.";
    }
  }
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

export default function CheckoutPageClient({ stores = [], settings = {} }) {
  const { isLoaded, isSignedIn, user } = useUser();
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

  const store = stores[0];

  const deliveryFee =
    fulfillmentType === "DELIVERY" && !deliveryError && deliveryDistance !== null
      ? subtotal >= (settings.freeDeliveryThreshold ?? 500)
        ? 0
        : settings.deliveryCharge ?? 50
      : 0;

  // Prefill from the signed-in Clerk profile
  useEffect(() => {
    if (!isSignedIn || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues((v) => ({
      ...v,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || v.name,
      email: user.primaryEmailAddress?.emailAddress ?? v.email,
      phone: v.phone || user.primaryPhoneNumber?.phoneNumber || "",
    }));
  }, [isSignedIn, user]);

  async function checkDeliveryServiceability(addressObj) {
    if (!addressObj.line1.trim() || !addressObj.city.trim() || !addressObj.state.trim() || !addressObj.pincode.trim()) {
      return null;
    }

    setCheckingDelivery(true);
    setDeliveryError("");

    const addressStr = `${addressObj.line1}, ${addressObj.line2 || ""}, ${addressObj.city}, ${addressObj.state} ${addressObj.pincode}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressStr)}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "FncWebsiteDeliveryRadiusEnforcement/1.0",
          },
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data || data.length === 0) {
        setDeliveryError("We couldn't verify this address. Please refine your address or choose Store Pickup.");
        setDeliveryDistance(null);
        setCoords(null);
        return null;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      setCoords({ lat, lng });

      // Calculate distance to active store
      if (store?.geo?.lat && store?.geo?.lng) {
        const dist = calculateDistance(store.geo.lat, store.geo.lng, lat, lng);
        setDeliveryDistance(dist);

        const radius = settings.deliveryRadiusKm ?? 5.0;
        if (dist > radius) {
          setDeliveryError(`Your address is outside our delivery area of ${radius} km. (Calculated distance: ${dist.toFixed(1)} km)`);
          return null;
        } else {
          setDeliveryError("");
          return { lat, lng, dist };
        }
      }
      return null;
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

    const nextErrors = validate(values, fulfillmentType, isSignedIn, settings, subtotal);
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
          ...(isSignedIn
            ? {}
            : { guest: { name: values.name, email: values.email, phone: values.phone } }),
          items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
          fulfillmentType,
          storeId: fulfillmentType === "PICKUP" ? store?.id : undefined,
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
          name: values.name || (user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : ""),
          email: values.email || (user ? user.primaryEmailAddress?.emailAddress : ""),
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
                onClick={() => setFulfillmentType("DELIVERY")}
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
                onClick={() => setFulfillmentType("PICKUP")}
                disabled={!store}
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
          </div>

          {/* Contact details */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
            <h2 className="font-display text-lg font-bold text-charcoal">Your Details</h2>

            {isSignedIn && (
              <div className="flex items-center gap-3 rounded-2xl bg-warmwhite px-4 py-3">
                <UserCircle2 className="h-5 w-5 text-fnc-red shrink-0" />
                <p className="font-body text-sm text-charcoal">
                  Ordering as <span className="font-semibold">{values.name}</span> ({values.email})
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              {!isSignedIn && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="font-body text-sm font-semibold text-charcoal">
                    Full name
                  </label>
                  <input id="name" type="text" value={values.name} onChange={handleChange("name")} placeholder="Your full name" className={inputClasses} />
                  {errors.name && <p className="font-body text-xs text-fnc-red">{errors.name}</p>}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="font-body text-sm font-semibold text-charcoal">
                  Phone number
                </label>
                <input id="phone" type="tel" value={values.phone} onChange={handleChange("phone")} placeholder="+91 98765 43210" className={inputClasses} />
                {errors.phone && <p className="font-body text-xs text-fnc-red">{errors.phone}</p>}
              </div>
            </div>
            {!isSignedIn && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-body text-sm font-semibold text-charcoal">
                  Email
                </label>
                <input id="email" type="email" value={values.email} onChange={handleChange("email")} placeholder="you@example.com" className={inputClasses} />
                {errors.email && <p className="font-body text-xs text-fnc-red">{errors.email}</p>}
              </div>
            )}
          </div>

          {/* Delivery address */}
          {fulfillmentType === "DELIVERY" && (
            <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
              <h2 className="font-display text-lg font-bold text-charcoal">Delivery Address</h2>
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
          <div className="flex items-center justify-between font-body text-base font-bold text-charcoal pt-3 border-t border-bordergray">
            <span>Order Total</span>
            <span>₹{subtotal + (fulfillmentType === "DELIVERY" ? deliveryFee : 0)}</span>
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
