"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

/**
 * Renders the Raw/Snacks-style sibling pill row + the product grid below
 * it, filtering entirely client-side. Clicking a pill used to navigate to
 * a whole new /shop/[category] page (new URL, banner re-fetch, scroll
 * reset) which read as "redirecting to another page" instead of just
 * narrowing the grid — this keeps everything on the current page.
 */
export default function CategoryFilterGrid({ products, siblingCategories, topLevelImage, initialSubcategory = null }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!selectedSubcategory) return products;
    return products.filter((p) => (p.categorySlugs ?? []).includes(selectedSubcategory));
  }, [products, selectedSubcategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function selectSubcategory(slug) {
    setSelectedSubcategory((prev) => (prev === slug ? null : slug));
    setPage(1);
  }

  return (
    <>
      {siblingCategories.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 flex-nowrap items-center py-1">
          {siblingCategories.map((c) => {
            const isActive = selectedSubcategory === c.slug;
            const thumb = c.image || topLevelImage || "/images/categories/fish.jpg";
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectSubcategory(c.slug)}
                className={cn(
                  "shrink-0 rounded-full pl-2 pr-6 py-2.5 font-body text-base font-bold border-2 transition-colors inline-flex items-center gap-3",
                  isActive
                    ? "bg-fnc-red text-white border-fnc-red shadow-md"
                    : "bg-fnc-red/10 text-fnc-red border-fnc-red/40 hover:bg-fnc-red/20"
                )}
              >
                <span className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border-2 border-white shadow">
                  <Image src={thumb} alt="" fill sizes="44px" className="object-cover" />
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <p className="font-body text-sm text-slate mb-6">
        {filtered.length} product{filtered.length === 1 ? "" : "s"}
      </p>

      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-bordergray rounded-2xl bg-white/50 w-full">
          <span className="text-4xl mb-3">🥩</span>
          <h4 className="font-display text-lg font-bold text-charcoal">Fresh stock arriving soon</h4>
          <p className="font-body text-sm text-slate mt-1 max-w-xs">
            We are currently refilling our inventory. In the meantime, feel free to check our other categories above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {paginated.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 0.05}>
              <ProductCard product={product} variant="kinetic" />
            </Reveal>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === currentPage ? "page" : undefined}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-full font-body text-sm font-semibold border transition-colors",
                  p === currentPage
                    ? "bg-fnc-red text-white border-fnc-red"
                    : "bg-white text-charcoal border-bordergray hover:border-charcoal"
                )}
              >
                {p}
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
