# Changelog

Milestone-level log per `Project-instructions.md` §10 process. Newest first.

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
