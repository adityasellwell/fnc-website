# F&C — Fresh Proteins & More — Project Instructions
## (Master reference — read this fully before any work. If it conflicts with
## an explicit prompt from the project owner in a given session, the explicit
## prompt for that specific task wins — but update this file afterward so it
## stays the accurate source of truth for everything else.)

---

## 1. Vision — What This Project Is

The official website for **F&C — Fresh Proteins & More**, a fresh protein retail
brand (fish, chicken, crab, eggs, and expanding categories) currently operating
**one physical store**, built to scale into a **national franchise brand**
without needing a rebuild later.

It serves four purposes at once, equally:
1. **Ecommerce** — customers browse and order fresh/ready-to-cook/ready-to-eat products
2. **Franchise platform** — investors learn about and apply for franchise opportunities
3. **Brand identity** — establishes F&C as premium, hygienic, trustworthy, modern
4. **SEO engine** — every product, store, city, recipe, and blog post is a discoverable page

### What this should feel like
Think **premium supermarket + gourmet butcher + hyperlocal delivery platform**
(closer to Blinkit's functional energy, Licious/FreshToHome's food-forward
photography, filtered through Whole Foods' visual discipline). **Food is
always the hero** — big photography, big typography, shopping-first.

### What this should NOT feel like
- A tech startup / SaaS landing page
- An Apple-style minimal abstract site (too little food presence)
- A dashboard-looking ecommerce site
- A fish market, meat shop, generic supermarket, or restaurant menu site
- A cheap ecommerce template with cramped icon-grid cards
- Cartoon/doodle imagery of any kind (explicitly rejected earlier in this project)

### Reference images on file
Two rounds of visual reference mockups were provided and should be treated as
the structural/layout target (large hero, generous category circles, roomy
product rows, dark franchise-CTA section, testimonial cards) — **not** as
final imagery (those mockups used AI-generated food photos, which this project
explicitly avoids — see Photography rules in section 5).

---

## 2. What We Took From NBC India (nbcindia.in) — Functional Reference Only

NBC was reviewed purely as a **business/functional reference**, never a visual one.

**Borrowed (function only):**
- Horizontal product-category strip on homepage
- Stats/trust bar for credibility (e.g. "1 Store Live Today", "3+ Cities in Pipeline")
- Store locator + "Order Online" as prominent, always-accessible actions
- A dedicated, serious **Franchise** funnel (not just a contact form)
- Trust badges (hygiene certifications, freshness guarantees)
- Delivery AND Pickup as two first-class fulfillment options at checkout

**Explicitly NOT borrowed:** NBC's plain/utilitarian visual style, layout crowding, lack of whitespace or motion.

---

## 3. Tech Stack

- **Next.js 16.x** (App Router, Turbopack default), **Node.js 20+** (22 LTS recommended), **React 19.x**
- **JavaScript only — no TypeScript**, unless one specific module is explicitly flagged as needing it
- **Tailwind CSS v4.x** — CSS-first config. **No `tailwind.config.js`.** All tokens live in `app/globals.css` under `@theme { ... }`.
- **Framer Motion** — component-level animation (hover, reveal, transitions)
- **GSAP + ScrollTrigger** — scroll-driven storytelling sections
- **Lenis** — global smooth scroll, initialized once in root layout
- **Shadcn/ui (JS)** — accessible base primitives only, skinned to match tokens
- **Lucide React** — icons
- **Database:** PostgreSQL via **Prisma ORM**, hosted on **Neon** or **Supabase**
- **Auth:** **Clerk** (preferred — handles RBAC for Admin/Store Manager/Staff/Customer roles out of the box) or Auth.js (NextAuth) as an alternative if full control over auth is preferred over speed
- **Cart/session state:** React Context or Zustand client-side; persisted server-side in Postgres per user (not just localStorage)
- **Cache/rate-limiting:** Redis via **Upstash** — for login rate-limiting and caching hot data (homepage banners/offers)
- **Payments:** **Razorpay** primary (India/UPI), Stripe as fallback/international later
- **Media storage:** **Cloudinary** or Supabase Storage once real photography exists (not `/public` folder at scale)
- **Search:** Postgres `ILIKE`/full-text search for now; Meilisearch or Algolia later if catalog grows large
- **Email:** **Resend** — order confirmations, franchise lead notifications, password resets
- **Error tracking:** **Sentry** — add once checkout/payments are live
- **Hosting:** Vercel (app) + Neon/Supabase (DB) + Upstash (Redis) + Cloudinary (media)

---

## 4. Architecture

One Next.js app, three logical zones, not separate codebases:

```
/                    → customer storefront (public)
/admin               → admin panel (protected, role-gated)
/api                 → route handlers (backend logic)
```

Split into separate services only when there's a real reason (e.g. a future
mobile app needing its own dedicated API surface) — not before.

