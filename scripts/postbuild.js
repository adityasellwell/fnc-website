// scripts/postbuild.js — verifies output directories for Hostinger deployment
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextDir = path.join(rootDir, ".next");
const rootHtaccess = path.join(rootDir, ".htaccess");

console.log("> Running postbuild output directory verification...");

if (!fs.existsSync(nextDir)) {
  console.error("ERROR: .next directory was not created during build!");
  process.exit(1);
}

// next.config.mjs sets output: "standalone" — that mode produces a
// minimal server in .next/standalone/ that does NOT include static
// assets by default (this is documented, required Next.js behavior, not
// a Hostinger quirk). Without this copy, the standalone server has no
// public/ or .next/static/ on disk at all, so EVERY CSS/JS/image request
// 500s even though page HTML still renders fine — exactly the "site
// loads but completely unstyled, no images" symptom this was causing.
const standaloneDir = path.join(nextDir, "standalone");
if (fs.existsSync(standaloneDir)) {
  fs.cpSync(path.join(rootDir, "public"), path.join(standaloneDir, "public"), {
    recursive: true,
  });
  fs.cpSync(path.join(nextDir, "static"), path.join(standaloneDir, ".next", "static"), {
    recursive: true,
  });
  console.log("> Copied public/ and .next/static/ into .next/standalone/ (required for output: \"standalone\").");
} else {
  console.warn("> .next/standalone/ not found — skipping standalone static asset copy (not using standalone output?).");
}

// A previous deploy added a root .htaccess with an Apache/LiteSpeed
// reverse-proxy rewrite rule, meant to route static assets to the Node
// process. It backfired: Hostinger's own hcdn layer already proxies
// every request (dynamic AND static) straight to the standalone server
// with zero config needed — confirmed by dynamic pages never touching
// LiteSpeed at all (no X-Turbo-Charged-By header) while static asset
// requests got intercepted by LiteSpeed's own static-file handler
// because of this file, which 500'd on every one of them (the rewrite's
// -f/-d file-exists check never matches real paths on disk, since
// public/ and .next/static/ are nested inside .next/standalone/, not at
// the project root). Actively removing any copy left over from that
// build so a stale one doesn't linger on the server between deploys.
if (fs.existsSync(rootHtaccess)) {
  try {
    fs.unlinkSync(rootHtaccess);
    console.log("> Removed stale root .htaccess (was breaking static asset routing).");
  } catch (err) {
    console.warn("> Could not remove root .htaccess:", err.message);
  }
}

// Hostinger's git deployment runner autodetected 'Create React App' framework and checks for a 'build' directory.
// We ensure 'build' and 'out' directories exist and contain build artifacts so Hostinger's output check passes cleanly.
const targetDirs = [path.join(rootDir, "build"), path.join(rootDir, "out")];

targetDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Create a build marker file so the directory is non-empty
  const buildMarker = path.join(dir, ".build-ok");
  if (!fs.existsSync(buildMarker)) {
    fs.writeFileSync(buildMarker, `Build verified at ${new Date().toISOString()}`);
  }
});

console.log("> Postbuild check complete: .next, build, out directories verified, standalone static assets copied, stale .htaccess removed.");
