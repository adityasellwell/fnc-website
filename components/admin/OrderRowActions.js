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

  const needsRiderBeforeDispatch =
    fulfillmentType === "DELIVERY" &&
    next === "OUT_FOR_DELIVERY" &&
    !deliveryPartnerId;

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
        setToast({ message: "Delivery rider assigned cleanly!", type: "success" });
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

      {/* Quick Rider Assignment Dropdown for Delivery Orders */}
      {fulfillmentType === "DELIVERY" && !isTerminal && (
        <div className="relative shrink-0">
          <select
            value={selectedRider}
            onChange={handleRiderChange}
            disabled={pending}
            className={`h-8 pl-7 pr-3 text-xs font-semibold rounded-full border transition-colors cursor-pointer outline-none ${
              selectedRider
                ? "bg-warmwhite border-bordergray text-charcoal"
                : "bg-fnc-blue/10 border-fnc-blue/30 text-fnc-blue animate-pulse"
            }`}
          >
            <option value="">{selectedRider ? (deliveryPartnerName ? `Rider: ${deliveryPartnerName}` : "Assigned Rider") : "+ Assign Rider"}</option>
            {availablePartners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.phone})
              </option>
            ))}
          </select>
          <Truck className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/70 pointer-events-none" />
        </div>
      )}

      {next && (
        needsRiderBeforeDispatch ? (
          <Link
            href={`/admin/orders/${orderId}`}
            className="h-8 px-3 rounded-full bg-fnc-blue text-white font-body text-xs font-semibold hover:bg-fnc-blue/90 transition-colors flex items-center gap-1 shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign Rider
          </Link>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={handleAdvance}
            className="h-8 px-3 rounded-full bg-fnc-red text-white font-body text-xs font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-1 shrink-0"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
            {actionButtonLabels[next] || statusLabels[next]}
          </button>
        )
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
