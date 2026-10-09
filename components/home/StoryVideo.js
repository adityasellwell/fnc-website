"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Sits inside RecommendationsSection's own <Container>, between the
 * category circles and the product grid. Autoplays muted+looped
 * (browsers block autoplay with sound).
 *
 * No native `controls` — the browser's control bar is a full-width
 * strip pinned to the bottom, which covered the captions burned into
 * this particular video's footage (e.g. "Peri Peri Signature"). A
 * single small mute toggle in the corner replaces it instead.
 *
 * The sharp video keeps an exact aspect-video (16:9) box — the real
 * file is exactly 1280x720, confirmed by parsing its MP4 tkhd box —
 * so it's never cropped. At a fixed, screen-safe height that ratio
 * doesn't fill the full row width, which read as empty dead space on
 * either side. Instead of leaving that blank, a second copy of the
 * same video plays full-width behind it, blurred and darkened — the
 * same letterboxing treatment Instagram/YouTube use for video that
 * doesn't match its frame, so the gap reads as a design choice rather
 * than unfinished.
 *
 * Hidden entirely when no video has been uploaded yet.
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
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-charcoal mb-3 text-center">See What Makes Us Fresh</h3>
      <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-105 rounded-2xl overflow-hidden bg-charcoal shadow-md">
        {/* Blurred full-width backdrop — purely decorative, fills the
            side gaps so the sharp video never looks like it's floating
            in empty space. */}
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl brightness-50"
        />

        {/* Sharp foreground video, centered at its true 16:9 size */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl || undefined}
          title=""
          autoPlay
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="relative z-10 h-full w-auto max-w-full mx-auto block aspect-video object-cover"
        />

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute z-20 top-3 right-3 h-9 w-9 rounded-full bg-black/50 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
