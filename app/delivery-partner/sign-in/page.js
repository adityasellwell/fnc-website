import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/delivery-partner-auth";
import PartnerSignInForm from "@/components/delivery-partner/PartnerSignInForm";

export const metadata = { title: "Delivery Partner Sign In" };

export default async function PartnerSignInPage() {
  const partner = await getCurrentPartner();
  if (partner) redirect("/delivery-partner/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-offwhite px-4 py-12">
      <PartnerSignInForm />
    </main>
  );
}
