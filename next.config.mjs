// Safe, non-breaking security headers. Deliberately NOT including a
// Content-Security-Policy here — this site loads Razorpay's checkout
// script/iframe, Firebase, and OpenStreetMap tiles, and a CSP wrong on any
// one of those allowlists would silently break payment or maps rather than
// fail loudly. Add CSP later as its own carefully-tested change.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Only restricts what THIS site is allowed to request from the browser —
  // geolocation stays allowed (delivery-radius detection), payment is left
  // unrestricted since Razorpay checkout may rely on the Payment Request
  // API for some methods. Camera/mic are blocked since nothing here uses them.
  { key: "Permissions-Policy", value: "camera=(), microphone=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: {
    position: "top-right",
  },
  images: {
    // res.cloudinary.com: new uploads (lib/cloudinary.js, since admin
    // image uploads moved off Firebase Storage to avoid its usage costs).
    // storage.googleapis.com: kept for any image uploaded before that
    // switch — without this allowlisted, next/image silently refuses to
    // render images from un-listed hosts (blank box, no error shown).
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
