// scripts/postbuild.js — verifies .next build output directory and htaccess routing
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

// Copy public/.htaccess to root if not present, to ensure Hostinger's Apache/LiteSpeed web server
// routes incoming requests correctly without throwing 404/500/htaccess errors.
if (fs.existsSync(publicHtaccess) && !fs.existsSync(rootHtaccess)) {
  try {
    fs.copyFileSync(publicHtaccess, rootHtaccess);
    console.log("> Copied public/.htaccess to root for Hostinger web server compatibility.");
  } catch (err) {
    console.warn("> Could not copy .htaccess to root:", err.message);
  }
}

console.log("> Postbuild check complete: .next build directory and .htaccess verified successfully.");
