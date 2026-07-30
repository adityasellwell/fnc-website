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

  return (
    <div className="flex items-center justify-between gap-4 mt-5">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={`h-9 w-9 flex items-center justify-center rounded-full border border-bordergray transition-colors ${
          page <= 1 ? "opacity-40 pointer-events-none" : "hover:border-charcoal"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <p className="font-body text-sm text-slate">
        Page {page} of {totalPages}
      </p>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={`h-9 w-9 flex items-center justify-center rounded-full border border-bordergray transition-colors ${
          page >= totalPages ? "opacity-40 pointer-events-none" : "hover:border-charcoal"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
