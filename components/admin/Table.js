import { cn } from "@/lib/utils";

/**
 * Presentational only (server-renderable) — column definitions:
 * { header: string, accessor: string | (row) => ReactNode, className? }
 */
export default function Table({ columns, rows, keyField = "id", emptyMessage = "Nothing here yet." }) {
  return (
    <div className="bg-white border border-bordergray rounded-2xl overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="border-b border-bordergray">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "font-body text-xs font-semibold uppercase tracking-wide text-slate px-5 py-3.5",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="font-body text-sm text-slate text-center py-10">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[keyField]} className="border-b border-bordergray last:border-b-0 hover:bg-warmwhite/60 transition-colors">
                {columns.map((col) => (
                  <td key={col.header} className={cn("font-body text-sm text-charcoal px-5 py-4", col.className)}>
                    {typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
