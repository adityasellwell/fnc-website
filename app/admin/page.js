import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ShoppingBag, DollarSign, AlertTriangle, Store, ArrowRight } from "lucide-react";
import AdminProfileClient from "./AdminProfileClient";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  
  const where = storeId ? { storeId } : {};

  // Query counts and stats
  const [totalOrders, completedOrders, lowStockProducts, recentOrders, scopedStore] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where: { ...where, paymentStatus: "PAID" },
      select: { total: true }
    }),
    db.product.findMany({
      where: {
        storeInventory: {
          some: {
            ...(storeId ? { storeId } : {}),
            stock: { lte: 5 }
          }
        }
      },
      select: { name: true }
    }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { store: { select: { name: true } } }
    }),
    storeId ? db.store.findUnique({ where: { id: storeId } }) : null
  ]);

  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const lowStockCount = lowStockProducts.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Admin Dashboard</h1>
        <p className="font-body text-xs text-slate mt-1">
          Welcome back, <span className="font-semibold text-charcoal">{admin.name}</span>. Here is a summary of activities.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-white border border-bordergray rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-fnc-green/10 text-fnc-green flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Total Revenue</span>
            <span className="font-display text-lg font-black text-charcoal truncate block mt-0.5">
              ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-bordergray rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-fnc-red/10 text-fnc-red flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Total Orders</span>
            <span className="font-display text-lg font-black text-charcoal truncate block mt-0.5">
              {totalOrders}
            </span>
          </div>
        </div>

        {/* Store */}
        <div className="bg-white border border-bordergray rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-charcoal/10 text-charcoal flex items-center justify-center shrink-0">
            <Store className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Store Scoping</span>
            <span className="font-display text-sm font-bold text-charcoal truncate block mt-0.5">
              {scopedStore?.name || "Global (All Stores)"}
            </span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-bordergray rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate uppercase tracking-wider block">Low Stock Alerts</span>
            <span className="font-display text-lg font-black text-charcoal truncate block mt-0.5">
              {lowStockCount} items
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Profile Settings */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-bordergray rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-charcoal flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-fnc-red" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-fnc-red hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm text-charcoal border-collapse">
              <thead>
                <tr className="border-b border-bordergray text-slate text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Order ID</th>
                  <th className="pb-3 pr-4">Store</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bordergray/50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate font-medium">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-warmwhite/30 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs font-semibold text-charcoal">
                        #{order.id.slice(-8)}
                      </td>
                      <td className="py-3 pr-4 text-xs font-medium text-slate">
                        {order.store?.name || "Global"}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-charcoal">
                        ₹{Number(order.total).toFixed(0)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          ["DELIVERED", "COLLECTED"].includes(order.status)
                            ? "bg-fnc-green/10 text-fnc-green"
                            : ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status)
                            ? "bg-fnc-red/10 text-fnc-red"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {order.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="h-7 px-3 rounded-full border border-bordergray hover:border-charcoal hover:text-fnc-red transition-all font-body text-xs font-semibold inline-flex items-center"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Profile Settings */}
        <AdminProfileClient
          initialName={admin.name}
          email={admin.email}
          role={admin.role.name}
          storeName={scopedStore?.name}
        />
      </div>
    </div>
  );
}
