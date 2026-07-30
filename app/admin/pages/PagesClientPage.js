"use client";

import { Plus, Pencil } from "lucide-react";
import Table from "@/components/admin/Table";
import PageFormModal from "@/components/admin/PageFormModal";
import { savePageAction } from "./actions";

const KNOWN_SLUGS = ["privacy-policy", "terms", "refund-policy", "shipping-policy"];

export default function PagesClientPage({ pages }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Pages</h1>
        <PageFormModal
          title="Add Page"
          action={savePageAction}
          knownSlugs={KNOWN_SLUGS}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Page
            </button>
          )}
        />
      </div>

      <p className="font-body text-sm text-slate mb-5">
        Privacy Policy, Terms, Refund Policy, and Shipping Policy live here — editing one updates
        the real live page immediately.
      </p>

      <Table
        emptyMessage="No pages yet."
        columns={[
          { header: "Title", accessor: (p) => p.title },
          { header: "Slug", accessor: (p) => `/${p.slug}` },
          {
            header: "Last Updated",
            accessor: (p) => new Date(p.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
          {
            header: "",
            className: "text-right",
            accessor: (p) => (
              <PageFormModal
                title={`Edit ${p.title}`}
                page={p}
                action={savePageAction}
                knownSlugs={KNOWN_SLUGS}
                trigger={({ onClick }) => (
                  <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              />
            ),
          },
        ]}
        rows={pages}
      />
    </div>
  );
}
