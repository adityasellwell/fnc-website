"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle, Truck, Store as StoreIcon } from "lucide-react";
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

function validate(values, fulfillmentType) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^[\d+\s-]{7,15}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (fulfillmentType === "DELIVERY") {
    if (!values.line1.trim()) errors.line1 = "Please enter your address.";
    if (!values.city.trim()) errors.city = "Please enter your city.";
    if (!values.state.trim()) errors.state = "Please enter your state.";
    if (!values.pincode.trim()) errors.pincode = "Please enter your pincode.";
  }
  return errors;
}

export default function CheckoutPageClient({ stores = [] }) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const [fulfillmentType, setFulfillmentType] = useState("DELIVERY");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");
  const [orderId, setOrderId] = useState(null);

  const store = stores[0];

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(values, fulfillmentType);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest: { name: values.name, email: values.email, phone: values.phone },
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

      setOrderId(json.data.id);
      setStatus("success");
      clear();
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
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="font-body text-sm font-semibold text-charcoal">
                  Full name
                </label>
                <input id="name" type="text" value={values.name} onChange={handleChange("name")} placeholder="Your full name" className={inputClasses} />
                {errors.name && <p className="font-body text-xs text-fnc-red">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="font-body text-sm font-semibold text-charcoal">
                  Phone number
                </label>
                <input id="phone" type="tel" value={values.phone} onChange={handleChange("phone")} placeholder="+91 98765 43210" className={inputClasses} />
                {errors.phone && <p className="font-body text-xs text-fnc-red">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-body text-sm font-semibold text-charcoal">
                Email
              </label>
              <input id="email" type="email" value={values.email} onChange={handleChange("email")} placeholder="you@example.com" className={inputClasses} />
              {errors.email && <p className="font-body text-xs text-fnc-red">{errors.email}</p>}
            </div>
          </div>

          {/* Delivery address */}
          {fulfillmentType === "DELIVERY" && (
            <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
              <h2 className="font-display text-lg font-bold text-charcoal">Delivery Address</h2>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="line1" className="font-body text-sm font-semibold text-charcoal">
                  Address line 1
                </label>
                <input id="line1" type="text" value={values.line1} onChange={handleChange("line1")} placeholder="House/flat no., street" className={inputClasses} />
                {errors.line1 && <p className="font-body text-xs text-fnc-red">{errors.line1}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="line2" className="font-body text-sm font-semibold text-charcoal">
                  Address line 2 (optional)
                </label>
                <input id="line2" type="text" value={values.line2} onChange={handleChange("line2")} placeholder="Landmark, apartment, etc." className={inputClasses} />
              </div>
              <div className="grid sm:grid-cols-3 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="font-body text-sm font-semibold text-charcoal">
                    City
                  </label>
                  <input id="city" type="text" value={values.city} onChange={handleChange("city")} placeholder="City" className={inputClasses} />
                  {errors.city && <p className="font-body text-xs text-fnc-red">{errors.city}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="state" className="font-body text-sm font-semibold text-charcoal">
                    State
                  </label>
                  <input id="state" type="text" value={values.state} onChange={handleChange("state")} placeholder="State" className={inputClasses} />
                  {errors.state && <p className="font-body text-xs text-fnc-red">{errors.state}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="pincode" className="font-body text-sm font-semibold text-charcoal">
                    Pincode
                  </label>
                  <input id="pincode" type="text" value={values.pincode} onChange={handleChange("pincode")} placeholder="400607" className={inputClasses} />
                  {errors.pincode && <p className="font-body text-xs text-fnc-red">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="font-body text-sm text-fnc-red flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-fit">
            {status === "submitting" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Placing order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
          <p className="font-body text-xs text-slate">
            Payment is confirmed after order placement — our team will reach out to complete
            payment before dispatch. Online payment at checkout is coming soon.
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
          <p className="font-body text-xs text-slate">
            Delivery charges, if any, are confirmed by our team after order placement.
          </p>
          <Link href="/cart" className="font-body text-xs text-slate hover:text-fnc-red transition-colors text-center">
            Edit cart
          </Link>
        </div>
      </div>
    </Section>
  );
}
