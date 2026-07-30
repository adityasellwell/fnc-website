import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

const ADMIN_ROLES = ["admin", "store_manager", "staff"];

/**
 * Resolves the signed-in Clerk user's staff/admin User row (not Customer —
 * see lib/auth.js for the separate customer-facing identity). Returns null
 * if there's no session, no matching User row, or their role isn't one of
 * ADMIN_ROLES. There's no self-serve admin sign-up — a person becomes an
 * admin only via a manual DB update (see docs/changelog.md Milestone 2).
 */
export async function getAdminUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { role: true },
  });

  if (!user || !ADMIN_ROLES.includes(user.role.name)) return null;
  return user;
}

/**
 * Use at the top of every app/admin/** page/layout. `notFound()` (not a
 * redirect) for non-admins — deliberately doesn't confirm /admin exists to
 * someone who isn't authorized for it. middleware.js already redirects
 * signed-out visitors to /sign-in before this ever runs.
 */
export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) notFound();
  return user;
}
