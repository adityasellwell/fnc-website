// server.js — Next.js production server for Hostinger hPanel Node.js
const { createServer } = require("http");
const { parse } = require("url");
const { execSync } = require("child_process");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// Applies any pending Prisma migrations before serving traffic. Runs only
// here (production boot on Hostinger, where the DB is actually reachable)
// — never during `next build`/`next dev`, which run without DB access and
// must keep succeeding via the mock-data fallback in lib/data/*.js even if
// migrations were never applied. Logged loudly but non-fatal: if this
// fails, the site still boots and serves mock data rather than crashing.
if (!dev) {
  try {
    console.log("> Applying Prisma migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("> Prisma migrations up to date.");
  } catch (err) {
    console.error("> Prisma migrate deploy failed — site will still boot, but the database schema may be out of date:", err.message);
  }

  // Seed script upserts by slug (or checks count() first where there's no
  // natural unique key, e.g. reviews/banners) — safe to run on every boot,
  // not just once. Guarantees a fresh production DB always has real
  // categories/products/stores instead of relying on a manual step.
  try {
    console.log("> Running database seed...");
    execSync("node prisma/seed.js", { stdio: "inherit" });
    console.log("> Database seed complete.");
  } catch (err) {
    console.error("> Database seed failed — site will still boot on mock-data fallback:", err.message);
  }
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  })
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> F&C Server ready on port ${port}`);
    });
});
