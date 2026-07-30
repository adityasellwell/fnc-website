import PolicyPageLayout from "@/components/layout/PolicyPageLayout";
import PolicyContent from "@/components/layout/PolicyContent";
import { getPageBySlug } from "@/services/pages";

export const metadata = {
  title: "Terms of Service — F&C",
  description: "F&C's terms of service — ordering rules, delivery limitations, and account guidelines.",
};

const FALLBACK_CONTENT = `## 1. Acceptance of Terms
By accessing the F&C website and purchasing proteins, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.

## 2. Ordering & Pricing
Product availability is subject to change based on daily supply. Prices listed are in Indian Rupees (INR). We verify item weights and prepare cuts fresh daily. If a product becomes unavailable after placing an order, we will reach out to offer a replacement or process a refund.

## 3. Delivery Area & Verification
We enforce a settings-driven delivery radius (configured at 5.0 km by default) centered around our active Thane store coordinates. Delivery serviceability is checked at checkout using geo-location coordinates resolved by OpenStreetMap's Nominatim service. Address inputs that cannot be verified or exceed the radius limits will be rejected.

## 4. Online Payments
Online payments are processed securely through Razorpay checkout integration. The payment status changes in our database only when verified by a signature-checked Razorpay webhook. Mismatched amounts or failed checkouts will automatically trigger manual audit flags.

## 5. Limitation of Liability
F&C is not liable for delayed deliveries caused by inaccurate address coordinates, heavy traffic, weather, or server-side API outages beyond our control.`;

export default async function TermsOfServicePage() {
  const page = await getPageBySlug("terms");

  return (
    <PolicyPageLayout title={page?.title ?? "Terms of Service"} lastUpdated="July 29, 2026">
      <PolicyContent content={page?.content ?? FALLBACK_CONTENT} />
    </PolicyPageLayout>
  );
}
