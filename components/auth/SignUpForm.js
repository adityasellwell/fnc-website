"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    // Validate phone number format (simple 10-digit check for India)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update name profile in Firebase
      await updateProfile(user, { displayName: name });

      // Firebase's updateProfile() has no phoneNumber field, so persist it
      // ourselves via our own Customer record before signing back out.
      const idToken = await user.getIdToken();
      await fetch("/api/auth/register-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, phone: `+91${cleanPhone}`, name }),
      });

      // Send verification email
      await sendEmailVerification(user);

      // Log out to prevent partial session access until verified
      await signOut(auth);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Account creation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-3xl border border-bordergray shadow-xl p-8 text-center">
        <div className="h-16 w-16 bg-fnc-green/10 text-fnc-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal mb-2">
          Verify Your Email
        </h2>
        <p className="font-body text-sm text-slate mb-6">
          We have sent a verification link to <span className="font-semibold text-charcoal">{email}</span>.
        </p>
        <p className="font-body text-xs text-slate bg-warmwhite p-4 rounded-xl mb-6">
          Please check your inbox (and spam folder) and click the link to verify your email. Once verified, you can sign in to complete your profile.
        </p>
        <Link href="/sign-in" className="inline-block w-full">
          <Button size="lg" className="w-full">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-bordergray shadow-xl p-8">
      <h2 className="font-display text-2xl font-bold text-charcoal text-center mb-1">
        Create F&amp;C Account
      </h2>
      <p className="font-body text-sm text-slate text-center mb-6">
        Register to save addresses and track your fresh protein orders.
      </p>

      {error && (
        <div className="p-4 bg-fnc-red/10 text-fnc-red rounded-xl mb-4 font-body text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
            Phone Number (for deliveries)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 font-body text-sm text-slate font-semibold">
              +91
            </span>
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-bordergray font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
            Password
          </label>
          <PasswordInput
            required
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? "Registering..." : "Create Account"}
        </Button>
      </form>

      <p className="font-body text-xs text-slate text-center mt-6">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-fnc-red font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
