"use client";

import { useTransition } from "react";
import { ChevronRight, Loader2, X } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import { advanceOrderStatusAction, cancelOrderAction } from "@/app/admin/orders/actions";
import { getNextStatus } from "@/lib/orderStatus";

const statusLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for Pickup",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export default function OrderRowActions({ orderId, status, fulfillmentType }) {
  const [pending, startTransition] = useTransition();
  const next = getNextStatus(status, fulfillmentType);
  const isTerminal = status === "CANCELLED" || status === "REFUNDED" || status === "DELIVERED" || status === "COLLECTED";

  return (
    <div className="flex items-center gap-2 justify-end">
      {next && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => advanceOrderStatusAction(orderId, status, fulfillmentType))}
          className="h-8 px-3 rounded-full bg-fnc-red text-white font-body text-xs font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60 flex items-center gap-1"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
          {statusLabels[next]}
        </button>
      )}
      {!isTerminal && (
        <ConfirmDialog
          title="Cancel this order?"
          description="This can't be undone from here — the customer will need to be informed separately."
          confirmLabel="Cancel Order"
          onConfirm={() => cancelOrderAction(orderId)}
          trigger={({ onClick }) => (
            <button
              type="button"
              onClick={onClick}
              className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:text-fnc-red hover:bg-warmwhite transition-colors"
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
