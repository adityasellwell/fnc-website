"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, getScopedStoreId } from "@/lib/admin-auth";
import {
  inviteTeamMember,
  updateTeamMemberRole,
  deactivateTeamMember,
  getUserRoleName,
  getUserStoreAndRole,
} from "@/services/team";

export async function inviteTeamMemberAction(formData) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.role.name !== "store_manager") {
    throw new Error("Unauthorized");
  }
  const storeId = admin.role.name === "admin" ? formData.get("storeId")?.toString() : admin.storeId;
  const roleId = formData.get("roleId").toString();

  // Only a super admin can hand out the super admin role — a store_manager
  // inviting someone stays capped at store_manager/staff, no matter what
  // roleId a crafted request sends.
  if (admin.role.name !== "admin") {
    const targetRoleName = await getUserRoleName(roleId);
    if (targetRoleName === "admin") {
      throw new Error("Only a Super Admin can grant the Super Admin role.");
    }
  }

  await inviteTeamMember({
    name: formData.get("name").toString().trim(),
    email: formData.get("email").toString().trim().toLowerCase(),
    roleId,
    storeId: storeId || null,
  }, admin.id);
  revalidatePath("/admin/team");
}

export async function updateTeamMemberRoleAction(id, roleId) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.role.name !== "store_manager") {
    throw new Error("Unauthorized");
  }

  // A store_manager may only manage their own store's staff, and can never
  // grant (or already be touching) the Super Admin role — without this, a
  // crafted request could promote anyone, in any store, to admin.
  if (admin.role.name !== "admin") {
    const scopedStoreId = getScopedStoreId(admin);
    const target = await getUserStoreAndRole(id);
    if (!target || target.storeId !== scopedStoreId || target.roleName === "admin") {
      throw new Error("Unauthorized");
    }
    const nextRoleName = await getUserRoleName(roleId);
    if (nextRoleName === "admin") {
      throw new Error("Only a Super Admin can grant the Super Admin role.");
    }
  }

  await updateTeamMemberRole(id, roleId, admin.id);
  revalidatePath("/admin/team");
}

export async function deactivateTeamMemberAction(id) {
  const admin = await requireAdminUser();
  if (admin.role.name !== "admin" && admin.role.name !== "store_manager") {
    throw new Error("Unauthorized");
  }
  const storeId = getScopedStoreId(admin);
  await deactivateTeamMember(id, storeId, admin.id);
  revalidatePath("/admin/team");
}
