import { TrendingUp, ShoppingBag, Receipt, Users } from "lucide-react";
import Table from "@/components/admin/Table";
import {
  getRevenueStats,
  getTopProducts,
  getCustomerBreakdown,
  getPopularSearches,
  getStoreBreakdown,
} from "@/services/analytics";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { db } from "@/lib/db";

export const metadata = { title: "Analytics — Admin" };

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-bordergray rounded-2xl p-5 flex items-center gap-4">
      <div className="h-11 w-11 shrink-0 rounded-full bg-fnc-red/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-fnc-red" />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-charcoal">{value}</p>
        <p className="font-body text-xs text-slate">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);

  const [revenue, topProducts, customers, popularSearches, storeBreakdown] = await Promise.all([
    getRevenueStats(storeId || undefined),
    getTopProducts(5, storeId || undefined),
    getCustomerBreakdown(storeId || undefined),
    getPopularSearches(),
    !storeId ? getStoreBreakdown() : Promise.resolve(null),
  ]);

  let lowStock = null;
  if (storeId) {
    lowStock = await db.storeInventory.findMany({
      where: { storeId, stock: { lte: 5 } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 10,
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">
        Analytics {storeId ? `— ${admin.store?.name || "My Store"}` : "— Platform Overview"}
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Revenue (paid orders)" value={`₹${revenue.revenue.toFixed(0)}`} />
        <StatCard icon={ShoppingBag} label="Orders (active)" value={revenue.orderCount} />
        <StatCard icon={Receipt} label="Avg. Order Value" value={`₹${revenue.averageOrderValue.toFixed(0)}`} />
        <StatCard icon={Users} label="Customers" value={customers.totalCustomers} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal mb-3">Top Products</h2>
          <Table
            emptyMessage="No sales yet."
            columns={[
              { header: "Product", accessor: (p) => p.name },
              { header: "Units Sold", accessor: (p) => p.unitsSold, className: "text-right" },
            ]}
            rows={topProducts}
            keyField="productId"
          />
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-charcoal mb-3">Popular Searches</h2>
          <Table
            emptyMessage="No searches logged yet."
            columns={[
              { header: "Query", accessor: (s) => s.query },
              { header: "Times Searched", accessor: (s) => s.count, className: "text-right" },
            ]}
            rows={popularSearches}
            keyField="query"
          />
        </div>
      </div>

      {storeBreakdown && (
        <div className="mt-8 bg-white border border-bordergray rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-charcoal mb-4">Per-Store Sales Breakdown</h2>
          <Table
            emptyMessage="No store data available."
            columns={[
              { header: "Store", accessor: (s) => s.storeName },
              { header: "Revenue", accessor: (s) => `₹${s.revenue.toFixed(0)}`, className: "text-right" },
              { header: "Active Orders", accessor: (s) => s.orderCount, className: "text-right" },
              { header: "Avg. Order Value", accessor: (s) => `₹${s.averageOrderValue.toFixed(0)}`, className: "text-right" },
              { header: "Cancelled Orders", accessor: (s) => s.cancelledCount, className: "text-right" },
            ]}
            rows={storeBreakdown}
            keyField="storeId"
          />
        </div>
      )}

      {lowStock && lowStock.length > 0 && (
        <div className="mt-8 bg-white border border-bordergray rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-fnc-red mb-3">Low Stock Warnings ({lowStock.length})</h2>
          <Table
            emptyMessage="All items are well stocked!"
            columns={[
              { header: "Product", accessor: (i) => i.product.name },
              { header: "Stock", accessor: (i) => (
                <span className="font-semibold text-fnc-red">{i.stock} {i.product.unit}</span>
              ), className: "text-right" }
            ]}
            rows={lowStock}
            keyField="id"
          />
        </div>
      )}

      <div className="bg-white border border-bordergray rounded-2xl p-6 mt-6">
        <h2 className="font-display text-lg font-bold text-charcoal mb-4">New vs. Returning Customers</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="font-display text-2xl font-bold text-charcoal">{customers.oneTime}</p>
            <p className="font-body text-xs text-slate">One-time customers</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-fnc-green">{customers.returning}</p>
            <p className="font-body text-xs text-slate">Returning customers (2+ orders)</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-charcoal">{revenue.cancelledCount}</p>
            <p className="font-body text-xs text-slate">Cancelled orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}
