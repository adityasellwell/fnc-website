"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white w-full ${maxWidth} rounded-3xl border border-bordergray shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto`}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full text-slate hover:bg-warmwhite transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        {title && <h3 className="font-display text-xl font-bold text-charcoal mb-5 pr-8">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
