"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, X, UserPlus, Truck } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import Toast from "@/components/ui/Toast";
import { advanceOrderStatusAction, cancelOrderAction, assignDeliveryPartnerAction } from "@/app/admin/orders/actions";
import { getNextStatus, statusLabels, actionButtonLabels } from "@/lib/orderStatus";

export default function OrderRowActions({
  orderId,
  status,
  fulfillmentType,
  deliveryPartnerId,
  deliveryPartnerName,
  availablePartners = [],
}) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState(null);
  const [selectedRider, setSelectedRider] = useState(deliveryPartnerId || "");
  const next = getNextStatus(status, fulfillmentType);
  const isTerminal = status === "CANCELLED" || status === "REFUNDED" || status === "DELIVERED" || status === "COLLECTED";

  const isPrepared = status === "READY_FOR_PICKUP";
  const needsRiderAssignment = fulfillmentType === "DELIVERY" && isPrepared && (!selectedRider && !deliveryPartnerId);

  const handleAdvance = () => {
    startTransition(async () => {
      try {
        await advanceOrderStatusAction(orderId, status, fulfillmentType);
        const label = actionButtonLabels[next] || statusLabels[next] || next;
        setToast({ message: `Order updated: ${label}`, type: "success" });
      } catch (err) {
        setToast({ message: err?.message || "Failed to update status", type: "error" });
      }
    });
  };

  const handleRiderChange = (e) => {
    const partnerId = e.target.value;
    if (!partnerId) return;
    setSelectedRider(partnerId);
    startTransition(async () => {
      try {
        await assignDeliveryPartnerAction(orderId, partnerId);
        setToast({ message: "Delivery rider assigned! Ready for Out for Delivery.", type: "success" });
      } catch (err) {
        setToast({ message: err?.message || "Failed to assign rider", type: "error" });
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelOrderAction(orderId);
        setToast({ message: "Order cancelled successfully", type: "info" });
      } catch (err) {
        setToast({ message: err?.message || "Failed to cancel order", type: "error" });
      }
    });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* Main Order Action Button Workflow */}
      {next && (
        needsRiderAssignment ? (
          /* When order is prepared and needs a rider: main action button becomes Assign Rider select */
          <div className="relative shrink-0">
            <select
              value={selectedRider}
              onChange={handleRiderChange}
              disabled={pending}
              className="h-8 pl-8 pr-3 text-xs font-semibold rounded-full bg-fnc-blue text-white hover:bg-fnc-blue/90 transition-colors cursor-pointer outline-none shadow-sm appearance-none"
            >
              <option value="" className="bg-white text-charcoal font-semibold">
                + Assign Rider
              </option>
              {availablePartners.map((p) => (
                <option key={p.id} value={p.id} className="bg-white text-charcoal font-semibold">
                  {p.name} ({p.phone})
                </option>
              ))}
            </select>
            <Truck className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
          </div>
        ) : (
          /* Standard status transition button (Confirm Order -> Start Preparing -> Mark Prepared -> Out for Delivery) */
          <button
            type="button"
            disabled={pending}
            onClick={handleAdvance}
            className="h-8 px-3.5 rounded-full bg-fnc-red text-white font-body text-xs font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {actionButtonLabels[next] || statusLabels[next]}
          </button>
        )
      )}

      {/* Optional: if order is already out for delivery or prepared with a rider, show small rider pill */}
      {fulfillmentType === "DELIVERY" && (selectedRider || deliveryPartnerId) && !isTerminal && (
        <div className="relative shrink-0">
          <select
            value={selectedRider}
            onChange={handleRiderChange}
            disabled={pending}
            className="h-8 pl-7 pr-2.5 text-[11px] font-medium rounded-full bg-warmwhite border border-bordergray text-charcoal hover:bg-warmwhite/80 transition-colors cursor-pointer outline-none"
          >
            <option value="">{deliveryPartnerName ? `Rider: ${deliveryPartnerName}` : "Rider Assigned"}</option>
            {availablePartners.map((p) => (
              <option key={p.id} value={p.id}>
                Change: {p.name} ({p.phone})
              </option>
            ))}
          </select>
          <Truck className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
        </div>
      )}

      {!isTerminal && (
        <ConfirmDialog
          title="Cancel this order?"
          description="This can't be undone from here — the customer will need to be informed separately."
          confirmLabel="Cancel Order"
          onConfirm={handleCancel}
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors shrink-0"
              aria-label="Cancel order"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        />
      )}
    </div>
  );
}
