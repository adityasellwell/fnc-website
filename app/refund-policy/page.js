import PolicyPageLayout from "@/components/layout/PolicyPageLayout";
import PolicyContent from "@/components/layout/PolicyContent";
import { getPageBySlug } from "@/services/pages";

export const metadata = {
  title: "Refund Policy — F&C",
  description: "F&C's refund policy — freshness guarantee, replacement terms, and refund timelines.",
};

const FALLBACK_CONTENT = `## 1. Freshness Guarantee
We source, cut, and pack all fish, chicken, and other proteins daily to guarantee the highest quality. Due to the perishable nature of our products, refund claims must be filed within 4 hours of receiving delivery or store pickup.

## 2. Refund & Replacement Criteria
You are eligible for a replacement or store refund in the following scenarios:
- The product packaging is ruptured or leaked upon arrival.
- Incorrect items or weights were delivered.
- Quality standards or freshness are not met.

## 3. How to Request a Refund
To request a refund, please send a message to our WhatsApp support line (+91 98765 43210) or email us at hello@fncfresh.in. You must include:
- Your local order ID (visible in your account/checkout screen).
- A clear photograph of the product and its packaging.
- A brief description of the issue.

## 4. Processing & Settlement Timelines
Approved refunds will be processed directly back to the original source account via Razorpay. Online refund settlements typically reflect in your bank account or card statement within 5-7 business days as per standard banking terms.`;

export default async function RefundPolicyPage() {
  const page = await getPageBySlug("refund-policy");

  return (
    <PolicyPageLayout title={page?.title ?? "Refund Policy"} lastUpdated="July 29, 2026">
      <PolicyContent content={page?.content ?? FALLBACK_CONTENT} />
    </PolicyPageLayout>
  );
}
