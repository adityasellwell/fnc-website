"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Global smooth scroll, initialized once in the root layout per the
 * project's tech stack (Lenis). No-ops under prefers-reduced-motion so
 * native, instant scrolling is preserved for users who need it.
 */
export default function SmoothScrollProvider({ children }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return children;
}
