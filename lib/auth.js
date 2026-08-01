import { getSessionClaims } from "@/lib/auth-jwt";
import { db } from "@/lib/db";

/**
 * Resolves the signed-in shopper's Customer row (server-only).
 * Returns null if there's no signed-in session or if the email is not verified.
 */
export async function getCurrentCustomer() {
  const claims = await getSessionClaims();
  if (!claims) return null;

  // Enforce: only resolve/create Customer after email is verified,
  // EXCEPT for phone authentication where there's no email.
  const isPhoneAuth = claims.firebase?.sign_in_provider === "phone";
  if (!isPhoneAuth && !claims.email_verified) return null;

  return getOrCreateCustomerForFirebaseUser(claims);
}

export async function getOrCreateCustomerForFirebaseUser(claims) {
  const uid = claims.uid;
  const email = claims.email || null;
  const phone = claims.phone || claims.phone_number || null;
  const provider = claims.firebase?.sign_in_provider || "firebase";

  // 1. Find by authUid first
  const existingByUid = await db.customer.findUnique({
    where: { authUid: uid },
  });
  if (existingByUid) return existingByUid;

  // 2. Find by phone if it exists
  if (phone) {
    const existingByPhone = await db.customer.findFirst({
      where: { phone },
    });
    if (existingByPhone) {
      if (!existingByPhone.authUid) {
        return db.customer.update({
          where: { id: existingByPhone.id },
          data: {
            authUid: uid,
            authProvider: provider,
            email: existingByPhone.email || email,
          },
        });
      }
      return existingByPhone;
    }
  }

  // 3. Find by email to link (for guest checkout transition)
  if (email) {
    const existingByEmail = await db.customer.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      if (!existingByEmail.authUid) {
        return db.customer.update({
          where: { email },
          data: {
            authUid: uid,
            authProvider: provider,
            phone: existingByEmail.phone || phone,
          },
        });
      }
      return existingByEmail;
    }
  }

  // 4. Create a new Customer
  const name = claims.name || (email ? email.split("@")[0] : null) || (phone ? `Phone ${phone.slice(-4)}` : "F&C Customer");

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
