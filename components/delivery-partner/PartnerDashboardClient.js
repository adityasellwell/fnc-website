"use client";

import { useState, useTransition } from "react";
import { Phone, MessageCircle, MapPin, Package, Truck, LogOut, Loader2 } from "lucide-react";
import { pickedUpAction, deliveredAction, partnerSignOutAction } from "@/app/delivery-partner/actions";

function OrderCard({ order }) {
  const [pending, startTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const addr = order.deliveryAddress || {};
  const addressText = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
  const phone = order.customer?.phone;

  function handlePickedUp() {
    startTransition(() => pickedUpAction(order.id));
  }

  function handleDelivered() {
    setError("");
    startTransition(async () => {
      const res = await deliveredAction(order.id, otp);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div className="bg-white border border-bordergray rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-charcoal">Order #{order.id.slice(-8)}</p>
        <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full bg-warmwhite text-slate">
          {order.status === "PREPARING" ? "Ready for pickup" : "Out for delivery"}
        </span>
      </div>

      <div className="font-body text-sm text-charcoal">
        <p className="font-semibold">{order.customer?.name}</p>
        <p className="text-slate mt-0.5">{addressText || "No address on file"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {phone && (
          <a href={`tel:${phone}`} className="h-9 px-3 rounded-full border border-bordergray flex items-center gap-1.5 font-body text-xs font-semibold text-charcoal hover:bg-warmwhite transition-colors">
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
        {phone && (
          <a href={`https://wa.me/91${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="h-9 px-3 rounded-full border border-bordergray flex items-center gap-1.5 font-body text-xs font-semibold text-charcoal hover:bg-warmwhite transition-colors">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        )}
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="h-9 px-3 rounded-full border border-bordergray flex items-center gap-1.5 font-body text-xs font-semibold text-charcoal hover:bg-warmwhite transition-colors">
          <MapPin className="h-3.5 w-3.5" /> Navigate
        </a>
      </div>

      {order.status === "PREPARING" && (
        <button
          onClick={handlePickedUp}
          disabled={pending}
          className="h-11 rounded-xl bg-charcoal text-white font-body text-sm font-bold hover:bg-charcoal/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          Picked Up
        </button>
      )}

      {order.status === "OUT_FOR_DELIVERY" && (
        <div className="flex flex-col gap-2 pt-1 border-t border-bordergray">
          <label className="font-body text-xs font-semibold text-charcoal mt-2">Enter customer&apos;s OTP to confirm delivery</label>
          <div className="flex gap-2">
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={4}
              inputMode="numeric"
              placeholder="4-digit OTP"
              className="flex-1 h-11 px-3.5 rounded-xl border border-bordergray font-body text-sm text-center tracking-widest focus:border-fnc-red focus:outline-none"
            />
            <button
              onClick={handleDelivered}
              disabled={pending || otp.length !== 4}
              className="h-11 px-4 rounded-xl bg-fnc-green text-white font-body text-sm font-bold hover:bg-fnc-green/90 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Delivered
            </button>
          </div>
          {error && <p className="font-body text-xs text-fnc-red">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function PartnerDashboardClient({ partner, orders }) {
  return (
    <main className="min-h-screen bg-offwhite">
      <div className="bg-white border-b border-bordergray px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-display font-bold text-charcoal">{partner.name}</p>
          <p className="font-body text-xs text-slate">Today&apos;s Deliveries</p>
        </div>
        <form action={partnerSignOutAction}>
          <button type="submit" className="h-9 w-9 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-display font-bold text-charcoal">No deliveries assigned right now</p>
            <p className="font-body text-sm text-slate mt-1">Check back once your store manager assigns you an order.</p>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </main>
  );
}
