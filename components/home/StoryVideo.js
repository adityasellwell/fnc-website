"use client";

/**
 * Sits inside RecommendationsSection's own <Container>, between the
 * category circles and the product grid — not a full-bleed standalone
 * section, so it's sized like any other homepage block rather than
 * filling the viewport. Autoplays muted+looped (browsers block
 * autoplay with sound) with native controls so a visitor can unmute.
 * Hidden entirely when no video has been uploaded yet.
 */
export default function StoryVideo({ videoUrl, posterUrl }) {
  if (!videoUrl) return null;

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-charcoal mb-3">See What Makes Us Fresh</h3>
      <div className="relative w-full h-56 sm:h-72 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-charcoal shadow-md">
        <video
          src={videoUrl}
          poster={posterUrl || undefined}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
