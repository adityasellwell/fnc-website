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
    // Admin-uploaded product/category/banner/store images are hosted on
    // Firebase Storage (see lib/firebase/admin.js's uploadToStorage) at
    // https://storage.googleapis.com/<bucket>/<path> — without this
    // allowlisted, next/image silently refuses to render them (blank box,
    // no error shown to the admin), while pre-seeded local /images/...
    // paths keep working since those don't need remotePatterns at all.
    remotePatterns: [
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
