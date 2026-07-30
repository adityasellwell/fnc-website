import PolicyPageLayout from "@/components/layout/PolicyPageLayout";

export const metadata = {
  title: "Refund Policy — F&C",
  description: "F&C's refund policy — freshness guarantee, replacement terms, and refund timelines.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPageLayout title="Refund Policy" lastUpdated="July 29, 2026">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">1. Freshness Guarantee</h2>
        <p>
          We source, cut, and pack all fish, chicken, and other proteins daily to guarantee the highest quality. Due to the perishable nature of our products, refund claims must be filed within <strong>4 hours</strong> of receiving delivery or store pickup.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">2. Refund &amp; Replacement Criteria</h2>
        <p>
          You are eligible for a replacement or store refund in the following scenarios:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>The product packaging is ruptured or leaked upon arrival.</li>
          <li>Incorrect items or weights were delivered.</li>
          <li>Quality standards or freshness are not met.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">3. How to Request a Refund</h2>
        <p>
          To request a refund, please send a message to our WhatsApp support line (<a href="tel:+919876543210" className="text-fnc-red font-semibold hover:underline">+91 98765 43210</a>) or email us at <a href="mailto:hello@fncfresh.in" className="text-fnc-red font-semibold hover:underline">hello@fncfresh.in</a>. You must include:
        </p>
        <ol className="list-decimal pl-5 flex flex-col gap-1">
          <li>Your local order ID (visible in your account/checkout screen).</li>
          <li>A clear photograph of the product and its packaging.</li>
          <li>A brief description of the issue.</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">4. Processing &amp; Settlement Timelines</h2>
        <p>
          Approved refunds will be processed directly back to the original source account via Razorpay. Online refund settlements typically reflect in your bank account or card statement within <strong>5-7 business days</strong> as per standard banking terms.
        </p>
      </section>
    </PolicyPageLayout>
  );
}
