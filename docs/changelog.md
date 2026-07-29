# Changelog

Milestone-level log per `Project-instructions.md` §10 process. Newest first.

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
