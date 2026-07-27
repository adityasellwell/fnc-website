"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/**
 * Direction B's animated logo-draw loader, shown once on initial page load.
 * Draws two strokes echoing the fin/comb shapes from the F&C mark, then
 * reveals the "F&C" wordmark before fading out. Skipped entirely under
 * prefers-reduced-motion.
 */
export default function LogoLoader() {
  const shouldReduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(!shouldReduceMotion);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-offwhite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <svg width="140" height="140" viewBox="0 0 120 120" fill="none" aria-hidden="true">
            <motion.path
              d="M18 72 C 38 42, 68 32, 100 46 C 80 51, 58 62, 44 86 C 34 79, 24 75, 18 72 Z"
              stroke="var(--color-fnc-blue)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.7 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.path
              d="M58 24 C 64 14, 74 14, 77 23 C 80 14, 90 15, 90 25 C 90 33, 79 40, 73 44 C 67 40, 58 33, 58 24 Z"
              stroke="var(--color-fnc-red)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.7 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.65, 0, 0.35, 1] }}
            />
            <motion.text
              x="60"
              y="103"
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="24"
              fontWeight="700"
              fill="var(--color-charcoal)"
              initial={{ opacity: 0, y: 109 }}
              animate={{ opacity: 1, y: 103 }}
              transition={{ duration: 0.5, delay: 0.95 }}
            >
              F&amp;C
            </motion.text>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
