# Changelog

Milestone-level log per `Project-instructions.md` §10 process. Newest first.

---

## Milestone 13 — Pre-Launch Pass: Location Accuracy, Phone Login, Email, Order Tracking, Promo Strip (2026-08-01)

Largely produced by another tool from the pre-launch plan (location bugs,
phone auth, Resend email, customer order tracking, promo strip, SEO
basics); audited and corrected before this commit.

**Location accuracy (the two real bugs from the plan, confirmed fixed):**
Navbar now fetches stores via `/api/stores` instead of importing a
Prisma-backed function into client code (previously silently fell back to
hardcoded mock data every time — invisible only because the mock
happened to match the one real store). Serviceability now uses the real
`Settings.deliveryRadiusKm` (5 km) from that same endpoint instead of a
hardcoded 15 km, so the location picker and checkout no longer contradict
each other. `geocodeAddress()` also gained progressive fallback queries
(pincode-only, without the housing-society name, etc.) for addresses
Nominatim doesn't index well.

**Phone login:** real Firebase Phone Auth (RecaptchaVerifier +
`signInWithPhoneNumber`) added to `SignUpForm.js`, alongside email and
Google. `Customer.email` is now nullable (phone-only accounts have none);
`getOrCreateCustomerForFirebaseUser` matches by phone when there's no
email.

**Email:** `resend` package + `lib/email.js`, new
`/api/auth/send-verification` using Admin SDK's
`generateEmailVerificationLink()` with a real branded template, replacing
Firebase's shared default sender — the actual fix for landing in spam
(the rest of that fix is DNS/domain verification, which is the owner's
side, not code).

**Customer order tracking:** new `/account/orders/[id]` — status
timeline, delivery/pickup details, rider info if assigned. Read-only,
ownership-checked (404s if the order isn't the signed-in customer's).

**Admin-manageable promo strip:** `PROMO_STRIP` added to
`BannerPlacement` (additive, not a rename — `CATEGORY`/`POPUP` stay as
they were), `getBannersByPlacement()` generalizes the banner query layer
beyond the old HERO-only fetcher, new `components/home/PromoStrip.js`
between the homepage's product grid and trust section.

**SEO/production basics:** `metadataBase`, `app/robots.js`,
`app/sitemap.js`, `app/manifest.js` — all confirmed missing before this
pass.

**Real bugs found and fixed during audit before this commit:**
- Schema had drifted from migration history — `Customer.email` was made
  nullable and `PROMO_STRIP` added directly to the live DB (via a
  `db push`-style change) with no migration file ever created. Generated
  the missing migration and marked it applied via `prisma migrate
  resolve`, so a fresh environment's migration history now matches
  reality instead of silently missing these changes.
- `/api/auth/send-verification` had no rate limiting and no ownership
  check on the target email — anyone could have used it to mass-send
  verification emails to arbitrary addresses, which would damage the
  sending domain's reputation with Resend (the exact problem this
  feature exists to solve). Added rate limiting.
