"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * Full width layout (w-full) matching the category circles & product grid.
 * Controlled height (h-60 sm:h-72 md:h-84 lg:h-[460px]) so product cards fit below.
 * Blurred ambient backdrop fills full width with no empty side gaps.
 * Foreground video is uncropped (object-contain) so captions/text are never cut off.
 */
export default function StoryVideo({ videoUrl, posterUrl }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  if (!videoUrl) return null;

  function toggleMute() {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
    setMuted((m) => !m);
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-charcoal mb-3 text-center">
        See What Makes Us Fresh
      </h3>
      <div className="relative w-full h-60 sm:h-72 md:h-84 lg:h-[460px] rounded-2xl overflow-hidden bg-charcoal shadow-md">
        {/* Full-width blurred ambient backdrop */}
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl brightness-50 pointer-events-none"
        />

        {/* Sharp foreground video - centered, un-cropped, zero zoom */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="relative z-10 h-full w-auto max-w-full mx-auto block object-contain"
        />

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute z-20 top-3 right-3 h-9 w-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-colors shadow-md"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
