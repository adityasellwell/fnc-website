import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Resolves the signed-in shopper's Customer row (server-only), creating one
 * on first sign-in. Find-or-create is keyed on Clerk's userId first, then
 * falls back to email — so a shopper who placed a guest order earlier and
 * later signs in with the same email gets linked to that same Customer row
 * (and its order history) instead of getting a duplicate.
 *
 * Returns null if there's no signed-in session, or if Clerk has no email on
 * file yet (shouldn't normally happen — email is required at sign-up).
 */
export async function getCurrentCustomer() {
  const { userId } = await auth();
  if (!userId) return null;
  return getOrCreateCustomerForClerkUser(userId);
}

export async function getOrCreateCustomerForClerkUser(clerkUserId) {
  const existing = await db.customer.findUnique({ where: { clerkId: clerkUserId } });
  if (existing) return existing;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "F&C Customer";
  const phone = user?.primaryPhoneNumber?.phoneNumber ?? null;

  return db.customer.upsert({
    where: { email },
    update: { clerkId: clerkUserId },
    create: { clerkId: clerkUserId, name, email, phone },
  });
}
