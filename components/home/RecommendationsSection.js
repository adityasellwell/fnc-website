"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Percent, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/layout/Container";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export default function RecommendationsSection({ products = [], initialCategories = [] }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const scrollContainerRef = useRef(null);

  const subcategories = useMemo(() => {
    const selectedCategoryObj = selectedCategory
      ? initialCategories.find((c) => c.slug === selectedCategory)
      : null;
    return selectedCategoryObj
      ? initialCategories.filter((c) => c.parentCategoryId === selectedCategoryObj.id)
      : [];
  }, [selectedCategory, initialCategories]);

  function selectCategory(slug) {
    const isActive = selectedCategory === slug;
    setSelectedCategory(isActive ? null : slug);
    setSelectedSubcategory(null); // switching (or clearing) the parent always resets any subcategory narrowing
  }

  // Only top-level categories get their own circle — a subcategory (e.g.
  // "Raw"/"Snacks" under "Fish") is reached via the parent's "View All"
  // link on /shop/[category], not as its own flat circle here.
  const categoriesList = [
    ...initialCategories
      .filter((c) => !c.parentCategoryId)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        image: c.image || `/images/categories/${c.slug}.jpg`,
        id: c.id,
      })),
    { slug: "offers", name: "Offers", image: null, id: "offers" },
  ];

  const isScrollable = categoriesList.length > 8;

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCategory) {
      if (selectedCategory === "offers") {
        list = list.filter(
          (p) =>
            Array.isArray(p.tags) &&
            (p.tags.includes("premium") || p.tags.includes("seasonal"))
        );
      } else if (selectedSubcategory) {
        // A subcategory pill was picked underneath the parent circle —
        // narrows to ONLY that subcategory's products, not the parent's
        // full rollup anymore (e.g. Fish + Snacks selected = Snacks only).
        list = list.filter((p) => p.categoryId === `cat-${selectedSubcategory}`);
      } else {
        // p.categoryId is the synthetic "cat-<slug>" string lib/data/products.js
        // emits (see its header comment) — not the real Category.id cuid, so it
        // must be compared against the slug directly, not a categoriesList lookup.
        // Selecting a top-level category alone pulls in its subcategories'
        // products (e.g. "Fish" includes "Raw" and "Snacks"), matching
        // /shop/[category]'s rollup behavior.
        const childSlugs = subcategories.map((c) => c.slug);
        const activeSlugs = [`cat-${selectedCategory}`, ...childSlugs.map((s) => `cat-${s}`)];
        list = list.filter((p) => activeSlugs.includes(p.categoryId));
      }
    } else {
      list = list.filter(
        (p) =>
          Array.isArray(p.tags) &&
          (p.tags.includes("bestseller") || p.tags.includes("premium"))
      );
    }

    return list;
  }, [selectedCategory, selectedSubcategory, products, subcategories]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-offwhite pt-4 pb-12 overflow-hidden">
      <Container>

        {/* ── Category Circles ─────────────────────────────────────────── */}
        <div className="relative w-full mb-6 group py-2">
          {/* Desktop Left Scroll Arrow (only when scrollable) */}
          {isScrollable && (
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Scroll Left"
              className="absolute -left-5 top-[60px] -translate-y-1/2 z-25 h-10 w-10 rounded-full bg-white shadow-md border border-bordergray flex items-center justify-center text-charcoal hover:text-fnc-red hover:scale-105 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable / Grid Container */}
          <div
            ref={scrollContainerRef}
            className={cn(
              "scrollbar-none px-4 sm:px-0 pb-3 w-full",
              isScrollable
                ? "flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth -mx-4 sm:mx-0"
                : "flex gap-3 overflow-x-auto sm:grid sm:grid-cols-8 sm:gap-0"
            )}
          >
            {categoriesList.map((item, i) => {
              const isActive = selectedCategory === item.slug;
              const isOffers = item.slug === "offers";
              const imgSrc = item.image;

              return (
                <Reveal
                  key={item.slug}
                  delay={i * 0.04}
                  y={14}
                  onClick={() => selectCategory(item.slug)}
                  className={cn(
                    "group flex flex-col items-center gap-2 cursor-pointer py-1.5 focus:outline-none",
                    isScrollable ? "shrink-0 px-0.5" : "px-1"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectCategory(item.slug);
                    }
                  }}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "relative rounded-full overflow-hidden border-[3px] transition-all duration-300 h-20 w-20 sm:h-24 sm:w-24 lg:h-24 lg:w-24 xl:h-28 xl:w-28",
                      isActive
                        ? "border-fnc-red scale-105 shadow-lg"
                        : "border-bordergray group-hover:border-charcoal/40 group-hover:scale-102"
                    )}
                  >
                    {isOffers ? (
                      <div className="h-full w-full flex items-center justify-center bg-fnc-red">
                        <Percent className="h-8 w-8 sm:h-10 sm:w-10 text-white" strokeWidth={2} />
                      </div>
                    ) : (
                      <Image
                        src={imgSrc || "/images/categories/fish.jpg"}
                        alt={item.name}
                        fill
                        sizes="(max-width:640px) 80px, (max-width:1024px) 96px, 112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    {/* Active ring */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-fnc-red ring-offset-2 z-10 pointer-events-none" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "font-body text-[11px] sm:text-xs lg:text-sm font-bold text-center whitespace-nowrap transition-colors leading-tight max-w-[6.5rem]",
                      isActive ? "text-fnc-red" : "text-charcoal group-hover:text-fnc-red"
                    )}
                  >
                    {item.name}
                  </span>
                </Reveal>
              );
            })}
          </div>

          {/* Desktop Right Scroll Arrow (only when scrollable) */}
          {isScrollable && (
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Scroll Right"
              className="absolute -right-5 top-[60px] -translate-y-1/2 z-25 h-10 w-10 rounded-full bg-white shadow-md border border-bordergray flex items-center justify-center text-charcoal hover:text-fnc-red hover:scale-105 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* ── Subcategory pills — only when the selected circle is a parent
             category with children. Picking one narrows the grid down to
             just that subcategory; picking the same one again clears back
             to the parent's full rollup. ─────────────────────────────── */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 -mt-1">
            {subcategories.map((c) => {
              const isActive = selectedSubcategory === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedSubcategory(isActive ? null : c.slug)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold border transition-colors",
                    isActive
                      ? "bg-fnc-red text-white border-fnc-red"
                      : "bg-white text-charcoal border-bordergray hover:border-fnc-red"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Recommendations Grid ───────────────────────────────── */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-charcoal">
              {selectedSubcategory
                ? subcategories.find((c) => c.slug === selectedSubcategory)?.name
                : selectedCategory
                ? categoriesList.find((c) => c.slug === selectedCategory)?.name
                : "Today's Fresh Picks"}
            </h3>
            <span className="font-body text-xs text-slate shrink-0">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-bordergray rounded-2xl bg-white/50 w-full">
              <span className="text-4xl mb-3">🥩</span>
              <h4 className="font-display text-lg font-bold text-charcoal">Fresh stock arriving soon</h4>
              <p className="font-body text-sm text-slate max-w-xs mt-1">
                We are currently refilling our inventory. In the meantime, feel free to explore our other categories above!
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.93 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ProductCard product={product} variant="kinetic" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {selectedCategory && selectedCategory !== "offers" && (
            <div className="flex justify-center mt-8">
              <Link
                href={`/shop/${selectedSubcategory || selectedCategory}`}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border-2 border-fnc-red text-fnc-red font-display text-sm font-bold hover:bg-fnc-red hover:text-white transition-colors"
              >
                View All in{" "}
                {selectedSubcategory
                  ? subcategories.find((c) => c.slug === selectedSubcategory)?.name
                  : categoriesList.find((c) => c.slug === selectedCategory)?.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>

      </Container>
    </section>
  );
}
