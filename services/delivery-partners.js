import { db } from "@/lib/db";
import { generatePin, hashPin } from "@/lib/delivery-partner-auth";

export async function listDeliveryPartners(storeId) {
  return db.deliveryPartner.findMany({
    where: storeId ? { storeId } : {},
    include: { store: { select: { name: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
}

export async function listActivePartnersForStore(storeId) {
  return db.deliveryPartner.findMany({
    where: { storeId, isActive: true },
    orderBy: { name: "asc" },
  });
}

/** Returns the plain PIN once, at creation, so admin can hand it to the partner — never retrievable again. */
export async function createDeliveryPartner({ name, phone, storeId, vehicleType, vehicleNumber }) {
  const pin = generatePin();
  const { pinHash, pinSalt } = hashPin(pin);
  const partner = await db.deliveryPartner.create({
    data: { name, phone, storeId, vehicleType: vehicleType || null, vehicleNumber: vehicleNumber || null, pinHash, pinSalt },
  });
  return { partner, pin };
}

export async function updateDeliveryPartner(id, { name, vehicleType, vehicleNumber, status, isActive }) {
  return db.deliveryPartner.update({
    where: { id },
    data: { name, vehicleType: vehicleType || null, vehicleNumber: vehicleNumber || null, status, isActive },
  });
}

/** Admin-triggered PIN reset — returns the new plain PIN once. */
export async function resetDeliveryPartnerPin(id) {
  const pin = generatePin();
  const { pinHash, pinSalt } = hashPin(pin);
  await db.deliveryPartner.update({ where: { id }, data: { pinHash, pinSalt } });
  return pin;
}

export async function deleteDeliveryPartner(id) {
  return db.deliveryPartner.update({ where: { id }, data: { isActive: false, status: "OFFLINE" } });
}
