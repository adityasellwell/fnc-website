import { db } from "@/lib/db";

const STAFF_ROLE_NAMES = ["admin", "store_manager", "staff"];

export async function listTeamMembers(storeId) {
  const where = storeId ? { storeId } : {};
  return db.user.findMany({
    where,
    include: { role: true, store: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listStaffRoles() {
  return db.role.findMany({ where: { name: { in: STAFF_ROLE_NAMES } } });
}

export async function getUserRoleName(roleId) {
  const role = await db.role.findUnique({ where: { id: roleId } });
  return role?.name ?? null;
}

export async function getUserStoreAndRole(userId) {
  const user = await db.user.findUnique({ where: { id: userId }, include: { role: true } });
  return user ? { storeId: user.storeId, roleName: user.role.name } : null;
}

/**
 * Creates a "pending" team member — a User row with no authUid yet. The
 * moment someone signs in via Firebase with this exact email, getAdminUser()
 * (lib/admin-auth.js) links it automatically. No invite email is sent yet
 * (Resend isn't wired up for this) — the owner tells them directly to sign
 * up with this email.
 */
export async function inviteTeamMember({ name, email, roleId, storeId }, inviterId) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, roleId, storeId: storeId || null },
    });
    await tx.auditLog.create({
      data: {
        userId: inviterId,
        action: "INVITE_TEAM_MEMBER",
        entityType: "User",
        entityId: user.id,
        storeId: storeId || null,
        details: { name, email, roleId },
      },
    });
    return user;
  });
}

export async function updateTeamMemberRole(id, roleId, inviterId) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.update({ where: { id }, data: { roleId } });
    await tx.auditLog.create({
      data: {
        userId: inviterId,
        action: "UPDATE_TEAM_MEMBER_ROLE",
        entityType: "User",
        entityId: id,
        storeId: user.storeId || null,
        details: { roleId },
      },
    });
    return user;
  });
}

export async function deactivateTeamMember(id, storeId, inviterId) {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");
  if (storeId && user.storeId !== storeId) {
    throw new Error("Unauthorized");
  }

  return db.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id },
      data: { isActive: false },
    });
    await tx.auditLog.create({
      data: {
        userId: inviterId,
        action: "DEACTIVATE_TEAM_MEMBER",
        entityType: "User",
        entityId: id,
        storeId: user.storeId || null,
        details: { email: user.email, name: user.name },
      },
    });
    return updated;
  });
}
