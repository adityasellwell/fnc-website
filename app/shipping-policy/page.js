import PolicyPageLayout from "@/components/layout/PolicyPageLayout";

export const metadata = {
  title: "Shipping Policy — F&C",
  description: "F&C's shipping policy — delivery fees, radius limits, and same-day delivery slots.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPageLayout title="Shipping &amp; Delivery Policy" lastUpdated="July 29, 2026">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">1. Delivery Service Coverage</h2>
        <p>
          We operate a temperature-controlled local delivery fleet from our store in Hiranandani Estate, Thane West. We only deliver to addresses within our designated delivery radius (configured to 5.0 km by default). Address coordinates are verified at checkout. Orders outside this radius are not serviceable.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">2. Delivery Charges &amp; Thresholds</h2>
        <p>
          Delivery charges are dynamically computed based on your order subtotal:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li><strong>Minimum Order Value:</strong> Orders must meet a minimum subtotal of ₹200 to qualify for delivery.</li>
          <li><strong>Standard Delivery Fee:</strong> A flat charge of ₹50 applies to all orders under the free-delivery threshold.</li>
          <li><strong>Free Delivery:</strong> All orders with a subtotal of ₹500 or more are delivered free of charge.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">3. Delivery Timings &amp; Cutoffs</h2>
        <p>
          We offer daily delivery slots to keep the cold chain intact. Orders placed before <strong>2:00 PM</strong> are scheduled for same-day evening delivery. Orders placed after the cutoff time will be delivered the following morning.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">4. Store Pickup Alternative</h2>
        <p>
          If your address is outside our delivery radius or fails geocoding validation, you can select the <strong>Store Pickup</strong> option at checkout. Pickups are free and can be collected during our regular store operating hours (7:00 AM – 9:00 PM).
        </p>
      </section>
    </PolicyPageLayout>
  );
}
