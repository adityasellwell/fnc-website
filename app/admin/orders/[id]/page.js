import { notFound } from "next/navigation";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import OrderDetailClient from "./OrderDetailClient";

export const metadata = { title: "Order Workspace — Admin" };

export default async function AdminOrderDetailPage({ params }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      customer: true,
      statusHistory: { include: { changedBy: true }, orderBy: { timestamp: "asc" } },
      store: true,
      refundRequest: true,
    },
  });

  if (!order) notFound();

  // Scoping check for Store Admins
  if (storeId && order.storeId !== storeId) {
    notFound();
  }

  // Serialize dates and decimals safely before sending to the client
  const serialized = JSON.parse(JSON.stringify(order));

  return <OrderDetailClient order={serialized} currentUser={JSON.parse(JSON.stringify(admin))} />;
}
