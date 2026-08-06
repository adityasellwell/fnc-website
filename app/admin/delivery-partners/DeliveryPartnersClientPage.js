"use client";

import { Plus, Pencil, KeyRound, Ban } from "lucide-react";
import Table from "@/components/admin/Table";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DeliveryPartnerFormModal from "@/components/admin/DeliveryPartnerFormModal";
import {
  createDeliveryPartnerAction,
  updateDeliveryPartnerAction,
  resetPartnerPinAction,
  deactivatePartnerAction,
} from "./actions";

const STATUS_STYLES = {
  AVAILABLE: "text-fnc-green bg-fnc-green/10",
  BUSY: "text-amber-600 bg-amber-50",
  OFFLINE: "text-slate bg-warmwhite",
};

export default function DeliveryPartnersClientPage({ partners, stores, scopedStoreId }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal">Delivery</h1>
          <p className="font-body text-sm text-slate mt-1">
            Add and manage delivery riders. They sign in separately at /delivery-partner/sign-in with their phone and PIN.
          </p>
        </div>
        <DeliveryPartnerFormModal
          title="Add Delivery Rider"
          action={createDeliveryPartnerAction}
          stores={stores}
          scopedStoreId={scopedStoreId}
          trigger={({ onClick }) => (
            <button type="button" onClick={onClick} className="h-10 px-4 rounded-full bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              Add Delivery Rider
            </button>
          )}
        />
      </div>

      <Table
        emptyMessage="No delivery riders yet."
        columns={[
          { header: "Name", accessor: (p) => p.name },
          { header: "Phone", accessor: (p) => p.phone },
          { header: "Store", accessor: (p) => p.store?.name || "—" },
          { header: "Vehicle", accessor: (p) => [p.vehicleType, p.vehicleNumber].filter(Boolean).join(" — ") || "—" },
          {
            header: "Status",
            accessor: (p) => (
              <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${p.isActive ? STATUS_STYLES[p.status] : "text-slate bg-warmwhite"}`}>
                {p.isActive ? p.status : "Deactivated"}
              </span>
            ),
          },
          {
            header: "",
            className: "text-right",
            accessor: (p) => (
              <div className="flex items-center gap-2 justify-end">
                <DeliveryPartnerFormModal
                  title="Edit Delivery Rider"
                  partner={p}
                  action={updateDeliveryPartnerAction.bind(null, p.id)}
                  stores={stores}
                  scopedStoreId={scopedStoreId}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Edit" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                <ConfirmDialog
                  title="Reset this rider's PIN?"
                  description={`A new PIN will be generated for ${p.name}. Their old PIN stops working immediately.`}
                  confirmLabel="Reset PIN"
                  onConfirm={async () => {
                    const res = await resetPartnerPinAction(p.id);
                    if (res?.pin) alert(`New PIN for ${p.name}: ${res.pin}`);
                  }}
                  trigger={({ onClick }) => (
                    <button type="button" onClick={onClick} aria-label="Reset PIN" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-charcoal hover:bg-warmwhite transition-colors">
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                  )}
                />
                {p.isActive && (
                  <ConfirmDialog
                    title="Deactivate this rider?"
                    description={`${p.name} will no longer be able to sign in or be assigned new orders.`}
                    confirmLabel="Deactivate"
                    onConfirm={() => deactivatePartnerAction(p.id)}
                    trigger={({ onClick }) => (
                      <button type="button" onClick={onClick} aria-label="Deactivate" className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors">
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    )}
                  />
                )}
              </div>
            ),
          },
        ]}
        rows={partners}
      />
    </div>
  );
}
