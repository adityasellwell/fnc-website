import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Table from "@/components/admin/Table";
import { getCustomerWithOrders } from "@/services/customers";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";

export const metadata = { title: "Customer — Admin" };

const statusLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for Pickup",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default async function AdminCustomerDetailPage({ params }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const { id } = await params;
  const customer = await getCustomerWithOrders(id, storeId || undefined);
  if (!customer) notFound();
  // getCustomerWithOrders only filters the *orders* list by store — the
  // customer row itself has no store dimension, so without this a Store
  // Admin could view any customer's name/email/phone/addresses by direct
  // URL even if that customer never ordered from their store.
  if (storeId && customer.orders.length === 0) notFound();

  return (
    <div>
      <Link href="/admin/customers" className="inline-flex items-center gap-2 font-body text-sm font-semibold text-slate hover:text-fnc-red transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </Link>

      <div className="bg-white border border-bordergray rounded-2xl p-6 mb-6">
        <h1 className="font-display text-xl font-bold text-charcoal">{customer.name}</h1>
        <p className="font-body text-sm text-slate mt-1">
          {customer.email} · {customer.phone ?? "No phone on file"} ·{" "}
          {customer.authUid ? "Registered account" : "Guest"}
        </p>
      </div>

      {customer.addresses.length > 0 && (
        <div className="bg-white border border-bordergray rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-charcoal mb-3">Saved Addresses</h2>
          <div className="flex flex-col gap-2">
            {customer.addresses.map((a) => (
              <p key={a.id} className="font-body text-sm text-slate">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
              </p>
            ))}
          </div>
        </div>
      )}

      <h2 className="font-display text-lg font-bold text-charcoal mb-3">Order History</h2>
      <Table
        emptyMessage="No orders yet."
        columns={[
          { header: "Order", accessor: (o) => `#${o.id.slice(-8)}` },
          { header: "Items", accessor: (o) => o.items.length },
          { header: "Total", accessor: (o) => `₹${Number(o.total).toFixed(0)}` },
          { header: "Status", accessor: (o) => statusLabels[o.status] },
          {
            header: "Placed",
            accessor: (o) => new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
        ]}
        rows={customer.orders}
      />
    </div>
  );
}
