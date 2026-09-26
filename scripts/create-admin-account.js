const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  console.log("Checking roles...");
  const roles = await db.role.findMany();
  console.log("Roles found:", roles);

  const adminRole = roles.find((r) => r.name === "admin");
  if (!adminRole) {
    console.error("Admin role not found!");
    return;
  }

  const email = "anchospitalityllp@gmail.com";
  console.log(`Checking user with email: ${email}...`);

  let user = await db.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    console.log(`Creating super admin user for ${email}...`);
    user = await db.user.create({
      data: {
        name: "F&C Super Admin",
        email,
        roleId: adminRole.id,
        isActive: true,
      },
      include: { role: true },
    });
    console.log("Created user in DB:", user);
  } else {
    console.log("Existing user found in DB:", user);
    if (user.roleId !== adminRole.id || !user.isActive) {
      user = await db.user.update({
        where: { id: user.id },
        data: { roleId: adminRole.id, isActive: true },
        include: { role: true },
      });
      console.log("Updated user to super admin:", user);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await db.$disconnect();
  });
