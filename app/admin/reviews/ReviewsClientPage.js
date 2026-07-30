"use client";

import { Trash2, Star } from "lucide-react";
import Table from "@/components/admin/Table";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { deleteReviewAction } from "./actions";

export default function ReviewsClientPage({ reviews, page, totalPages, searchParams }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Reviews</h1>

      <Table
        emptyMessage="No reviews yet."
        columns={[
          { header: "Author", accessor: (r) => r.authorName },
          {
            header: "Rating",
            accessor: (r) => (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-fnc-red text-fnc-red" : "text-bordergray"}`} />
                ))}
              </div>
            ),
          },
          { header: "Comment", accessor: (r) => <span className="line-clamp-2 max-w-xs block">{r.comment}</span> },
          { header: "On", accessor: (r) => r.product?.name ?? r.store?.name ?? "—" },
          {
            header: "Date",
            accessor: (r) => new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            header: "",
            className: "text-right",
            accessor: (r) => (
              <ConfirmDialog
                title="Delete this review?"
                description="This will be permanently removed and the product's rating will be recalculated."
                confirmLabel="Delete"
                onConfirm={() => deleteReviewAction(r.id)}
                trigger={({ onClick }) => (
                  <button type="button" onClick={onClick} aria-label="Delete" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              />
            ),
          },
        ]}
        rows={reviews}
      />

      <Pagination page={page} totalPages={totalPages} searchParams={searchParams} />
    </div>
  );
}
