"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import Table from "@/components/admin/Table";
import { processRefundAction } from "./actions";

const statusStyles = {
  PENDING: "text-fnc-blue bg-fnc-blue/10",
  APPROVED: "text-fnc-green bg-fnc-green/10",
  REJECTED: "text-fnc-red bg-fnc-red/10",
};

export default function RefundsClientPage({ refunds }) {
  const [pending, startTransition] = useTransition();
  const [notesById, setNotesById] = useState({});

  function handleProcess(refundId, status) {
    const notes = notesById[refundId] || "";
    startTransition(() => processRefundAction(refundId, status, notes));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Refund Requests</h1>

      <Table
        emptyMessage="No refund requests yet."
        columns={[
          { header: "Order", accessor: (r) => `#${r.orderId.slice(-8).toUpperCase()}` },
          { header: "Customer", accessor: (r) => r.order.customer.name },
          { header: "Store", accessor: (r) => r.order.store?.name ?? "—" },
          { header: "Amount", accessor: (r) => `₹${Number(r.amount).toFixed(2)}` },
          { header: "Reason", accessor: (r) => r.reason },
          {
            header: "Status",
            accessor: (r) => (
              <span className={`font-body text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[r.status] ?? "text-slate bg-warmwhite"}`}>
                {r.status}
              </span>
            ),
          },
          {
            header: "",
            className: "text-right",
            accessor: (r) =>
              r.status === "PENDING" ? (
                <div className="flex items-center gap-2 justify-end">
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notesById[r.id] || ""}
                    onChange={(e) => setNotesById((n) => ({ ...n, [r.id]: e.target.value }))}
                    className="h-9 px-2.5 rounded-lg border border-bordergray font-body text-xs w-40"
                  />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleProcess(r.id, "APPROVED")}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-fnc-green hover:bg-fnc-green/10 transition-colors disabled:opacity-50"
                    aria-label="Approve refund"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleProcess(r.id, "REJECTED")}
                    className="h-8 w-8 flex items-center justify-center rounded-full text-fnc-red hover:bg-fnc-red/10 transition-colors disabled:opacity-50"
                    aria-label="Reject refund"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span className="font-body text-xs text-slate">
                  {r.notes || "—"}
                </span>
              ),
          },
        ]}
        rows={refunds}
      />
    </div>
  );
}
