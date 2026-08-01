"use server";

import { requireAdminUser } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateAdminProfileAction(formData) {
  const admin = await requireAdminUser();
  const name = formData.get("name")?.toString().trim();
  
  if (!name) {
    throw new Error("Name is required");
  }
  
  await db.user.update({
    where: { id: admin.id },
    data: { name },
  });
  
  revalidatePath("/admin");
}
