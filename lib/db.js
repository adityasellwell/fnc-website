import { PrismaClient } from "@prisma/client";

/**
 * Serverless-safe Prisma client singleton.
 *
 * Next.js hot-reloads modules in dev, which would otherwise instantiate a
 * fresh PrismaClient (and a fresh connection pool) on every edit — this
 * quickly exhausts a serverless Postgres provider's connection limit
 * (Neon/Supabase). Stashing the instance on `globalThis` survives the
 * hot-reload and reuses the same client. In production (no hot reload)
 * this just creates the client once per server instance, as normal.
 */
const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = db;
}
