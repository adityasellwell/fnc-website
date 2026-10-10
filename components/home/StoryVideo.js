"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * Full width always — matches the same Container the category circles
 * and product grid sit in. The uploaded file is re-exported at exactly
 * 7:1 (2100x300) specifically to fit this section's target height at
 * full width, so aspect-7/1 here is an exact match: zero cropping,
 * zero black bars, height scales naturally with width. If the video
 * is ever re-exported at a different ratio, update aspect-7/1 to
 * match it exactly or this breaks again.
 *
 * Autoplays muted + looped with a corner mute/unmute toggle button.
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
      <div className="relative w-full aspect-7/1 rounded-2xl overflow-hidden bg-black shadow-md">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover block"
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
