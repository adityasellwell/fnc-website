/**
 * Category data — backed by Prisma/Postgres.
 *
 * Falls back to MOCK_CATEGORIES when the DB is unreachable (e.g. during
 * development before a real DATABASE_URL is configured). Once a real
 * Neon/Supabase connection string is added to .env.local, the Prisma
 * path runs and the mock data is never reached.
 */
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Mock data — used when DB is unavailable
// ---------------------------------------------------------------------------
const MOCK_CATEGORIES = [
  { id: "cat-fish",          slug: "fish",          name: "Fish",           description: "Fresh whole fish and fillets, sourced daily.", image: "/images/categories/fish.jpg",         parentCategory: null, order: 1 },
  { id: "cat-chicken",       slug: "chicken",       name: "Chicken",        description: "Farm-fresh chicken in every cut.",              image: "/images/categories/chicken.jpg",      parentCategory: null, order: 2 },
  { id: "cat-crab",          slug: "crab",          name: "Crab",           description: "Live and cleaned crab, handled with care.",     image: "/images/categories/crab.jpg",         parentCategory: null, order: 3 },
  { id: "cat-eggs",          slug: "eggs",          name: "Eggs",           description: "Farm eggs — brown, white, and desi.",           image: "/images/categories/eggs.jpg",         parentCategory: null, order: 4 },
  { id: "cat-ready-to-cook", slug: "ready-to-cook", name: "Ready to Cook",  description: "Marinated and pre-cut, ready for your pan.",    image: "/images/categories/ready-to-cook.jpg",parentCategory: null, order: 5 },
  { id: "cat-ready-to-eat",  slug: "ready-to-eat",  name: "Ready to Eat",   description: "Fully cooked, chef-crafted meals.",             image: "/images/categories/ready-to-eat.jpg", parentCategory: null, order: 6 },
  { id: "cat-cheese-dairy",  slug: "cheese-dairy",  name: "Cheese & Dairy", description: "Premium artisan cheeses and dairy products.",   image: "/images/categories/cheese-dairy.jpg", parentCategory: null, order: 7 },
];

// ---------------------------------------------------------------------------
// Mapper (used by both live and mock paths)
// ---------------------------------------------------------------------------
function mapCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    image: category.image,
    parentCategoryId: category.parentCategoryId ?? category.parentCategory?.id ?? null,
    parentCategory: category.parentCategory
      ? {
          id: category.parentCategory.id,
          slug: category.parentCategory.slug,
          name: category.parentCategory.name,
        }
      : null,
    order: category.order,
  };
}

export async function getCategories() {
  try {
    const categories = await db.category.findMany({
      include: { parentCategory: true },
      orderBy: { order: "asc" },
    });
    return categories.map(mapCategory);
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const category = await db.category.findUnique({
      where: { slug },
      include: { parentCategory: true },
    });
    return category ? mapCategory(category) : null;
  } catch {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
}

// Direct children only (one level) — used to roll a parent category's page
// up to show every subcategory's products together, with pills to narrow
// down to just one subcategory.
export async function getCategoryChildren(parentId) {
  try {
    const children = await db.category.findMany({
      where: { parentCategoryId: parentId },
      orderBy: { order: "asc" },
    });
    return children.map(mapCategory);
  } catch {
    return [];
  }
}
