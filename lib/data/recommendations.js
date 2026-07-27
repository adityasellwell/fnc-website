import { getProducts } from "./products";

/**
 * Fetch recommendations for the homepage.
 * Returns a list of featured/bestselling products to be displayed.
 * Composes `getProducts()` (backed by Prisma/Postgres) rather than querying
 * directly, so it automatically inherits that function's shape reconciliation
 * (Decimal price -> Number, synthetic `cat-<slug>` categoryId, etc.).
 */
export async function getHomepageRecommendations() {
  const products = await getProducts();
  
  // Return all bestsellers or a curated list
  return products.filter(
    (product) => 
      product.tags.includes("bestseller") || 
      product.tags.includes("premium")
  );
}
