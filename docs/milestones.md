# F&C Milestone Plan (authoritative)

Source of truth for remaining work. One milestone at a time — plan stated
briefly before starting, built, verified, shown to the owner, and only
then does the next one start. Don't jump ahead.

## Project-wide rules (apply to every milestone below)

- **Build only what's required for the current milestone.** No speculative
  engineering — if a feature isn't needed yet, don't build it.
- **Reuse before creating.** Before adding a new component/hook/util/
  service/validator/table/form, check if one already exists.
- **Keep the codebase simple.** Prefer Server Components + Server Actions
  + Prisma directly. Only add an API route (`app/api/*`) when something
  outside a Next.js server context actually needs it — a mobile app, a
  webhook receiver (Razorpay), or another external caller. Don't add
  controller/repository layers for CRUD that doesn't need them.
- **Every milestone ends with:** build passes, lint passes, docs
  (`docs/changelog.md`) updated, local commit, a short implementation
  summary, and explicit owner approval before starting the next one.
  (No "TypeScript passes" check — this project is JS-only per
  Project-instructions.md §3/§10.)
- **Git: commit locally after each milestone. Do not `git push` until the
  owner explicitly approves that milestone.** This is a standing rule, not
  a one-off — don't push automatically going forward.
- **Process for every milestone:** Audit → Plan → Permission → Build →
  Verify → Local Commit (then wait — push only on explicit approval).

---

## Done

| # | Milestone | Summary |
|---|---|---|
| 0 | Fix production database | Missing migrations generated, auto-run on deploy, seed data live. |
| 1 | Real checkout | Removed WhatsApp cart checkout, built `/checkout` (guest + signed-in). |
| 2 | Auth (Clerk) | Sign-in/up, real `/account`, closed an order-ownership security gap. |
| 3 | Admin Panel (Core) | Role-gated `/admin` core admin panel: orders dashboard, products/categories CRUD, inventory quick-adjust, customers details, coupons management. |
| 4 | Razorpay Payment | Hosted checkout at `/checkout` using Webhook as source of truth for PAID/FAILED status updates, with payment-id-based idempotency, amount checking, and transaction-level audit logging. |
| 5 | Delivery Radius & Fees | Settings-driven delivery radius, charge, minimum order, and free delivery thresholds, editable from Admin Settings, enforced client and server-side using active store coordinates. |
| 6 | Policy Pages | Four compliant static pages (/privacy-policy, /terms, /refund-policy, /shipping-policy) sharing a single reusable template layout and linked from the footer. |
| 7 | Analytics Capture | Orders capture device/browser/IP/delivery distance; searches capture the same via a shared `logProductSearch()` helper. Wired the Navbar's previously-disabled search bar to actually search `/shop` (fixed a MySQL-incompatible `mode: "insensitive"` bug found along the way). |
| 8 | Admin Analytics Dashboard | `/admin/analytics` — revenue (paid orders), order count, AOV, top products, new-vs-returning customers, popular searches. Plain aggregation queries, no charting library. |
| 9 | Zomato / Swiggy Link-Out | "Order on Zomato"/"Order on Swiggy" buttons in the checkout order summary, only rendered when a URL is set. Both URLs are editable in Admin → Settings (built in Milestone 5) — nothing to redeploy once the owner adds real listing URLs there. |

---

All 10 planned milestones (0–9) are functionally complete. See
`docs/changelog.md` for full detail per milestone.

---

## 10 — Admin CMS, Real Reviews, Storefront Polish (2026-07-30)

Owner-requested batch, planned and confirmed before starting: password
show/hide toggle, a "Buy Now" direct-checkout button alongside Add to
Cart, real Firebase Storage image uploads in admin (no more pasting
URLs), admin visual polish (logo/brand colors, collapsible sidebar), and
a lightweight CMS layer — Banners, Stores, and the 4 policy pages are now
all admin-editable, plus real customer reviews (sign-in required) with
an admin moderation screen. Full detail in `docs/changelog.md`.

---

## 11 — Multi-Store Admin, Store-Scoped Inventory, Order Operations (2026-07-31)

Owner-requested restructuring: a real Super Admin (head office, manages
the whole platform/website) vs. Store Admin/Staff (scoped to one store's
orders, inventory, team, reviews) model, per-store stock (`StoreInventory`
replacing the old single global `Product.stock`), a customer-facing
store-scoped cart (nearest-store resolution, per-store product
availability), and an Order Operations workspace (status timeline,
packing notes, rider assignment, print invoice, refund requests). Full
detail in `docs/changelog.md`, including a list of real bugs found and
fixed during a full audit pass before this was committed.