- The new admin dashboard (`app/admin/page.js`, now the landing page
  every admin sees after login) queried `Order.totalPaid` — a field that
  doesn't exist (the real field is `total`). This would have thrown a
  Prisma validation error and crashed the dashboard for every single
  admin/store-manager login. Same wrong field name also produced
  `₹NaN` in the recent-orders table; a `status === "PENDING"` check for
  status-badge coloring was comparing against a value that isn't a valid
  `OrderStatus` (that's a `PaymentStatus` value) and could never match.
  All fixed; revenue now correctly computed from `paymentStatus: "PAID"`
  orders, matching the convention `services/analytics.js` already uses.
- `/account/orders/[id]` (the new customer order-tracking page) read
  `item.qty`/`item.price` on order line items — the real `OrderItem`
  fields are `quantity`/`unitPrice` (same wrong-field-name mistake class
  found and fixed in the admin Order Operations page last session).
  Would have rendered `x undefined` and `₹NaN` for every item, on the
  customer-facing page being built specifically to fix "proper order
  tracking."

**Not yet verified live** (needs owner-provided credentials/testing):
Resend domain verification + actual inbox-placement test, real OTP
round-trip on a live phone number, Firebase Phone provider enabled in
the console.

---

## Milestone 12 — Product Media/Stock Gating, Wishlist Sync, Promotions Rewrite, Refunds (2026-07-31)

Completes the phases left open at the end of Milestone 11.

**Storefront:** `AddToCartButton`/`BuyNowButton` on the product detail page
now disable (and label "Out of Stock") using the same per-store
`StoreInventory` check `ProductCard` already had, gated behind a `mounted`
flag so it never mismatches server-rendered HTML. PDP image fallback now
tries the product's own legacy image before the generic category image
(`ProductMediaGallery` still wins once a product has real `ProductMedia`
rows).

**Wishlist:** `app/wishlist/actions.js` (`getWishlistAction`,
`toggleWishlistAction`, `syncWishlistAction`) — signed-in customers get a
real DB-backed wishlist (`Wishlist` model already existed, just wasn't
used) that follows them across devices. Guests keep the existing
localStorage-only Zustand store unchanged. On sign-in, the wishlist page
does a one-time merge of local items into the account, then loads the
account's list as the source of truth.

**Promotions:** `Coupon` and `Offer` — two overlapping models with zero
live rows in production (checked before touching anything) — merged into
one `Promotion` model (`type: COUPON | OFFER`, `discountType: PERCENT |
FLAT | BOGO`, optional `code`, `bannerImage`, `startsAt`/`endsAt`).
`/admin/coupons` (kept the URL/nav label to avoid unnecessary churn) now
manages Promotions instead. Checkout gained an actual promo-code input
(there wasn't one before, even though `/api/orders` already accepted
`couponCode`) with live discount preview via a new
`validatePromoCodeAction`, real order-total math replacing the input, and
a `/promo/[code]` campaign landing page that auto-applies its code at
checkout via a one-shot localStorage handoff.

**Refunds:** `/admin/refunds` — a Super-Admin-only board (separation of
duties: Store Admins can already *initiate* a refund from the Order
Operations page, but approving one moves real money) to approve/reject
pending `RefundRequest` rows; approval marks the order `REFUNDED` and
writes an `OrderStatusHistory` entry, same mechanism every other status
change uses.

**Contact form:** now actually saves to a new `ContactMessage` model
instead of a `setTimeout` that faked success (there was no backend for it
at all before this).

**Files:** `prisma/migrations/20260731154412_promotion_and_contact_message/`,
`services/promotions.js` (replaces `services/coupons.js`), `services/
refunds.js`, `app/admin/coupons/*`, `app/admin/refunds/*`, `app/checkout/
actions.js`, `app/contact/actions.js`, `app/wishlist/actions.js`,
`app/promo/[code]/page.js`, `components/promo/PromoAutoApply.js`.

---

## Milestone 11 — Multi-Store Admin, Store-Scoped Inventory, Order Operations (2026-07-31)

**Schema:** `StoreInventory` (per-store product stock, replaces the old
single global `Product.stock`, kept as a temporary rollup during
migration), `Order.storeId` now set for delivery orders too (previously
only pickup), `Order.packingNotes`/`riderName`/`riderPhone`, `RETURNED`
order status, `User.isActive` (soft-deactivate instead of destructive
delete), `ProductMedia` (multi-image/video per product, replacing the
plain `images` JSON array going forward), `RefundRequest`.

**Roles:** `admin` (Super Admin — unrestricted, only role that can touch
Banners/Stores/Pages/Settings/Coupons) vs `store_manager`/`staff` (scoped
to their own `User.storeId` for Orders/Products-inventory/Customers/
Reviews/Team/Analytics). `lib/admin-auth.js` gained `isSuperAdmin()` /
`getScopedStoreId()` helpers; every store-scoped service (`orders.js`,
`team.js`, `reviews.js`, `customers.js`, `analytics.js`) now accepts and
filters by `storeId`.

**Customer-facing:** cart now belongs to a resolved store (`lib/store/
location.js`, `lib/store/cart.js`) — the nearest active store is resolved
via a new `getNearestActiveStore()` (`lib/data/stores.js`), replacing the
`stores[0]`/`findFirst` shortcuts previously used independently in
checkout UI and the order API. Adding a product not carried by the
resolved store is blocked; switching stores with items already in cart
prompts a clear-and-switch confirmation. Delivery orders now persist the
resolved store's id (`app/api/orders/route.js`) instead of always `null`.

**Admin — Order Operations (`/admin/orders/[id]`, new):** full status
timeline (`OrderStatusHistory`, who/when), editable packing notes, rider
name/phone assignment, print-friendly invoice (`@media print`), refund
request initiation for cancelled/returned orders. Store-scoped: 404s for
orders outside a Store Admin's own store, enforced on both the page view
and every mutating server action.

**Admin — Inventory folded into Products:** the standalone `/admin/
inventory` screen is gone; `StockAdjuster` now takes a `storeId` and the
Products table shows a per-store stock breakdown (Store Admins see only
their store's row; Super Admin sees/adjusts all). New products are now
auto-connected to every active store with zero-stock `StoreInventory`
rows on creation (previously new products had no store connection or
stock rows at all).

**Real bugs found and fixed during a full audit pass** (this work was
largely produced by another tool while the assistant was rate-limited;
everything below was verified and corrected before this commit):
- `updateTeamMemberRoleAction` had **no store-scoping or role-ceiling
  check at all** — any store_manager could have promoted any user, in any
  store, to Super Admin via a direct call. Now validates the target user
  is in the caller's own store and rejects granting/touching the `admin`
  role unless the caller already is one. Same class of gap closed in
  `inviteTeamMemberAction` (a store_manager could otherwise invite a new
  Super Admin outright).
- `app/admin/orders/actions.js`'s mutating actions (advance/cancel status,
  packing notes, rider assignment, refund requests) had **no store-
  scoping check** — a Store Admin could mutate another store's orders via
  a crafted request even though the page view was correctly scoped. Added
  `assertOrderAccess()` (new `getOrderStoreId()` in `services/orders.js`).
- `getCustomerWithOrders` only filtered the *orders* list by store, not
  the customer row itself — a Store Admin could view any customer's name/
  email/phone/addresses by direct URL even for customers who never
  ordered from their store. Added a `notFound()` check.
- `services/products.js`'s `listProducts`/`getProductById` overwrote
  `product.images` unconditionally with (empty, for every pre-existing
  product) `ProductMedia` rows, with no fallback to the legacy `images`
  JSON column. Since `ProductFormModal` pre-fills its image field from
  `product.images`, editing **any of the 33 real existing products**
  would have shown an empty image field and silently wiped that
  product's images on save. Added a fallback (`resolveImages()`) —
  matches the fallback the storefront-facing `lib/data/products.js`
  already had correctly.
- `/admin/orders/[id]`'s Prisma query ordered `statusHistory` by
  `createdAt`, a field that doesn't exist on `OrderStatusHistory` (it's
  `timestamp`) — would have thrown on every page load. Same wrong-field
  bug also referenced in the client's timeline render and price display
  (`item.price` instead of `OrderItem.unitPrice`) — all `NaN`/crash paths
  fixed.
