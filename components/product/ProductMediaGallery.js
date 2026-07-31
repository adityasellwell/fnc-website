"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductMediaGallery({ media = [], fallbackImage, secondaryFallbackImage, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [fallbackErrored, setFallbackErrored] = useState(false);

  if (!media || media.length === 0) {
    // fallbackImage (the product's own, possibly-broken URL) is tried
    // first; if it 404s, drop to secondaryFallbackImage (the known-good
    // category photo) instead of a blank box.
    const shown = fallbackErrored ? secondaryFallbackImage : fallbackImage || secondaryFallbackImage;
    return (
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray">
        {shown ? (
          <Image
            src={shown}
            alt={productName}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            priority
            onError={() => setFallbackErrored(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate font-body text-sm">
            No Image Available
          </div>
        )}
      </div>
    );
  }

  const activeItem = media[activeIndex];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Display */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-warmwhite border border-bordergray">
        {activeItem.type === "VIDEO" ? (
          <div className="w-full h-full relative">
            <video
              src={activeItem.url}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              controls
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/75 rounded-full text-white backdrop-blur-sm transition-colors z-10"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <Image
            src={activeItem.url}
            alt={`${productName} - Image ${activeIndex + 1}`}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-all duration-300"
            priority
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {media.map((item, idx) => (
            <button
              key={item.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 bg-warmwhite transition-all",
                activeIndex === idx ? "border-fnc-red scale-95" : "border-bordergray hover:border-slate"
              )}
            >
              {item.type === "VIDEO" ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black/25">
                  <video src={item.url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" muted />
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
