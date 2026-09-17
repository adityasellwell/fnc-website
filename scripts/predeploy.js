// scripts/predeploy.js — applies pending Prisma migrations before Next.js build
const { execSync } = require("child_process");

// Fix executable permissions on Linux/macOS build servers (Hostinger hbuilds)
// to prevent EACCES errors when Prisma engines run.
if (process.platform !== "win32") {
  try {
    execSync("chmod -R +x node_modules/@prisma/engines node_modules/.bin 2>/dev/null || true", { stdio: "ignore" });
  } catch (_) {
    // Ignore permission errors if chmod isn't permitted
  }
}

function run(command, label) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.warn(`> ${label} failed or DB unreachable — continuing (${err.message})`);
  }
}

run("npx prisma migrate deploy", "prisma migrate deploy");
