// scripts/predeploy.js — applies pending Prisma migrations and seeds the DB
// before the Next.js build, when a database happens to be reachable (e.g.
// Hostinger's build environment). Every step is non-fatal: if the DB is
// unreachable (e.g. local dev, no MySQL running), this logs a warning and
// exits 0 so `next build` still runs and falls back to the mock data
// already built into lib/data/*.js. Written in plain Node (no shell `&&`/
// `||`/parens) so it behaves identically under cmd.exe (Windows/local) and
// bash/sh (Hostinger/Linux) — mixing shell operators across those two was
// the previous approach and broke on Windows.
const { execSync } = require("child_process");

function run(command, label) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.warn(`> ${label} failed or DB unreachable — continuing (${err.message})`);
  }
}

run("npx prisma migrate deploy", "prisma migrate deploy");
run("node prisma/seed.js", "database seed");
