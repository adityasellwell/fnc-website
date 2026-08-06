"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
    <div className="w-full max-w-sm bg-white rounded-3xl border border-bordergray shadow-xl p-8">
      <h1 className="font-display text-2xl font-bold text-charcoal text-center mb-1">Delivery Rider Sign In</h1>
      <p className="font-body text-sm text-slate text-center mb-6">Sign in with the phone number and PIN your store manager gave you.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">Phone Number</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">4-Digit PIN</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••"
            className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal text-center tracking-widest focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>

        {error && <p className="font-body text-xs text-fnc-red">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-fnc-red text-white font-body text-sm font-bold hover:bg-fnc-red/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
}
