// Prisma seed script — populates the database with the same illustrative
// content that used to live as mock arrays in lib/data/*.js, converted to
// match the real schema (string enums -> Prisma enum values, nested
// geo/status shapes -> real columns, etc.).
//
// Run via `npx prisma db seed` (wired up through the "prisma.seed" key in
// package.json) once a real DATABASE_URL is available. Idempotent: keyed
// upserts on unique slugs/codes mean re-running it won't duplicate
// categories/stores/products/recipes; reviews and banners have no natural
// unique key in the schema, so those two are only inserted if the table is
// currently empty.
//
// This file intentionally creates its own PrismaClient instance rather than
// importing the app's singleton from lib/db.js: lib/db.js lives under the
// project root, whose package.json has no "type": "module", so Node would
// try to load it as CommonJS (and choke on its `import`/`export` syntax) if
// pulled into this standalone script. prisma/package.json scopes this
// directory to ESM so this file's own `import`/`export` syntax works under
// plain `node prisma/seed.js`.

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// ---------------------------------------------------------------------
// Source data (same content that used to live in lib/data/*.js mocks)
// ---------------------------------------------------------------------

const categoriesData = [
  {
    id: "cat-fish",
    slug: "fish",
    name: "Fish",
    description:
      "River and ocean-fresh fish, hand-cleaned and cut to order every morning.",
    image: "/images/categories/fish.jpg",
    order: 1,
  },
  {
    id: "cat-chicken",
    slug: "chicken",
    name: "Chicken",
    description: "Farm-sourced chicken, antibiotic-free, cut fresh in-store daily.",
    image: "/images/categories/chicken.jpg",
    order: 2,
  },
  {
    id: "cat-crab",
    slug: "crab",
    name: "Crab",
    description: "Live-sourced mud crab and cleaned crab meat, in season.",
    image: "/images/categories/crab.jpg",
    order: 3,
  },
  {
    id: "cat-eggs",
    slug: "eggs",
    name: "Eggs",
    description: "Farm and country eggs, sourced within 48 hours of lay.",
    image: "/images/categories/eggs.jpg",
    order: 4,
  },
  {
    id: "cat-ready-to-cook",
    slug: "ready-to-cook",
    name: "Ready to Cook",
    description: "Marinated, breaded and shaped proteins — oven or pan in minutes.",
    image: "/images/categories/ready-to-cook.jpg",
    order: 5,
  },
  {
    id: "cat-ready-to-eat",
    slug: "ready-to-eat",
    name: "Ready to Eat",
    description:
      "Restaurant-style curries and biryanis, cooked and packed — just heat and serve.",
    image: "/images/categories/ready-to-eat.jpg",
    order: 6,
  },
  {
    id: "cat-cheese-dairy",
    slug: "cheese-dairy",
    name: "Cheese & Dairy",
    description:
      "Paneer, cheese and butter made fresh, delivered alongside your protein order.",
    image: "/images/categories/cheese-dairy.jpg",
    order: 7,
  },
];

const storesData = [
  {
    id: "store-hyderabad-jubilee-hills",
    slug: "jubilee-hills-hyderabad",
    name: "F&C Jubilee Hills",
    status: "ACTIVE",
    address: "Road No. 36, Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4326,
    longitude: 78.4071,
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    openingHours: {
      mon: "7:00 AM - 9:00 PM",
      tue: "7:00 AM - 9:00 PM",
      wed: "7:00 AM - 9:00 PM",
      thu: "7:00 AM - 9:00 PM",
      fri: "7:00 AM - 9:00 PM",
      sat: "7:00 AM - 9:00 PM",
      sun: "7:00 AM - 9:00 PM",
    },
    images: ["/images/stores/jubilee-hills.jpg"],
    deliveryAvailable: true,
    pickupAvailable: true,
    googleMapsLink: "https://maps.google.com/?q=Jubilee+Hills+Hyderabad",
  },
  {
    id: "store-bengaluru-indiranagar",
    slug: "indiranagar-bengaluru",
    name: "F&C Indiranagar",
    status: "COMING_SOON",
    address: "100 Feet Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.6412,
    phone: "+91 98765 43211",
    whatsapp: "+91 98765 43211",
    openingHours: {},
    images: ["/images/stores/indiranagar.jpg"],
    deliveryAvailable: false,
    pickupAvailable: true,
    googleMapsLink: "https://maps.google.com/?q=Indiranagar+Bengaluru",
  },
  {
    id: "store-mumbai-bandra",
    slug: "bandra-mumbai",
    name: "F&C Bandra",
    status: "COMING_SOON",
    address: "Linking Road, Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    latitude: 19.0596,
    longitude: 72.8295,
    phone: "+91 98765 43212",
    whatsapp: "+91 98765 43212",
    openingHours: {},
    images: ["/images/stores/bandra.jpg"],
    deliveryAvailable: false,
    pickupAvailable: true,
    googleMapsLink: "https://maps.google.com/?q=Bandra+Mumbai",
  },
];

