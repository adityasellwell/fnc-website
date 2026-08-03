"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function ScrollContainer({ children }) {
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
  }, []);

  return (
    <div className="relative bg-white border border-bordergray rounded-2xl overflow-hidden">
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}
      >
        {children}
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
