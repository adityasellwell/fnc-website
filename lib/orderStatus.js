const DELIVERY_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const PICKUP_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COLLECTED"];

export const statusLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for Pickup",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  RETURNED: "Returned",
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