- The Order Operations totals card displayed `order.subtotal`/
  `deliveryFee`/`discount`, none of which exist on `Order` (only `total`
  is stored) — rendered as `₹NaN`. Replaced with a subtotal recomputed
  from `order.items` plus the applied coupon code, rather than fabricating
  fields that were never persisted.
- Products list's per-store stock adjuster only branched on
  `role.name === "store_manager"`, leaving `staff` users looking at (and
  clicking, then silently failing on) every other store's adjuster.
  Server-side mutation was already correctly blocked either way, but
  fixed the UI to scope `staff` the same as `store_manager`.

**Not yet built** (left as-is, flagged for a follow-up decision rather
than built silently): product media gallery UI on the PDP, wishlist DB
sync, and a proposed Coupon/Offer → single `Promotion` model rewrite —
the last one involves dropping two working models and needs explicit
sign-off before proceeding, not assumed.

---

## Milestone 10 — Admin CMS, Real Reviews, Storefront Polish (2026-07-30)

**Password visibility toggle:** new shared `components/ui/PasswordInput.js`
(eye/eye-off icon), used by both SignInForm and SignUpForm instead of
duplicating the logic.

**"Buy Now" direct checkout:** `components/product/BuyNowButton.js` — adds
the item to cart and jumps straight to `/checkout`, sitting next to (not
replacing) `AddToCartButton` on the PDP. Also added
`components/product/QuickAddToCartButton.js` to `ProductCard` — the grid
cards had zero cart action at all before this (only the PDP did).

