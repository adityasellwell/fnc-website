"use client";

import { Plus, Pencil, Trash2 } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StoreFormModal from "@/components/admin/StoreFormModal";
import { createStoreAction, updateStoreAction, deleteStoreAction } from "./actions";

export default function StoresClientPage({ stores }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Stores</h1>
        <StoreFormModal
          title="Add Store"
          action={createStoreAction}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Add Store
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No stores yet."
        columns={[
          { header: "Name", accessor: (s) => s.name },
          { header: "City", accessor: (s) => `${s.city}, ${s.state}` },
          {
            header: "Status",
            accessor: (s) => (
              <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === "ACTIVE" ? "text-fnc-green bg-fnc-green/10" : "text-fnc-blue bg-fnc-blue/10"}`}>
                {s.status === "ACTIVE" ? "Active" : "Coming Soon"}
              </span>
            ),
          },
          { header: "Delivery", accessor: (s) => (s.deliveryAvailable ? "Yes" : "No") },
          { header: "Pickup", accessor: (s) => (s.pickupAvailable ? "Yes" : "No") },
          {
            header: "",
            className: "text-right",
            accessor: (s) => (
              <div className="flex items-center gap-2 justify-end">
                <StoreFormModal
                  title="Edit Store"
                  store={s}
                  action={updateStoreAction.bind(null, s.id)}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Delete this store?"
                  description={`"${s.name}" will be permanently removed.`}
                  confirmLabel="Delete"
                  onConfirm={() => deleteStoreAction(s.id)}
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
        rows={stores}
      />
    </div>
  );
}