### Folder structure
```
app/                    → routes only (page.js, layout.js, loading.js)
  api/                  → Route Handlers (backend logic)
  admin/                → admin panel routes (role-gated)
components/
  ui/                   → generic primitives: Button, Card, Badge, Input, Modal
  layout/               → Navbar, Footer, Container, Section
  home/                 → homepage-specific sections
  product/              → ProductCard, ProductGallery, ProductInfo
  store/                → StoreCard, StoreLocatorMap
  franchise/            → FranchiseHero, InvestmentCard
  recipe/                → RecipeCard
  motion/                → Reveal, Magnetic, TextSplit, ParallaxSection
lib/
  data/                  → mock data files (interim, until DB wired)
  utils.js
  constants.js
public/
  images/, fonts/
```

A component belongs in `ui/` only if it has zero F&C-specific content knowledge.

### Data access rule
Components never import raw arrays/DB calls directly. Always go through a
function in `lib/data/` (e.g. `getProducts()`, `getStoreBySlug(slug)`) written
`async` even when backed by mock data — so swapping mock data for real Prisma
calls later requires zero component changes.

---

## 5. Design System

### Colors — BRIGHT AND BOLD (not muted/dark), derived only from the F&C logo
Corrected direction: vibrant, confident, saturated brand colors — NOT neon,
NOT washed-out/muted. Current values in use:

| Role | Token | Hex |
|---|---|---|
| Primary accent (red) | `--color-fnc-red` | `#DC2F26` |
| Secondary accent (green) | `--color-fnc-green` | `#2E6B1F` |
| Tertiary accent (blue) | `--color-fnc-blue` | `#337FC2` |
| Background | `--color-offwhite` | `#FAF9F6` |
| Background alt | `--color-warmwhite` | `#F3F1EC` |
| Text primary | `--color-charcoal` | `#1E1E1E` |
| Text secondary | `--color-slate` | `#6B6B6B` |
| Border | `--color-bordergray` | `#E5E3DD` |

Dark-mode-reserved tokens (`--color-fnc-*-dark`, `--color-dark-bg`,
`--color-dark-surface`, `--color-dark-border`, `--color-dark-text`,
`--color-dark-text-muted`) are **defined but not wired to any toggle or
`prefers-color-scheme` behavior yet** — dark mode is a later-phase feature,
not built now. Do not remove these reserved tokens; do not activate them either.

Rule of use: one color leads per screen (usually red for CTAs/action). Never
let all three brand colors compete in the same viewport.

### Typography — large, bold, food-forward (not editorial-minimal)
Mobile-first: base token is mobile size, pair with a `md:`/`lg:` variant for desktop.

| Role | Desktop size | Token |
|---|---|---|
| Hero heading | 80-120px (currently 104px via text-hero-lg) | text-hero / text-hero-lg |
| Section heading | 48-64px (currently 56px via text-section-heading-lg) | text-section-heading / -lg |
| Subheading | 22-28px (currently 24px) | text-subheading |
| Body | 18-20px | text-body / text-body-lg |

