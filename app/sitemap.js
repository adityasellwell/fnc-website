import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getRecipes } from "@/lib/data/recipes";
import { getBlogPosts } from "@/lib/data/blog";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fncmumbai.com";

  // Static URLs
  const staticUrls = [
    "",
    "/about",
    "/contact",
    "/stores",
    "/recipes",
    "/blog",
    "/franchise",
    "/health-hygiene",
    "/shop",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic products
  let productUrls = [];
  try {
    const products = await getProducts();
    productUrls = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (e) {
    console.error("Sitemap product fetch failed:", e);
  }

  // Dynamic categories
  let categoryUrls = [];
  try {
    const categories = await getCategories();
    categoryUrls = categories.map((c) => ({
      url: `${baseUrl}/shop/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap category fetch failed:", e);
  }

  // Dynamic recipes
  let recipeUrls = [];
  try {
    const recipes = await getRecipes();
    recipeUrls = recipes.map((r) => ({
      url: `${baseUrl}/recipe/${r.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap recipe fetch failed:", e);
  }

  // Dynamic blog posts
  let blogUrls = [];
  try {
    const posts = await getBlogPosts();
    blogUrls = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap blog fetch failed:", e);
  }

  return [...staticUrls, ...productUrls, ...categoryUrls, ...recipeUrls, ...blogUrls];
}
