const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const roleName = process.argv[3];
  const name = process.argv[4] || "Admin User";

  if (!email || !roleName) {
    console.error("Usage: node scripts/make_admin.js <email> <role> [name]");
    console.error("Example: node scripts/make_admin.js admin@fc.com admin");
    process.exit(1);
  }

  const role = await prisma.role.findUnique({
    where: { name: roleName }
  });

  if (!role) {
    console.error(`Role '${roleName}' not found in database. Available roles: admin, store_manager, staff, customer`);
    process.exit(1);
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      roleId: role.id,
      name
    },
    create: {
      email,
      roleId: role.id,
      name
    }
  });

  console.log(`Successfully promoted ${email} to role '${roleName}' (pending first sign-in auto-link):`, user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