Fonts: Bricolage Grotesque (display) + Inter (body), loaded via `next/font/google`.

**Every component must use these tokens, not default/arbitrary Tailwind text
sizes.** A recurring failure mode on this project has been components
rendering with default `text-2xl`/`text-3xl` instead of the actual tokens —
always verify the token is really applied, not just defined in `globals.css`.

### Layout
- Max content width: **1600-1700px** (`--container-content: 100rem`), NOT
  Tailwind's default `max-w-7xl` (1280px) — `Container.js` must use the
  wider token.
- Generous spacing **between** sections (`--spacing-section-sm/md/lg`) — even
  when content within a section is dense (e.g. a product grid), section-to-
  section rhythm should feel spacious, not cramped.
- **Vary layout per section** — do not repeat "image left, text right" for
  every section; different sections should look visually distinct from each
  other (hero vs. category row vs. product grid vs. franchise CTA vs.
  testimonials should each have a different structure).
- Radius scale: soft, premium — `--radius-sm` through `--radius-3xl`.

### Photography — real, not AI-generated
**No AI-looking food photography in the final site.** This was an explicit,
repeated project requirement. AI-generated food images have a recognizable
"off" quality (waxy texture, odd proportions) that undermines trust for a
food brand. Use real/licensed stock photography as a bridge until an actual
product/store photoshoot happens. Reference mockups with AI imagery are for
LAYOUT reference only, never for final content.

**Avoid image reuse across unrelated content** — a recurring issue on this
project has been the same stock photo (e.g. a raw salmon shot) getting reused
for a hero, a store photo, AND a "cooked curry" recipe card. Every product,
store, and recipe needs a distinct, content-appropriate image.

### Logo
The existing F&C logo (fish/rooster hybrid mark, laurel wreath) is **not
being redesigned.** Treated as a brand badge — clean, appropriately sized in
nav/footer/headers — while the site's layout, typography, and motion carry
the premium feel.

### Motion
- Framer Motion: component-level (hover, reveal, transitions)
- GSAP + ScrollTrigger: scroll-driven storytelling
- Lenis: global smooth scroll, once in root layout
- Every animation must have a `prefers-reduced-motion` fallback
- Motion communicates confidence and hierarchy, not decoration — no gimmicks,
  no doodle/wallpaper-style decorative patterns (explicitly rejected earlier)

---

## 6. Site Structure & Routing

```
/                          -> homepage
/shop                       -> all products
/shop/[category]            -> category listing
/product/[slug]              -> product detail
/stores                      -> store locator (all)
/store/[slug]                -> individual store SEO page
/franchise                   -> franchise overview
/franchise/apply              -> application form
/recipes                     -> recipe listing
/recipe/[slug]                -> recipe detail
/blog                        -> blog listing
/blog/[slug]                  -> blog post
/about, /health-hygiene, /quality, /contact
/cart, /checkout, /account    -> separate phase (see Section 9)
/admin/*                      -> role-gated admin panel
```

### Homepage section order (current, corrected)
First screen (no scrolling, 1600px+ desktop) contains:
```
Sticky Header (logo, FUNCTIONAL location selector [manual, no GPS],
search, "Store Locator" nav link/icon [distinct from delivery selector,
links to /stores], login, wishlist, cart, Shop Now)
  -> Hero image slider (auto-advancing carousel, real photos, Framer
     Motion transitions, dot/arrow nav, hero-lg type scale)
  -> Ready to Cook / Ready to Eat toggle buttons
  -> Category circles row (Fish, Chicken, Crab, Ready to Cook, Ready to
     Eat, Cheese & Dairy, Eggs, Offers) — INTERACTIVE, see below
```
On mobile this stacks/scrolls; "one screen" is a desktop-first constraint only.

