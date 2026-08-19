/**
 * Every product currently shows 0 stock in production (StoreInventory was
 * backfilled from the pre-existing Product.stock values, which were
 * already all 0 — nobody had been using real inventory tracking day to
 * day). Hard-blocking purchases on that would make the entire storefront
 * unsellable, so out-of-stock gating (ProductCard, AddToCartButton,
 * BuyNowButton) stays off until the owner actually starts keeping real
 * per-store stock numbers in Admin → Products. Flip to `true` then — no
 * other code changes needed, the StoreInventory lookups are already wired.
 */
export const ENFORCE_STOCK_GATING = false;

/**
 * Firebase Phone Auth (customer sign-in/sign-up "Phone & OTP" tab) requires
 * the project to be on the Blaze (pay-as-you-go) plan to send SMS — no
 * budget for that right now. Turning this off hides the phone tab in
 * SignInForm/SignUpForm (defaults to the Email tab) without deleting any
 * of the phone-auth code — flip back to `true` once Blaze billing is set
 * up and nothing else needs to change.
 *
 * Not related to the delivery-rider handoff OTP (services/orders.js) —
 * that one is shown in-app on the customer's tracking page, never sent
 * via SMS, so it works regardless of this flag.
 */
export const PHONE_AUTH_ENABLED = false;

// Shared between components/home/WhyChooseFC.js and the admin Settings
// page (image upload per card) — kept in one place so the two never
// drift out of sync on titles/order.
export const WHY_CHOOSE_POINTS = [
  { icon: "Sunrise",      tone: "red",   title: "Fresh Every Morning",       detail: "Cut and packed in-store daily." },
  { icon: "Award",        tone: "blue",  title: "Premium Quality",           detail: "Handpicked sourcing, every batch." },
  { icon: "ChefHat",      tone: "green", title: "Expert Butchery",           detail: "Trained hands, precise cuts." },
  { icon: "Snowflake",    tone: "blue",  title: "Cold Chain Maintained",     detail: "Fresh from counter to door." },
  { icon: "Truck",        tone: "red",   title: "Fast Delivery",             detail: "Same-day, straight to your kitchen." },
  { icon: "ShieldCheck",  tone: "green", title: "Quality Checked Daily",     detail: "Every batch verified before sale." },
];

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
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Shipping Policy", href: "/shipping-policy" },
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