// categoryId below is the OLD mock category id ("cat-fish" etc.) — the seed
// resolves it to the category's slug (stripping the "cat-" prefix) to look
// up the real, freshly-created category row.
const productsData = [
  {
    id: "prod-rohu-fillet", slug: "rohu-fillet", name: "Rohu Fillet", categoryId: "cat-fish",
    description: "Boneless rohu fillet, cleaned and skinned. A household favourite for curries and fry.",
    images: ["/images/products/rohu-fillet.jpg"], price: 349, unit: "500 g",
    nutrition: { calories: 97, protein: "16.6g", fat: "1.4g", carbs: "0g" },
    cookingInstructions: "Marinate 15 minutes, shallow fry 3-4 minutes per side or simmer in curry for 12-15 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 3 months.",
    tags: ["boneless", "bestseller", "curry-cut"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 128, relatedProducts: ["prod-pomfret-whole", "prod-prawns-jumbo"], relatedRecipes: ["rohu-curry"],
  },
  {
    id: "prod-pomfret-whole", slug: "pomfret-whole-cleaned", name: "Pomfret (Whole, Cleaned)", categoryId: "cat-fish",
    description: "Silver pomfret, scaled and gutted, ready to marinate. Prized for its delicate, boneless-feeling flesh.",
    images: ["/images/products/pomfret-whole.jpg"], price: 599, unit: "1 pc (~350-400 g)",
    nutrition: { calories: 90, protein: "18.8g", fat: "1.7g", carbs: "0g" },
    cookingInstructions: "Shallow fry whole after a turmeric-chilli marinade, or steam with a light coconut masala.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 3 months.",
    tags: ["whole-fish", "premium"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.8, reviewCount: 94, relatedProducts: ["prod-rohu-fillet", "prod-crab-meat-cleaned"], relatedRecipes: [],
  },
  {
    id: "prod-salmon-fillet", slug: "salmon-fillet-imported", name: "Salmon Fillet (Imported)", categoryId: "cat-fish",
    description: "Skin-on Norwegian salmon fillet, portioned. Rich in Omega-3, ideal for grilling or pan-searing.",
    images: ["/images/products/salmon-fillet.jpg"], price: 899, unit: "300 g (2 portions)",
    nutrition: { calories: 208, protein: "20.4g", fat: "13.4g", carbs: "0g" },
    cookingInstructions: "Pan-sear skin-side down 4 minutes, flip 2 minutes. Rest 2 minutes before serving.",
    storageInstructions: "Keep frozen at -18°C. Thaw in refrigerator 12 hours before use.",
    tags: ["imported", "premium", "high-protein"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.9, reviewCount: 61, relatedProducts: ["prod-prawns-jumbo"], relatedRecipes: [],
  },
  {
    id: "prod-prawns-jumbo", slug: "prawns-jumbo", name: "Jumbo Prawns (Deveined)", categoryId: "cat-fish",
    description: "Deveined jumbo prawns, shell-on. Sweet, firm flesh — great for grilling, curry or fry.",
    images: ["/images/products/prawns-jumbo.jpg"], price: 649, unit: "500 g",
    nutrition: { calories: 99, protein: "24g", fat: "0.3g", carbs: "0.2g" },
    cookingInstructions: "Toss in garlic butter and pan-sear 2 minutes per side, or add to curry in the last 6-8 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day, or freeze up to 2 months.",
    tags: ["deveined", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 152, relatedProducts: ["prod-rohu-fillet", "prod-salmon-fillet"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-breast", slug: "chicken-breast-boneless", name: "Chicken Breast (Boneless)", categoryId: "cat-chicken",
    description: "Skinless, boneless chicken breast. Lean, high-protein, trimmed of visible fat.",
    images: ["/images/products/chicken-breast.jpg"], price: 259, unit: "500 g",
    nutrition: { calories: 165, protein: "31g", fat: "3.6g", carbs: "0g" },
    cookingInstructions: "Pound to even thickness, grill or pan-sear 5-6 minutes per side until internal temp hits 74°C.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 4 months.",
    tags: ["boneless", "high-protein", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 210, relatedProducts: ["prod-chicken-curry-cut", "prod-chicken-mince"], relatedRecipes: ["chicken-breast-stir-fry"],
  },
  {
    id: "prod-chicken-curry-cut", slug: "chicken-curry-cut-bone-in", name: "Chicken Curry Cut (Bone-in)", categoryId: "cat-chicken",
    description: "Traditional bone-in curry cut, skin removed. The classic choice for home-style chicken curry.",
    images: ["/images/products/chicken-curry-cut.jpg"], price: 229, unit: "500 g",
    nutrition: { calories: 190, protein: "27g", fat: "8g", carbs: "0g" },
    cookingInstructions: "Marinate 20 minutes, cook covered on medium heat for 25-30 minutes until tender.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 4 months.",
    tags: ["bone-in", "curry-cut", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 187, relatedProducts: ["prod-chicken-breast", "prod-chicken-mince"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-mince", slug: "chicken-mince-keema", name: "Chicken Mince (Keema)", categoryId: "cat-chicken",
    description: "Freshly minced chicken, double-ground. Perfect for keema, kebabs and cutlets.",
    images: ["/images/products/chicken-mince.jpg"], price: 249, unit: "500 g",
    nutrition: { calories: 143, protein: "19g", fat: "7g", carbs: "0g" },
    cookingInstructions: "Cook on high heat 8-10 minutes, breaking lumps, until fully browned and no pink remains.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day, or freeze up to 3 months.",
    tags: ["mince", "keema"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 76, relatedProducts: ["prod-chicken-breast"], relatedRecipes: [],
  },
  {
    id: "prod-mud-crab-whole", slug: "mud-crab-whole", name: "Mud Crab (Whole, Live-Sourced)", categoryId: "cat-crab",
    description: "Whole mud crab, cleaned and ready to cook. Sweet, dense meat — best in a pepper or masala fry.",
    images: ["/images/products/mud-crab-whole.jpg"], price: 799, unit: "~600-700 g",
    nutrition: { calories: 97, protein: "19g", fat: "1.5g", carbs: "0g" },
    cookingInstructions: "Cut into pieces, cook in a spiced masala for 15-18 minutes until shell turns bright red-orange.",
    storageInstructions: "Best used same day. Keep refrigerated at 0-4°C, use within 24 hours.",
    tags: ["seasonal", "premium", "whole"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.8, reviewCount: 43, relatedProducts: ["prod-crab-meat-cleaned", "prod-pomfret-whole"], relatedRecipes: [],
  },
  {
    id: "prod-crab-meat-cleaned", slug: "crab-meat-cleaned", name: "Crab Meat (Cleaned)", categoryId: "cat-crab",
    description: "Picked, cleaned crab meat with no shell to sort through. Ready straight into the pan.",
    images: ["/images/products/crab-meat-cleaned.jpg"], price: 549, unit: "250 g",
    nutrition: { calories: 83, protein: "18g", fat: "1.1g", carbs: "0g" },
    cookingInstructions: "Toss in garlic butter for 3-4 minutes, or fold into a quick crab curry in the last 5 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day, or freeze up to 1 month.",
    tags: ["cleaned", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 38, relatedProducts: ["prod-mud-crab-whole"], relatedRecipes: [],
  },
  {
    id: "prod-farm-eggs-tray", slug: "farm-fresh-eggs-tray-30", name: "Farm Fresh Eggs (Tray of 30)", categoryId: "cat-eggs",
    description: "Grade-A farm eggs, sourced within 48 hours of lay. Firm yolks, strong shells.",
    images: ["/images/products/farm-eggs-tray.jpg"], price: 249, unit: "30 pcs",
    nutrition: { calories: 78, protein: "6.3g", fat: "5.3g", carbs: "0.6g" },
    cookingInstructions: "Boil 9-10 minutes for a firm yolk, 6-7 minutes for a soft one.",
    storageInstructions: "Store refrigerated at 4°C. Best used within 3 weeks of purchase.",
    tags: ["bestseller", "family-pack"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.8, reviewCount: 264, relatedProducts: ["prod-country-eggs"], relatedRecipes: [],
  },
  {
    id: "prod-country-eggs", slug: "country-eggs-desi-12", name: "Country Eggs (Desi, 12 pack)", categoryId: "cat-eggs",
    description: "Free-range desi eggs with deep-orange yolks, from smaller native breed hens.",
    images: ["/images/products/country-eggs.jpg"], price: 179, unit: "12 pcs",
    nutrition: { calories: 71, protein: "6.1g", fat: "4.8g", carbs: "0.5g" },
    cookingInstructions: "Boil 8-9 minutes for a firm yolk. Great for curries and bhurji.",
    storageInstructions: "Store refrigerated at 4°C. Best used within 3 weeks of purchase.",
    tags: ["free-range", "desi"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 89, relatedProducts: ["prod-farm-eggs-tray"], relatedRecipes: [],
  },
  {
    id: "prod-tandoori-chicken", slug: "tandoori-marinated-chicken", name: "Tandoori Marinated Chicken", categoryId: "cat-ready-to-cook",
    description: "Bone-in chicken marinated overnight in yogurt and tandoori spice — straight onto the grill or into the oven.",
    images: ["/images/products/tandoori-chicken.jpg"], price: 289, unit: "500 g",
    nutrition: { calories: 195, protein: "24g", fat: "9g", carbs: "3g" },
    cookingInstructions: "Grill or oven-roast at 220°C for 25-30 minutes, turning once.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 2 months.",
    tags: ["marinated", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 63, relatedProducts: ["prod-peri-peri-chicken", "prod-malvani-chicken"], relatedRecipes: [],
  },
  {
    id: "prod-peri-peri-chicken", slug: "peri-peri-marinated-chicken", name: "Peri Peri Marinated Chicken", categoryId: "cat-ready-to-cook",
    description: "Boneless chicken marinated in a tangy peri peri rub — pan-fry, grill or air-fry.",
    images: ["/images/products/peri-peri-chicken.jpg"], price: 299, unit: "500 g",
    nutrition: { calories: 188, protein: "25g", fat: "8g", carbs: "4g" },
    cookingInstructions: "Pan-fry 5-6 minutes per side, or air-fry at 200°C for 15 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 2 months.",
    tags: ["marinated", "quick-cook", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.8, reviewCount: 91, relatedProducts: ["prod-tandoori-chicken", "prod-malvani-chicken"], relatedRecipes: [],
  },
  {
    id: "prod-malvani-chicken", slug: "malvani-marinated-chicken", name: "Malvani Marinated Chicken", categoryId: "cat-ready-to-cook",
    description: "Bone-in curry cut marinated in a coastal Malvani spice blend — just cook down with onions and it's done.",
    images: ["/images/products/malvani-chicken.jpg"], price: 289, unit: "500 g",
    nutrition: { calories: 200, protein: "23g", fat: "10g", carbs: "4g" },
    cookingInstructions: "Cook covered on medium heat for 25-30 minutes until tender.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days, or freeze up to 2 months.",
    tags: ["marinated"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 34, relatedProducts: ["prod-tandoori-chicken", "prod-peri-peri-chicken"], relatedRecipes: [],
  },
  {
    id: "prod-marinated-fish", slug: "marinated-fish", name: "Marinated Fish", categoryId: "cat-ready-to-cook",
    description: "Pomfret marinated in a turmeric-chilli rub, ready to shallow fry straight from the pack.",
    images: ["/images/products/marinated-fish.jpg"], price: 349, unit: "400 g (2-3 pcs)",
    nutrition: { calories: 140, protein: "19g", fat: "5g", carbs: "3g" },
    cookingInstructions: "Shallow fry 3-4 minutes per side on medium heat until golden.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day, or freeze up to 1 month.",
    tags: ["marinated", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 42, relatedProducts: ["prod-frozen-fish-fillets"], relatedRecipes: [],
  },
  {
    id: "prod-frozen-fish-fillets", slug: "frozen-fish-fillets", name: "Frozen Fish Fillets", categoryId: "cat-ready-to-cook",
    description: "Individually quick-frozen basa fillets — portioned and ready whenever you need them.",
    images: ["/images/products/frozen-fish-fillets.jpg"], price: 379, unit: "500 g (4-5 pcs)",
    nutrition: { calories: 90, protein: "17g", fat: "2g", carbs: "0g" },
    cookingInstructions: "Thaw in the fridge overnight, then pan-fry or bake at 200°C for 15 minutes.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["frozen"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.4, reviewCount: 26, relatedProducts: ["prod-marinated-fish"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-nuggets", slug: "chicken-nuggets", name: "Chicken Nuggets", categoryId: "cat-ready-to-cook",
    description: "Breaded chicken breast nuggets, kid-friendly and air-fryer ready.",
    images: ["/images/products/chicken-nuggets.jpg"], price: 279, unit: "400 g (approx. 20 pcs)",
    nutrition: { calories: 220, protein: "12g", fat: "13g", carbs: "15g" },
    cookingInstructions: "Air-fry at 200°C for 10-12 minutes, flipping halfway. No need to thaw.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["kids-friendly", "quick-cook", "frozen"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 88, relatedProducts: ["prod-chicken-wings"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-wings", slug: "chicken-wings", name: "Chicken Wings", categoryId: "cat-ready-to-cook",
    description: "Party-size chicken wings, lightly spiced — bake, air-fry or grill.",
    images: ["/images/products/chicken-wings.jpg"], price: 259, unit: "500 g (approx. 12 pcs)",
    nutrition: { calories: 203, protein: "18g", fat: "14g", carbs: "1g" },
    cookingInstructions: "Air-fry at 200°C for 18-20 minutes, turning halfway.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["quick-cook", "frozen"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 57, relatedProducts: ["prod-chicken-nuggets", "prod-chicken-seekh-kebab"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-seekh-kebab", slug: "chicken-seekh-kebab", name: "Chicken Kebabs", categoryId: "cat-ready-to-cook",
    description: "Hand-shaped, spiced minced chicken skewers. Pan-fry, grill or air-fry straight from frozen.",
    images: ["/images/products/chicken-seekh-kebab.jpg"], price: 349, unit: "400 g (8 pcs)",
    nutrition: { calories: 210, protein: "17g", fat: "13g", carbs: "5g" },
    cookingInstructions: "Pan-fry on medium heat 10-12 minutes, turning occasionally, until cooked through.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["quick-cook", "frozen", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 97, relatedProducts: ["prod-chicken-wings", "prod-chicken-mince"], relatedRecipes: [],
  },
  {
    id: "prod-fish-fingers", slug: "fish-fingers", name: "Fish Fingers", categoryId: "cat-ready-to-eat",
    description: "Breaded fish fingers made from real fillet, no reformed frames. Oven or air-fryer ready.",
    images: ["/images/products/fish-fingers.jpg"], price: 319, unit: "400 g (approx. 16 pcs)",
    nutrition: { calories: 179, protein: "11g", fat: "8g", carbs: "14g" },
    cookingInstructions: "Air-fry at 200°C for 10-12 minutes, flipping halfway. No need to thaw.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["kids-friendly", "quick-cook", "frozen"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 118, relatedProducts: ["prod-chicken-popcorn"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-popcorn", slug: "chicken-popcorn", name: "Chicken Popcorn", categoryId: "cat-ready-to-eat",
    description: "Bite-sized crispy chicken poppers, cooked and ready to eat straight from the pack.",
    images: ["/images/products/chicken-popcorn.jpg"], price: 229, unit: "250 g",
    nutrition: { calories: 260, protein: "13g", fat: "16g", carbs: "17g" },
    cookingInstructions: "Reheat in an air-fryer at 190°C for 5 minutes, or microwave 90 seconds.",
    storageInstructions: "Keep frozen at -18°C. Do not refreeze once thawed.",
    tags: ["kids-friendly", "ready-to-eat", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 68, relatedProducts: ["prod-fish-fingers"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-roll", slug: "chicken-roll", name: "Chicken Roll", categoryId: "cat-ready-to-eat",
    description: "Spiced chicken filling rolled in a soft paratha — heat and eat in under 2 minutes.",
    images: ["/images/products/chicken-roll.jpg"], price: 179, unit: "1 pc (approx. 220 g)",
    nutrition: { calories: 310, protein: "16g", fat: "14g", carbs: "29g" },
    cookingInstructions: "Microwave 90 seconds, or pan-heat 2 minutes per side.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day.",
    tags: ["ready-to-eat", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 37, relatedProducts: ["prod-egg-roll"], relatedRecipes: [],
  },
  {
    id: "prod-egg-roll", slug: "egg-roll", name: "Egg Roll", categoryId: "cat-ready-to-eat",
    description: "Egg-layered paratha roll with a light onion-chilli filling — heat and eat.",
    images: ["/images/products/egg-roll.jpg"], price: 129, unit: "1 pc (approx. 200 g)",
    nutrition: { calories: 285, protein: "12g", fat: "12g", carbs: "31g" },
    cookingInstructions: "Microwave 90 seconds, or pan-heat 2 minutes per side.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day.",
    tags: ["ready-to-eat", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.4, reviewCount: 22, relatedProducts: ["prod-chicken-roll"], relatedRecipes: [],
  },
  {
    id: "prod-chicken-curry-rte", slug: "chicken-curry-ready-to-eat", name: "Chicken Curry", categoryId: "cat-ready-to-eat",
    description: "Home-style bone-in chicken curry, cooked fresh each morning and packed hot-sealed.",
    images: ["/images/products/chicken-curry-rte.jpg"], price: 269, unit: "400 g tray (serves 2)",
    nutrition: { calories: 175, protein: "18g", fat: "9g", carbs: "6g" },
    cookingInstructions: "Microwave 3-4 minutes or heat in a pan on medium for 5-6 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days.",
    tags: ["ready-to-eat"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 48, relatedProducts: ["prod-butter-chicken"], relatedRecipes: [],
  },
  {
    id: "prod-butter-chicken", slug: "butter-chicken-ready-to-eat", name: "Butter Chicken", categoryId: "cat-ready-to-eat",
    description: "Slow-simmered tomato-butter gravy with tender chicken. Cooked and packed same-day — just heat and serve.",
    images: ["/images/products/butter-chicken.jpg"], price: 299, unit: "400 g tray (serves 2)",
    nutrition: { calories: 210, protein: "16g", fat: "13g", carbs: "8g" },
    cookingInstructions: "Microwave 3-4 minutes or heat in a pan on medium for 6-8 minutes, stirring once.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days.",
    tags: ["ready-to-eat", "bestseller"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.7, reviewCount: 84, relatedProducts: ["prod-chicken-breast"], relatedRecipes: ["butter-chicken-at-home"],
  },
  {
    id: "prod-chicken-biryani", slug: "chicken-biryani-ready-to-eat", name: "Chicken Biryani Bowl", categoryId: "cat-ready-to-eat",
    description: "Dum-cooked basmati biryani with bone-in chicken, packed hot-sealed to lock in the layered spices.",
    images: ["/images/products/chicken-biryani.jpg"], price: 249, unit: "350 g tray (serves 1-2)",
    nutrition: { calories: 265, protein: "14g", fat: "9g", carbs: "32g" },
    cookingInstructions: "Microwave 3-4 minutes, fluff gently before serving.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 day.",
    tags: ["ready-to-eat", "quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 71, relatedProducts: ["prod-chicken-curry-cut"], relatedRecipes: [],
  },
  {
    id: "prod-fish-curry-rte", slug: "fish-curry-ready-to-eat", name: "Fish Curry", categoryId: "cat-ready-to-eat",
    description: "Home-style tamarind fish curry, cooked with rohu and packed the same morning it's made.",
    images: ["/images/products/fish-curry.jpg"], price: 279, unit: "400 g tray (serves 2)",
    nutrition: { calories: 145, protein: "17g", fat: "6g", carbs: "5g" },
    cookingInstructions: "Heat in a pan on medium for 5-6 minutes, or microwave 3 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 days.",
    tags: ["ready-to-eat"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 39, relatedProducts: ["prod-rohu-fillet"], relatedRecipes: [],
  },
  {
    id: "prod-fresh-paneer", slug: "fresh-paneer", name: "Fresh Paneer", categoryId: "cat-cheese-dairy",
    description: "Soft, milk-fresh paneer made in small batches — no preservatives, no rubbery texture.",
    images: ["/images/products/fresh-paneer.jpg"], price: 149, unit: "200 g",
    nutrition: { calories: 265, protein: "18g", fat: "20g", carbs: "4g" },
    cookingInstructions: "Pan-sear cubes 2-3 minutes per side, or add to curry in the last 5 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 3 days.",
    tags: ["bestseller", "family-pack"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.8, reviewCount: 102, relatedProducts: ["prod-cheese-block"], relatedRecipes: [],
  },
  {
    id: "prod-cheese-block", slug: "cheese-block-cheddar", name: "Cheese Block (Cheddar)", categoryId: "cat-cheese-dairy",
    description: "Aged cheddar block, sliced or grated to order at the counter.",
    images: ["/images/products/cheese-block.jpg"], price: 219, unit: "200 g",
    nutrition: { calories: 402, protein: "25g", fat: "33g", carbs: "1.3g" },
    cookingInstructions: "Ready to eat, melts well for sandwiches and bakes.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 3 weeks of opening.",
    tags: ["family-pack"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.6, reviewCount: 45, relatedProducts: ["prod-fresh-paneer"], relatedRecipes: [],
  },
  {
    id: "prod-white-butter", slug: "white-butter", name: "White Butter", categoryId: "cat-cheese-dairy",
    description: "Fresh churned white butter, unsalted — no added preservatives.",
    images: ["/images/products/white-butter.jpg"], price: 159, unit: "200 g",
    nutrition: { calories: 717, protein: "0.9g", fat: "81g", carbs: "0.1g" },
    cookingInstructions: "Ready to eat, or melt into gravies for a richer finish.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 2 weeks.",
    tags: ["quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 28, relatedProducts: ["prod-fresh-paneer"], relatedRecipes: [],
  },
  {
    id: "prod-fresh-cream", slug: "fresh-cream", name: "Fresh Cream", categoryId: "cat-cheese-dairy",
    description: "Thick dairy cream for curries, desserts and coffee — churned fresh, no additives.",
    images: ["/images/products/fresh-cream.jpg"], price: 99, unit: "200 ml",
    nutrition: { calories: 340, protein: "2.1g", fat: "36g", carbs: "3g" },
    cookingInstructions: "Stir into curries off the heat, or whip for desserts.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 5 days of opening.",
    tags: ["quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.5, reviewCount: 19, relatedProducts: ["prod-white-butter"], relatedRecipes: [],
  },
  {
    id: "prod-cooking-sauce", slug: "cooking-sauce", name: "Cooking Sauce", categoryId: "cat-cheese-dairy",
    description: "Slow-cooked tomato and onion base sauce — the shortcut start for any home curry.",
    images: ["/images/products/cooking-sauce.jpg"], price: 129, unit: "250 g jar",
    nutrition: { calories: 68, protein: "1.5g", fat: "3g", carbs: "9g" },
    cookingInstructions: "Sauté with your protein of choice for 8-10 minutes.",
    storageInstructions: "Keep refrigerated at 0-4°C once opened. Use within 2 weeks.",
    tags: ["quick-cook", "family-pack"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.4, reviewCount: 24, relatedProducts: ["prod-dips"], relatedRecipes: [],
  },
  {
    id: "prod-dips", slug: "garlic-dip", name: "Garlic Dip", categoryId: "cat-cheese-dairy",
    description: "Creamy garlic dip — pairs with kebabs, wings and fries alike.",
    images: ["/images/products/garlic-dip.jpg"], price: 89, unit: "150 g",
    nutrition: { calories: 310, protein: "1.2g", fat: "32g", carbs: "4g" },
    cookingInstructions: "Ready to eat, chilled.",
    storageInstructions: "Keep refrigerated at 0-4°C. Use within 1 week of opening.",
    tags: ["quick-cook"], availableAtStores: ["store-hyderabad-jubilee-hills"],
    rating: 4.3, reviewCount: 15, relatedProducts: ["prod-cooking-sauce"], relatedRecipes: [],
  },
];

const recipesData = [
  {
    slug: "rohu-curry", title: "Home-Style Rohu Fish Curry",
    description: "A tangy, mustard-forward curry that's the weeknight classic Bengali households swear by.",
    image: "/images/categories/fish.jpg",
    ingredients: ["500 g F&C Rohu Fillet", "2 tbsp mustard oil", "1 tsp turmeric", "1 tbsp mustard paste", "2 green chillies", "1 onion, sliced"],
    steps: [
      "Marinate the fillets in turmeric and salt for 10 minutes.",
      "Shallow fry until lightly golden, then set aside.",
      "Sauté onions in mustard oil until soft, stir in mustard paste and chillies.",
      "Simmer the fried fish in the gravy for 12-15 minutes and serve with rice.",
    ],
    relatedProducts: ["prod-rohu-fillet"], cookTime: "35 mins", servings: 4,
  },
  {
    slug: "butter-chicken-at-home", title: "Butter Chicken at Home",
    description: "Restaurant-style butter chicken, made simple enough for a weeknight using our curry-cut chicken.",
    image: "/images/categories/chicken.jpg",
    ingredients: ["500 g F&C Chicken Curry Cut", "1 cup yogurt", "2 tbsp butter", "1 cup tomato purée", "1 tsp garam masala", "2 tbsp cream"],
    steps: [
      "Marinate chicken in yogurt and spices for at least 1 hour.",
      "Cook the marinated chicken through, then set aside.",
      "Simmer tomato purée with butter until it deepens in colour.",
      "Add the chicken back in, finish with cream and garam masala.",
    ],
    relatedProducts: ["prod-chicken-curry-cut", "prod-chicken-breast"], cookTime: "50 mins", servings: 4,
  },
  {
    slug: "chilli-garlic-prawns", title: "Chilli Garlic Prawns",
    description: "A 15-minute pan-fry that turns jumbo prawns into a proper weekend starter.",
    image: "/images/categories/fish.jpg",
    ingredients: ["500 g F&C Jumbo Prawns (Deveined)", "4 cloves garlic, chopped", "2 dried red chillies", "1 tbsp butter", "Juice of half a lemon"],
    steps: [
      "Pat the prawns dry and season lightly.",
      "Sizzle garlic and chillies in butter until fragrant.",
      "Add prawns, searing 2 minutes per side until pink and firm.",
      "Finish with lemon juice and serve immediately.",
    ],
    relatedProducts: ["prod-prawns-jumbo"], cookTime: "15 mins", servings: 2,
  },
  {
    slug: "crab-masala", title: "Coastal Crab Masala",
    description: "A spiced coconut-based crab masala that makes the most of whole mud crab.",
    image: "/images/categories/crab.jpg",
    ingredients: ["1 F&C Mud Crab (Whole), cut into pieces", "1 cup grated coconut", "1 tbsp coriander seeds", "2 tomatoes, chopped", "1 sprig curry leaves"],
    steps: [
      "Dry-roast coconut and coriander seeds, then grind to a paste.",
      "Sauté curry leaves and tomatoes until softened.",
      "Add the ground paste and cook until the oil separates.",
      "Add crab pieces, cover and cook 15-18 minutes until done.",
    ],
    relatedProducts: ["prod-mud-crab-whole"], cookTime: "40 mins", servings: 3,
  },
];

const reviewsData = [
  { productId: "prod-rohu-fillet", rating: 5, comment: "No bones, no mess — my mother-in-law actually asked where I bought the fish from.", authorName: "Priya Reddy", createdAt: "2026-06-02" },
  { productId: "prod-chicken-breast", rating: 5, comment: "Been ordering weekly for 3 months now. Always cut fresh, never that 'been in the fridge' smell.", authorName: "Arjun Rao", createdAt: "2026-05-18" },
  { storeId: "store-hyderabad-jubilee-hills", rating: 4, comment: "Store is spotless and the staff actually know their cuts. Slightly pricier than the market but worth it.", authorName: "Sandeep Kumar", createdAt: "2026-06-10" },
  { productId: "prod-farm-eggs-tray", rating: 5, comment: "Yolks are noticeably firmer than the supermarket ones. Tray of 30 lasts us the week.", authorName: "Lakshmi Iyer", createdAt: "2026-04-22" },
  { productId: "prod-butter-chicken", rating: 4, comment: "Tastes home-cooked, not like a packaged ready meal. My go-to on days I can't cook.", authorName: "Fatima Sheikh", createdAt: "2026-06-28" },
  { productId: "prod-fresh-paneer", rating: 5, comment: "Softest paneer I've had outside my grandmother's kitchen. Doesn't turn rubbery when cooked.", authorName: "Karthik Nair", createdAt: "2026-05-30" },
];

// Copy kept food-brand-voice throughout — "Order" not "Shop", this is a
// fresh-protein counter/franchise, not a generic online storefront.
const bannersData = [
  {
    placement: "HERO",
    image: "/images/categories/fish.jpg",
    link: "/shop/fish",
    priority: 1,
    title: "Fresh Proteins, Cut to Order.",
    subtitle:
      "From our counter to your kitchen — 100% hygienic, zero preservatives, cold-chain delivered.",
    ctaLabel: "Order Fresh Seafood",
  },
  {
    placement: "HERO",
    image: "/images/categories/chicken.jpg",
    link: "/shop/chicken",
    priority: 2,
    title: "Antibiotic-Free Fresh Chicken.",
    subtitle:
      "Sourced daily from bio-secure farms. Tender, fresh-cut breast fillets, thighs, and drumsticks.",
    ctaLabel: "Order Farm Chicken",
  },
  {
    placement: "HERO",
    image: "/images/categories/ready-to-cook.jpg",
    link: "/shop/ready-to-cook",
    priority: 3,
    title: "Ready to Cook in Minutes.",
    subtitle:
      "Gourmet marinated tandoori chicken, winglets, and kebab skewers. Just cook and serve.",
    ctaLabel: "Order Marinades",
  },
  {
    placement: "HERO",
    image: "/images/categories/ready-to-eat.jpg",
    link: "/shop/ready-to-eat",
    priority: 4,
    title: "Curries & Dum Biryanis.",
    subtitle:
      "Slow-simmered, restaurant-quality curries and layered rice bowls cooked fresh every morning.",
    ctaLabel: "Order Cooked Meals",
  },
];

// ---------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------

async function seedCategories() {
  const slugToId = new Map();
  for (const cat of categoriesData) {
    const row = await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        order: cat.order,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
        order: cat.order,
      },
    });
    slugToId.set(cat.slug, row.id);
  }
  return slugToId;
}

async function seedStores() {
  const oldIdToId = new Map();
  for (const store of storesData) {
    const row = await db.store.upsert({
      where: { slug: store.slug },
      update: {
        name: store.name,
        status: store.status,
        address: store.address,
        city: store.city,
        state: store.state,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        whatsapp: store.whatsapp,
        openingHours: store.openingHours,
        images: store.images,
        deliveryAvailable: store.deliveryAvailable,
        pickupAvailable: store.pickupAvailable,
        googleMapsLink: store.googleMapsLink,
      },
      create: {
        slug: store.slug,
        name: store.name,
        status: store.status,
        address: store.address,
        city: store.city,
        state: store.state,
        latitude: store.latitude,
        longitude: store.longitude,
        phone: store.phone,
        whatsapp: store.whatsapp,
        openingHours: store.openingHours,
        images: store.images,
        deliveryAvailable: store.deliveryAvailable,
        pickupAvailable: store.pickupAvailable,
        googleMapsLink: store.googleMapsLink,
      },
    });
    oldIdToId.set(store.id, row.id);
  }
  return oldIdToId;
}

async function seedProducts(categorySlugToId, storeOldIdToId) {
  const oldIdToProduct = new Map();

  // Pass 1: create/update every product's scalar fields + category + stores.
  for (const product of productsData) {
    const categorySlug = product.categoryId.replace(/^cat-/, "");
    const realCategoryId = categorySlugToId.get(categorySlug);
    const storeIds = product.availableAtStores
      .map((oldId) => storeOldIdToId.get(oldId))
      .filter(Boolean);

    const data = {
      name: product.name,
      description: product.description,
      images: product.images,
      price: product.price,
      unit: product.unit,
      nutrition: product.nutrition,
      cookingInstructions: product.cookingInstructions,
      storageInstructions: product.storageInstructions,
      tags: product.tags,
      rating: product.rating,
      reviewCount: product.reviewCount,
      category: { connect: { id: realCategoryId } },
      // `connect` (not `set`) — `set` is only a valid operation inside an
      // `update`, and this `data` object is shared between upsert's
      // `create` and `update` branches below.
      availableAtStores: { connect: storeIds.map((id) => ({ id })) },
    };

    const row = await db.product.upsert({
      where: { slug: product.slug },
      update: data,
      create: { slug: product.slug, ...data },
    });
    oldIdToProduct.set(product.id, { id: row.id, slug: row.slug });
  }

  // Pass 2: wire up the self-relation (relatedProducts). Written from one
  // direction only — lib/data/products.js merges both `relatedProducts`
  // and `relatedProductsOf` when reading, so this is enough for the app to
  // treat the link as symmetric.
  for (const product of productsData) {
    if (!product.relatedProducts.length) continue;
    const self = oldIdToProduct.get(product.id);
    const relatedIds = product.relatedProducts
      .map((oldId) => oldIdToProduct.get(oldId)?.id)
      .filter(Boolean);
    if (!relatedIds.length) continue;

    await db.product.update({
      where: { id: self.id },
      data: { relatedProducts: { set: relatedIds.map((id) => ({ id })) } },
    });
  }

  return oldIdToProduct;
}

async function seedRecipes(productOldIdToProduct) {
  for (const recipe of recipesData) {
    const relatedIds = recipe.relatedProducts
      .map((oldId) => productOldIdToProduct.get(oldId)?.id)
      .filter(Boolean);

    const data = {
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      // `connect` (not `set`) — same reasoning as in seedProducts: this
      // `data` object is shared between upsert's `create` and `update`.
      relatedProducts: { connect: relatedIds.map((id) => ({ id })) },
    };

    await db.recipe.upsert({
      where: { slug: recipe.slug },
      update: data,
      create: { slug: recipe.slug, ...data },
    });
  }
}

async function seedReviews(productOldIdToProduct, storeOldIdToId) {
  const existingCount = await db.review.count();
  if (existingCount > 0) return; // no natural unique key — avoid duplicating on re-run

  for (const review of reviewsData) {
    await db.review.create({
      data: {
        rating: review.rating,
        comment: review.comment,
        authorName: review.authorName,
        createdAt: new Date(review.createdAt),
        productId: review.productId
          ? productOldIdToProduct.get(review.productId)?.id
          : undefined,
        storeId: review.storeId ? storeOldIdToId.get(review.storeId) : undefined,
      },
    });
  }
}

async function seedBanners() {
  const existingCount = await db.banner.count();
  if (existingCount > 0) return; // no natural unique key — avoid duplicating on re-run

  for (const banner of bannersData) {
    await db.banner.create({
      data: {
        placement: banner.placement,
        image: banner.image,
        link: banner.link,
        priority: banner.priority,
        title: banner.title,
        subtitle: banner.subtitle,
        ctaLabel: banner.ctaLabel,
      },
    });
  }
}

async function main() {
  console.log("Seeding categories...");
  const categorySlugToId = await seedCategories();

  console.log("Seeding stores...");
  const storeOldIdToId = await seedStores();

  console.log("Seeding products...");
  const productOldIdToProduct = await seedProducts(categorySlugToId, storeOldIdToId);

  console.log("Seeding recipes...");
  await seedRecipes(productOldIdToProduct);

  console.log("Seeding reviews...");
  await seedReviews(productOldIdToProduct, storeOldIdToId);

  console.log("Seeding banners...");
  await seedBanners();

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
