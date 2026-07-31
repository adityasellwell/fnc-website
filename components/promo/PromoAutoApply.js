"use client";

import { useEffect } from "react";

/**
 * Remembers the promo code from a /promo/[code] visit so checkout can
 * auto-apply it — a plain localStorage flag rather than a new global
 * store, since it's a one-shot handoff between two pages, not ongoing
 * shared state.
 */
export default function PromoAutoApply({ code }) {
  useEffect(() => {
    localStorage.setItem("fnc_pending_promo", code);
  }, [code]);

  return null;
}
