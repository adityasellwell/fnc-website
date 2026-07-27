"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Section from "@/components/layout/Section";
import { icons } from "lucide-react";

// Each card gets a color from the F&C logo palette
const points = [
  { icon: "Sunrise",      tone: "red",   title: "Fresh Every Morning",       detail: "Cut and packed in-store daily." },
  { icon: "Award",        tone: "blue",  title: "Premium Quality",           detail: "Handpicked sourcing, every batch." },
  { icon: "ChefHat",      tone: "green", title: "Expert Butchery",           detail: "Trained hands, precise cuts." },
  { icon: "Snowflake",    tone: "blue",  title: "Cold Chain Maintained",     detail: "Fresh from counter to door." },
  { icon: "Truck",        tone: "red",   title: "Fast Delivery",             detail: "Same-day, straight to your kitchen." },
  { icon: "ShieldCheck",  tone: "green", title: "Quality Checked Daily",     detail: "Every batch verified before sale." },
];

const toneClasses = {
  red:   { icon: "bg-fnc-red/10 text-fnc-red",     border: "hover:border-fnc-red",   label: "group-hover:text-fnc-red"   },
  blue:  { icon: "bg-fnc-blue/10 text-fnc-blue",   border: "hover:border-fnc-blue",  label: "group-hover:text-fnc-blue"  },
  green: { icon: "bg-fnc-green/10 text-fnc-green", border: "hover:border-fnc-green", label: "group-hover:text-fnc-green" },
};

const accentLine = {
  red:   "bg-fnc-red",
  blue:  "bg-fnc-blue",
  green: "bg-fnc-green",
};

function FeatureCard({ point, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const Icon = icons[point.icon];
  const tone = toneClasses[point.tone];

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={shouldReduceMotion ? {} : { y: -6, transition: { duration: 0.25 } }}
      className={`group bg-white border border-bordergray rounded-3xl p-8 flex flex-col items-center text-center gap-5 shadow-xs hover:shadow-xl transition-all duration-300 cursor-default ${tone.border}`}
    >
      {/* Icon — logo color per tone, springs on hover */}
      <motion.div
        whileHover={
          shouldReduceMotion
            ? {}
            : { scale: 1.15, rotate: 8, transition: { type: "spring", stiffness: 300, damping: 15 } }
        }
        className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 ${tone.icon}`}
      >
        {Icon && <Icon className="h-8 w-8" strokeWidth={2.25} />}
      </motion.div>

      <div className="flex flex-col gap-2">
        <h3 className={`font-display text-xl sm:text-2xl font-bold text-charcoal transition-colors duration-200 ${tone.label}`}>
          {point.title}
        </h3>
        <p className="font-body text-sm sm:text-base text-slate leading-relaxed max-w-xs">
          {point.detail}
        </p>
      </div>

      {/* Accent underline in logo tone color */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileHover={shouldReduceMotion ? {} : { scaleX: 1 }}
        transition={{ duration: 0.25 }}
        className={`w-12 h-0.5 rounded-full origin-left ${accentLine[point.tone]}`}
      />
    </motion.div>
  );
}

export default function WhyChooseFC() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Section background="warmwhite">
      {/* Decorative colored bar at top — all three logo colors */}
      <div className="flex h-1 rounded-full overflow-hidden mb-12 max-w-xs mx-auto gap-0.5">
        <div className="flex-1 bg-fnc-red" />
        <div className="flex-1 bg-fnc-blue" />
        <div className="flex-1 bg-fnc-green" />
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
          Why Choose F&amp;C
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
          The details most stores skip.
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {points.map((point, i) => (
          <FeatureCard key={point.title} point={point} index={i} />
        ))}
      </div>
    </Section>
  );
}
