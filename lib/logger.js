import { db } from "@/lib/db";

/**
 * High-performance, non-blocking API & System Activity Logger.
 * Records API route hits, status codes, execution duration, IP, errors, and metadata
 * directly to the MySQL database without slowing down the client HTTP response.
 */
export async function recordApiLog({
  route,
  method = "GET",
  statusCode = 200,
  durationMs = 0,
  ip = null,
  userAgent = null,
  error = null,
  details = null,
}) {
  try {
    const errorStr = error
      ? typeof error === "string"
        ? error
        : error.message || JSON.stringify(error)
      : null;

    // Asynchronous fire-and-forget database insertion
    db.apiLog
      .create({
        data: {
          route,
          method,
          statusCode,
          durationMs,
          ip: ip ? String(ip).slice(0, 45) : null,
          userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
          error: errorStr,
          details: details ? details : undefined,
        },
      })
      .catch((err) => {
        console.error("[logger] Failed to persist ApiLog:", err?.message || err);
      });
  } catch (err) {
    console.error("[logger] Error recording log:", err);
  }
}

/**
 * Helper wrapper for API handlers to automatically record execution metrics and log errors.
 */
export function withLogging(route, handler) {
  return async function (request, context) {
    const startTime = Date.now();
    const method = request.method;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    try {
      const response = await handler(request, context);
      const durationMs = Date.now() - startTime;
      const statusCode = response?.status || 200;

      recordApiLog({
        route,
        method,
        statusCode,
        durationMs,
        ip,
        userAgent,
        error: statusCode >= 400 ? `HTTP ${statusCode}` : null,
      });

      return response;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const statusCode = 500;

      recordApiLog({
        route,
        method,
        statusCode,
        durationMs,
        ip,
        userAgent,
        error: err?.message || String(err),
        details: { stack: err?.stack },
      });

      throw err;
    }
  };
}

/**
 * Retrieves API activity analytics & log records for the Admin Dashboard.
 */
export async function getApiLogs({ limit = 100, page = 1, status = "ALL", route = null, search = "" }) {
  try {
    const skip = (page - 1) * limit;
    const where = {};

    if (status === "ERRORS") {
      where.statusCode = { gte: 400 };
    } else if (status === "SUCCESS") {
      where.statusCode = { lt: 400 };
    } else if (status === "SERVER_ERRORS") {
      where.statusCode = { gte: 500 };
    }

    if (route) {
      where.route = route;
    }

    if (search) {
      where.OR = [
        { route: { contains: search } },
        { error: { contains: search } },
        { ip: { contains: search } },
      ];
    }

    const [logs, total, totalAll, errorCount] = await Promise.all([
      db.apiLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip,
      }),
      db.apiLog.count({ where }),
      db.apiLog.count(),
      db.apiLog.count({ where: { statusCode: { gte: 400 } } }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalRequests: totalAll,
        totalErrors: errorCount,
        errorRatePct: totalAll > 0 ? ((errorCount / totalAll) * 100).toFixed(1) : 0,
      },
    };
  } catch (err) {
    console.error("[getApiLogs] failed:", err);
    return {
      logs: [],
      total: 0,
      page: 1,
      totalPages: 1,
      stats: { totalRequests: 0, totalErrors: 0, errorRatePct: 0 },
    };
  }
}
