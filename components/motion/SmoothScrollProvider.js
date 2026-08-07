"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Global smooth scroll, initialized once in the root layout.
 * Employs ResizeObserver and load listeners to prevent Lenis from losing
 * sync when dynamic images or listings shift page height (solving scroll lock / jitter).
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

    // Exposed so Modal.js can pause/resume Lenis while a modal is open —
    // data-lenis-prevent alone stops it hijacking wheel events over the
    // modal's own scroll area, but doesn't stop it still smooth-scrolling
    // the page behind a fixed-position overlay.
    window.__lenis = lenis;

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
  }, []);

  return children;
}
