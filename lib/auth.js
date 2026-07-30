import { getSessionClaims } from "@/lib/auth-jwt";
import { db } from "@/lib/db";

/**
 * Resolves the signed-in shopper's Customer row (server-only).
 * Returns null if there's no signed-in session or if the email is not verified.
 */
export async function getCurrentCustomer() {
  const claims = await getSessionClaims();
  if (!claims) return null;

  // Enforce: only resolve/create Customer after email is verified
  if (!claims.email_verified) return null;

  return getOrCreateCustomerForFirebaseUser(claims);
}

export async function getOrCreateCustomerForFirebaseUser(claims) {
  const uid = claims.uid;
  const email = claims.email;
  const provider = claims.firebase?.sign_in_provider || "firebase";

  if (!email) return null;

  // 1. Find by authUid first
  const existingByUid = await db.customer.findUnique({
    where: { authUid: uid },
  });
  if (existingByUid) return existingByUid;

  // 2. Find by email to link (for guest checkout transition)
  const existingByEmail = await db.customer.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    // Dynamic account linking
    if (!existingByEmail.authUid) {
      return db.customer.update({
        where: { email },
        data: {
          authUid: uid,
          authProvider: provider,
        },
      });
    }
    return existingByEmail;
  }

  // 3. Create a new Customer
  const name = claims.name || email.split("@")[0] || "F&C Customer";
  const phone = claims.phone || claims.phone_number || null;

  return db.customer.create({
    data: {
      authUid: uid,
      authProvider: provider,
      name,
      email,
      phone,
    },
  });
}