**Real image uploads (Firebase Storage):** `/api/admin/upload` — admin-only
(gated the same way every other admin action is, via `requireAdminUser()`),
uploads via the Firebase **Admin** SDK (`lib/firebase/admin.js`'s new
`uploadToStorage()`), which bypasses Storage security rules entirely —
authorization happens in our own route, not Console-configured rules. New
`components/admin/ImageUploadField.js` renders a hidden input so it drops
into existing `<form action={serverAction}>` patterns as a straight
replacement for the old raw-URL text field — no schema changes needed
(every image field already just stores a URL string). Wired into
Products and Categories.

**Admin panel visual polish:** new `components/admin/AdminShell.js` client
wrapper — real F&C logo, brand-red active nav highlighting, and a
collapsible sidebar (icon-only when collapsed). `app/admin/layout.js` is
now a thin server component that fetches the admin user and role-gates
the Team nav item, handing rendering off to AdminShell.

**Admin CMS additions:**
- **Banners** (`/admin/banners`) — full CRUD for homepage hero banners
  (image via the new upload, title/subtitle/CTA/link/priority/schedule).
- **Stores** (`/admin/stores`) — full CRUD; there was previously no admin
  screen for store address/hours/phone/images at all.
- **Pages** (`/admin/pages`) — new `Page` Prisma model (slug/title/content)
  makes Privacy Policy, Terms, Refund Policy, and Shipping Policy
  admin-editable. Content uses a deliberately simple line-based convention
  (`## ` = heading, `- ` = bullet, blank line = new block) rather than a
  full rich-text editor — parsed by `lib/utils/pageContent.js`, rendered by
  `components/layout/PolicyContent.js`. All 4 pages now fetch from the DB
  with the original hardcoded copy kept as an in-file fallback if no DB
  row exists yet. Seeded via `prisma/seed.js`'s new `seedPages()`.

**Real customer reviews:** `/api/reviews` POST previously had **no
authentication at all** — anyone could submit a review under any typed
name. Now requires a signed-in, email-verified customer; `authorName` is
no longer accepted from the client at all, it's always the real account
name. Added `Review.customerId` (nullable FK to Customer, migration
`20260730114518_review_customer`) so every new review is tied to a real
account, plus duplicate-review prevention (one review per customer per
product/store). New `components/product/ReviewForm.js` on the PDP — shows
a sign-in prompt for guests, a star-rating + comment form for signed-in
customers. New `/admin/reviews` moderation screen — view and delete any
review, with `Product.rating`/`reviewCount` correctly recalculated on
delete (previously only recalculated on create).

**Bug fixed along the way:** `/admin/banners`, `/admin/stores`,
`/admin/pages`, and `/admin/reviews` initially crashed the build with
"Functions cannot be passed directly to Client Components" — the same
class of bug already fixed for Products/Categories/Coupons during the
Firebase migration, just not yet applied to these four new sections.
Fixed the same way: a thin server `page.js` that fetches + serializes
data, handing off to a `*ClientPage.js` client component that does the
actual Table/Modal/trigger-prop composition (Orders/Customers/Inventory/
Team were checked and don't have this issue — their trigger-prop usage is
already contained within their own client components).

**Verified:** `next build` passes (99/99 pages), lint clean on every file
touched. Migrations for `Page` and `Review.customerId` applied directly
against the live production database (local now has direct DB + Firebase
Admin access, confirmed working this session).

---

## Milestone 9 — Zomato / Swiggy Link-Out (2026-07-29)

