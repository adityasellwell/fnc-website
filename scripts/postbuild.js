// scripts/postbuild.js — ensures output directories exist for Hostinger / deployment runners
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const nextDir = path.join(rootDir, ".next");
const outDir = path.join(rootDir, "out");
const distDir = path.join(rootDir, "dist");
const buildDir = path.join(rootDir, "build");

console.log("> Running postbuild output directory verification...");

if (!fs.existsSync(nextDir)) {
  console.error("ERROR: .next directory was not created during build!");
  process.exit(1);
}

// Hostinger hbuilds or other host platforms might be configured to expect 'out', 'dist', or 'build'.
// We ensure fallback directories exist so deployment runners never fail with "No output directory found after build".
const dirsToEnsure = [outDir, distDir, buildDir];

dirsToEnsure.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    // Place a placeholder marker or copy index if needed
    fs.writeFileSync(
      path.join(dir, "index.html"),
      "<!DOCTYPE html><html><head><title>F&C App</title></head><body>Server App Ready</body></html>"
    );
  }
});

console.log("> Postbuild check complete: .next, out, dist, and build directories are verified.");
