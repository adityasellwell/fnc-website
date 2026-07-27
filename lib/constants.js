export const BRAND = {
  name: "F&C",
  fullName: "F&C — Fresh Proteins & More",
  tagline: "Fresh Proteins & More",
  categoryLine: "Fish . Chicken . Crab",
  logo: "/images/logo.png",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "hello@fncfresh.in",
};

/**
 * Static single-store location for the header's location indicator.
 * Mirrors the active store in lib/data/stores.js. Kept as a plain
 * constant (not fetched) since there's only one store today — swap for
 * a real location-picker/GPS flow once there's more than one to choose
 * between.
 */
export const CURRENT_LOCATION = {
  label: "Hiranandani Estate, Thane",
  fullLabel: "Hiranandani Estate, Thane West, Maharashtra",
};

export const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Stores", href: "/stores" },
  { label: "Recipes", href: "/recipes" },
  { label: "Franchise", href: "/franchise" },
  { label: "Health & Hygiene", href: "/health-hygiene" },
  { label: "About", href: "/about" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Fish", href: "/shop/fish" },
    { label: "Chicken", href: "/shop/chicken" },
    { label: "Crab", href: "/shop/crab" },
    { label: "Eggs", href: "/shop/eggs" },
    { label: "Ready to Cook", href: "/shop/ready-to-cook" },
    { label: "Ready to Eat", href: "/shop/ready-to-eat" },
    { label: "Cheese & Dairy", href: "/shop/cheese-dairy" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Health & Hygiene", href: "/health-hygiene" },
    { label: "Quality Standards", href: "/quality" },
    { label: "Franchise", href: "/franchise" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "Store Locator", href: "/stores" },
    { label: "FAQs", href: "/faqs" },
  ],
};

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

/**
 * Decorative icon + accent tone per category slug, used by PlaceholderMedia
 * as a fallback wherever a photo isn't available. `image` mirrors each
 * category's `image` field in lib/data/categories.js — duplicated here so
 * ProductCard (which only receives a product, not its category) can show a
 * representative photo until real per-product photography is shot.
 */
export const CATEGORY_META = {
  fish: { icon: "Fish", tone: "blue", image: "/images/categories/fish.jpg" },
  chicken: { icon: "Drumstick", tone: "red", image: "/images/categories/chicken.jpg" },
  crab: { icon: "Shell", tone: "green", image: "/images/categories/crab.jpg" },
  eggs: { icon: "Egg", tone: "neutral", image: "/images/categories/eggs.jpg" },
  "ready-to-cook": { icon: "Flame", tone: "red", image: "/images/categories/ready-to-cook.jpg" },
  "ready-to-eat": { icon: "ChefHat", tone: "blue", image: "/images/categories/ready-to-eat.jpg" },
  "cheese-dairy": { icon: "Milk", tone: "neutral", image: "/images/categories/cheese-dairy.jpg" },
};

export const TRUST_BADGES = [
  { icon: "ShieldCheck", label: "Hygienically Processed" },
  { icon: "Snowflake", label: "Cold Chain Maintained" },
  { icon: "Truck", label: "Same-Day Delivery" },
  { icon: "Award", label: "Quality Checked Daily" },
];

export const FRANCHISE_STATS = [
  { value: "1", label: "Store Live Today" },
  { value: "3+", label: "Cities in Pipeline" },
  { value: "4", label: "Protein Categories" },
];

export const WHY_CHOOSE_FC = [
  {
    icon: "Sunrise",
    title: "Fresh every morning",
    detail: "Cut and packed in-store daily — never sitting in cold storage for days.",
  },
  {
    icon: "Package",
    title: "Premium packaging",
    detail: "Leak-proof, vacuum-sealed packs that keep proteins fresh door to door.",
  },
  {
    icon: "Truck",
    title: "Same-day delivery",
    detail: "Order by early afternoon, get it delivered fresh the same evening.",
  },
  {
    icon: "Snowflake",
    title: "Unbroken cold chain",
    detail: "Temperature-controlled from our counter to your kitchen.",
  },
  {
    icon: "ChefHat",
    title: "Expert butchery",
    detail: "Trained hands cut every order to spec — no shortcuts, no guesswork.",
  },
  {
    icon: "ShieldCheck",
    title: "Quality you can trust",
    detail: "Every batch checked against our own hygiene standard before it reaches you.",
  },
];

export const PROMO_BANNER = {
  eyebrow: "This Week",
  title: "Family Combo Picks",
  description:
    "Curated fish, chicken and egg bundles sized for the whole week — put together by our store team, not an algorithm.",
  image: "/images/categories/chicken.jpg",
  imageAlt: "Fresh chicken breast on a cutting board",
  cta: { label: "Shop Combo Picks", href: "/shop" },
};