**Built:** "Order on Zomato" / "Order on Swiggy" buttons in the `/checkout`
order summary, each rendered only when its URL is actually set — so the
feature ships complete now and needs zero further code once the owner adds
real listing URLs. Both fields (`zomatoUrl`/`swiggyUrl`) already existed on
the `Settings` model and were already editable in `/admin/settings` from
Milestone 5; this milestone only added the storefront-facing buttons.

**Verified:** `next build` passes.

**Still blocked on:** the owner's actual Zomato/Swiggy listing URLs — the
buttons simply won't appear until those are filled in via Admin → Settings.

---

## Milestone 8 — Admin Analytics Dashboard (2026-07-29)

**Built:** `services/analytics.js` (`getRevenueStats`, `getTopProducts`,
`getCustomerBreakdown`, `getPopularSearches` — plain Prisma aggregations,
no charting library) and `/admin/analytics` displaying revenue (paid
orders only), active order count, cancelled count, average order value,
top 5 products by units sold, one-time vs. returning customer counts, and
the top 8 searched terms. Added to the admin sidebar nav.

**Verified:** `next build` passes.

---

## Milestone 7 — Analytics Capture (2026-07-29)

**Fixed a real bug found while wiring this up:** `app/api/products/route.js`
used `mode: "insensitive"` in its search filter — a Postgres/MongoDB-only
Prisma option that doesn't exist on MySQL (this project's provider) and
would have thrown on every search request. Removed it; MySQL's default
collation (`utf8mb4_unicode_ci`, set in the initial migration) is already
case-insensitive, so plain `contains` is correct.

**Built:**
- `lib/utils/analytics.js` — added `logProductSearch({ query, results })`,
  a shared fire-and-forget helper (device/browser via existing
  `parseUserAgent`, IP from headers, `userId` from the Clerk session if
  any) used by both `/api/products` and `/shop`, replacing duplicated
  inline logic that previously lived only in the API route.
- **Wired the Navbar's search bar** — it was a decorative `disabled` input
  with no backing functionality. It's now a real form that navigates to
  `/shop?search=...` on submit (both desktop and mobile menu variants).
- `/shop` now reads `?search=`, filters by name/description, shows a
  "N results for '...'" message with a clear-search link, and logs the
  search via the same shared helper — so real user searches actually show
  up in `SearchLog`, not just API-level ones.

Order-level capture (device/browser/IP/delivery distance on `Order`) and
the `SearchLog` model itself were already in place from earlier work in
this milestone's schema migration — this pass closed the loop that made
search capture actually reachable from the real UI.

**Verified:** `next build` passes.

---

## Milestone 6 — Policy Pages (2026-07-29)

**Built:**
- **Navigation Links:** Appended Privacy Policy, Terms of Service, Refund Policy, and Shipping Policy links to `FOOTER_LINKS.support` inside `/lib/constants.js`.
- **Reusable Policy Layout:** Created `/components/layout/PolicyPageLayout.js` featuring clean responsive typography containers, matching the typography, spacing, and header/footer components of other content pages (like `/about` and `/faqs`).
- **Static Pages:** Implemented four descriptive, compliant policy screens under `/app/privacy-policy/page.js`, `/app/terms/page.js`, `/app/refund-policy/page.js`, and `/app/shipping-policy/page.js`.

**Verified:** Compiled successfully via `npm run build` as optimized static HTML pages.

---

## Milestone 5 — Delivery Radius & Fees (2026-07-29)

**Schema:** Added the `Settings` singleton model with fields for delivery radius, delivery charges, minimum order value, free delivery thresholds, third-party integrations (Zomato/Swiggy), social links, business info, and SEO details. Created the migration SQL files under `prisma/migrations/20260729183000_add_settings/migration.sql`.

