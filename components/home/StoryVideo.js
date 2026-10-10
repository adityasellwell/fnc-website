"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * Full width always — matches the same Container the category circles
 * and product grid sit in. Height is capped per breakpoint directly
 * (not derived from an aspect ratio), and object-contain always shows
 * the COMPLETE frame, never cropped/zoomed — explicitly required, even
 * though it means plain black bars on the sides on very wide screens
 * where the box is wider than the video's own shape. That tradeoff
 * (bars, never crop) was chosen deliberately over the alternative
 * (object-cover, never bars, but crops/zooms) — don't flip it back to
 * object-cover without checking that's actually wanted again.
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
      <div className="relative w-full h-52 sm:h-64 md:h-72 lg:h-80 rounded-2xl overflow-hidden bg-black shadow-md">
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-contain block"
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
