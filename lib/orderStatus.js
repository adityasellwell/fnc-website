const DELIVERY_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"];
const PICKUP_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COLLECTED"];

export const statusLabels = {
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