Below the fold, full homepage continues with:
```
  -> Recommendations (dynamic product grid, driven by toggle + circle
     selection, see interactive logic below)
  -> Why Choose F&C
  -> Health & Hygiene
  -> Store Locator section (map-based, see below — NOT the same as the
     header's Store Locator LINK; this is an on-page preview)
  -> Franchise CTA (dark background, stats, Apply/Download CTAs)
  -> Reviews / Testimonials
  -> Final CTA band (4 actionable cards: Shop Fresh, Visit Store, WhatsApp Order, Franchise Partner)
  -> Footer
```

**Interactive toggle/circle/Recommendations logic:**
- "Ready to Cook" active -> category circles show raw/marinated product images
- "Ready to Eat" active -> same circles switch to cooked dish images
- Clicking a circle filters the Recommendations grid to that category,
  respecting the active toggle state; selected circle shows an active state
- Default (no circle selected): Recommendations shows a featured/best-seller
  mix for the active toggle
- Framer Motion transitions on grid content changes (no hard-swap)

**Homepage Store Locator section (map-based):**
- Interactive map (Leaflet + OpenStreetMap by default — no API key/cost;
  swap to Google Maps later if an API key is provided) showing the
  store location(s)
- Plots the VISITOR'S OWN browser location (Geolocation API, permission-
  based) alongside the store pin, with distance and a "Get Directions" link
- This is the visitor's own position on a map, NOT GPS-based nearest-
  store selection across multiple stores (that remains deferred — see
  Section 9, only matters once there are 2+ stores to choose between)
- Links through to the full /stores page for complete details

Removed from the homepage (kept as components for their real destination
pages — /shop, /franchise, /about, /recipes): the old standalone Best
Sellers block and Promotional Banner (superseded by Recommendations).

---

## 7. Data Models

```js
Category { id, slug, name, description, image, parentCategory, order }

Product {
  id, slug, name, categoryId, description, images[], price, unit,
  nutrition{}, cookingInstructions, storageInstructions, tags[],
  availableAtStores[], rating, reviewCount, relatedProducts[], relatedRecipes[]
}

Store {
  id, slug, name, address, city, state, geo{lat,lng}, phone, whatsapp,
  openingHours{}, images[], productsAvailable[], deliveryAvailable,
  pickupAvailable, googleMapsLink
}

FranchiseLead { id, name, email, phone, city, investmentBudget, message, createdAt, status }

Recipe { id, slug, title, description, image, ingredients[], steps[], relatedProducts[], cookTime, servings }

BlogPost { id, slug, title, excerpt, content, image, publishedAt, tags[] }

Review { id, productId or storeId, rating, comment, authorName, createdAt }

Customer { id, name, email, phone, addresses[], orderHistory[] }

Order {
  id, customerId, items[], fulfillmentType ('delivery'|'pickup'),
  storeId (pickup) or deliveryAddress, status, paymentStatus, total, createdAt
}

OrderStatusHistory { id, orderId, status, timestamp, changedBy }

Coupon { id, code, type ('percent'|'flat'), value, minOrderValue,
         appliesTo ('product'|'category'|'cart'), expiryDate, usageLimit,
         usedCount, active }

Offer { id, type ('flash'|'festival'|'combo'|'bogo'), title, discount,
        startsAt, endsAt, productIds[], bannerImage, active }

Banner { id, placement ('hero'|'category'|'popup'), device ('desktop'|'mobile'),
         image, video, link, priority, startsAt, endsAt }

Role { id, name ('admin'|'store_manager'|'staff'|'customer') }
User { id, name, email, passwordHash, roleId, storeId (nullable) }

AuditLog { id, userId, action, entityType, entityId, timestamp, details }
Wishlist { id, customerId, productId }
```

Every routable entity has a `slug` field.

---

## 8. Order Fulfillment Model — Delivery AND Pickup (NBC-style)

At checkout, customer picks `fulfillmentType`: `'delivery'` or `'pickup'`.

### Status flow (shared core, branches at the end)
```
placed -> confirmed -> preparing
  -> (delivery) -> out for delivery -> delivered
  -> (pickup)   -> ready for pickup -> collected
  (cancelled / refunded allowed only before "preparing" starts, self-service;
  after that, requires contacting support)
```

