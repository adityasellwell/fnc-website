/**
 * Product data — backed by Prisma/Postgres.
 *
 * Falls back to MOCK_PRODUCTS when the DB is unreachable.
 *
 * Shape notes:
 * 1. `categoryId` emits synthetic `cat-<slug>` strings so ProductCard.js and
 *    RecommendationsSection.js keep working without changes.
 * 2. `price` is converted from Prisma Decimal to plain Number.
 */
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Mock data — used when DB is unavailable
// ---------------------------------------------------------------------------
const MOCK_PRODUCTS = [
  {
    id: "prod-rohu",
    slug: "rohu-fillet",
    name: "Rohu Fish Fillet",
    categoryId: "cat-fish",
    description: "Fresh Rohu fillets, cleaned and cut to order. Perfect for curries and fry.",
    images: [],
    price: 349,
    unit: "500g",
    nutrition: { protein: "22g", fat: "4g", carbs: "0g", calories: "130kcal" },
    cookingInstructions: "Marinate with spices and pan-fry or use in curries.",
    storageInstructions: "Keep refrigerated, use within 2 days.",
    tags: ["bestseller", "fresh"],
    availableAtStores: [],
    rating: 4.6,
    reviewCount: 124,
    relatedProducts: [],
    relatedRecipes: [],
  },
  {
    id: "prod-pomfret",
    slug: "pomfret-whole",
    name: "Pomfret (Whole)",
    categoryId: "cat-fish",
    description: "Silver pomfret — a coastal favourite for its delicate flavour.",
    images: [],
    price: 599,
    unit: "400–500g",
    nutrition: { protein: "20g", fat: "5g", carbs: "0g", calories: "120kcal" },
    cookingInstructions: "Shallow fry or steam with minimal seasoning.",
    storageInstructions: "Keep refrigerated, use within 2 days.",
    tags: ["premium", "seafood"],
    availableAtStores: [],
    rating: 4.8,
    reviewCount: 87,
    relatedProducts: ["rohu-fillet"],
    relatedRecipes: [],
  },
  {
    id: "prod-chicken-curry",
    slug: "chicken-curry-cut",
    name: "Chicken Curry Cut",
    categoryId: "cat-chicken",
    description: "Country chicken cut into curry pieces — skin-on, bone-in.",
    images: [],
    price: 299,
    unit: "500g",
    nutrition: { protein: "25g", fat: "8g", carbs: "0g", calories: "165kcal" },
    cookingInstructions: "Slow cook in a spice-rich gravy for best results.",
    storageInstructions: "Keep refrigerated, use within 2 days.",
    tags: ["bestseller", "fresh"],
    availableAtStores: [],
    rating: 4.7,
    reviewCount: 210,
    relatedProducts: [],
    relatedRecipes: [],
  },
  {
    id: "prod-boneless-breast",
    slug: "chicken-boneless-breast",
    name: "Chicken Boneless Breast",
    categoryId: "cat-chicken",
    description: "Skinless boneless breast — lean, versatile, chef-preferred.",
    images: [],
    price: 349,
    unit: "500g",
    nutrition: { protein: "31g", fat: "3.6g", carbs: "0g", calories: "165kcal" },
    cookingInstructions: "Grill, bake or stir-fry. Marinate for at least 30 minutes.",
    storageInstructions: "Keep refrigerated, use within 2 days.",
    tags: ["bestseller", "lean"],
    availableAtStores: [],
    rating: 4.9,
    reviewCount: 185,
    relatedProducts: ["chicken-curry-cut"],
    relatedRecipes: [],
  },
  {
    id: "prod-mud-crab",
    slug: "mud-crab-live",
    name: "Mud Crab (Live)",
    categoryId: "cat-crab",
    description: "Live mud crab — meaty, fresh from the water.",
    images: [],
    price: 799,
    unit: "Per piece (~400g)",
    nutrition: { protein: "18g", fat: "1g", carbs: "0g", calories: "82kcal" },
    cookingInstructions: "Steam or cook in coconut-based gravy.",
    storageInstructions: "Keep alive in a cool, moist container. Cook within 12 hours.",
    tags: ["premium", "seasonal"],
    availableAtStores: [],
    rating: 4.9,
    reviewCount: 56,
    relatedProducts: [],
    relatedRecipes: [],
  },
  {
    id: "prod-eggs-farm",
    slug: "farm-eggs-tray",
    name: "Farm Eggs (Tray of 30)",
    categoryId: "cat-eggs",
    description: "Cage-free farm eggs — rich yellow yolk, clean shell.",
    images: [],
    price: 189,
    unit: "30 eggs",
    nutrition: { protein: "6g per egg", fat: "5g per egg", carbs: "0g", calories: "70kcal per egg" },
    cookingInstructions: "Versatile — boil, fry, scramble, bake.",
    storageInstructions: "Store in a cool, dry place. Refrigerate for longer shelf life.",
    tags: ["bestseller", "value"],
    availableAtStores: [],
    rating: 4.5,
    reviewCount: 302,
    relatedProducts: [],
    relatedRecipes: [],
  },
  {
    id: "prod-tandoori-chicken",
    slug: "tandoori-chicken-marinated",
    name: "Tandoori Chicken (Marinated)",
    categoryId: "cat-ready-to-cook",
    description: "Half chicken, marinated with our house tandoori spice blend. Just grill or bake.",
    images: [],
    price: 429,
    unit: "500g",
    nutrition: { protein: "28g", fat: "10g", carbs: "4g", calories: "210kcal" },
    cookingInstructions: "Grill at 220°C for 25–30 min, turning halfway.",
    storageInstructions: "Refrigerate and cook within 24 hours.",
    tags: ["bestseller", "premium"],
    availableAtStores: [],
    rating: 4.8,
    reviewCount: 143,
    relatedProducts: [],
    relatedRecipes: [],
  },
  {
    id: "prod-fish-curry",
    slug: "fish-curry-ready-to-eat",
    name: "Fish Curry (Ready to Eat)",
    categoryId: "cat-ready-to-eat",
    description: "House-made coastal fish curry — reheatable, restaurant-quality.",
    images: [],
    price: 279,
    unit: "250g (serves 1–2)",
    nutrition: { protein: "20g", fat: "12g", carbs: "6g", calories: "210kcal" },
    cookingInstructions: "Heat in a pan for 5 min or microwave for 2 min.",
    storageInstructions: "Refrigerate and consume within 2 days.",
    tags: ["premium", "ready-to-eat"],
    availableAtStores: [],
    rating: 4.7,
    reviewCount: 98,
    relatedProducts: [],
    relatedRecipes: [],
  },
];

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------
function mapProduct(product) {
  let images = [];
  if (product.media && product.media.length > 0) {
    images = product.media.map((m) => m.url);
  } else {
    images = product.images;
    if (typeof images === "string") {
      try { images = JSON.parse(images); } catch { images = []; }
    }
  }
  if (!Array.isArray(images)) images = [];

  let tags = product.tags;
  if (typeof tags === "string") {
    try { tags = JSON.parse(tags); } catch { tags = []; }
  }
  if (!Array.isArray(tags)) tags = [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: `cat-${product.category?.slug ?? product.categoryId?.replace(/^cat-/, "") ?? "uncategorized"}`,
    description: product.description,
    images,
    media: product.media || [],
    price: Number(product.price),
    unit: product.unit,
    nutrition: product.nutrition,
    cookingInstructions: product.cookingInstructions,
    storageInstructions: product.storageInstructions,
    tags,
    storeInventory: product.storeInventory || [],
    availableAtStores: (product.availableAtStores ?? []).map((s) =>
      typeof s === "string" ? s : s.id
    ),
    rating: product.rating,
    reviewCount: product.reviewCount,
    relatedProducts: [
      ...(product.relatedProducts ?? []),
      ...(product.relatedProductsOf ?? []),
    ].map((p) => (typeof p === "string" ? p : p.slug)),
    relatedRecipes: (product.relatedRecipes ?? []).map((r) =>
      typeof r === "string" ? r : r.slug
    ),
  };
}

