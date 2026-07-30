import { db } from "@/lib/db";

const STAFF_ROLE_NAMES = ["admin", "store_manager", "staff"];

export async function listTeamMembers() {
  return db.user.findMany({
    include: { role: true, store: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function listStaffRoles() {
  return db.role.findMany({ where: { name: { in: STAFF_ROLE_NAMES } } });
}

/**
 * Creates a "pending" team member — a User row with no authUid yet. The
 * moment someone signs in via Firebase with this exact email, getAdminUser()
 * (lib/admin-auth.js) links it automatically. No invite email is sent yet
 * (Resend isn't wired up for this) — the owner tells them directly to sign
 * up with this email.
 */
export async function inviteTeamMember({ name, email, roleId, storeId }) {
  return db.user.create({
    data: { name, email, roleId, storeId: storeId || null },
  });
}

export async function updateTeamMemberRole(id, roleId) {
  return db.user.update({ where: { id }, data: { roleId } });
}
