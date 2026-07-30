import PolicyPageLayout from "@/components/layout/PolicyPageLayout";
import PolicyContent from "@/components/layout/PolicyContent";
import { getPageBySlug } from "@/services/pages";

export const metadata = {
  title: "Privacy Policy — F&C",
  description: "F&C's privacy policy — how we collect, use, and protect your information.",
};

const FALLBACK_CONTENT = `## 1. Information We Collect
We collect information you provide directly to us when placing an order or registering an account. This includes your name, email address, phone number, and delivery address. We also keep a record of your order history, transaction logs, and support queries.

## 2. How We Use Your Information
We use the information we collect to process orders, initiate payment gateways (via Razorpay), verify delivery coordinates, coordinate pickups, communicate order updates, and respond to customer support inquiries.

## 3. Third-Party Integrations
We share your data with trusted partners only to the extent necessary to perform checkout and authentication services:
- Firebase Authentication: Provides user authentication and account sign-in.
- Razorpay: Handles cryptographic payment processing. We do not store or transmit raw card numbers or CVVs on our own servers.
- OpenStreetMap (Nominatim): Resolves typed addresses to verify store delivery serviceability.

## 4. Data Security
We implement standard security measures to safeguard transaction records, audit logs, and account details. However, no internet transmission is 100% secure. You are responsible for keeping your login credentials confidential.

## 5. Your Choices & Contact
You may access and update your account details by visiting your Account dashboard. For questions about this policy, please contact us at hello@fncfresh.in.`;

export default async function PrivacyPolicyPage() {
  const page = await getPageBySlug("privacy-policy");

  return (
    <PolicyPageLayout title={page?.title ?? "Privacy Policy"} lastUpdated="July 29, 2026">
      <PolicyContent content={page?.content ?? FALLBACK_CONTENT} />
    </PolicyPageLayout>
  );
}
