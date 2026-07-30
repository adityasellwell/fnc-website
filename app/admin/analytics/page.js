import { TrendingUp, ShoppingBag, Receipt, Users } from "lucide-react";
import Table from "@/components/admin/Table";
import {
  getRevenueStats,
  getTopProducts,
  getCustomerBreakdown,
  getPopularSearches,
} from "@/services/analytics";

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
  const [revenue, topProducts, customers, popularSearches] = await Promise.all([
    getRevenueStats(),
    getTopProducts(),
    getCustomerBreakdown(),
    getPopularSearches(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Analytics</h1>

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
