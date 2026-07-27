"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Section from "@/components/layout/Section";
import Reveal from "@/components/motion/Reveal";

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-fnc-red",
  "bg-fnc-green",
  "bg-fnc-blue",
  "bg-charcoal",
];

// How many cards to show based on viewport
// We control via CSS, but track index differently per breakpoint
const CARDS_DESKTOP = 3;
const CARDS_MOBILE  = 1;

export default function ReviewsSlider({ reviews = [] }) {
  const [index, setIndex]     = useState(0);
  const [paused, setPaused]   = useState(false);
  const [cardsVisible, setCardsVisible] = useState(CARDS_MOBILE);
  const timerRef = useRef(null);

  // Detect viewport width to know how many cards show
  useEffect(() => {
    const update = () => {
      setCardsVisible(window.innerWidth >= 1024 ? CARDS_DESKTOP : window.innerWidth >= 640 ? 2 : CARDS_MOBILE);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, reviews.length - cardsVisible);

  const next = () => setIndex((i) => Math.min(i + 1, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  // Auto-advance
  useEffect(() => {
    if (paused || reviews.length <= cardsVisible) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [paused, maxIndex, reviews.length, cardsVisible]);

  if (!reviews.length) return null;

  // Slice the visible window
  const visible = reviews.slice(index, index + cardsVisible);

  return (
    <Section
      background="offwhite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >

      {/* Header — centered */}
      <Reveal className="text-center mb-12 sm:mb-16">
        <p className="font-body text-xs sm:text-sm font-extrabold uppercase tracking-wider text-fnc-red mb-3">
          What Customers Say
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal leading-[1.1]">
          Real households, real orders.
        </h2>
      </Reveal>

      {/* Slider */}
      <Reveal delay={0.1} className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {visible.map((review, i) => (
              <div
                key={review.id}
                className="bg-white border border-bordergray rounded-3xl p-7 sm:p-8 flex flex-col gap-5 hover:shadow-md hover:border-fnc-red/30 transition-all duration-300"
              >
                {/* Quote Icon */}
                <Quote className="h-7 w-7 text-fnc-red opacity-80 shrink-0" strokeWidth={2} />

                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${idx < review.rating ? "fill-fnc-red text-fnc-red" : "text-bordergray"}`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="font-body text-base sm:text-lg text-charcoal/80 leading-relaxed flex-1">
                  "{review.comment}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-bordergray">
                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center font-body text-sm font-bold text-white shrink-0 ${
                      AVATAR_COLORS[i % AVATAR_COLORS.length]
                    }`}
                  >
                    {initials(review.authorName)}
                  </div>
                  <div>
                    <p className="font-body text-sm font-bold text-charcoal">
                      {review.authorName}
                    </p>
                    <p className="font-body text-xs text-slate">Verified Customer</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {reviews.length > cardsVisible && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              disabled={index === 0}
              className="h-11 w-11 flex items-center justify-center rounded-full border border-bordergray text-charcoal hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-fnc-red" : "w-2 bg-bordergray hover:bg-slate/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={index >= maxIndex}
              className="h-11 w-11 flex items-center justify-center rounded-full border border-bordergray text-charcoal hover:bg-charcoal/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </Reveal>

    </Section>
  );
}
