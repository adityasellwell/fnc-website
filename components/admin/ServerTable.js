import { cn } from "@/lib/utils";
import ScrollContainer from "./ScrollContainer";

export default function ServerTable({ columns, rows, keyField = "id", emptyMessage = "Nothing here yet." }) {
  return (
    <ScrollContainer>
      <table className="w-full text-left border-collapse min-w-160">
        <thead>
          <tr className="border-b border-bordergray bg-warmwhite/60">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "font-body text-[11px] font-bold uppercase tracking-wider text-slate px-4 sm:px-5 py-3 whitespace-nowrap",
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
              <td colSpan={columns.length} className="font-body text-sm text-slate text-center py-12">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row[keyField]}
                className="border-b border-bordergray last:border-b-0 hover:bg-warmwhite/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={cn("font-body text-sm text-charcoal px-4 sm:px-5 py-3.5 align-middle", col.className)}
                  >
                    {typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ScrollContainer>
  );
}
