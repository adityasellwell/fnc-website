"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small client island so ProductCard (a server component used across
 * every listing) doesn't need "use client" just for this one click
 * handler. Sits as a sibling to the card's Link (see ProductCard), never
 * nested inside it, so it never creates an invalid nested <a>.
 */
export default function QuickOrderButton({ phone, message, className }) {
  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const digits = phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Order this on WhatsApp"
      className={cn(
        "flex items-center justify-center rounded-full bg-fnc-green text-white shadow-md hover:bg-fnc-green/90 transition-colors",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={2} />
    </button>
  );
}
