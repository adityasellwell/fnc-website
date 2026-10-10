"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * Full width always — matches the same Container the category circles
 * and product grid sit in. Height is set directly as a share of the
 * actual viewport height (vh units), not derived from container width
 * math — a width-based aspect-ratio guess kept landing taller than
 * expected on real, very-wide browser windows. vh is a direct,
 * unambiguous promise: this section can never be taller than that
 * percentage of whatever screen it's actually viewed on. object-contain
 * shows the COMPLETE frame always (explicitly required — nothing
 * cropped), which combined with a short wide box means some plain
 * black bars on the left/right are unavoidable, since the video (2:1)
 * is relatively narrower than this box's shape at most screen widths.
 * That's the deliberate tradeoff of "fits on screen" + "shows
 * everything" at the same time — not a bug.
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
      <div className="relative w-full h-[28vh] sm:h-[32vh] lg:h-[36vh] rounded-2xl overflow-hidden bg-black shadow-md">
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
