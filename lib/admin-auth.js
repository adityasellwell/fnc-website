import { getSessionClaims } from "@/lib/auth-jwt";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const ADMIN_ROLES = ["admin", "store_manager", "staff"];

/**
 * Resolves the signed-in Firebase user's staff/admin User row (not Customer).
 * Returns null if there's no session, no matching User row, or if their role isn't authorized.
 * Automatic linking: If an admin email is seeded but has no authUid yet, the first login
 * links the authUid automatically.
 */
export async function getAdminUser() {
  const claims = await getSessionClaims();
  if (!claims) return null;

  // Enforce email verification for admins
  if (!claims.email_verified) return null;

  const uid = claims.uid;
  const email = claims.email;
  const provider = claims.firebase?.sign_in_provider || "firebase";

  if (!email) return null;

  let user = await db.user.findUnique({
    where: { authUid: uid },
    include: { role: true },
  });

  // Automatic linking logic
  if (!user) {
    const existingByEmail = await db.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (existingByEmail) {
      if (!existingByEmail.authUid) {
        // Safe account linking
        user = await db.user.update({
          where: { email },
          data: {
            authUid: uid,
            authProvider: provider,
          },
          include: { role: true },
        });
        console.log(`[AdminAuth] Automatically linked email ${email} to Firebase UID ${uid}`);
      } else {
        // Security Event: authUid mismatch
        console.error(`[AdminAuth] SECURITY WARNING: Attempted to link already linked admin email ${email} (current authUid: ${existingByEmail.authUid}, login authUid: ${uid})`);
        return null;
      }
    }
  }

  if (!user || !user.isActive || !ADMIN_ROLES.includes(user.role.name)) return null;
  return user;
}

export function isSuperAdmin(user) {
  return user?.role?.name === "admin";
}

export function getScopedStoreId(user) {
  return isSuperAdmin(user) ? null : user?.storeId;
}

/**
 * Use at the top of every app/admin/** page/layout. `notFound()` for non-admins.
 */
export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) notFound();
  return user;
}

/**
 * Stricter guard for /admin/team — only full admins (not store_manager/
 * staff) may invite or change roles for other team members.
 */
export async function requireFullAdminUser() {
  const user = await getAdminUser();
  if (!user || user.role.name !== "admin") notFound();
  return user;
}
