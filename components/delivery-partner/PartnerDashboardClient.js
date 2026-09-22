"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Navigation, 
  Package, 
  Truck, 
  LogOut, 
  Loader2, 
  Bike, 
  User, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { pickedUpAction, deliveredAction, partnerSignOutAction } from "@/app/delivery-partner/actions";
import { BRAND } from "@/lib/constants";

const CustomerLocationMap = dynamic(() => import("./CustomerLocationMap"), {
  ssr: false,
  loading: () => <div className="w-full h-44 rounded-2xl bg-warmwhite animate-pulse flex items-center justify-center text-xs text-slate font-body">Loading customer map...</div>,
});

function OrderCard({ order }) {
  const [pending, startTransition] = useTransition();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const addr = order.deliveryAddress || {};
  const addressText = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
  const hasCoords = order.latitude != null && order.longitude != null;
  
  const navigateUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`;
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

  const isPreparing = order.status === "PREPARING";
  const isOutForDelivery = order.status === "OUT_FOR_DELIVERY";

  return (
    <div className="bg-white border border-bordergray/80 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      {/* Header / Order ID & Status */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-bordergray/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-charcoal">Order #{order.id.slice(-8)}</span>
          </div>
          <p className="font-body text-xs text-slate mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate" />
            {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span
          className={`font-body text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            isPreparing
              ? "bg-amber-100 text-amber-800 border border-amber-200"
              : "bg-blue-100 text-blue-800 border border-blue-200 animate-pulse"
          }`}
        >
          {isPreparing ? (
            <>
              <Package className="w-3.5 h-3.5 text-amber-600" />
              Ready for Pickup
            </>
          ) : (
            <>
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              Out for Delivery
            </>
          )}
        </span>
      </div>

      {/* Customer Info Card */}
      <div className="bg-warmwhite/60 border border-bordergray/60 rounded-2xl p-3.5 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-charcoal">
          <div className="w-7 h-7 rounded-full bg-white border border-bordergray flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-fnc-red" />
          </div>
          <span className="font-body font-bold text-sm text-charcoal">{order.customer?.name || "Customer"}</span>
        </div>
        <div className="flex items-start gap-2 text-slate text-xs font-body pl-1">
          <MapPin className="w-4 h-4 text-fnc-red shrink-0 mt-0.5" />
          <p className="text-charcoal/90 leading-relaxed font-medium">{addressText || "No address on file"}</p>
        </div>
      </div>

      {/* Map Preview */}
      {hasCoords && (
        <div className="rounded-2xl overflow-hidden border border-bordergray/60">
          <CustomerLocationMap lat={order.latitude} lng={order.longitude} />
        </div>
      )}

      {/* Action Buttons (Call, WhatsApp, Navigation) */}
      <div className="grid grid-cols-3 gap-2">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="h-10 px-2 rounded-xl border border-bordergray bg-white hover:bg-warmwhite transition-all flex items-center justify-center gap-1.5 font-body text-xs font-bold text-charcoal shadow-2xs active:scale-95"
          >
            <Phone className="h-3.5 w-3.5 text-fnc-blue shrink-0" />
            <span>Call</span>
          </a>
        ) : (
          <button disabled className="h-10 px-2 rounded-xl border border-bordergray bg-warmwhite text-slate/40 font-body text-xs font-bold flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed">
            <Phone className="h-3.5 w-3.5" />
            <span>No Phone</span>
          </button>
        )}

        {phone ? (
          <a
            href={`https://wa.me/91${phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 transition-all flex items-center justify-center gap-1.5 font-body text-xs font-bold text-emerald-800 shadow-2xs active:scale-95"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <button disabled className="h-10 px-2 rounded-xl border border-bordergray bg-warmwhite text-slate/40 font-body text-xs font-bold flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </button>
        )}

        <a
          href={navigateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-10 px-2 rounded-xl bg-charcoal text-white hover:bg-charcoal/90 transition-all flex items-center justify-center gap-1.5 font-body text-xs font-bold shadow-2xs active:scale-95"
        >
          {hasCoords ? <Navigation className="h-3.5 w-3.5 text-amber-400 shrink-0" /> : <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
          <span>Navigate</span>
        </a>
      </div>

      {/* Action Workflow */}
      {isPreparing && (
        <button
          onClick={handlePickedUp}
          disabled={pending}
          className="h-12 w-full rounded-2xl bg-charcoal text-white font-body text-sm font-bold hover:bg-charcoal/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-charcoal/10 disabled:opacity-60 active:scale-[0.99]"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Package className="h-4 w-4 text-amber-400" />
              Confirm Package Picked Up
            </>
          )}
        </button>
      )}

      {isOutForDelivery && (
        <div className="flex flex-col gap-3 pt-3 border-t border-bordergray/60">
          <div className="flex items-center justify-between">
            <label className="font-body text-xs font-bold text-charcoal flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-fnc-green" />
              Customer Delivery OTP
            </label>
            <span className="font-body text-[11px] text-slate font-medium">Ask customer for 4-digit code</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={4}
                inputMode="numeric"
                placeholder="••••"
                className="w-full h-12 px-3.5 rounded-xl border border-bordergray font-body text-base text-charcoal text-center tracking-[0.5em] placeholder:tracking-normal placeholder:text-slate/40 focus:border-fnc-green focus:ring-2 focus:ring-fnc-green/10 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={handleDelivered}
              disabled={pending || otp.length !== 4}
              className="h-12 px-5 rounded-xl bg-fnc-green text-white font-body text-sm font-bold hover:bg-fnc-green/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-fnc-green/20 disabled:opacity-50 active:scale-95 shrink-0"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Delivery
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="p-2.5 rounded-xl bg-fnc-red/10 border border-fnc-red/20 font-body text-xs text-fnc-red font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PartnerDashboardClient({ partner, orders }) {
  const readyCount = orders.filter((o) => o.status === "PREPARING").length;
  const activeCount = orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length;

  return (
    <main className="min-h-screen bg-offwhite pb-12">
      {/* Top Bar Header */}
      <header className="bg-white border-b border-bordergray px-4 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Rider Status */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-warmwhite border border-bordergray/60 p-1 flex items-center justify-center shrink-0">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                width={40}
                height={40}
                className="object-contain max-h-8 w-auto"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-sm sm:text-base text-charcoal">{partner.name}</p>
                <span className="flex h-2 w-2 relative" title="Online & Available">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="font-body text-xs text-slate font-medium">Delivery Partner &bull; {partner.phone}</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <form action={partnerSignOutAction}>
            <button
              type="submit"
              title="Sign Out"
              className="h-10 px-3 flex items-center gap-1.5 rounded-xl border border-bordergray text-slate hover:text-fnc-red hover:bg-fnc-red/10 transition-all font-body text-xs font-semibold active:scale-95"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <div className="px-4 py-6 max-w-xl mx-auto flex flex-col gap-5">
        {/* Status Bar Summary */}
        <div className="bg-white border border-bordergray/80 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fnc-red/10 border border-fnc-red/20 flex items-center justify-center text-fnc-red shrink-0">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-charcoal">Today&apos;s Dispatch</h2>
              <p className="font-body text-xs text-slate font-medium">Active delivery queue</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="font-display font-extrabold text-lg text-charcoal">{orders.length}</span>
              <p className="font-body text-[10px] uppercase font-bold text-slate tracking-wider">Total</p>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        {orders.length === 0 ? (
          <div className="bg-white border border-bordergray/80 rounded-3xl p-8 sm:p-12 text-center shadow-2xs flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-warmwhite border border-bordergray/60 flex items-center justify-center mb-4 text-slate/70">
              <Bike className="w-8 h-8 text-slate" />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal mb-1">No Deliveries Assigned</h3>
            <p className="font-body text-sm text-slate max-w-xs leading-relaxed">
              You currently have no active deliveries in your queue. Check back once your store manager assigns an order.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
