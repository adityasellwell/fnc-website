"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Featured Brand / Freshness Story Video.
 *
 * Full width always — matches the same Container the category circles
 * and product grid sit in. Container.js caps content at max-w-content
 * (1600px, globals.css), so at desktop this section is never wider
 * than ~1520px after padding — calculated from that real number, not
 * guessed: a 4.2:1 ratio there lands at ~360px tall, comfortable on
 * one screen. Mobile is only ~335px wide, where that same ratio would
 * be ~80px tall (unreadable), so the ratio scales up from 1.8:1 on
 * mobile to 4.2:1 on desktop — identical breakpoint values to
 * Hero.js's banner carousel, which solved this exact width-vs-height
 * problem for the same Container already. object-cover crops a little
 * off the top/bottom at each breakpoint as a result; the burned-in
 * captions near the bottom edge have been checked to still clear it.
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
      <div className="relative w-full aspect-[1.8/1] sm:aspect-2.5/1 md:aspect-[3.2/1] lg:aspect-[4.2/1] rounded-2xl overflow-hidden bg-black shadow-md">
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
