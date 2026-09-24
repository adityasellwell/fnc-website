// scripts/predeploy.js — applies pending Prisma migrations and seeds the DB
// before the Next.js build, when a database happens to be reachable (e.g.
// Hostinger's build environment). Every step is non-fatal: if the DB is
// unreachable (e.g. local dev, no MySQL running), this logs a warning and
// exits 0 so `next build` still runs cleanly.
const { execSync } = require("child_process");

function run(command, label) {
  try {
    execSync(command, { stdio: "inherit", shell: true });
  } catch (err) {
    console.warn(`> ${label} failed or DB unreachable — continuing (${err?.message || err})`);
  }
}

// On Linux / macOS (Hostinger), ensure Prisma binary files have execute permissions (+x)
if (process.platform !== "win32") {
  run("chmod -R +x node_modules/@prisma/engines/ 2>/dev/null || true", "chmod prisma engines");
}

run("npx prisma migrate deploy", "prisma migrate deploy");


