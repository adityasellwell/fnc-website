"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Container from "@/components/layout/Container";

/**
 * Click-to-play, not autoplay — respects mobile data and avoids the
 * autoplay-with-sound UX problem. Hidden entirely when no video has been
 * uploaded yet (see Settings.homepageVideoUrl).
 */
export default function StoryVideo({ videoUrl, posterUrl }) {
  const [playing, setPlaying] = useState(false);

  if (!videoUrl) return null;

  return (
    <section className="bg-offwhite pb-12 sm:pb-16">
      <Container>
        <div className="mb-5">
          <h3 className="font-display text-xl sm:text-2xl font-extrabold text-charcoal">See What Makes Us Fresh</h3>
          <p className="font-body text-sm text-slate mt-1">A quick look inside F&amp;C — straight from our counter to your kitchen.</p>
        </div>

        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-charcoal shadow-lg">
          {playing ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="h-full w-full object-contain bg-black"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play video"
              className="group relative h-full w-full block cursor-pointer"
            >
              {posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URL
                <img src={posterUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-charcoal to-slate" />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <span className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                  <Play className="h-7 w-7 sm:h-8 sm:w-8 text-fnc-red ml-1" fill="currentColor" />
                </span>
              </div>
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
