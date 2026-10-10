"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * The uploaded file is exported at exactly 2:1 (1600x800) specifically
 * to fit this section — a 16:9 export was too tall at full width on
 * desktop, and neither cropping nor a blurred backdrop filler read as
 * clean. At 2:1, full width naturally lands at a reasonable height on
 * every screen size, so object-cover here crops nothing (box ratio
 * matches the file exactly). Full width always — matches the same
 * Container the category circles and product grid sit in, starting
 * and ending at the exact same edges as everything else on the page.
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
      <div className="relative w-full aspect-2/1 rounded-2xl overflow-hidden bg-black shadow-md">
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
