"use client";

import { useState, useTransition } from "react";
import {
  cancelOrderAction,
  requestRefundAction,
  cancelRefundRequestAction,
} from "./actions";
import {
  X,
  RotateCcw,
  Upload,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REASON_CATEGORIES = [
  { value: "ITEM_NOT_RECEIVED", label: "I did not receive my order" },
  { value: "ITEM_DAMAGED", label: "Item arrived damaged or spoiled" },
  { value: "WRONG_ITEM", label: "I received wrong items" },
  { value: "QUALITY_ISSUE", label: "Product quality was not satisfactory" },
  { value: "DELIVERY_CANCELLED", label: "Delivery was cancelled mid-way" },
  { value: "DUPLICATE_ORDER", label: "I placed this order by mistake" },
  { value: "OTHER", label: "Other reason" },
];

const REFUND_STATUS_STEPS = [
  {
    key: "REQUESTED",
    label: "Request Submitted",
    desc: "Your refund request has been submitted and is under review.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock3,
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review",
    desc: "Our team is actively reviewing your refund request.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Loader2,
  },
  {
    key: "APPROVED",
    label: "Approved",
    desc: "Refund approved. Processing your payment now.",
    color: "text-fnc-green",
    bg: "bg-fnc-green/5",
    border: "border-fnc-green/20",
    icon: CheckCircle2,
  },
  {
    key: "PROCESSING",
    label: "Processing",
    desc: "Razorpay is processing your refund.",
    color: "text-fnc-green",
    bg: "bg-fnc-green/5",
    border: "border-fnc-green/20",
    icon: Loader2,
  },
  {
    key: "REFUNDED",
    label: "Refunded",
    desc: "Amount credited back to your original payment method.",
    color: "text-fnc-green",
    bg: "bg-fnc-green/5",
    border: "border-fnc-green/20",
    icon: CheckCircle2,
  },
];

const CANCELLED_STATUS = {
  key: "CANCELLED",
  label: "Request Withdrawn",
  desc: "You cancelled this refund request.",
  color: "text-slate",
  bg: "bg-warmwhite",
  border: "border-bordergray",
  icon: Ban,
};

const REJECTED_STATUS = {
  key: "REJECTED",
  label: "Request Rejected",
  desc: "We could not process a refund for this order.",
  color: "text-fnc-red",
  bg: "bg-fnc-red/5",
  border: "border-fnc-red/20",
  icon: X,
};

/** Returns whether cancel button should be shown */
export function canCancelOrder(order) {
  return ["PLACED", "CONFIRMED"].includes(order.status) && !["CANCELLED", "REFUNDED"].includes(order.status);
}

/** Returns whether refund request button should be shown */
export function canRequestRefund(order) {
  if (!["PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "READY_FOR_PICKUP", "COLLECTED"].includes(order.status)) return false;
  if (order.paymentStatus !== "PAID") return false;
  if (order.refundRequest) return false;
  // 24h window for delivered/collected
  if (["DELIVERED", "COLLECTED"].includes(order.status)) {
    const hoursSince = (Date.now() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince > 24) return false;
  }
  return true;
}

export default function OrderActions({ order }) {
  const [pending, startTransition] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [category, setCategory] = useState("");
  const [reason, setReason] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelOrderAction(order.id);
      if (res.ok) {
        showToast(
          res.wasRefunded
            ? "Order cancelled. Your refund is being processed."
            : "Order cancelled successfully.",
          "success"
        );
        setShowCancelConfirm(false);
      } else {
        showToast(res.error, "error");
      }
    });
  };

  const handleRefundSubmit = (e) => {
    e.preventDefault();
    if (!category) { showToast("Please select a reason", "error"); return; }
    if (reason.trim().length < 10) { showToast("Please describe the issue in more detail", "error"); return; }

    startTransition(async () => {
      const res = await requestRefundAction(order.id, { category, reason, photoUrl: photoUrl || null });
      if (res.ok) {
        showToast("Refund request submitted. We'll review it within 24–48 hours.", "success");
        setShowRefundForm(false);
      } else {
        showToast(res.error, "error");
      }
    });
  };

  const handleCancelRefund = () => {
    if (!order.refundRequest) return;
    startTransition(async () => {
      const res = await cancelRefundRequestAction(order.refundRequest.id, order.id);
      if (res.ok) {
        showToast("Refund request withdrawn.", "success");
      } else {
        showToast(res.error, "error");
      }
    });
  };

  const showCancel = canCancelOrder(order);
  const showRefund = canRequestRefund(order);
  const refund = order.refundRequest;

  // Get current refund status display
  const getRefundStatusDisplay = () => {
    if (!refund) return null;
    if (refund.status === "REJECTED") return REJECTED_STATUS;
    if (refund.status === "CANCELLED") return CANCELLED_STATUS;
    return REFUND_STATUS_STEPS.find((s) => s.key === refund.status) || null;
  };

  const refundStatusDisplay = getRefundStatusDisplay();
  const activeRefundStepIndex = REFUND_STATUS_STEPS.findIndex((s) => s.key === refund?.status);

  if (!showCancel && !showRefund && !refund) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white font-body text-sm font-semibold transition-all",
            toast.type === "error" ? "bg-fnc-red" : "bg-fnc-green"
          )}
        >
          {toast.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* ─── Cancel Order ─── */}
      {showCancel && !showCancelConfirm && (
        <button
          onClick={() => setShowCancelConfirm(true)}
          disabled={pending}
          className="h-11 w-full rounded-2xl border-2 border-fnc-red text-fnc-red font-body text-sm font-bold hover:bg-fnc-red hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel Order
        </button>
      )}

      {showCancelConfirm && (
        <div className="rounded-2xl border-2 border-fnc-red/30 bg-fnc-red/5 p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-fnc-red shrink-0 mt-0.5" />
            <div>
              <p className="font-display font-bold text-charcoal text-sm">Cancel this order?</p>
              <p className="font-body text-xs text-slate mt-1">
                {order.paymentStatus === "PAID"
                  ? "A full refund of ₹" + Number(order.total).toFixed(0) + " will be automatically initiated to your original payment method."
                  : "No payment has been charged."}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              disabled={pending}
              className="flex-1 h-10 rounded-xl border border-bordergray font-body text-sm font-semibold text-charcoal hover:bg-warmwhite transition-colors"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancel}
              disabled={pending}
              className="flex-1 h-10 rounded-xl bg-fnc-red text-white font-body text-sm font-bold hover:bg-fnc-red/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Yes, Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Refund Request Form ─── */}
      {showRefund && !refund && (
        <>
          {!showRefundForm ? (
            <button
              onClick={() => setShowRefundForm(true)}
              disabled={pending}
              className="h-11 w-full rounded-2xl border-2 border-amber-400 text-amber-700 font-body text-sm font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Request Refund
            </button>
          ) : (
            <div className="rounded-2xl border border-bordergray bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-charcoal">Request a Refund</h3>
                <button onClick={() => setShowRefundForm(false)} className="text-slate hover:text-charcoal">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleRefundSubmit} className="flex flex-col gap-4">
                {/* Reason Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-charcoal">
                    What went wrong? <span className="text-fnc-red">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      disabled={pending}
                      className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none appearance-none disabled:opacity-60"
                    >
                      <option value="">Select a reason...</option>
                      {REASON_CATEGORIES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate pointer-events-none" />
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-charcoal">
                    Describe the issue <span className="text-fnc-red">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide details about the problem..."
                    required
                    minLength={10}
                    rows={3}
                    disabled={pending}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none resize-none disabled:opacity-60"
                  />
                </div>

                {/* Photo URL (Firebase Storage URL from client-side upload) */}
                {["ITEM_DAMAGED", "WRONG_ITEM", "QUALITY_ISSUE"].includes(category) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-body text-xs font-semibold text-charcoal flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Evidence Photo URL <span className="text-slate font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Paste a photo URL (Firebase, Imgur, etc.)"
                      disabled={pending}
                      className="w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none disabled:opacity-60"
                    />
                    <p className="font-body text-xs text-slate">
                      Adding a photo speeds up our review process.
                    </p>
                  </div>
                )}

                {/* Refund Amount Info */}
                <div className="flex items-center justify-between bg-warmwhite rounded-xl px-4 py-3">
                  <span className="font-body text-sm text-slate">Refund Amount</span>
                  <span className="font-display text-base font-bold text-charcoal">
                    ₹{Number(order.total).toFixed(0)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRefundForm(false)}
                    disabled={pending}
                    className="flex-1 h-11 rounded-xl border border-bordergray font-body text-sm font-semibold text-charcoal hover:bg-warmwhite transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 h-11 rounded-xl bg-amber-500 text-white font-body text-sm font-bold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* ─── Refund Status Timeline ─── */}
      {refund && refundStatusDisplay && (
        <div className={cn("rounded-2xl border p-5", refundStatusDisplay.border, refundStatusDisplay.bg)}>
          <h3 className="font-display text-sm font-bold text-charcoal mb-4">Refund Status</h3>

          {/* Terminal rejected / cancelled states */}
          {["REJECTED", "CANCELLED"].includes(refund.status) ? (
            <div className={cn("flex items-start gap-3 p-4 rounded-xl border", refundStatusDisplay.border, refundStatusDisplay.bg)}>
              <refundStatusDisplay.icon className={cn("h-5 w-5 shrink-0 mt-0.5", refundStatusDisplay.color)} />
              <div>
                <p className={cn("font-display font-bold text-sm", refundStatusDisplay.color)}>
                  {refundStatusDisplay.label}
                </p>
                {refund.status === "REJECTED" && refund.adminNotes && (
                  <p className="font-body text-xs text-slate mt-1">{refund.adminNotes}</p>
                )}
                {refund.status === "CANCELLED" && (
                  <p className="font-body text-xs text-slate mt-1">{refundStatusDisplay.desc}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Progress Steps */}
              <div className="flex flex-col gap-0">
                {REFUND_STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx < activeRefundStepIndex;
                  const isActive = idx === activeRefundStepIndex;
                  const isFuture = idx > activeRefundStepIndex;

                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "h-7 w-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-all",
                            isCompleted
                              ? "bg-fnc-green border-fnc-green"
                              : isActive
                              ? "bg-white border-fnc-green shadow-sm"
                              : "bg-white border-bordergray"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <div
                              className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                isActive ? "bg-fnc-green" : "bg-bordergray"
                              )}
                            />
                          )}
                        </div>
                        {idx < REFUND_STATUS_STEPS.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-6 my-1",
                              isCompleted ? "bg-fnc-green" : "bg-bordergray"
                            )}
                          />
                        )}
                      </div>
                      <div className="pb-4">
                        <p
                          className={cn(
                            "font-display text-sm font-bold leading-7",
                            isActive
                              ? "text-charcoal"
                              : isCompleted
                              ? "text-fnc-green"
                              : "text-slate"
                          )}
                        >
                          {step.label}
                        </p>
                        {isActive && (
                          <p className="font-body text-xs text-slate mt-0.5">{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Refund amount & ID */}
              {(refund.status === "REFUNDED") && (
                <div className="mt-3 pt-3 border-t border-fnc-green/20 flex flex-col gap-1">
                  <p className="font-body text-sm text-charcoal">
                    <strong>₹{Number(refund.amount).toFixed(2)}</strong> refunded to your account.
                  </p>
                  {refund.razorpayRefundId && (
                    <p className="font-body text-xs text-slate">Refund ID: {refund.razorpayRefundId}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Customer can withdraw a REQUESTED refund */}
          {refund.status === "REQUESTED" && (
            <button
              onClick={handleCancelRefund}
              disabled={pending}
              className="mt-4 h-9 px-4 rounded-xl border border-bordergray font-body text-xs font-semibold text-slate hover:text-fnc-red hover:border-fnc-red/30 transition-colors flex items-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Withdraw Request
            </button>
          )}
        </div>
      )}
    </div>
  );
}
