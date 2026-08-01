import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Server-renderable — builds ?page=N links preserving other query params.
 * `searchParams` is the current page's resolved searchParams object.
 */
export default function Pagination({ page, totalPages, searchParams = {} }) {
  if (totalPages <= 1) return null;

  function hrefFor(p) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }

  const pages = [];
  const range = 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - range && i <= page + range)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {/* Prev */}
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`h-9 w-9 flex items-center justify-center rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal transition-colors ${
          page <= 1 ? "opacity-40 pointer-events-none" : "hover:border-charcoal hover:text-fnc-red"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {/* Pages */}
      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span
              key={`dots-${idx}`}
              className="h-9 px-3 flex items-center justify-center font-body text-sm text-slate select-none"
            >
              ...
            </span>
          );
        }

        const isActive = p === page;

        return (
          <Link
            key={p}
            href={hrefFor(p)}
            className={`h-9 min-w-9 px-2 flex items-center justify-center rounded-xl border font-body text-sm transition-all ${
              isActive
                ? "bg-fnc-red text-white border-fnc-red font-bold shadow-md shadow-fnc-red/10"
                : "bg-white text-charcoal border-bordergray hover:border-charcoal hover:text-fnc-red"
            }`}
          >
            {p}
          </Link>
        );
      })}

      {/* Next */}
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`h-9 w-9 flex items-center justify-center rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal transition-colors ${
          page >= totalPages ? "opacity-40 pointer-events-none" : "hover:border-charcoal hover:text-fnc-red"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
