/**
 * Recipe data — backed by Prisma/Postgres.
 * Falls back to MOCK_RECIPES when the DB is unreachable.
 */
import { db } from "@/lib/db";

const MOCK_RECIPES = [
  {
    id: "rec-fish-curry",
    slug: "coastal-fish-curry",
    title: "Coastal Fish Curry",
    description: "A rich, tangy coconut-based curry that works beautifully with any white fish.",
    image: "/images/categories/fish.jpg",
    ingredients: [
      "500g Rohu or Pomfret fillets",
      "1 can coconut milk",
      "2 tbsp fish curry masala",
      "1 onion, sliced",
      "2 tomatoes, chopped",
      "1 tsp turmeric",
      "Salt to taste",
      "Oil for cooking",
    ],
    steps: [
      "Heat oil in a deep pan and sauté onions until golden.",
      "Add tomatoes and cook until soft.",
      "Add curry masala, turmeric and fry for 2 minutes.",
      "Pour in coconut milk and bring to a simmer.",
      "Add fish pieces and cook gently for 8–10 minutes.",
      "Adjust salt and serve with steamed rice.",
    ],
    relatedProducts: ["rohu-fillet", "pomfret-whole"],
    cookTime: "30 mins",
    servings: 3,
  },
  {
    id: "rec-tandoori",
    slug: "oven-tandoori-chicken",
    title: "Oven-Baked Tandoori Chicken",
    description: "Get that smoky tandoor flavour at home with minimal prep — our marinated chicken does the hard work.",
    image: "/images/categories/chicken.jpg",
    ingredients: [
      "500g F&C Tandoori Marinated Chicken",
      "1 tbsp butter (for basting)",
      "Lemon wedges, to serve",
      "Mint chutney, to serve",
    ],
    steps: [
      "Preheat oven to 220°C (fan 200°C).",
      "Place chicken on a wire rack over a baking tray.",
      "Bake for 25–30 minutes, turning once at the 15-minute mark.",
      "Baste with butter in the last 5 minutes for extra colour.",
      "Serve hot with lemon and mint chutney.",
    ],
    relatedProducts: ["tandoori-chicken-marinated"],
    cookTime: "35 mins",
    servings: 2,
  },
  {
    id: "rec-crab-masala",
    slug: "dry-crab-masala",
    title: "Dry Crab Masala",
    description: "A bold, dry coastal masala that lets the sweetness of fresh crab shine through.",
    image: "/images/categories/crab.jpg",
    ingredients: [
      "1 live mud crab (~400g), cleaned",
      "3 tbsp coconut oil",
      "2 onions, finely sliced",
      "1 tsp ginger-garlic paste",
      "2 tsp crab masala powder",
      "1 tsp red chilli powder",
      "Salt to taste",
      "Fresh curry leaves",
    ],
    steps: [
      "Heat coconut oil in a wok and add curry leaves.",
      "Sauté onions until deep golden.",
      "Add ginger-garlic paste and cook 2 minutes.",
      "Add crab pieces and toss well.",
      "Add masala, chilli powder and salt. Stir-fry on high heat for 12–15 minutes.",
      "Serve dry with steamed rice or appam.",
    ],
    relatedProducts: ["mud-crab-live"],
    cookTime: "25 mins",
    servings: 2,
  },
  {
    id: "rec-egg-bhurji",
    slug: "masala-egg-bhurji",
    title: "Masala Egg Bhurji",
    description: "India's favourite scrambled eggs — spiced, silky, and done in 10 minutes.",
    image: "/images/categories/eggs.jpg",
    ingredients: [
      "4 F&C farm eggs",
      "1 onion, finely chopped",
      "1 tomato, chopped",
      "1 green chilli, sliced",
      "1/2 tsp cumin seeds",
      "1/4 tsp turmeric",
      "Salt and pepper to taste",
      "Fresh coriander",
    ],
    steps: [
      "Heat oil in a pan, add cumin seeds until they splutter.",
      "Add onion and chilli, sauté until translucent.",
      "Add tomato and cook until pulpy.",
      "Break eggs directly into the pan.",
      "Scramble continuously on medium-low heat.",
      "Season, top with coriander and serve on toast or paratha.",
    ],
    relatedProducts: ["farm-eggs-tray"],
    cookTime: "10 mins",
    servings: 2,
  },
];

const RECIPE_INCLUDE = {
  relatedProducts: { select: { slug: true } },
};

function mapRecipe(recipe) {
  let ingredients = recipe.ingredients;
  if (typeof ingredients === "string") {
    try { ingredients = JSON.parse(ingredients); } catch { ingredients = []; }
  }
  if (!Array.isArray(ingredients)) ingredients = [];

  let steps = recipe.steps;
  if (typeof steps === "string") {
    try { steps = JSON.parse(steps); } catch { steps = []; }
  }
  if (!Array.isArray(steps)) steps = [];

  return {
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    image: recipe.image,
    ingredients,
    steps,
    relatedProducts: (recipe.relatedProducts ?? []).map((p) =>
      typeof p === "string" ? p : p.slug
    ),
    cookTime: recipe.cookTime,
    servings: recipe.servings,
  };
}

export async function getRecipes() {
  try {
    const recipes = await db.recipe.findMany({
      include: RECIPE_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return recipes.map(mapRecipe);
  } catch {
    return MOCK_RECIPES;
  }
}

export async function getRecipeBySlug(slug) {
  try {
    const recipe = await db.recipe.findUnique({
      where: { slug },
      include: RECIPE_INCLUDE,
    });
    return recipe ? mapRecipe(recipe) : null;
  } catch {
    return MOCK_RECIPES.find((r) => r.slug === slug) ?? null;
  }
}
