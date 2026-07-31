# F&C Fresh Meat & Fish — Complete Project Guide & Overview

Welcome to the official handbook for the **F&C Fresh** website. This document explains what we built, how it works, how it looks, and how the different systems run—all in simple, non-technical language.

---

## 🥩 1. What is F&C Fresh?
F&C Fresh is a modern online store for ordering fresh meat, chicken, fish, and seafood. Customers can browse fresh products, filter by categories, add items to a cart, check if delivery is available for their home address, and complete their purchases securely using either **Online Payment (Razorpay)** or by **Store Pickup**.

Additionally, there is a secure, hidden **Admin Dashboard** where the F&C management team can track orders, monitor daily sales, update prices, adjust inventory stock levels, and manage team members.

---

## 🎨 2. Design & User Interface (How the Website Looks)

The website uses a modern, premium design system inspired by top food delivery apps:
*   **Colors:** Clean charcoal gray for text and headers, crisp white/cream backgrounds for a fresh feel, and an energetic **F&C Red** accent color for buttons, prices, and important call-outs.
*   **Fonts:** Bold, clean typography that is highly readable on both smartphones and computer screens.
*   **Layout:**
    *   **On Computers:** A spacious header with navigation links, a prominent search bar, shopping cart previews, and a clean grid showing product cards.
    *   **On Mobile Phones:** A clean bottom navigation bar (just like Instagram or Swiggy) containing buttons for *Home*, *Shop*, *Wishlist*, and *Account* for easy one-handed browsing.

---

## 🛒 3. The Customer Experience (How the Storefront Works)

### A. Browsing & Selecting Items
*   **Home Page:** Features sliding banners announcing special offers, a list of food categories (e.g., Fish, Chicken, Prawns), and "Best Sellers" or "Fresh Catch of the Day".
*   **Category Filter:** Clicking on "Fish" or "Chicken" opens a page showing only those items.
*   **Product Cards:** Each card displays a high-quality picture, name, unit size (e.g., "500g"), price, customer rating, and a clear **Add to Cart** button.
*   **Wishlist:** Customers can tap a heart icon on any item to save it to their wishlist to buy later.

### B. The Shopping Cart
*   A slide-out drawer displays all added items, quantities, and prices.
*   **Real-time Calculations:** The cart automatically computes the total price, adds delivery charges (if applicable), and updates instantly when quantities are changed.

### C. Delivery Check & Geofencing (The Thane 5km Radius)
To ensure maximum freshness, F&C only delivers within a **5-kilometer radius** of their active store in Hiranandani Estate, Thane West.
*   **How it works for a customer:**
    1.  At checkout, the customer enters their address.
    2.  The website uses a free global map helper (**OpenStreetMap**) to turn that text address into precise GPS coordinates (Latitude & Longitude).
    3.  The system computes the straight-line distance between the store coordinates and the customer's coordinates.
    4.  If the distance is **under 5.0 km**, the order proceeds to delivery.
    5.  If it is **over 5.0 km** or the address cannot be located on the map, the website politely explains the limitation and prompts the customer to choose **Store Pickup** instead.

### D. Checkout & Payment
*   Customers fill in their contact details (Name, Email, Verified Phone Number).
*   They choose:
    *   **Store Pickup:** They pay online and collect it directly from the Thane store (completely free).
    *   **Home Delivery:** Deliver to their address (free for orders above ₹500; a ₹50 fee is added for orders below ₹500).
*   **Razorpay Integration:** When they click "Pay", a secure checkout window pops up. They can pay via UPI, NetBanking, Credit/Debit cards, or wallets.
*   **Order Confirmation:** Once paid, the order is registered, and a button appears to share their receipt directly via **WhatsApp** with the F&C support team.

---

## 🔑 4. Authentication (How Login & Sign Up Work)

We migrated the entire security system from a third-party service (Clerk) to a custom, free **Firebase Session Cookie** model. This keeps the application fast, secure, and completely free of monthly user costs.

### A. Secure Signup Loop (Verified Customers Only)
To keep the database clean and free of fake accounts, we enforce a strict verification flow:
1.  **Form Input:** The user types their name, email, phone number, and password.
2.  **No Immediate DB Entry:** Unlike standard sites, we **do not** write their account into our database immediately.
3.  **Temporary Storage:** The phone number and name are stored safely inside **Firebase's Custom User Claims** (a secure online vault).
4.  **Verification Email:** The user is immediately logged out and sent a verification email.
5.  **Activation:** The user opens their email and clicks the verification link.
6.  **First Login:** The user logs in. The website checks that their email is verified, reads the name and phone number from the secure claims vault, and **finally creates their Customer record in the database**.

### B. Google Login (One-Click)
*   Customers can click "Sign in with Google" to log in instantly. Since Google already verifies emails, they bypass the verification link loop, and their account is created immediately.

---

## 👔 5. The Admin Dashboard (For the F&C Business Team)

Admins can log in to `/admin` to manage the entire business operation. 

### A. Core Panels
*   **Analytics Dashboard:** Displays total sales charts, order counts, average order values, and lists top-selling products.
*   **Orders Management:** A central registry of all customer orders. Staff can update order status (e.g., from *Pending* to *Out for Delivery* or *Delivered*).
*   **Products & Inventory:**
    *   Admins can add new products, edit descriptions, adjust weights, and update prices.
    *   **Stock Counter:** Displays stock levels. If stock hits zero, the product automatically displays "Out of Stock" on the storefront, preventing customers from ordering it.
*   **Categories Manager:** Allows creation and ordering of food categories.
*   **Coupons/Discounts:** Admins can create coupon codes (e.g., "FRESH10"), set expiry dates, minimum spend thresholds, and discount values (percentage or flat discount).
*   **Banners Manager:** Easily change the promotional sliders on the homepage.
*   **Pages Editor:** Update policies directly (Privacy Policy, Refund Policy, etc.) without writing any code.

### B. Security & Roles (Who Can Access What?)
There are three staff levels, each with different permissions:
1.  **Admin:** Complete access. Can view financial analytics, adjust settings, and add/remove team members.
2.  **Store Manager:** Can manage orders, adjust inventory levels, and edit products, but cannot see global financials or manage team members.
3.  **Staff:** Read-only access to view orders and update delivery statuses.

### C. Seeding & Auto-Linking Team Members
To add a new staff member:
1.  The Admin goes to `/admin/team` and enters the new member's email and role (e.g., `manager@fncfresh.com`).
2.  The system creates a "pending" slot.
3.  The staff member registers an account on the website with that exact email.
4.  On their first login, the website automatically recognizes their email, links their credentials, and grants them access to the Admin Panel with their designated permissions.

---

## ⚙️ 6. Technical Summary (How the Gears Turn)

For technical teams or developers joining the project:
*   **Framework:** Built on **Next.js 16 (App Router)** for fast loading and server-side page generations.
*   **Database:** Powered by a remote **MySQL** database on Hostinger, connected via **Prisma ORM**.
*   **Authentication:** Managed via **Firebase Client SDK** (front-end) and **Firebase Admin SDK** (server-side token validations).
*   **Sessions:** Standard JSON Web Tokens (JWT) stored in a secure 14-day `httpOnly` cookie.
*   **Map API:** Coordinates resolved via **OpenStreetMap Nominatim API** (free, no Google Maps API fees).
*   **Rate Limiter:** Protected by **Upstash Redis** sliding-window limiters to prevent API abuse.
