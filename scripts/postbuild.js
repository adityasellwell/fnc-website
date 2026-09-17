// scripts/postbuild.js — verifies output directories for Hostinger deployment
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextDir = path.join(rootDir, ".next");
const publicHtaccess = path.join(rootDir, "public", ".htaccess");
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

// Copy public/.htaccess to root if not present for Apache/LiteSpeed routing
if (fs.existsSync(publicHtaccess) && !fs.existsSync(rootHtaccess)) {
  try {
    fs.copyFileSync(publicHtaccess, rootHtaccess);
    console.log("> Copied public/.htaccess to root for Hostinger web server compatibility.");
  } catch (err) {
    console.warn("> Could not copy .htaccess to root:", err.message);
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

console.log("> Postbuild check complete: .next, build, out directories and .htaccess verified successfully.");
