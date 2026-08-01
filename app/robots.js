export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fncmumbai.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
