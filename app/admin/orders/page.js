import Table from "@/components/admin/Table";
import Pagination from "@/components/admin/Pagination";
import Filters from "@/components/admin/Filters";
import OrderRowActions from "@/components/admin/OrderRowActions";
import { listOrders } from "@/services/orders";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import Link from "next/link";
import { statusLabels } from "@/lib/orderStatus";

export const metadata = { title: "Orders — Admin" };

const STATUS_OPTIONS = Object.entries(statusLabels).map(([value, label]) => ({ value, label }));

export default async function AdminOrdersPage({ searchParams }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { orders, totalPages } = await listOrders({
    status: sp.status || undefined,
    fulfillmentType: sp.fulfillmentType || undefined,
    page,
    storeId: storeId || undefined,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Orders</h1>

      <Filters
        fields={[
          { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
          {
            key: "fulfillmentType",
            label: "Fulfillment",
            type: "select",
            options: [
              { value: "DELIVERY", label: "Delivery" },
              { value: "PICKUP", label: "Pickup" },
            ],
          },
        ]}
      />

      <Table
        emptyMessage="No orders match these filters."
        columns={[
          {
            header: "Order",
            accessor: (o) => (
              <Link href={`/admin/orders/${o.id}`} className="font-semibold text-fnc-red hover:underline">
                #{o.id.slice(-8).toUpperCase()}
              </Link>
            ),
          },
          { header: "Customer", accessor: (o) => o.customer?.name ?? "—" },
          { header: "Items", accessor: (o) => o.items.length },
          { header: "Total", accessor: (o) => `₹${Number(o.total).toFixed(0)}` },
          { header: "Fulfillment", accessor: (o) => (o.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup") },
          {
            header: "Status",
            accessor: (o) => (
              <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-full bg-fnc-blue/10 text-fnc-blue">
                {statusLabels[o.status]}
              </span>
            ),
          },
          {
            header: "Placed",
            accessor: (o) =>
              new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          },
          {
            header: "",
            className: "text-right",
            accessor: (o) => (
              <OrderRowActions orderId={o.id} status={o.status} fulfillmentType={o.fulfillmentType} />
            ),
          },
        ]}
        rows={orders}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={sp} />
    </div>
  );
}
