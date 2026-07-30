import { db } from "@/lib/db";

export async function listBanners() {
  return db.banner.findMany({ orderBy: [{ placement: "asc" }, { priority: "asc" }] });
}

export async function createBanner(data) {
  return db.banner.create({ data });
}

export async function updateBanner(id, data) {
  return db.banner.update({ where: { id }, data });
}

export async function deleteBanner(id) {
  return db.banner.delete({ where: { id } });
}