**Built:**
- **Configuration Service:** `services/settings.js` supplying `getSettings` (autoseeds DEFAULT_SETTINGS on first query) and `updateSettings`.
- **Forward Geocoding:** `lib/utils/geocode.js` exporting `geocodeAddress(addressString)` to query OpenStreetMap's Nominatim endpoint for coordinates.
- **Admin Settings Console:** `/admin/settings` form rendering current configurations, utilizing Next.js Server Actions in `/admin/settings/actions.js` to handle validations and trigger cache invalidation. Added "Settings" link to the admin navigation sidebar in `/admin/layout.js`.
- **API Order Enforcement:** Updated `/api/orders` POST to retrieve settings, locate the active delivering store in the database, resolve address coordinates, check if within radius, ensure subtotal meets minimum order requirements, calculate delivery fee, and record the final total. Blocks submission on geocoding/distance failures.
- **Checkout Page UI:** Updated `CheckoutPageClient.js` to accept settings and calculate distance dynamically to the active store. Performs geocoding on blur of address inputs, displaying inline progress/success/error statuses, block checkout submit on unserviceable/unverifiable addresses, and dynamically updates the order summary pricing rows with real delivery fees.

**Verified:** Compiled successfully via `npm run build`. Clean ESLint check on all updated checkout and admin settings pages. Ran automated tests under `/scratch/test_geocode.js` verifying coordinates lookup.

---

## Milestone 4 — Razorpay Payment (2026-07-29)

**Installed:** `razorpay@^2.9.5`.

**Schema:** Added `razorpayOrderId` (unique), `razorpayPaymentId` (unique), and `razorpaySignature` to the `Order` model, and created the `PaymentAuditLog` model (storing event ID, event type, raw payload, signature, processed timestamp, and result message) via migration `20260729182048_add_razorpay_payment`.

**Built:**
- **Payment Service:** `services/payment.js` for signature verification helper (`verifyWebhookSignature`) and audit logging (`createPaymentAuditLog`).
- **Webhook Endpoint:** `/api/webhooks/razorpay` to handle payment notifications:
  - Signature verification using `X-Razorpay-Signature` and webhook secret.
  - Payment-ID-based idempotency (checks `Order.razorpayPaymentId` and returns `200 OK` directly on matches).
  - Amount verification (compares captured amount in paise with `Order.total` exactly, writing `"AMOUNT_MISMATCH"` log on errors).
  - Payment failure handling (updates `paymentStatus = FAILED` and logs details for `"payment.failed"` event).
  - Successful capture transactions (updates `paymentStatus = PAID`, `status = CONFIRMED`, saving ID/signature and writing `"WEBHOOK_PAYMENT_CAPTURED"` audit logs).
- **Verify Status Endpoint:** `/api/orders/[id]/verify-payment` as a read-only endpoint that queries the database to report if payment was captured (used for client polling/UX).
- **Orders API:** Updated `/api/orders` POST to initialize a Razorpay order, save its ID on the local order row, write the initial `"ORDER_CREATED"` audit log, and return the key and order details to the client.
- **Checkout Frontend:**
  - Loaded the Razorpay widget script tag dynamically using Next.js `Script` in `/checkout`.
  - Updated `CheckoutPageClient.js` to trigger the Razorpay widget, define customer prefills, and poll `/api/orders/[id]/verify-payment` on success to wait until database changes propagate via the webhook. Added visual waiting indicators to the CTA button for paying/verifying states.

**Verified:** `next build` compiles successfully and all dynamic payment verification and webhook routes compile without errors. Standard ESLint check is clean on all newly added files. Standalone test script `/scratch/test_payment.js` confirms signature verification algorithms run successfully.

---

## Milestone 3 — Admin Panel (Core) (2026-07-29)

**Schema:** Added `Product.stock` field (with comment noting single-store scale and future migration to separate Inventory table if multi-store is needed) via migration `20260729103517_product_stock`.

**Built:**
- **Auth Guard:** `lib/admin-auth.js` (`getAdminUser()`, `requireAdminUser()`) checking Clerk session against database roles (`admin`, `store_manager`, `staff`).
- **Admin Shell:** `app/admin/layout.js` (header with Clerk UserButton, sidebar navigation, mobile-responsive layout).
- **Reusable Admin Components:**
  - `components/admin/Table.js` — presentational, server-renderable table.
  - `components/admin/Modal.js` — accessible dialog with Escape-key close listener.
  - `components/admin/Pagination.js` — pagination control using query params.
  - `components/admin/Filters.js` — search and category dropdown filters.
  - `components/admin/ConfirmDialog.js` — confirm dialog with pending/spinner states.
