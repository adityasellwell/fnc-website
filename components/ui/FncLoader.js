"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export default function FncLoader({ text = "Loading fresh proteins...", fullScreen = false, className = "" }) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center p-6", className)}>
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="h-16 w-16 rounded-full border-4 border-fnc-red/20 border-t-fnc-red animate-spin" />
        
        {/* Logo centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="F&C Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain animate-pulse"
            priority
          />
        </div>
      </div>
      
      {text && (
        <p className="font-display text-sm font-semibold text-charcoal tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-offwhite/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
