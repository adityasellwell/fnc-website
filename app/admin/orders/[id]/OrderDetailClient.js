"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Clock,
  Truck,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Save,
  Undo,
} from "lucide-react";
import {
  advanceOrderStatusAction,
  cancelOrderAction,
  updatePackingNotesAction,
  assignRiderAction,
  createRefundAction,
} from "../actions";
import { getNextStatus, getStatusLabel } from "@/lib/orderStatus";

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors disabled:opacity-60";

export default function OrderDetailClient({ order, currentUser }) {
  const [pending, startTransition] = useTransition();
  const [packingNotes, setPackingNotes] = useState(order.packingNotes || "");
  const [riderName, setRiderName] = useState(order.riderName || "");
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || "");
  const [refundAmount, setRefundAmount] = useState(order.total || "");
  const [refundReason, setRefundReason] = useState("");
  const [showRefundForm, setShowRefundForm] = useState(false);

  const nextStatus = getNextStatus(order.status, order.fulfillmentType);
  // Order only stores the final `total` — subtotal/delivery-fee/discount
  // breakdowns were never persisted per-line, so subtotal is recomputed
  // from items (the one piece we do have) rather than reading fields that
  // don't exist on the Order model.
  const itemsSubtotal = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  const handleAdvanceStatus = () => {
    if (!nextStatus) return;
    if (confirm(`Advance order status to "${getStatusLabel(nextStatus)}"?`)) {
      startTransition(() => advanceOrderStatusAction(order.id, order.status, order.fulfillmentType));
    }
  };

  const handleCancelOrder = () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      startTransition(() => cancelOrderAction(order.id));
    }
  };

  const handleSavePackingNotes = (e) => {
    e.preventDefault();
    startTransition(async () => {
      await updatePackingNotesAction(order.id, packingNotes);
      alert("Packing notes saved!");
    });
  };

  const handleSaveRider = (e) => {
    e.preventDefault();
    startTransition(async () => {
      await assignRiderAction(order.id, riderName, riderPhone);
      alert("Rider assigned successfully!");
    });
  };

  const handleCreateRefund = (e) => {
    e.preventDefault();
    startTransition(async () => {
      await createRefundAction(order.id, refundAmount, refundReason);
      alert("Refund request created!");
      setShowRefundForm(false);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* CSS for print mode */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
        }
      `}</style>

      {/* Breadcrumb / Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-slate hover:text-charcoal transition-colors font-body text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="h-10 px-4 rounded-full border border-bordergray bg-white text-charcoal font-body text-sm font-semibold hover:bg-warmwhite transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Main workspace layout */}
      <div className="grid lg:grid-cols-3 gap-6 print:hidden">
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Order Header / Status Card */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="font-body text-xs text-slate uppercase tracking-wider font-semibold">
                  Order ID
                </p>
                <h1 className="font-display text-xl font-bold text-charcoal">
                  #{order.id.slice(-8).toUpperCase()}
                </h1>
                <p className="font-body text-xs text-slate mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`font-body text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === "DELIVERED" || order.status === "COLLECTED"
                      ? "text-fnc-green bg-fnc-green/10"
                      : order.status === "CANCELLED" || order.status === "RETURNED"
                      ? "text-fnc-red bg-fnc-red/10"
                      : "text-fnc-blue bg-fnc-blue/10"
                  }`}
                >
                  {getStatusLabel(order.status)}
                </span>
                <p className="font-body text-xs text-slate mt-1.5 uppercase font-semibold">
                  {order.fulfillmentType}
                </p>
              </div>
            </div>

            {/* Quick Status Control Buttons */}
            <div className="border-t border-bordergray pt-4 flex flex-wrap gap-3">
              {nextStatus && (
                <button
                  onClick={handleAdvanceStatus}
                  disabled={pending}
                  className="h-10 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as {getStatusLabel(nextStatus)}
                </button>
              )}
              {order.status !== "CANCELLED" &&
                order.status !== "DELIVERED" &&
                order.status !== "COLLECTED" &&
                order.status !== "RETURNED" && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={pending}
                    className="h-10 px-5 rounded-xl border border-fnc-red/20 text-fnc-red font-body text-sm font-semibold hover:bg-fnc-red/5 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Cancel Order
                  </button>
                )}
            </div>
          </div>

          {/* Packing Notes & Instructions */}
          <div className="bg-white border border-bordergray rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-charcoal mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-fnc-red" />
              Store Packing Notes
            </h2>
            <form onSubmit={handleSavePackingNotes} className="flex flex-col gap-3">
              <textarea
                value={packingNotes}
                onChange={(e) => setPackingNotes(e.target.value)}
                placeholder="Add special instructions, substitute details, or packaging status notes for the store staff..."
                disabled={pending}
                className="w-full min-h-[100px] p-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal focus:border-fnc-red focus:outline-none transition-colors resize-y disabled:opacity-60"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pending}
                  className="h-10 px-4 rounded-xl bg-charcoal text-white font-body text-sm font-semibold hover:bg-charcoal/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  Save Notes
                </button>
              </div>
            </form>
          </div>

          {/* Rider Assignment (if Delivery) */}
          {order.fulfillmentType === "DELIVERY" && (
            <div className="bg-white border border-bordergray rounded-3xl p-6">
              <h2 className="font-display text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-fnc-red" />
                Delivery Rider Assignment
              </h2>
              <form onSubmit={handleSaveRider} className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-charcoal">Rider Name</label>
                  <input
                    value={riderName}
                    onChange={(e) => setRiderName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
                    disabled={pending}
                    className={inputClasses}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs font-semibold text-charcoal">Rider Phone</label>
                  <input
                    value={riderPhone}
                    onChange={(e) => setRiderPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    disabled={pending}
                    className={inputClasses}
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-10 px-4 rounded-xl bg-charcoal text-white font-body text-sm font-semibold hover:bg-charcoal/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    Assign Rider
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Refund Actions (if Cancelled/Returned) */}
          {(order.status === "CANCELLED" || order.status === "RETURNED" || order.status === "REFUNDED") && (
            <div className="bg-white border border-bordergray rounded-3xl p-6">
              <h2 className="font-display text-base font-bold text-charcoal mb-4 flex items-center gap-2">
                <Undo className="h-5 w-5 text-fnc-red" />
                Refund Operations
              </h2>
              {order.refundRequest ? (
                <div className="bg-warmwhite p-4 rounded-2xl flex flex-col gap-2">
                  <p className="font-body text-sm text-charcoal">
                    <span className="font-semibold">Refund Status:</span>{" "}
                    <span className="font-bold text-fnc-red">{order.refundRequest.status}</span>
                  </p>
                  <p className="font-body text-sm text-charcoal">
                    <span className="font-semibold">Refund Amount:</span> ₹{Number(order.refundRequest.amount).toFixed(2)}
                  </p>
                  <p className="font-body text-sm text-charcoal">
                    <span className="font-semibold">Reason:</span> {order.refundRequest.reason}
                  </p>
                  {order.refundRequest.processedAt && (
                    <p className="font-body text-xs text-slate">
                      Processed at: {formatDate(order.refundRequest.processedAt)}
                    </p>
                  )}
                </div>
              ) : showRefundForm ? (
                <form onSubmit={handleCreateRefund} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-xs font-semibold text-charcoal">Refund Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        max={order.total}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        required
                        disabled={pending}
                        className={inputClasses}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-body text-xs font-semibold text-charcoal">Reason</label>
                      <input
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="e.g. Customer return, cancellation"
                        required
                        disabled={pending}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRefundForm(false)}
                      className="h-10 px-4 font-body text-sm font-semibold text-charcoal hover:bg-warmwhite rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pending}
                      className="h-10 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-60"
                    >
                      Initiate Refund Request
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowRefundForm(true)}
                  className="h-10 px-4 rounded-xl border border-bordergray bg-white text-charcoal font-body text-sm font-semibold hover:bg-warmwhite transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Undo className="h-4 w-4" />
                  Request Refund
                </button>
              )}
            </div>
          )}

          {/* Items Purchased List */}
          <div className="bg-white border border-bordergray rounded-3xl p-6">
            <h2 className="font-display text-base font-bold text-charcoal mb-4">Items Summary</h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-bordergray last:border-0">
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-charcoal">{item.product.name}</p>
                    <p className="font-body text-xs text-slate mt-0.5">
                      ₹{Number(item.unitPrice).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-charcoal">
                      ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Card */}
            <div className="mt-6 pt-6 border-t border-bordergray flex flex-col gap-2.5">
              <div className="flex justify-between font-body text-sm text-slate">
                <span>Items Subtotal</span>
                <span>₹{itemsSubtotal.toFixed(2)}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between font-body text-sm text-fnc-green font-semibold">
                  <span>Coupon Applied</span>
                  <span>{order.couponCode}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-base font-bold text-charcoal pt-2.5 border-t border-bordergray">
                <span>Total Amount</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Timeline */}
        <div className="flex flex-col gap-6">
          {/* Customer Profile Card */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="font-display text-base font-bold text-charcoal flex items-center gap-2">
              <User className="h-5 w-5 text-fnc-red" />
              Customer Details
            </h2>
            <div className="flex flex-col gap-3 font-body text-sm text-charcoal">
              <p>
                <span className="text-slate font-semibold">Name:</span> {order.customer.name}
              </p>
              <p>
                <span className="text-slate font-semibold">Email:</span> {order.customer.email}
              </p>
              <p>
                <span className="text-slate font-semibold">Phone:</span> {order.customer.phone || "N/A"}
              </p>
              <div className="flex items-start gap-2 pt-2 border-t border-bordergray mt-2">
                <MapPin className="h-4 w-4 text-slate shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs text-slate uppercase">Fulfillment Store</p>
                  <p className="font-semibold text-charcoal text-sm mt-0.5">{order.store.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Card (if applicable) */}
          {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
            <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4">
              <h2 className="font-display text-base font-bold text-charcoal flex items-center gap-2">
                <MapPin className="h-5 w-5 text-fnc-red" />
                Delivery Address
              </h2>
              <div className="font-body text-sm text-charcoal flex flex-col gap-1.5">
                <p className="font-bold">{order.deliveryAddress.line1}</p>
                {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
                </p>
              </div>
            </div>
          )}

          {/* Payment Info Card */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="font-display text-base font-bold text-charcoal flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-fnc-red" />
              Payment Information
            </h2>
            <div className="flex flex-col gap-2.5 font-body text-sm text-charcoal">
              <p>
                <span className="text-slate font-semibold">Status:</span>{" "}
                <span
                  className={`font-semibold px-2 py-0.5 rounded ${
                    order.paymentStatus === "PAID"
                      ? "text-fnc-green bg-fnc-green/10"
                      : "text-fnc-red bg-fnc-red/10"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <span className="text-slate font-semibold">Gateway:</span> Razorpay
              </p>
              {order.razorpayPaymentId && (
                <p>
                  <span className="text-slate font-semibold">Transaction ID:</span>{" "}
                  <code className="text-xs font-mono">{order.razorpayPaymentId}</code>
                </p>
              )}
            </div>
          </div>

          {/* Order Activity Timeline */}
          <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-4">
            <h2 className="font-display text-base font-bold text-charcoal flex items-center gap-2">
              <Clock className="h-5 w-5 text-fnc-red" />
              Timeline History
            </h2>
            <div className="relative pl-6 border-l-2 border-bordergray flex flex-col gap-6">
              {order.statusHistory.map((h, idx) => (
                <div key={h.id} className="relative">
                  {/* Dot icon */}
                  <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-fnc-red" />
                  <div>
                    <p className="font-display text-sm font-bold text-charcoal">
                      {getStatusLabel(h.status)}
                    </p>
                    <p className="font-body text-xs text-slate mt-0.5">
                      {h.changedBy ? `By ${h.changedBy.name}` : "System automatic"}
                    </p>
                    <p className="font-body text-[10px] text-slate mt-0.5">{formatDate(h.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden layout specifically structured for standard invoice printing */}
      <div id="printable-invoice" className="hidden flex-col gap-5 bg-white text-black p-8 font-body max-w-3xl mx-auto border border-black">
        {/* Branding header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-black">
              F&amp;C FRESH &amp; CLEAN
            </h1>
            <p className="text-xs text-gray-700 mt-1">Gourmet Seafood &amp; Meat Delivery</p>
            <p className="text-xs text-gray-700">{order.store.name} Store</p>
            <p className="text-xs text-gray-500">{order.store.address}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-black uppercase">TAX INVOICE</h2>
            <p className="text-xs text-gray-700 mt-1">Invoice #: {order.id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-700">Date: {formatDate(order.createdAt)}</p>
            <p className="text-xs text-gray-700">Fulfillment: {order.fulfillmentType}</p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-2 gap-6 pb-4 border-b border-gray-300">
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase">Customer Information</p>
            <p className="text-sm font-bold mt-1">{order.customer.name}</p>
            <p className="text-xs text-gray-700 mt-0.5">Phone: {order.customer.phone || "N/A"}</p>
            <p className="text-xs text-gray-700">Email: {order.customer.email}</p>
          </div>
          {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase">Delivery Address</p>
              <p className="text-sm font-bold mt-1">{order.deliveryAddress.line1}</p>
              {order.deliveryAddress.line2 && <p className="text-xs text-gray-700">{order.deliveryAddress.line2}</p>}
              <p className="text-xs text-gray-700">
                {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}
              </p>
            </div>
          )}
        </div>

        {/* Itemised Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-400 bg-gray-100 font-bold">
              <th className="py-2 px-1">Product Description</th>
              <th className="py-2 px-1 text-right">Unit Price</th>
              <th className="py-2 px-1 text-right">Qty</th>
              <th className="py-2 px-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-2 px-1 font-semibold">{item.product.name}</td>
                <td className="py-2 px-1 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-2 px-1 text-right">{item.quantity}</td>
                <td className="py-2 px-1 text-right">₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Table */}
        <div className="flex justify-end mt-4">
          <div className="w-64 flex flex-col gap-1.5 text-xs text-gray-800">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            {order.couponCode && (
              <div className="flex justify-between font-bold text-green-700">
                <span>Coupon Applied</span>
                <span>{order.couponCode}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-black text-sm pt-2 border-t-2 border-black">
              <span>Grand Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Packing & Rider details */}
        {(order.packingNotes || order.riderName) && (
          <div className="mt-6 p-3 bg-gray-50 border border-gray-300 rounded text-xs flex flex-col gap-1">
            {order.packingNotes && (
              <p>
                <span className="font-bold">Packing Instructions:</span> {order.packingNotes}
              </p>
            )}
            {order.riderName && (
              <p>
                <span className="font-bold">Assigned Rider:</span> {order.riderName} ({order.riderPhone})
              </p>
            )}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center mt-10 border-t border-gray-300 pt-4">
          <p className="text-xs font-bold text-black">Thank you for shopping with F&amp;C!</p>
          <p className="text-[10px] text-gray-500 mt-1">
            For support, contact us at {order.store.phone} or visit our website.
          </p>
        </div>
      </div>
    </div>
  );
}
