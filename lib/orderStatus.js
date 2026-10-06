const DELIVERY_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
const PICKUP_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COLLECTED"];

export const statusLabels = {
  PENDING_PAYMENT: "Pending Payment",
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Prepared & Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  RETURNED: "Returned",
};

export const actionButtonLabels = {
  CONFIRMED: "Confirm Order",
  PREPARING: "Start Preparing",
  READY_FOR_PICKUP: "Mark Prepared",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
  COLLECTED: "Mark Collected",
};

export function getStatusLabel(status) {
  return statusLabels[status] || status;
}

export function getNextStatus(status, fulfillmentType) {
  const flow = fulfillmentType === "PICKUP" ? PICKUP_FLOW : DELIVERY_FLOW;
  const idx = flow.indexOf(status);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}

export function formatOrderCode(order) {
  if (!order) return "";
  if (order.orderNumber) {
    return `FNC-${order.orderNumber}`;
  }
  const idStr = String(order.id || "");
  const shortId = idStr.slice(-5).toUpperCase();
  return `FNC-${shortId}`;
}
