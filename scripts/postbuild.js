// scripts/postbuild.js — verifies .next build output directory exists
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

// Clean up any static placeholder index.html files so Nginx/Apache reverse proxies
// pass requests through to Next.js server.js instead of serving a static html file.
[outDir, distDir, buildDir].forEach((dir) => {
  const htmlFile = path.join(dir, "index.html");
  if (fs.existsSync(htmlFile)) {
    try {
      fs.unlinkSync(htmlFile);
    } catch (_) {}
  }
});

console.log("> Postbuild check complete: .next build directory verified successfully.");
