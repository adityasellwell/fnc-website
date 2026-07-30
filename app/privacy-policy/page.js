import PolicyPageLayout from "@/components/layout/PolicyPageLayout";

export const metadata = {
  title: "Privacy Policy — F&C",
  description: "F&C's privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout title="Privacy Policy" lastUpdated="July 29, 2026">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us when placing an order or registering an account. This includes your name, email address, phone number, and delivery address. We also keep a record of your order history, transaction logs, and support queries.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to process orders, initiate payment gateways (via Razorpay), verify delivery coordinates, coordinate pickups, communicate order updates, and respond to customer support inquiries.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">3. Third-Party Integrations</h2>
        <p>
          We share your data with trusted partners only to the extent necessary to perform checkout and authentication services:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li><strong>Clerk:</strong> Provides user authentication and account portal management.</li>
          <li><strong>Razorpay:</strong> Handles cryptographic payment processing. We do not store or transmit raw card numbers or CVVs on our own servers.</li>
          <li><strong>OpenStreetMap (Nominatim):</strong> Resolves typed addresses to verify store delivery serviceability.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">4. Data Security</h2>
        <p>
          We implement standard security measures to safeguard transaction records, audit logs, and account details. However, no internet transmission is 100% secure. You are responsible for keeping your login credentials confidential.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-charcoal">5. Your Choices &amp; Contact</h2>
        <p>
          You may access and update your account details by visiting your Account dashboard. For questions about this policy, please contact us at <a href="mailto:hello@fncfresh.in" className="text-fnc-red font-semibold hover:underline">hello@fncfresh.in</a>.
        </p>
      </section>
    </PolicyPageLayout>
  );
}