- One `OrderStatusHistory` table drives both paths — same data model, different status labels shown based on `fulfillmentType`.
- **No live GPS rider tracking** — that's real infrastructure (rider app, real-time location streaming) not justified at one-store scale. Use a **status-based tracker** instead (matches how most single-location food businesses, including NBC, actually operate).
- Admin Orders dashboard: filterable by status AND fulfillment type, one-tap status-advance buttons. This is the single most-used admin screen — prioritize it early in the admin build.
- Notifications (Resend email, optionally SMS/WhatsApp via Twilio) on: order confirmed, out-for-delivery/ready-for-pickup (highest-value notification), delivered/collected + review nudge.
- Refunds: manual admin-approved via Razorpay/Stripe refund API — do not automate refund approval initially.

---

## 9. Build Phases

**Done:**
- Phase 1 — Design tokens, fonts, core components (Button, Card, Container, Section, Navbar, Footer)
- Phase 2 (rebuilt) — Full food-forward homepage per Section 6 structure, bright/bold brand colors, 1600px container, large type scale, real photography (no AI-generated final images, no doodle patterns)

**In progress / next (parallelized via subagents where independent):**
- Database schema finalized + migrated (Prisma/Postgres)
- Backend API route handlers (products, categories, stores, cart, orders, franchise leads, reviews, newsletter)
- Inner pages: shop, product, category, store, franchise, recipes, blog, about, contact
- Cart & checkout UI (frontend/flow only — **payment integration deliberately excluded from this parallel push**, gets its own dedicated pass)

**Deliberately deferred — separate, careful phases, not rushed:**
- **Auth (Clerk) + payment (Razorpay) integration** — security-sensitive, gets focused review, not bundled with fast parallel UI work
- Admin panel: Products/Categories/Orders/Customers CRUD first, then Coupons/Offers/Banner management
- SEO pass: metadata, JSON-LD schema, sitemap, OpenGraph
- GPS/location detection + delivery-radius system — needs 2+ stores to meaningfully test, deferred until then
- Dark mode activation (tokens already reserved)
- Search upgrade (Meilisearch/Algolia) — only once catalog grows large
- Analytics dashboard, audit logs
- PWA / future mobile app — consumes the same API layer once it exists

---

## 10. Non-Negotiable Rules

- JavaScript only, no TypeScript, unless one module is explicitly flagged.
- Tailwind v4 CSS-first config only — no `tailwind.config.js`.
- No hardcoded content that will realistically be dynamic — goes in `lib/data/`, even as mock data.
- Every image via `next/image`, meaningful `alt` text, no reused images across unrelated content.
- No AI-generated food photography in final/shipped content.
- No doodle/cartoon/decorative wallpaper patterns.
- Every animation has a `prefers-reduced-motion` fallback.
- Server Components by default; `'use client'` only where interactivity is needed, kept low in the tree.
- Every dynamic route exports `generateMetadata()` + correct JSON-LD schema.
- Target 90+ Lighthouse (Performance, Accessibility, Best Practices, SEO) on mobile.
- Never commit real secrets — `.env.local`, confirm `.gitignore` covers it.
- Checkout/payment/auth are never bundled into fast/parallel frontend polish work — always a separate, deliberate pass.
- **This file must never be deleted**, even when a specific task doesn't require reading it. If it goes missing, recreate/restore it before continuing other work.

---

## 11. Current Status

Homepage restructure completed (auto-advancing Framer Motion Hero slider, Blinkit-style location selector modal, unified toggle + category circles + Recommendations grid with smooth transitions, and Final CTA action cards). Real Store Locator page (/stores) and individual dynamic SEO store details pages (/store/[slug]) completed with Leaflet maps and interactive filtering. Code structure strictly utilizes the constants and data layer in lib/data/. Next: DB schema, API endpoints, and checkout.