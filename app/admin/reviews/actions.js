"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import { deleteReviewAdmin } from "@/services/reviews";

export async function deleteReviewAction(id) {
  const admin = await requireAdminUser();
  const storeId = getScopedStoreId(admin);
  await deleteReviewAdmin(id, storeId);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}
