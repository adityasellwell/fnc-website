import { requireFullAdminUser } from "@/lib/admin-auth";
import { getApiLogs } from "@/lib/logger";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Server,
  ShieldAlert,
  Terminal,
} from "lucide-react";

export const metadata = {
  title: "System & API Logs — Admin",
  description: "Monitor real-time API hits, system activity, errors, response times, and status codes.",
};

export const dynamic = "force-dynamic";

export default async function AdminLogsPage({ searchParams }) {
  await requireFullAdminUser();

  const params = await searchParams;
  const page = parseInt(params?.page || "1", 10);
  const statusFilter = params?.status || "ALL";
  const search = params?.search || "";

  const { logs, total, totalPages, stats } = await getApiLogs({
    limit: 50,
    page,
    status: statusFilter,
    search,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bordergray pb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-fnc-red" />
            System &amp; API Activity Logs
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate mt-1">
            Real-time audit log of every API route hit, request count, response time, and server error.
          </p>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-bordergray rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="font-body text-xs font-bold text-slate uppercase tracking-wider">Total Requests</p>
            <p className="font-display text-2xl font-bold text-charcoal mt-1">{stats.totalRequests.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-fnc-blue/10 text-fnc-blue flex items-center justify-center shrink-0">
            <Server className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-bordergray rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="font-body text-xs font-bold text-slate uppercase tracking-wider">Total Errors</p>
            <p className="font-display text-2xl font-bold text-fnc-red mt-1">{stats.totalErrors.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-fnc-red/10 text-fnc-red flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white border border-bordergray rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="font-body text-xs font-bold text-slate uppercase tracking-wider">Error Rate</p>
            <p className="font-display text-2xl font-bold text-charcoal mt-1">{stats.errorRatePct}%</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-fnc-green/10 text-fnc-green flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-bordergray rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Logs" },
            { id: "ERRORS", label: "Errors Only (4xx & 5xx)" },
            { id: "SERVER_ERRORS", label: "500 Critical Errors" },
            { id: "SUCCESS", label: "200 Success" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/admin/logs?status=${tab.id}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className={`px-3.5 py-2 rounded-xl font-body text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-charcoal text-white shadow-xs"
                    : "bg-warmwhite text-slate hover:text-charcoal hover:bg-bordergray/50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <form method="GET" action="/admin/logs" className="relative shrink-0 sm:w-72">
          <input type="hidden" name="status" value={statusFilter} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search route, error, or IP..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-bordergray bg-warmwhite font-body text-xs text-charcoal focus:border-fnc-red focus:bg-white focus:outline-none transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate" />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-bordergray rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-bordergray bg-warmwhite font-body text-xs font-bold text-slate uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Method &amp; Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">Client IP</th>
                <th className="py-3.5 px-4">Error / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bordergray font-body text-xs text-charcoal">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate">
                    <Terminal className="h-8 w-8 mx-auto mb-2 text-slate/50" />
                    No API activity logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isServerError = log.statusCode >= 500;
                  const isClientError = log.statusCode >= 400 && log.statusCode < 500;
                  const isSuccess = log.statusCode < 400;

                  return (
                    <tr key={log.id} className="hover:bg-warmwhite/50 transition-colors">
                      <td className="py-3.5 px-4 text-slate font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              log.method === "POST"
                                ? "bg-blue-100 text-blue-700"
                                : log.method === "DELETE"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="font-mono text-xs font-bold text-charcoal truncate max-w-xs">
                            {log.route}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                            isSuccess
                              ? "bg-fnc-green/10 text-fnc-green"
                              : isServerError
                              ? "bg-fnc-red/10 text-fnc-red"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.durationMs}ms
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate whitespace-nowrap">
                        {log.ip || "127.0.0.1"}
                      </td>

                      <td className="py-3.5 px-4 max-w-md">
                        {log.error ? (
                          <div className="rounded-lg bg-fnc-red/5 border border-fnc-red/20 p-2 text-[11px] font-mono text-fnc-red break-all">
                            ⚠️ {log.error}
                          </div>
                        ) : log.details ? (
                          <details className="cursor-pointer text-[11px] font-mono text-slate">
                            <summary className="hover:text-charcoal font-semibold select-none">
                              View Payload
                            </summary>
                            <pre className="mt-1 p-2 bg-warmwhite rounded-lg border border-bordergray overflow-x-auto text-[10px]">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-slate/60 text-[11px] italic">OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-bordergray bg-warmwhite flex items-center justify-between font-body text-xs text-slate">
            <span>
              Showing page <strong className="text-charcoal">{page}</strong> of <strong className="text-charcoal">{totalPages}</strong> ({total} entries)
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/logs?page=${page - 1}&status=${statusFilter}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="px-3 py-1.5 rounded-lg border border-bordergray bg-white font-semibold text-charcoal hover:bg-warmwhite transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/logs?page=${page + 1}&status=${statusFilter}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                  className="px-3 py-1.5 rounded-lg border border-bordergray bg-white font-semibold text-charcoal hover:bg-warmwhite transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
