import PolicyPageLayout from "@/components/layout/PolicyPageLayout";

export const metadata = {
  title: "Terms of Service — F&C",
  description: "F&C's terms of service — ordering rules, delivery limitations, and account guidelines.",
};

export default function TermsOfServicePage() {
  return (
    <PolicyPageLayout title="Terms of Service" lastUpdated="July 29, 2026">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">1. Acceptance of Terms</h2>
        <p>
          By accessing the F&amp;C website and purchasing proteins, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">2. Ordering &amp; Pricing</h2>
        <p>
          Product availability is subject to change based on daily supply. Prices listed are in Indian Rupees (INR). We verify item weights and prepare cuts fresh daily. If a product becomes unavailable after placing an order, we will reach out to offer a replacement or process a refund.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">3. Delivery Area &amp; Verification</h2>
        <p>
          We enforce a settings-driven delivery radius (configured at 5.0 km by default) centered around our active Thane store coordinates. Delivery serviceability is checked at checkout using geo-location coordinates resolved by OpenStreetMap's Nominatim service. Address inputs that cannot be verified or exceed the radius limits will be rejected.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">4. Online Payments</h2>
        <p>
          Online payments are processed securely through Razorpay checkout integration. The payment status changes in our database only when verified by a signature-checked Razorpay webhook. Mismatched amounts or failed checkouts will automatically trigger manual audit flags.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">5. Limitation of Liability</h2>
        <p>
          F&amp;C is not liable for delayed deliveries caused by inaccurate address coordinates, heavy traffic, weather, or server-side API outages beyond our control.
        </p>
      </section>
    </PolicyPageLayout>
  );
}
