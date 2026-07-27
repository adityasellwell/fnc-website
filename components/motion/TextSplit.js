"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Word-level split reveal for Direction B's oversized display type.
 * Each word masks and rises into place with a stagger. Falls back to
 * plain static text under prefers-reduced-motion.
 */
export default function TextSplit({
  text,
  as: Tag = "h1",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.05,
}) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-top mr-[0.22em] last:mr-0 pb-[0.1em]"
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "115%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.75,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
