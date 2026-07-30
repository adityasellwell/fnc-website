"use client";

import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import BannerFormModal from "@/components/admin/BannerFormModal";
import { createBannerAction, updateBannerAction, deleteBannerAction } from "./actions";

export default function BannersClientPage({ banners }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Banners</h1>
        <BannerFormModal
          title="Add Banner"
          action={createBannerAction}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No banners yet — the homepage falls back to mock banners until one exists."
        columns={[
          {
            header: "Image",
            accessor: (b) => (
              <div className="relative h-12 w-20 rounded-lg overflow-hidden bg-warmwhite border border-bordergray">
                {b.image && <Image src={b.image} alt="" fill className="object-cover" />}
              </div>
            ),
          },
          { header: "Placement", accessor: (b) => b.placement },
          { header: "Title", accessor: (b) => b.title || "—" },
          { header: "Device", accessor: (b) => b.device },
          { header: "Priority", accessor: (b) => b.priority },
          {
            header: "",
            className: "text-right",
            accessor: (b) => (
              <div className="flex items-center gap-2 justify-end">
                <BannerFormModal
                  title="Edit Banner"
                  banner={b}
                  action={updateBannerAction.bind(null, b.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this banner?"
                  description="It will be permanently removed from the homepage rotation."
                  confirmLabel="Delete"
                  onConfirm={() => deleteBannerAction(b.id)}
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
        rows={banners}
      />
    </div>
  );
}
