import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const ADMIN_ROLES = ["admin", "store_manager", "staff"];

/**
 * Resolves the signed-in Clerk user's staff/admin User row (not Customer —
 * see lib/auth.js for the separate customer-facing identity). Three ways a
 * User row gets linked to a Clerk account, checked in order:
 *
 * 1. Already linked (clerkId matches) — the normal case after first login.
 * 2. A pending invite exists (a User row created from /admin/team with this
 *    exact email but no clerkId yet) — link it now.
 * 3. Nobody's been invited yet, but this is the very first admin: their
 *    email matches INITIAL_ADMIN_EMAIL — bootstrap them as admin. This is
 *    the *only* automatic path to the admin role; regular Customer sign-up
 *    (lib/auth.js) never touches the User/Role table at all.
 *
 * Returns null if none of the above match, or their role isn't ADMIN_ROLES.
 */
export async function getAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const linked = await db.user.findUnique({ where: { clerkId: userId }, include: { role: true } });
  if (linked) return ADMIN_ROLES.includes(linked.role.name) ? linked : null;

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const pendingInvite = await db.user.findUnique({ where: { email }, include: { role: true } });
  if (pendingInvite) {
    const user = await db.user.update({
      where: { id: pendingInvite.id },
      data: { clerkId: userId },
      include: { role: true },
    });
    return ADMIN_ROLES.includes(user.role.name) ? user : null;
  }

  if (process.env.INITIAL_ADMIN_EMAIL && email === process.env.INITIAL_ADMIN_EMAIL) {
    const adminRole = await db.role.findUnique({ where: { name: "admin" } });
    if (!adminRole) return null;
    return db.user.create({
      data: {
        clerkId: userId,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Admin",
        email,
        roleId: adminRole.id,
      },
      include: { role: true },
    });
  }

  return null;
}

/**
 * Use at the top of every app/admin/** page/layout. `notFound()` (not a
 * redirect) for non-admins — deliberately doesn't confirm /admin exists to
 * someone who isn't authorized for it. proxy.js already redirects
 * signed-out visitors to /sign-in before this ever runs.
 */
export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) notFound();
  return user;
}

/**
 * Stricter guard for /admin/team — only full admins (not store_manager/
 * staff) may invite or change roles for other team members, to prevent a
 * lower-privilege account from escalating itself or others.
 */
export async function requireFullAdminUser() {
  const user = await getAdminUser();
  if (!user || user.role.name !== "admin") notFound();
  return user;
}