const PRODUCT_INCLUDE = {
  category: { select: { slug: true } },
  availableAtStores: { select: { id: true } },
  relatedProducts: { select: { slug: true } },
  relatedProductsOf: { select: { slug: true } },
  relatedRecipes: { select: { slug: true } },
  media: { orderBy: { displayOrder: "asc" } },
  storeInventory: { include: { store: { select: { id: true, name: true, slug: true, status: true } } } },
};

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return products.map(mapProduct);
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function getProductBySlug(slug) {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    return product ? mapProduct(product) : null;
  } catch {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

export async function getProductsByCategory(categorySlugOrId) {
  try {
    const slug = categorySlugOrId.replace(/^cat-/, "");
    const products = await db.product.findMany({
      where: { category: { slug } },
      include: PRODUCT_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return products.map(mapProduct);
  } catch {
    const slug = categorySlugOrId.replace(/^cat-/, "");
    return MOCK_PRODUCTS.filter((p) => p.categoryId === `cat-${slug}`);
  }
}

export async function getFeaturedProducts(limit = 8) {
  try {
    const products = await getProducts();
    return products.filter((p) => Array.isArray(p.tags) && p.tags.includes("bestseller")).slice(0, limit);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.tags.includes("bestseller")).slice(0, limit);
  }
}
