"use client";

import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Automatically formats Cloudinary video URLs to auto-crop & transcode
 * any uploaded video to exact 21:9 resolution (1920x822) with smart auto-quality.
 */
function getAutoTransformedVideoUrl(url) {
  if (!url) return url;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("/c_fill,")) {
    return url.replace("/upload/", "/upload/c_fill,w_1920,h_822,q_auto,f_auto/");
  }
  return url;
}

export default function StoryVideo({ videoUrl, posterUrl }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  if (!videoUrl) return null;

  const finalVideoUrl = getAutoTransformedVideoUrl(videoUrl);

  function toggleMute() {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
    setMuted((m) => !m);
  }

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="font-display text-lg sm:text-xl font-extrabold text-charcoal mb-3 text-center">
        See What Makes Us Fresh
      </h3>
      <div className="relative w-full aspect-[16/7] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black shadow-md">
        <video
          ref={videoRef}
          src={finalVideoUrl}
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
