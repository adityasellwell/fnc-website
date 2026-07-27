"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Calm fade/slide-up entrance used across both homepage directions.
 * Respects prefers-reduced-motion by skipping the animated initial state.
 */
export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 24,
  duration = 0.6,
  once = true,
  className,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
