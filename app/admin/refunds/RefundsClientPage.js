"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Loader2,
  RefreshCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Ban,
  ImageIcon,
} from "lucide-react";
import { processRefundAction } from "./actions";

const STATUS_STYLES = {
  REQUESTED:    { label: "Requested",    className: "text-amber-600 bg-amber-50 border-amber-200" },
  UNDER_REVIEW: { label: "Under Review", className: "text-blue-600 bg-blue-50 border-blue-200" },
  APPROVED:     { label: "Approved",     className: "text-fnc-green bg-fnc-green/10 border-fnc-green/20" },
  PROCESSING:   { label: "Processing",   className: "text-fnc-green bg-fnc-green/10 border-fnc-green/20" },
  REFUNDED:     { label: "Refunded",     className: "text-fnc-green bg-fnc-green/10 border-fnc-green/20" },
  REJECTED:     { label: "Rejected",     className: "text-fnc-red bg-fnc-red/10 border-fnc-red/20" },
  CANCELLED:    { label: "Withdrawn",    className: "text-slate bg-warmwhite border-bordergray" },
};

const CATEGORY_LABELS = {
  ITEM_NOT_RECEIVED:  "Item Not Received",
  ITEM_DAMAGED:       "Item Damaged / Spoiled",
  WRONG_ITEM:         "Wrong Item Received",
  QUALITY_ISSUE:      "Quality Issue",
  DELIVERY_CANCELLED: "Delivery Cancelled",
  DUPLICATE_ORDER:    "Duplicate / Mistake Order",
  OTHER:              "Other",
};

