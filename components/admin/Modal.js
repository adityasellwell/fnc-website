"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl border border-bordergray shadow-2xl relative max-h-[88vh] flex flex-col overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-bordergray shrink-0">
              {title ? (
                <h3 className="font-display text-lg sm:text-xl font-bold text-charcoal">{title}</h3>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="h-9 w-9 flex items-center justify-center rounded-full text-slate hover:bg-warmwhite transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="thin-scrollbar px-4 sm:px-6 py-5 sm:py-6 overflow-y-auto overflow-x-hidden">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
