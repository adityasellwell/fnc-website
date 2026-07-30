const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const clerkId = process.argv[3];
  const name = process.argv[4] || "Admin User";

  if (!email || !clerkId) {
    console.error("Usage: node scripts/make_admin.js <email> <clerkId> [name]");
    process.exit(1);
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "admin" }
  });

  if (!adminRole) {
    console.error("Admin role not found in database. Run seed first.");
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      clerkId,
      roleId: adminRole.id,
      name
    },
    create: {
      email,
      clerkId,
      roleId: adminRole.id,
      name
    }
  });

  console.log(`Successfully made ${email} (${clerkId}) an Admin:`, user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