export default function RefundsClientPage({ refunds }) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(null); // refund being reviewed
  const [adminNotes, setAdminNotes] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Same fix as the admin Modal component: Lenis (global smooth-scroll)
  // hijacks wheel events for the whole page independent of CSS, so it has
  // to be explicitly paused while this custom review modal is open.
  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    window.__lenis?.stop();
    return () => {
      document.body.style.overflow = "";
      window.__lenis?.start();
    };
  }, [selected]);

  const openModal = (refund) => {
    setSelected(refund);
    setAdminNotes("");
    setFinalAmount(Number(refund.amount).toFixed(2));
  };

  const closeModal = () => {
    setSelected(null);
    setAdminNotes("");
    setFinalAmount("");
  };

  const handleProcess = (decision) => {
    if (!selected) return;
    const amount = parseFloat(finalAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid refund amount", "error");
      return;
    }
    if (amount > Number(selected.order.total)) {
      showToast(`Amount cannot exceed order total ₹${Number(selected.order.total).toFixed(2)}`, "error");
      return;
    }

    startTransition(async () => {
      const res = await processRefundAction(selected.id, decision, adminNotes, amount);
      if (res.ok) {
        showToast(
          decision === "APPROVED"
            ? "Refund approved and processed via Razorpay ✓"
            : "Refund request rejected.",
          decision === "APPROVED" ? "success" : "info"
        );
        closeModal();
      } else {
        showToast(res.error || "Something went wrong", "error");
      }
    });
  };

  const actionableRefunds = refunds.filter((r) => ["REQUESTED", "UNDER_REVIEW"].includes(r.status));
  const processedRefunds = refunds.filter((r) => !["REQUESTED", "UNDER_REVIEW"].includes(r.status));

  return (
    <div className="flex flex-col gap-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white font-body text-sm font-semibold ${
            toast.type === "error" ? "bg-fnc-red" : "bg-fnc-green"
          }`}
        >
          {toast.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Refund Requests</h1>
        <p className="font-body text-sm text-slate mt-1">Review, approve, or reject customer refund requests.</p>
      </div>

      {/* Actionable requests */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-base font-semibold text-charcoal flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          Pending Review
          {actionableRefunds.length > 0 && (
            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-fnc-red text-white font-body text-xs font-bold flex items-center justify-center">
              {actionableRefunds.length}
            </span>
          )}
        </h2>

        {actionableRefunds.length === 0 ? (
          <div className="bg-white border border-bordergray rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-fnc-green mx-auto mb-3" />
            <p className="font-display text-base font-semibold text-charcoal">All caught up!</p>
            <p className="font-body text-sm text-slate mt-1">No refund requests pending review.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actionableRefunds.map((r) => (
              <RefundCard key={r.id} refund={r} onReview={openModal} />
            ))}
          </div>
        )}
      </div>

      {/* Processed requests */}
      {processedRefunds.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-base font-semibold text-charcoal flex items-center gap-2">
            <RefreshCcw className="h-4 w-4 text-slate" />
            Processed
          </h2>
          <div className="flex flex-col gap-3">
            {processedRefunds.map((r) => (
              <RefundCard key={r.id} refund={r} onReview={null} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="thin-scrollbar bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" data-lenis-prevent>
            <div className="flex items-center justify-between p-6 border-b border-bordergray">
              <h2 className="font-display text-lg font-bold text-charcoal">Review Refund Request</h2>
              <button onClick={closeModal} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-warmwhite text-slate">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Order & Customer Info */}
              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Order" value={
                  <Link href={`/admin/orders/${selected.orderId}`} className="text-fnc-red font-bold flex items-center gap-1 hover:underline">
                    #{selected.orderId.slice(-8).toUpperCase()}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                } />
                <InfoBox label="Order Total" value={`₹${Number(selected.order.total).toFixed(2)}`} />
                <InfoBox label="Customer" value={selected.order.customer.name} />
                <InfoBox label="Phone" value={selected.order.customer.phone || "—"} />
                <InfoBox label="Email" value={selected.order.customer.email} />
                <InfoBox label="Store" value={selected.order.store?.name || "—"} />
              </div>

              {/* Payment IDs */}
              {selected.order.razorpayPaymentId && (
                <div className="bg-warmwhite rounded-xl p-3">
                  <p className="font-body text-xs text-slate font-semibold mb-1">Razorpay Payment ID</p>
                  <p className="font-body text-xs font-mono text-charcoal break-all">
                    {selected.order.razorpayPaymentId}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs font-semibold text-slate uppercase tracking-wide">
                    Reason Category
                  </span>
                  <span className="font-body text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {CATEGORY_LABELS[selected.category] || selected.category}
                  </span>
                </div>
                <div className="bg-warmwhite rounded-xl p-3">
                  <p className="font-body text-sm text-charcoal">{selected.reason || "No details provided"}</p>
                </div>
              </div>

              {/* Photo evidence */}
              {selected.photoUrl && (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-xs font-semibold text-slate uppercase tracking-wide">Evidence Photo</p>
                  <a href={selected.photoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-fnc-red text-sm font-semibold hover:underline">
                    <ImageIcon className="h-4 w-4" />
                    View Photo
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <hr className="border-bordergray" />

              {/* Refund Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={Number(selected.order.total)}
                  value={finalAmount}
                  onChange={(e) => setFinalAmount(e.target.value)}
                  disabled={pending}
                  className="h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none disabled:opacity-60"
                />
                <p className="font-body text-xs text-slate">
                  Pre-filled with the order total. You can reduce it for a partial refund.
                </p>
              </div>

              {/* Admin Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs font-semibold text-charcoal">
                  Admin Notes{" "}
                  <span className="font-normal text-slate">(shown to customer if rejected)</span>
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes or reason for rejection..."
                  rows={3}
                  disabled={pending}
                  className="px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none resize-none disabled:opacity-60"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleProcess("REJECTED")}
                  disabled={pending}
                  className="flex-1 h-11 rounded-2xl border-2 border-fnc-red text-fnc-red font-body text-sm font-bold hover:bg-fnc-red hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </button>
                <button
                  onClick={() => handleProcess("APPROVED")}
                  disabled={pending}
                  className="flex-1 h-11 rounded-2xl bg-fnc-green text-white font-body text-sm font-bold hover:bg-fnc-green/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve & Refund
                </button>
              </div>

              {pending && (
                <p className="font-body text-xs text-center text-slate animate-pulse">
                  Contacting Razorpay... please wait
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RefundCard({ refund, onReview }) {
  const s = STATUS_STYLES[refund.status] || STATUS_STYLES.REQUESTED;
  const isPending = ["REQUESTED", "UNDER_REVIEW"].includes(refund.status);

  return (
    <div className={`bg-white border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isPending ? "border-amber-200 shadow-sm" : "border-bordergray"}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-sm font-bold text-charcoal">
            #{refund.orderId.slice(-8).toUpperCase()}
          </span>
          <span className={`font-body text-xs font-semibold px-2.5 py-0.5 rounded-full border ${s.className}`}>
            {s.label}
          </span>
          <span className="font-body text-xs font-semibold px-2 py-0.5 rounded-full bg-warmwhite text-slate border border-bordergray">
            {CATEGORY_LABELS[refund.category] || "Other"}
          </span>
        </div>
        <p className="font-body text-sm text-charcoal mt-1.5">
          <span className="font-semibold">{refund.order.customer.name}</span>
          {refund.order.customer.phone && (
            <span className="text-slate"> · {refund.order.customer.phone}</span>
          )}
        </p>
        <p className="font-body text-xs text-slate mt-0.5 line-clamp-1">{refund.reason}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <p className="font-display text-base font-bold text-charcoal">
          ₹{Number(refund.amount).toFixed(2)}
        </p>
        <p className="font-body text-xs text-slate">
          {new Date(refund.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        {onReview && (
          <button
            onClick={() => onReview(refund)}
            className="h-9 px-4 rounded-xl bg-charcoal text-white font-body text-xs font-semibold hover:bg-charcoal/90 transition-colors"
          >
            Review
          </button>
        )}
        {refund.razorpayRefundId && (
          <p className="font-body text-xs text-slate font-mono">
            {refund.razorpayRefundId.slice(0, 16)}…
          </p>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-warmwhite rounded-xl p-3">
      <p className="font-body text-xs font-semibold text-slate uppercase tracking-wide mb-1">{label}</p>
      <div className="font-body text-sm text-charcoal font-semibold">{value}</div>
    </div>
  );
}
