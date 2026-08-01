export default function manifest() {
  return {
    name: "F&C — Fresh Proteins & More",
    short_name: "F&C",
    description: "Premium fresh fish, chicken, crab, eggs, ready-to-cook and ready-to-eat proteins cold-chain delivered to your door.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF9",
    theme_color: "#DC2F26",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
