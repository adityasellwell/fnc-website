"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Bike, Phone, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/constants";

export default function PartnerSignInForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/delivery-partner/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), pin }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sign in failed");
      router.push("/delivery-partner/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-bordergray shadow-xl p-6 sm:p-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative w-20 h-20 mb-3 flex items-center justify-center p-2 rounded-2xl bg-warmwhite/80 border border-bordergray/60 shadow-sm">
          <Image
            src={BRAND.logo}
            alt={BRAND.name}
            width={80}
            height={80}
            className="object-contain max-h-16 w-auto"
            priority
          />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fnc-red/10 text-fnc-red text-xs font-bold uppercase tracking-wider mb-2">
          <Bike className="w-3.5 h-3.5" />
          Rider Portal
        </div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Delivery Partner Sign In</h1>
        <p className="font-body text-xs sm:text-sm text-slate mt-1 max-w-xs">
          Enter your registered phone number and 4-digit PIN provided by your store manager.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
            Registered Phone Number
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate flex items-center gap-1">
              <Phone className="w-4 h-4 text-slate" />
              <span className="font-body text-xs font-semibold text-charcoal border-r border-bordergray pr-2 ml-1">+91</span>
            </div>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="70392 22266"
              className="w-full h-12 pl-24 pr-4 rounded-xl border border-bordergray font-body text-sm text-charcoal placeholder:text-slate/60 focus:border-fnc-red focus:ring-2 focus:ring-fnc-red/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
            4-Digit Rider PIN
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-slate" />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-bordergray font-body text-base text-charcoal text-center tracking-[0.5em] placeholder:tracking-normal placeholder:text-slate/60 focus:border-fnc-red focus:ring-2 focus:ring-fnc-red/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-fnc-red/10 border border-fnc-red/20 font-body text-xs text-fnc-red font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-fnc-red" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-fnc-red text-white font-body text-sm font-bold hover:bg-fnc-red/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-fnc-red/20 disabled:opacity-60 active:scale-[0.99]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-bordergray/60 text-center">
        <p className="font-body text-[11px] text-slate">
          {BRAND.fullName} &bull; Delivery Partner Network
        </p>
      </div>
    </div>
  );
}
