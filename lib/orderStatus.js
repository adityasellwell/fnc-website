const DELIVERY_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const PICKUP_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COLLECTED"];

export function getNextStatus(status, fulfillmentType) {
  const flow = fulfillmentType === "PICKUP" ? PICKUP_FLOW : DELIVERY_FLOW;
  const idx = flow.indexOf(status);
  if (idx === -1 || idx === flow.length - 1) return null;
  return flow[idx + 1];
}