- **Orders Dashboard:**
  - `app/admin/orders/page.js` & `actions.js` — status/fulfillment filtering.
  - `components/admin/OrderRowActions.js` — one-tap next-status advancement (via flows in `lib/orderStatus.js`).
  - `services/orders.js` — transaction-based status updates tracking `OrderStatusHistory`.
- **Products CRUD:**
  - `app/admin/products/page.js` & `actions.js` — complete product management.
  - `components/admin/ProductFormModal.js` — modal form to add/edit products.
  - `services/products.js` — database methods.
- **Categories CRUD:**
  - `app/admin/categories/page.js` & `actions.js` — category CRUD.
  - `components/admin/CategoryFormModal.js` — modal form to add/edit categories.
  - `services/categories.js` — database methods.
- **Inventory quick-adjust:**
  - `app/admin/inventory/page.js` & `actions.js` — quick stock-adjuster view.
  - `components/admin/StockAdjuster.js` — client-side +/- adjustment buttons.
- **Customers view:**
  - `app/admin/customers/page.js` & `[id]/page.js` — client list and details view including order history and saved addresses.
  - `services/customers.js` — database methods.
- **Coupons CRUD:**
  - `app/admin/coupons/page.js` & `actions.js` — coupon management.
  - `components/admin/CouponFormModal.js` — modal form to add/edit coupons.
  - `services/coupons.js` — database methods.

**Verified:** `next build` passes successfully. ESLint warnings and errors were found in legacy storefront components (unrelated to newly implemented admin files) but all newly introduced admin panel files are clean of lint errors.

---

## Milestone 2 — Auth (Clerk) (2026-07-29)

**Installed:** `@clerk/nextjs@^7.6.2`. Note v7 removed the old `SignedIn`/
`SignedOut` components in favor of a unified `<Show when="signed-in">`.

**Schema:** added `Customer.clerkId` (nullable, unique) via a new migration
(`20260729100157_customer_clerk_id`). Design decision: `Customer` (not
`User`) is the identity for public shoppers — `User`+`Role` stays reserved
for staff/admin who'll get `/admin` access later. `Role` rows
(admin/store_manager/staff/customer) are now seeded.

