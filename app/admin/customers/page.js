import Link from "next/link";
import Table from "@/components/admin/Table";
import Pagination from "@/components/admin/Pagination";
import Filters from "@/components/admin/Filters";
import { listCustomers } from "@/services/customers";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";

export const metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage({ searchParams }) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const { customers, totalPages } = await listCustomers({
    search: sp.search || undefined,
    page,
    storeId: storeId || undefined,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Customers</h1>

      <Filters fields={[{ key: "search", label: "Search name, email or phone", type: "search" }]} />

      <Table
        emptyMessage="No customers match this search."
        columns={[
          { header: "Name", accessor: (c) => c.name },
          { header: "Email", accessor: (c) => c.email },
          { header: "Phone", accessor: (c) => c.phone ?? "—" },
          { header: "Orders", accessor: (c) => c._count.orders },
          { header: "Account", accessor: (c) => (c.authUid ? "Registered" : "Guest") },
          {
            header: "",
            className: "text-right",
            accessor: (c) => (
              <Link href={`/admin/customers/${c.id}`} className="font-body text-xs font-semibold text-fnc-red hover:underline">
                View
              </Link>
            ),
          },
        ]}
        rows={customers}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={sp} />
    </div>
  );
}
