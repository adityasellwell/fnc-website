"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CouponFormModal from "@/components/admin/CouponFormModal";
import { createPromotionAction, updatePromotionAction, deletePromotionAction } from "./actions";

function formatDiscount(p) {
  if (p.discountType === "PERCENT") return `${Number(p.value)}%`;
  if (p.discountType === "FLAT") return `₹${Number(p.value)}`;
  return "Buy One Get One";
}

export default function CouponsClientPage({ initialCoupons, categories = [], products = [] }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Coupons &amp; Promotions</h1>
        <CouponFormModal
          title="Add Promotion"
          action={createPromotionAction}
          categories={categories}
          products={products}
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Promotion
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No promotions yet."
        columns={[
          { header: "Title", accessor: (p) => p.title },
          { header: "Code", accessor: (p) => (p.code ? <span className="font-semibold">{p.code}</span> : <span className="text-slate">— (offer)</span>) },
          { header: "Discount", accessor: (p) => formatDiscount(p) },
          {
            header: "Applies To",
            accessor: (p) => {
              if (p.appliesTo === "PRODUCT") {
                const names = (p.scopeProducts ?? []).map((sp) => products.find((pr) => pr.id === sp.id)?.name).filter(Boolean);
                return names.length > 0 ? names.join(", ") : "Specific products (none selected)";
              }
              if (p.appliesTo === "CATEGORY") {
                return categories.find((c) => c.id === p.scopeCategoryId)?.name || "Specific category (none selected)";
              }
              return "Whole cart";
            },
          },
          { header: "Used", accessor: (p) => `${p.usedCount}${p.usageLimit ? ` / ${p.usageLimit}` : ""}` },
          {
            header: "Ends",
            accessor: (p) => (p.endsAt ? new Date(p.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No expiry"),
          },
          {
            header: "Status",
            accessor: (p) => (
              <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${p.active ? "text-fnc-green bg-fnc-green/10" : "text-slate bg-warmwhite"}`}>
                {p.active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            header: "",
            className: "text-right",
            accessor: (p) => (
              <div className="flex items-center gap-2 justify-end">
                <CouponFormModal
                  title="Edit Promotion"
                  coupon={p}
                  action={updatePromotionAction.bind(null, p.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this promotion?"
                  description={`"${p.title}" will be permanently removed.`}
                  confirmLabel="Delete"
                  onConfirm={() => deletePromotionAction(p.id)}
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
        rows={initialCoupons}
      />
    </div>
  );
}
