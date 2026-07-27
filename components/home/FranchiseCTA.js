"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { FRANCHISE_STATS } from "@/lib/constants";

/**
 * Count-up hook — animates a number from 0 to `target` once `trigger` is true.
 * Returns the current display value (string, preserves "+" / "x" suffixes).
 */
function useCountUp(rawValue, trigger) {
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!trigger) return;

    // Extract numeric prefix and non-numeric suffix (e.g. "3+" → num=3, suffix="+")
    const match = String(rawValue).match(/^(\d+\.?\d*)(.*)$/);
    if (!match) { setDisplay(rawValue); return; }

    const num    = parseFloat(match[1]);
    const suffix = match[2] ?? "";
    const duration = 1200; // ms
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * num * 10) / 10;
      setDisplay(`${Number.isInteger(current) ? current : current.toFixed(1)}${suffix}`);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [trigger, rawValue]);

  return display;
}

function StatItem({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const count = useCountUp(stat.value, !shouldReduceMotion && inView);

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <p
        className={`font-display text-3xl sm:text-4xl font-bold text-fnc-red ${
          inView && !shouldReduceMotion ? "animate-count-glow" : ""
        }`}
      >
        {shouldReduceMotion ? stat.value : count}
      </p>
      <p className="font-body text-sm text-white/70 mt-1">{stat.label}</p>
    </motion.div>
  );
}

/**
 * Franchise CTA — enhanced with:
 * - Count-up number animation on scroll entry (eased, ~1.2s)
 * - Red glow pulse on stat values as they count up
 * - Subtle hover lift on the section text block
 */
export default function FranchiseCTA() {
  return (
    <Section spacing="lg" className="bg-charcoal text-white">
      <Reveal className="max-w-2xl">
        <p className="font-body text-sm font-semibold uppercase tracking-wider text-fnc-red mb-3">
          Franchise With F&amp;C
        </p>
        <h2 className="font-display text-section-heading-lg font-bold leading-[1.02]">
          Bring F&amp;C&apos;s fresh protein model to your city.
        </h2>
        <p className="font-body text-body text-white/75 mt-5 max-w-xl">
          A proven format, a trusted brand, and a supply chain built for
          hygiene and consistency — ready to launch in your city.
        </p>
      </Reveal>

      <div className="grid grid-cols-3 gap-6 max-w-xl mt-10">
        {FRANCHISE_STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      <Reveal delay={0.3} className="flex flex-wrap gap-4 mt-10">
        <Button href="/franchise/apply" size="lg">
          Apply for Franchise
        </Button>
        <Button
          href="/franchise/brochure"
          size="lg"
          variant="outline"
          className="border-white/30 text-white hover:border-white"
        >
          Download Brochure
        </Button>
      </Reveal>
    </Section>
  );
}
