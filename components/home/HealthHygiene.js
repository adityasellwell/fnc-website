"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { icons } from "lucide-react";

// Steps use alternating logo colors: green (farm/nature) → blue (water/fish) → red (brand)
const steps = [
  { icon: "Sprout",          label: "Farm",        tone: "green" },
  { icon: "ClipboardCheck",  label: "Inspection",  tone: "blue"  },
  { icon: "Droplets",        label: "Cleaning",    tone: "blue"  },
  { icon: "Package",         label: "Packaging",   tone: "red"   },
  { icon: "Snowflake",       label: "Cold Chain",  tone: "blue"  },
  { icon: "Store",           label: "Store",       tone: "red"   },
  { icon: "Smile",           label: "Customer",    tone: "green" },
];

const toneMap = {
  red:   { circle: "border-fnc-red text-fnc-red",   bg: "bg-fnc-red/10",   line: "bg-fnc-red",   label: "group-hover:text-fnc-red"   },
  blue:  { circle: "border-fnc-blue text-fnc-blue", bg: "bg-fnc-blue/10",  line: "bg-fnc-blue",  label: "group-hover:text-fnc-blue"  },
  green: { circle: "border-fnc-green text-fnc-green",bg:"bg-fnc-green/10", line: "bg-fnc-green", label: "group-hover:text-fnc-green" },
};

function StepNode({ step, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const Icon = icons[step.icon];
  const t = toneMap[step.tone];

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.08 }}
      className="relative flex flex-col items-center text-center gap-4 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Step number */}
      <motion.span
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: index * 0.08 + 0.2, duration: 0.3 }}
        className="absolute -top-5 font-body text-[10px] font-bold opacity-50 text-charcoal"
      >
        {String(index + 1).padStart(2, "0")}
      </motion.span>

      {/* Icon circle — logo color per step */}
      <motion.div
        animate={
          shouldReduceMotion ? {} :
          hovered
            ? { scale: 1.15 }
            : { scale: 1 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className={`relative z-10 h-20 w-20 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors duration-300 ${t.circle} ${t.bg}`}
      >
        {Icon && <Icon className="h-9 w-9" strokeWidth={2.25} />}

        {/* Ping ring on hover */}
        {hovered && !shouldReduceMotion && (
          <motion.div
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute inset-0 rounded-full border-2 ${t.circle.split(" ")[0]}`}
          />
        )}
      </motion.div>

      <p className={`font-body text-base font-bold text-charcoal transition-colors duration-200 ${t.label}`}>
        {step.label}
      </p>
    </motion.div>
  );
}

export default function HealthHygiene() {
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section>
      <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
        <Reveal>
          {/* Three-color accent bar */}
          <div className="flex h-1 rounded-full overflow-hidden mb-5 w-24 mx-auto gap-0.5">
            <div className="flex-1 bg-fnc-green" />
            <div className="flex-1 bg-fnc-blue" />
            <div className="flex-1 bg-fnc-red" />
          </div>
          <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-green mb-3">
            Health &amp; Hygiene
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1] max-w-2xl">
            From farm to your table, every step accounted for.
          </h2>
          <Button href="/health-hygiene" variant="outline" className="mt-8">
            Our Hygiene Standards
          </Button>
        </Reveal>
      </div>

      <div className="relative max-w-5xl mx-auto px-4" ref={lineRef}>
        {/* Animated connecting line — draws left to right, gradient of logo colors */}
        <div className="hidden lg:block absolute top-10 left-10 right-10 h-0.5 bg-bordergray overflow-hidden rounded-full">
          <motion.div
            initial={shouldReduceMotion ? false : { width: "0%" }}
            animate={lineInView ? { width: "100%" } : {}}
            transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
            style={{ background: "linear-gradient(to right, #2D7A1F, #1E6FBF, #E8001D)" }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-12 gap-x-6 relative">
          {steps.map((step, i) => (
            <StepNode key={step.label} step={step} index={i} />
          ))}
        </div>
      </div>
    </Section>
  );
}
