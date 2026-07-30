"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/admin-auth";
import { deleteReviewAdmin } from "@/services/reviews";

export async function deleteReviewAction(id) {
  await requireAdminUser();
  await deleteReviewAdmin(id);
  revalidatePath("/admin/reviews");
  revalidatePath("/shop");
}
