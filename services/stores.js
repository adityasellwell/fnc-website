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
  return db.store.delete({ where: { id } });
}
