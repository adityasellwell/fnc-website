import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/delivery-partner-auth";
import { listOrdersForDeliveryPartner } from "@/services/orders";
import PartnerDashboardClient from "@/components/delivery-partner/PartnerDashboardClient";

export const metadata = { title: "Today's Deliveries — Delivery Rider" };

export default async function PartnerDashboardPage() {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/delivery-partner/sign-in");

  const orders = await listOrdersForDeliveryPartner(partner.id);
  const serialized = JSON.parse(JSON.stringify(orders));

  return (
    <PartnerDashboardClient
      partner={JSON.parse(JSON.stringify(partner))}
      orders={serialized}
    />
  );
}