**Built:**
- `middleware.js` — protects `/account` and `/admin`, redirects signed-out
  visitors to our own `/sign-in` (not Clerk's hosted portal — needed
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL` env vars to point at our
  custom pages).
- `/sign-in`, `/sign-up` — Clerk's prebuilt components, themed to brand red.
- `lib/auth.js` — `getCurrentCustomer()`/`getOrCreateCustomerForClerkUser()`,
  find-or-create keyed on clerkId first, then email (so a guest order and a
  later Clerk sign-in with the same email link to the same Customer/order
  history instead of duplicating).
- `/api/orders` — closed a real security gap: `customerId` was previously
  accepted directly from the client (GET query param and POST body), which
  let anyone read or attach orders to an arbitrary customer by guessing/
  knowing an id. Now always derived server-side — from the Clerk session
  if signed in, from guest contact details if not. Also now saves a real
  `Address` row for signed-in delivery orders (previously only a JSON
  snapshot on the Order), so account addresses actually populate.
- `/account` — replaced the "coming soon" placeholder with real order
  history and saved addresses, both scoped to the session's own customer.
- `/checkout` — prefills from the Clerk profile and hides the name/email
  fields when signed in (phone stays editable); guest fields only required
  when signed out.
- Navbar + bottom nav — Account icon routes to `/account` or `/sign-in`
  based on real auth state.

**Manual step still needed:** there's no self-serve admin sign-up. To make
someone an admin/store_manager/staff, they must sign in once via Clerk
(creating their `User` row isn't automatic either — that only happens for
the admin panel work in a later milestone), then their `roleId` needs to be
set manually in the database. Flagging now so it isn't a surprise later.

**Verified:** `next build` passes; confirmed via local prod server that
`/account` correctly 307-redirects signed-out visitors to `/sign-in` (not
Clerk's hosted portal), and both auth pages render.

**Deferred to the security pass (per Project-instructions.md §9):** `npm
audit` reported additional vulnerabilities after installing `@clerk/nextjs`
— not investigated now, same as the pre-existing dev-tooling ones.

---

## Milestone 0 — Fix production database (2026-07-28)

**Problem:** Production (Hostinger, MySQL) had zero tables — `prisma/migrations/`
never existed because a dev database was never reachable to generate one, so
`prisma migrate deploy` had nothing to apply. Confirmed via build logs showing
`P2021 "table does not exist"` (proves the connection itself was always
correct — a wrong URL would throw a connection error, not a missing-table
error).

**Fixed:**
- Generated the initial migration offline (`prisma migrate diff --from-empty`,
  no DB connection required) — `prisma/migrations/20260728065024_init/`.
- Confirmed `DATABASE_URL` in Hostinger's Node.js app env vars matches
  `.env`/`.env.local` exactly (`mysql://u224182961_fnc_user:...@localhost:3306/u224182961_fnc_db`).
- Hostinger's "Framework: Next.js" deploy mode locks the Build command to a
  preset dropdown (no custom shell steps possible there) — so migration +
  seed logic lives in `package.json`'s own `build` script instead, via
  `scripts/predeploy.js` (plain Node, not bash, so it behaves identically
  under Windows/cmd.exe locally and Linux/bash on Hostinger).
- Every step is non-fatal: if the DB is unreachable (local dev), it logs a
  warning and `next build` still proceeds on the existing mock-data fallback
  in `lib/data/*.js`.
- Verified live: build log showed "All migrations have been successfully
  applied" + all 6 seed steps completing; phpMyAdmin confirmed real rows
  (7 categories, 33 products, 4 recipes, 6 reviews, 1 store, 4 banners).
- Root cause of a lingering "still broken" report after the fix: a
  CDN/page-cache layer serving stale pre-fix HTML — resolved by clearing
  Hostinger's site cache, not a code issue.

**Files touched:** `prisma/migrations/20260728065024_init/migration.sql`,
`prisma/migrations/migration_lock.toml`, `package.json` (`build` script),
`scripts/predeploy.js` (new), `server.js` (redundant safety-net migrate/seed
at boot, kept in case a future deploy mode does invoke it).

**Still to verify:** homepage Recommendations grid showing real items on the
live site post-fix (was showing "0 items" before the DB had data — needs a
fresh check now that real data exists).

---

## Milestone 1 — Remove WhatsApp checkout, build real checkout (2026-07-28)

**Removed:** "Checkout on WhatsApp" button and message-building logic from
`/cart` (`components/cart/CartPageClient.js`). The separate "Order on
WhatsApp" quick-contact button on the Store Locator (`StoreLocatorInteractive.js`)
is untouched — that's a different feature and stays.

**Built:**
- Real `/checkout` page (`app/checkout/page.js` + `components/checkout/CheckoutPageClient.js`):
  order summary from the cart Zustand store, Delivery/Store-Pickup toggle
  (pickup shows the real active Thane store), guest contact form (name/
  phone/email), delivery address fields shown conditionally, submit button,
  and a real order-confirmation state (order id, "our team will contact you
  to confirm payment" — honest placeholder until Milestone 3 adds real
  payment capture).
- Guest checkout support in `/api/orders` POST: accepts either an existing
  `customerId` or a `guest: {name, email, phone}` object, and finds-or-
  creates a `Customer` row by email (unique) when it's a guest. Order is
  created with `paymentStatus: PENDING` (already the schema default — no
  migration needed).

**Verified:** `next build` passes; real browser screenshots confirm the
add-to-cart → cart → checkout flow renders correctly on desktop, and the
empty-cart state renders correctly on mobile with the bottom nav.

**Not yet verified:** the actual `/api/orders` POST round-trip against a
live database — no local MySQL available to test against, so this needs
confirmation once deployed (same limitation as every DB-touching feature
this session).
