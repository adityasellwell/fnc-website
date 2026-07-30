import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CouponFormModal from "@/components/admin/CouponFormModal";
import { listCoupons } from "@/services/coupons";
import { createCouponAction, updateCouponAction, deleteCouponAction } from "./actions";

export const metadata = { title: "Coupons — Admin" };

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Coupons</h1>
        <CouponFormModal
          title="Add Coupon"
          action={createCouponAction}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Coupon
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No coupons yet."
        columns={[
          { header: "Code", accessor: (c) => <span className="font-semibold">{c.code}</span> },
          { header: "Discount", accessor: (c) => (c.type === "PERCENT" ? `${Number(c.value)}%` : `₹${Number(c.value)}`) },
          { header: "Applies To", accessor: (c) => c.appliesTo },
          { header: "Used", accessor: (c) => `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ""}` },
          {
            header: "Expires",
            accessor: (c) => new Date(c.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            header: "Status",
            accessor: (c) => (
              <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${c.active ? "text-fnc-green bg-fnc-green/10" : "text-slate bg-warmwhite"}`}>
                {c.active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            header: "",
            className: "text-right",
            accessor: (c) => (
              <div className="flex items-center gap-2 justify-end">
                <CouponFormModal
                  title="Edit Coupon"
                  coupon={c}
                  action={updateCouponAction.bind(null, c.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this coupon?"
                  description={`"${c.code}" will be permanently removed.`}
                  confirmLabel="Delete"
                  onConfirm={() => deleteCouponAction(c.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Delete" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
              </div>
            ),
          },
        ]}
        rows={coupons}
      />
    </div>
  );
}
