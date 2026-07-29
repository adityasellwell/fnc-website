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

---

## Done

| # | Milestone | Summary |
|---|---|---|
| 0 | Fix production database | Missing migrations generated, auto-run on deploy, seed data live. |
| 1 | Real checkout | Removed WhatsApp cart checkout, built `/checkout` (guest + signed-in). |
| 2 | Auth (Clerk) | Sign-in/up, real `/account`, closed an order-ownership security gap. |

---

## 3 — Admin Panel (Core)

**Architecture:** `app/admin/*` (Server Components) → Server Actions →
`services/*` (plain functions wrapping Prisma) → Prisma. No API routes for
this milestone's CRUD — those stay reserved for Razorpay's webhook and any
future external caller.

**Build reusable admin foundation first** (everything below reused across
every admin section, built once):
- Admin layout, sidebar, header
- Permission guard (checks Clerk session → `User.role` from Milestone 2)
- Reusable Table, Form, Modal, Image Upload, Pagination, Filters,
  Confirmation Dialog

**Then, in order:**
1. Orders dashboard (status + fulfillment filters, one-tap status advance)
2. Products
3. Categories
4. Inventory (stock levels)
5. Customers
6. Coupons

---

## 4 — Razorpay Payment

Real payment at `/checkout`, hosted Checkout (no card data touches our
server), webhook-verified `paymentStatus` transition — plus:
- Payment audit log (who/what/when for every payment event)
- Webhook retry handling
- Idempotency — a webhook firing twice must never double-process an order

---

## 5 — Delivery Radius (Settings-driven, not hardcoded)

New `Settings` model (singleton row) holding:
- Delivery radius (km)
- Delivery charge
- Minimum order value
- Free-delivery threshold

Editable from Admin → Settings. Checkout reads these values live — no
redeploy needed to change the radius or charges later.

---

## 6 — Policy Pages (all four, one reusable template)

`/privacy-policy`, `/terms`, `/refund-policy`, `/shipping-policy` — built
together since they share the same static-content-page pattern (like
`/faqs`/`/about`), linked from the footer.

---

## 7 — Analytics Capture (kept simple)

Capture only: search terms, orders, revenue, device, browser, IP, delivery
distance. No complex event-tracking pipeline — this data attaches to the
existing `Order` model (and a lightweight search-log) rather than a new
generic analytics-events system.

---

## 8 — Admin Analytics Dashboard (business metrics first)

Revenue, Orders, Average Order Value, Top Products, New vs. Returning
Customers, Popular Searches. No custom charting infra beyond what's needed
for these — not a general-purpose BI dashboard.

---

## 9 — Zomato / Swiggy Link-Out

Buttons at checkout linking to existing Zomato/Swiggy listings. URLs live
in the same Admin → Settings screen as Milestone 5 (not hardcoded in
`lib/constants.js`), so the owner can update them without a redeploy.
Blocked on: the owner's actual listing URLs.
