"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Global smooth scroll, initialized once in the root layout.
 * Employs ResizeObserver and load listeners to prevent Lenis from losing
 * sync when dynamic images or listings shift page height.
 * Forces scroll to top (0, 0) instantly on route changes.
 */
export default function SmoothScrollProvider({ children }) {
  const pathname = usePathname();

  // Instantly scroll to top (0, 0) on every route/pathname change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      if (window.__lenis) {
        window.__lenis.destroy();
        window.__lenis = null;
      }
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768;

    if (reduce || isTouchDevice) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    window.__lenis = lenis;

    // Reset scroll position to top on Lenis initialization
    lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    // Watch dynamic height changes (DOM insertion, client rendering shifts)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Watch image loading shifts
    const handleImageLoad = () => {
      lenis.resize();
    };

    window.addEventListener("load", handleImageLoad);
    
    // Attach load listener to uncompleted images
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", handleImageLoad);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("load", handleImageLoad);
      images.forEach((img) => {
        img.removeEventListener("load", handleImageLoad);
      });
      lenis.destroy();
      if (window.__lenis === lenis) window.__lenis = null;
    };
  }, [pathname]);

  return children;
}
