"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Sits inside RecommendationsSection's own <Container>, between the
 * category circles and the product grid — not a full-bleed standalone
 * section, so it's sized like any other homepage block rather than
 * filling the viewport. Autoplays muted+looped (browsers block
 * autoplay with sound).
 *
 * No native `controls` — the browser's control bar is a full-width
 * strip pinned to the bottom, which covered the captions burned into
 * this particular video's footage (e.g. "Peri Peri Signature"). A
 * single small mute toggle in the corner replaces it instead, since
 * that's the only control that matters for a looping background video.
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
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-charcoal mb-3">See What Makes Us Fresh</h3>
      <div className="relative w-full max-w-4xl mx-auto aspect-[16/10] sm:aspect-video rounded-2xl overflow-hidden bg-charcoal shadow-md">
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
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 hover:bg-black/65 text-white flex items-center justify-center transition-colors"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
