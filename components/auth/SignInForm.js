"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/ui/PasswordInput";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const [activeTab, setActiveTab] = useState("email"); // "email" | "phone"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setVerificationSent(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        // Require email verification
        await fetch("/api/auth/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
        await signOut(auth); // Sign out of client-side firebase session to prevent half-logged in states
        setVerificationSent(true);
        setError("Your email is not verified. We have sent a verification link to your email. Please verify and try again.");
        setLoading(false);
        return;
      }

      // Email is verified — sync session with backend
      const idToken = await user.getIdToken();
      await syncSession(idToken);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      }
    );
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }
      const formattedPhone = `+91${cleanPhone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setTimer(60);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please check the number and try again.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const code = otp.replace(/\D/g, "");
      if (code.length !== 6) {
        throw new Error("Please enter a valid 6-digit OTP.");
      }
      const result = await confirmationResult.confirm(code);
      const user = result.user;

      const idToken = await user.getIdToken();
      await syncSession(idToken);
    } catch (err) {
      console.error(err);
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const idToken = await user.getIdToken();
      await syncSession(idToken);
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Google sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const syncSession = async (idToken) => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to create server session");
      }

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError("Session sync failed. Please try again.");
      await signOut(auth);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-bordergray shadow-xl p-8">
      <h2 className="font-display text-2xl font-bold text-charcoal text-center mb-1">
        Welcome Back
      </h2>
      <p className="font-body text-sm text-slate text-center mb-6">
        Sign in to your F&amp;C account to track orders and save addresses.
      </p>

      {/* Tabs */}
      <div className="flex border-b border-bordergray mb-6">
        <button
          type="button"
          onClick={() => { setActiveTab("email"); setError(""); }}
          className={`flex-1 pb-3 font-body text-sm font-semibold text-center border-b-2 transition-colors ${
            activeTab === "email" ? "border-fnc-red text-fnc-red" : "border-transparent text-slate hover:text-charcoal"
          }`}
        >
          Email &amp; Password
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("phone"); setError(""); }}
          className={`flex-1 pb-3 font-body text-sm font-semibold text-center border-b-2 transition-colors ${
            activeTab === "phone" ? "border-fnc-red text-fnc-red" : "border-transparent text-slate hover:text-charcoal"
          }`}
        >
          Phone &amp; OTP
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-xl mb-4 font-body text-xs font-semibold ${verificationSent ? "bg-fnc-blue/10 text-fnc-blue" : "bg-fnc-red/10 text-fnc-red"}`}>
          {error}
        </div>
      )}

      <div id="recaptcha-container"></div>

      {activeTab === "email" ? (
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      ) : (
        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
          {!otpSent ? (
            <div>
              <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center h-12 px-3 rounded-xl border border-bordergray bg-warmwhite font-body text-sm font-semibold text-charcoal">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-body text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-bordergray font-body text-sm text-charcoal text-center tracking-widest focus:border-fnc-red focus:outline-none transition-colors"
              />
              <p className="font-body text-xs text-slate mt-2 text-right">
                {timer > 0 ? (
                  `Resend in ${timer}s`
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-fnc-red font-bold hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? "Please wait..." : otpSent ? "Verify & Sign In" : "Send OTP Link"}
          </Button>
        </form>
      )}

      <div className="relative flex py-4 items-center">
        <div className="grow border-t border-bordergray" />
        <span className="shrink mx-4 text-xs text-slate font-body uppercase font-semibold">Or</span>
        <div className="grow border-t border-bordergray" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-bordergray bg-white font-body text-sm font-semibold text-charcoal hover:bg-warmwhite transition-colors"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 0, 0)">
            <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.56,11.41 21.35,11.1z" fill="#4285F4" />
            <path d="M12,20.8c2.7,0 4.96,-0.9 6.62,-2.43l-3.3,-2.57c-0.9,0.62 -2.07,0.99 -3.32,0.99c-2.55,0 -4.71,-1.72 -5.48,-4.05H3.1v2.66C4.75,17.7 8.12,20.8 12,20.8z" fill="#34A853" />
            <path d="M6.52,12.74c-0.2,-0.62 -0.31,-1.28 -0.31,-1.96c0,-0.68 0.11,-1.34 0.31,-1.96V6.16H3.1c-0.67,1.34 -1.05,2.85 -1.05,4.45c0,1.6 0.38,3.11 1.05,4.45l3.42,-2.66C6.21,14.46 6.32,13.36 6.52,12.74z" fill="#FBBC05" />
            <path d="M12,5.22c1.47,0 2.78,0.51 3.82,1.5l2.87,-2.87C16.95,2.21 14.7,1.2 12,1.2C8.12,1.2 4.75,4.3 3.1,7.62l3.42,2.66C7.29,6.94 9.45,5.22 12,5.22z" fill="#EA4335" />
          </g>
        </svg>
        Sign in with Google
      </button>

      <p className="font-body text-xs text-slate text-center mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-fnc-red font-bold hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
