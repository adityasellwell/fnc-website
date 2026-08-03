"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Presentational — column definitions:
 * { header: string, accessor: string | (row) => ReactNode, className? }
 *
 * Mobile-friendly horizontal scroll: momentum scrolling on touch,
 * scroll-contained so a sideways swipe never fights the page's own
 * scroll, and fade-edge shadows that appear only on the side there's
 * still more to scroll toward (so it doesn't just look like static
 * decoration — it's a real signal of scrollable content).
 */
export default function Table({ columns, rows, keyField = "id", emptyMessage = "Nothing here yet." }) {
  const scrollRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function updateFades() {
      setShowLeftFade(el.scrollLeft > 4);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
    updateFades();
    el.addEventListener("scroll", updateFades, { passive: true });
    const observer = new ResizeObserver(updateFades);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateFades);
      observer.disconnect();
    };
  }, [rows.length, columns.length]);

  return (
    <div className="relative bg-white border border-bordergray rounded-2xl overflow-hidden">
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        <table className="w-full text-left border-collapse min-w-160">
          <thead>
            <tr className="border-b border-bordergray bg-warmwhite/60">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={cn(
                    "font-body text-[11px] font-bold uppercase tracking-wider text-slate px-4 sm:px-5 py-3 whitespace-nowrap",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="font-body text-sm text-slate text-center py-12">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row[keyField]}
                  className="border-b border-bordergray last:border-b-0 hover:bg-warmwhite/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={cn("font-body text-sm text-charcoal px-4 sm:px-5 py-3.5 align-middle", col.className)}
                    >
                      {typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Scroll-affordance fades — only visible when there's actually more content that way */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-white to-transparent transition-opacity duration-200",
          showLeftFade ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white to-transparent transition-opacity duration-200",
          showRightFade ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
