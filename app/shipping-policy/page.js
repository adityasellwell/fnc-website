import PolicyPageLayout from "@/components/layout/PolicyPageLayout";
import PolicyContent from "@/components/layout/PolicyContent";
import { getPageBySlug } from "@/services/pages";

export const metadata = {
  title: "Shipping Policy — F&C",
  description: "F&C's shipping policy — delivery fees, radius limits, and same-day delivery slots.",
};

const FALLBACK_CONTENT = `## 1. Delivery Service Coverage
We operate a temperature-controlled local delivery fleet from our store in Hiranandani Estate, Thane West. We only deliver to addresses within our designated delivery radius (configured to 5.0 km by default). Address coordinates are verified at checkout. Orders outside this radius are not serviceable.

## 2. Delivery Charges & Thresholds
Delivery charges are dynamically computed based on your order subtotal:
- Minimum Order Value: Orders must meet a minimum subtotal of ₹200 to qualify for delivery.
- Standard Delivery Fee: A flat charge of ₹50 applies to all orders under the free-delivery threshold.
- Free Delivery: All orders with a subtotal of ₹500 or more are delivered free of charge.

## 3. Delivery Timings & Cutoffs
We offer daily delivery slots to keep the cold chain intact. Orders placed before 2:00 PM are scheduled for same-day evening delivery. Orders placed after the cutoff time will be delivered the following morning.

## 4. Store Pickup Alternative
If your address is outside our delivery radius or fails geocoding validation, you can select the Store Pickup option at checkout. Pickups are free and can be collected during our regular store operating hours (7:00 AM – 9:00 PM).`;

export default async function ShippingPolicyPage() {
  const page = await getPageBySlug("shipping-policy");

  return (
    <PolicyPageLayout title={page?.title ?? "Shipping & Delivery Policy"} lastUpdated="July 29, 2026">
      <PolicyContent content={page?.content ?? FALLBACK_CONTENT} />
    </PolicyPageLayout>
  );
}
