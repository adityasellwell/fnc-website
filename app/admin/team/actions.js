"use server";

import { revalidatePath } from "next/cache";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { inviteTeamMember, updateTeamMemberRole } from "@/services/team";

export async function inviteTeamMemberAction(formData) {
  await requireFullAdminUser();
  await inviteTeamMember({
    name: formData.get("name").toString().trim(),
    email: formData.get("email").toString().trim().toLowerCase(),
    roleId: formData.get("roleId").toString(),
  });
  revalidatePath("/admin/team");
}

export async function updateTeamMemberRoleAction(id, roleId) {
  await requireFullAdminUser();
  await updateTeamMemberRole(id, roleId);
  revalidatePath("/admin/team");
}
