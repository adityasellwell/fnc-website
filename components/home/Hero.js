"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import Button from "@/components/ui/Button";
import Section from "@/components/layout/Section";

const SLIDE_DURATION = 5000;

/**
 * Hero image slider — cinematic enhanced version.
 *
 * Additions over v1:
 *  - Word-by-word staggered headline animation (each word fades+slides in)
 *  - Spring-physics CTA button entrance
 *  - Mouse-parallax on background image (desktop only)
 *  - Auto-advance RAF-based progress bar (thin red line at slide bottom)
 *  - Cinematic scale transition between slides
 *  - Eyebrow badge springs in first with overshoot
 *  - Reduced-motion: all animations skipped, plain static image shown
 */
export default function Hero({ banners = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  // Mouse parallax motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const imgX = useTransform(springX, [-0.5, 0.5], ["-1.5%", "1.5%"]);
  const imgY = useTransform(springY, [-0.5, 0.5], ["-1.5%", "1.5%"]);

  const goTo = useCallback(
    (idxOrUpdater) => {
      if (typeof idxOrUpdater === "function") {
        setActiveIndex(idxOrUpdater);
      } else {
        setActiveIndex(idxOrUpdater);
      }
      setProgress(0);
    },
    []
  );

  const advance = useCallback(() => {
    if (banners.length < 2) return;
    setActiveIndex((prev) => (prev + 1) % banners.length);
    setProgress(0);
  }, [banners.length]);

  // RAF-based progress bar — resets on slide change or hover
  useEffect(() => {
    if (isHovered || banners.length < 2 || shouldReduceMotion) return;
    startRef.current = performance.now();

    function tick(now) {
      const elapsed = now - startRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        advance();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, isHovered, advance, banners.length, shouldReduceMotion]);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[activeIndex];
  const words = (currentBanner.title || "").split(" ");

  // ── Framer Motion variants ─────────────────────────────────────────────
  const wordContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const subVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.48, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.88, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 280,
        damping: 22,
        delay: 0.62,
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 18,
        delay: 0.04,
      },
    },
  };

  return (
    <Section spacing="sm" className="pt-2 pb-2">
      <div
        className="relative aspect-[1.8/1] sm:aspect-[2.5/1] md:aspect-[3.2/1] lg:aspect-[4.2/1] w-full overflow-hidden rounded-3xl border border-bordergray bg-warmwhite"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          resetParallax();
        }}
        onMouseMove={handleMouseMove}
      >
        {/* ── Slides ───────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              shouldReduceMotion ? undefined : { opacity: 0, scale: 0.97 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.75,
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Parallax image — extends 6% so shifts stay in-bounds */}
            <motion.div
              className="absolute inset-[-3%] w-[106%] h-[106%]"
              style={shouldReduceMotion ? {} : { x: imgX, y: imgY }}
            >
              <Image
                src={currentBanner.image}
                alt={currentBanner.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/35 via-transparent to-transparent" />

            {/* ── Slide Content ──────────────────────────────────────── */}
            <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 md:p-14 max-w-3xl text-white">
              {/* Eyebrow badge — spring pop-in */}
              <motion.span
                key={`badge-${activeIndex}`}
                variants={shouldReduceMotion ? {} : badgeVariants}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center w-fit font-body text-[10px] sm:text-xs font-bold uppercase tracking-widest text-fnc-red mb-3 bg-fnc-red/15 border border-fnc-red/30 px-3 py-1 rounded-full backdrop-blur-sm"
              >
                ✦ Premium Quality
              </motion.span>

              {/* Word-by-word staggered headline */}
              <motion.h1
                key={`headline-${activeIndex}`}
                variants={shouldReduceMotion ? {} : wordContainerVariants}
                initial="hidden"
                animate="visible"
                className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[4rem] leading-[1.05] tracking-tight mb-3 md:mb-4 flex flex-wrap gap-x-[0.28em] gap-y-1"
              >
                {words.map((word, i) => (
                  <motion.span
                    key={`word-${activeIndex}-${i}`}
                    variants={shouldReduceMotion ? {} : wordVariants}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                key={`sub-${activeIndex}`}
                variants={shouldReduceMotion ? {} : subVariants}
                initial="hidden"
                animate="visible"
                className="font-body text-xs sm:text-sm md:text-base text-white/85 max-w-lg mb-5 leading-relaxed hidden sm:block"
              >
                {currentBanner.subtitle}
              </motion.p>

              {/* CTA button — spring entrance + ambient pulse glow */}
              <motion.div
                key={`btn-${activeIndex}`}
                variants={shouldReduceMotion ? {} : buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <Button
                  href={currentBanner.link}
                  size="md"
                  className="animate-pulse-glow shadow-xl"
                >
                  {currentBanner.ctaLabel || "Shop Now"}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Progress Bar ─────────────────────────────────────────────── */}
        {!shouldReduceMotion && banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/15 z-20 overflow-hidden">
            <div
              className="h-full bg-fnc-red transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Dot Indicators ───────────────────────────────────────────── */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {banners.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goTo(index)}
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.85 }}
              className={`rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-7 h-2.5 bg-fnc-red shadow-[0_0_8px_rgba(200,25,26,0.7)]"
                  : "w-2 h-2 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
