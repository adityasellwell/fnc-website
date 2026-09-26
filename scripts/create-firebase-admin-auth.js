const dotenv = require("dotenv");
dotenv.config();
dotenv.config({ path: ".env.local" });

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

function normalizePrivateKey(raw) {
  if (!raw) return undefined;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.includes("\\n") ? key.replace(/\\n/g, "\n") : key;
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY_BASE64
  ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64.trim(), "base64").toString("utf8")
  : normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin credentials!");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const auth = getAuth();

async function main() {
  const email = "anchospitalityllp@gmail.com";
  const password = "FncAdmin@2026!";
  const displayName = "F&C Super Admin";

  console.log(`Setting up Firebase Auth for ${email}...`);

  let firebaseUser;
  try {
    firebaseUser = await auth.getUserByEmail(email);
    console.log("Firebase user already exists, updating password and verifying email...");
    firebaseUser = await auth.updateUser(firebaseUser.uid, {
      password,
      displayName,
      emailVerified: true,
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log("Creating new Firebase user...");
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
    } else {
      throw err;
    }
  }

  console.log("Firebase Auth User UID:", firebaseUser.uid);

  // Link authUid in MySQL Prisma database
  const adminRole = await db.role.findFirst({ where: { name: "admin" } });
  if (!adminRole) {
    throw new Error("Admin role not found in database");
  }

  const dbUser = await db.user.upsert({
    where: { email },
    update: {
      authUid: firebaseUser.uid,
      authProvider: "password",
      roleId: adminRole.id,
      isActive: true,
      name: displayName,
    },
    create: {
      email,
      name: displayName,
      authUid: firebaseUser.uid,
      authProvider: "password",
      roleId: adminRole.id,
      isActive: true,
    },
    include: { role: true },
  });

  console.log("Successfully created/updated Super Admin in MySQL database:");
  console.log("ID:", dbUser.id);
  console.log("Email:", dbUser.email);
  console.log("Role:", dbUser.role.name);
  console.log("Auth UID:", dbUser.authUid);
  console.log("Status: ACTIVE");
  console.log("-----------------------------------------");
  console.log(`ADMIN CREDENTIALS:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error setting up admin account:", e);
  })
  .finally(async () => {
    await db.$disconnect();
  });
