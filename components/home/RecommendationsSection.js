"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Percent, Flame, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "@/components/layout/Container";
import ProductCard from "@/components/product/ProductCard";
import Reveal from "@/components/motion/Reveal";

const CATEGORY_ITEMS = [
  { slug: "fish",         name: "Fish" },
  { slug: "chicken",      name: "Chicken" },
  { slug: "crab",         name: "Crab" },
  { slug: "ready-to-cook", name: "Ready to Cook" },
  { slug: "ready-to-eat",  name: "Ready to Eat" },
  { slug: "cheese-dairy",  name: "Cheese & Dairy" },
  { slug: "eggs",          name: "Eggs" },
  { slug: "offers",        name: "Offers" },
];

const CATEGORY_IMAGES = {
  "ready-to-cook": {
    fish:           "/images/categories/fish.jpg",
    chicken:        "/images/categories/chicken.jpg",
    crab:           "/images/categories/crab.jpg",
    "ready-to-cook":"/images/categories/ready-to-cook.jpg",
    "ready-to-eat": "/images/categories/ready-to-eat.jpg",
    "cheese-dairy": "/images/categories/cheese-dairy.jpg",
    eggs:           "/images/categories/eggs.jpg",
  },
  "ready-to-eat": {
    fish:           "/images/categories/ready-to-eat.jpg",
    chicken:        "/images/categories/ready-to-eat.jpg",
    crab:           "/images/categories/ready-to-eat.jpg",
    "ready-to-cook":"/images/categories/ready-to-eat.jpg",
    "ready-to-eat": "/images/categories/ready-to-eat.jpg",
    "cheese-dairy": "/images/categories/cheese-dairy.jpg",
    eggs:           "/images/categories/ready-to-eat.jpg",
  },
};

export default function RecommendationsSection({ products = [] }) {
  const [activeToggle, setActiveToggle]     = useState("ready-to-cook");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [activeToggle]);

  useEffect(() => {
    let list = [...products];

    if (activeToggle === "ready-to-cook") {
      list = list.filter((p) => p.categoryId !== "cat-ready-to-eat");
    } else {
      list = list.filter((p) => p.categoryId === "cat-ready-to-eat");
    }

    if (selectedCategory) {
      if (selectedCategory === "offers") {
        list = list.filter((p) => p.tags.includes("premium") || p.tags.includes("seasonal"));
      } else if (activeToggle === "ready-to-eat") {
        const q = selectedCategory;
        if (q === "fish")    list = list.filter((p) => p.slug.includes("fish"));
        else if (q === "chicken") list = list.filter((p) => p.slug.includes("chicken"));
        else if (q === "eggs")    list = list.filter((p) => p.slug.includes("egg"));
        else if (q !== "ready-to-eat") list = [];
      } else {
        list = list.filter((p) => p.categoryId === `cat-${selectedCategory}`);
      }
    } else {
      list = list.filter((p) => p.tags.includes("bestseller") || p.tags.includes("premium"));
    }

    setFilteredProducts(list);
  }, [activeToggle, selectedCategory, products]);

  return (
    <section className="bg-offwhite py-5 md:py-6 overflow-hidden">
      <Container>

        {/* ── Toggle ─────────────────────────────────────────────── */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex bg-[#F3F1EC] p-1.5 rounded-full border border-[#E5E3DD] shadow-inner gap-1">
            {[
              { key: "ready-to-cook", label: "Ready to Cook", icon: Flame },
              { key: "ready-to-eat",  label: "Ready to Eat",  icon: ChefHat },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveToggle(key)}
                className={`flex items-center gap-2 py-3 px-6 sm:px-8 rounded-full font-body text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer ${
                  activeToggle === key
                    ? "bg-fnc-red text-white shadow-md"
                    : "text-slate hover:text-charcoal"
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Category Circles ───────────────────────────────────── */}
        <div className="w-full mb-5 -mx-4 sm:mx-0">
          <div className="flex gap-3 sm:gap-0 overflow-x-auto scrollbar-none px-4 sm:px-0 sm:justify-center sm:grid sm:grid-cols-8">
            {CATEGORY_ITEMS.map((item, i) => {
              const isActive  = selectedCategory === item.slug;
              const isOffers  = item.slug === "offers";
              const imgSrc    = CATEGORY_IMAGES[activeToggle][item.slug];

              return (
                <Reveal
                  key={item.slug}
                  as="button"
                  type="button"
                  delay={i * 0.05}
                  y={16}
                  onClick={() => setSelectedCategory(isActive ? null : item.slug)}
                  className="group flex flex-col items-center gap-2 cursor-pointer py-1.5 px-1"
                >
                  {/* Circle */}
                  <div
                    className={`relative rounded-full overflow-hidden border-[3px] transition-all duration-300
                      h-20 w-20
                      sm:h-24 sm:w-24
                      lg:h-24 lg:w-24
                      xl:h-28 xl:w-28
                      ${
                        isActive
                          ? "border-fnc-red scale-105 shadow-lg"
                          : "border-bordergray group-hover:border-charcoal/40 group-hover:scale-102"
                      }`}
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
                      <div className="absolute inset-0 rounded-full ring-2 ring-fnc-red ring-offset-2" />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`font-body text-[11px] sm:text-xs lg:text-sm font-bold text-center whitespace-nowrap transition-colors leading-tight max-w-[6rem] ${
                      isActive ? "text-fnc-red" : "text-charcoal group-hover:text-fnc-red"
                    }`}
                  >
                    {item.name}
                  </span>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* ── Recommendations Grid ───────────────────────────────── */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold text-charcoal">
              {selectedCategory
                ? `${CATEGORY_ITEMS.find((c) => c.slug === selectedCategory)?.name}`
                : "Recommended for You"}
            </h3>
            <span className="font-body text-xs text-slate shrink-0">
              {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center border border-dashed border-bordergray rounded-2xl">
              <span className="text-4xl mb-3">🍽️</span>
              <h4 className="font-display text-lg font-bold text-charcoal">No items found</h4>
              <p className="font-body text-sm text-slate max-w-xs mt-1">
                No {activeToggle === "ready-to-cook" ? "Ready to Cook" : "Ready to Eat"} items in this category today.
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
        </div>

      </Container>
    </section>
  );
}
