import { db } from "@/lib/db";

export async function listStoresAdmin() {
  return db.store.findMany({ orderBy: { createdAt: "asc" } });
}

export async function createStoreAdmin(data) {
  return db.store.create({ data });
}

export async function updateStoreAdmin(id, data) {
  return db.store.update({ where: { id }, data });
}

export async function deleteStoreAdmin(id) {
  // Same class of bug as products/categories: several tables reference
  // storeId (StoreInventory, DeliveryPartner, Order, Review) with no
  // cascade — a plain delete() would crash with a silent foreign key
  // error the moment a store has any real activity, which every real
  // store will.
  const [partnerCount, orderCount] = await Promise.all([
    db.deliveryPartner.count({ where: { storeId: id } }),
    db.order.count({ where: { storeId: id } }),
  ]);
  if (orderCount > 0) {
    throw new Error(
      `This store has ${orderCount} order${orderCount === 1 ? "" : "s"} on record and can't be deleted — it would break order history. Mark it inactive instead.`
    );
  }
  if (partnerCount > 0) {
    throw new Error(
      `This store has ${partnerCount} delivery rider${partnerCount === 1 ? "" : "s"} assigned to it. Reassign or remove them first.`
    );
  }
  return db.$transaction(async (tx) => {
    await tx.storeInventory.deleteMany({ where: { storeId: id } });
    await tx.review.deleteMany({ where: { storeId: id } });
    return tx.store.delete({ where: { id } });
  });
}
