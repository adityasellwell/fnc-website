"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ReviewForm({ productId }) {
  const { isSignedIn, loading: authLoading } = useAuth();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please write a short comment.");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment: comment.trim() }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Couldn't submit your review.");

      setStatus("success");
      setComment("");
      setRating(0);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (authLoading) return null;

  if (!isSignedIn) {
    return (
      <div className="bg-warmwhite border border-bordergray rounded-2xl p-5 text-center">
        <p className="font-body text-sm text-slate">
          <a href={`/sign-in?redirect=/product/${productId}`} className="text-fnc-red font-semibold hover:underline">
            Sign in
          </a>{" "}
          to leave a review — every review here comes from a real, verified account.
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-fnc-green/5 border border-fnc-green/20 rounded-2xl p-5 flex items-center gap-2.5">
        <CheckCircle2 className="h-5 w-5 text-fnc-green shrink-0" />
        <p className="font-body text-sm text-charcoal">Thanks — your review has been posted.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-bordergray rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <p className="font-body text-sm font-semibold text-charcoal mb-2">Your rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hoverRating || rating) >= n ? "fill-fnc-red text-fnc-red" : "text-bordergray"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="What did you think of this product?"
        className="w-full px-4 py-3 rounded-xl border border-bordergray font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none"
      />

      {error && (
        <p className="font-body text-xs text-fnc-red flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" size="md" disabled={status === "submitting"} className="w-fit">
        {status === "submitting" && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
}
