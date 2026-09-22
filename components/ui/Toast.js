"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Toast({ message, type = "success", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-body font-bold animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md",
        type === "success" && "bg-emerald-900 text-white border-emerald-700 shadow-emerald-900/20",
        type === "error" && "bg-fnc-red text-white border-red-700 shadow-fnc-red/20",
        type === "info" && "bg-charcoal text-white border-gray-700 shadow-charcoal/20"
      )}
    >
      {type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
      {type === "error" && <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />}
      {type === "info" && <Info className="h-5 w-5 text-blue-400 shrink-0" />}

      <span className="flex-1 leading-snug">{message}</span>

      <button
        onClick={onClose}
        className="h-6 w-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors shrink-0"
        aria-label="Close notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
