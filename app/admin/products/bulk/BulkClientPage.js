"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { previewBulkImportAction, applyBulkImportAction } from "./actions";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  new: { label: "New", className: "bg-fnc-green/10 text-fnc-green border-fnc-green/30" },
  update: { label: "Will update", className: "bg-amber-50 text-amber-700 border-amber-300" },
  unchanged: { label: "No change", className: "bg-warmwhite text-slate border-bordergray" },
  warning: { label: "Possible duplicate", className: "bg-amber-50 text-amber-700 border-amber-300" },
  error: { label: "Error", className: "bg-fnc-red/10 text-fnc-red border-fnc-red/30" },
};

export default function BulkClientPage({ categories }) {
  const [preview, setPreview] = useState(null); // { rows, summary }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await previewBulkImportAction(fd);
      if (res?.error) {
        setError(res.error);
        setPreview(null);
      } else {
        setPreview(res);
      }
    } catch (err) {
      setError(err.message || "Failed to read file.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleApply() {
    if (!preview) return;
    setApplying(true);
    try {
      const res = await applyBulkImportAction(preview.rows);
      if (res?.error) {
        setError(res.error);
      } else {
        setResult(res);
        setPreview(null);
      }
    } catch (err) {
      setError(err.message || "Failed to apply changes.");
    } finally {
      setApplying(false);
    }
  }

  const actionableCount = preview
    ? preview.rows.filter((r) => r.status === "new" || r.status === "update" || r.status === "warning").length
    : 0;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 font-body text-sm text-slate hover:text-charcoal mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Bulk Import / Export</h1>
      <p className="font-body text-sm text-slate mb-6 max-w-2xl">
        Export the full catalog — price, stock, active status, category, additional categories, description,
        cooking/storage instructions, tags and image URLs — edit any of it in Excel, then re-upload the same file.
        Rows are matched by <strong>SKU</strong> — a known SKU updates that product, an unknown or blank SKU creates a new one.
        For Tags/Images/Additional Categories, separate multiple values with a comma. Nothing is saved until you review the preview and confirm.
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href="/api/admin/products/export"
          className="h-11 px-5 rounded-xl border border-bordergray bg-white font-body text-sm font-semibold text-charcoal hover:border-charcoal transition-colors inline-flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Current Catalog (.xlsx)
        </a>

        <label className="h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors inline-flex items-center gap-2 cursor-pointer">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "Reading file..." : "Upload Spreadsheet to Preview"}
          <input ref={inputRef} type="file" accept=".xlsx" onChange={handleFileChange} disabled={loading} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="p-3 mb-6 rounded-xl border border-fnc-red/20 bg-fnc-red/10 font-body text-sm text-fnc-red flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 mb-6 rounded-xl border border-fnc-green/30 bg-fnc-green/10 font-body text-sm text-charcoal">
          <p className="font-semibold flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-fnc-green" />
            Import complete
          </p>
          <p>{result.created} created, {result.updated} updated.</p>
          {result.errors.length > 0 && (
            <div className="mt-2 text-fnc-red">
              <p className="font-semibold">{result.errors.length} row(s) failed:</p>
              <ul className="list-disc list-inside">
                {result.errors.map((e, i) => (
                  <li key={i}>Row {e.row} ({e.name}): {e.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {preview && (
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-body text-sm text-charcoal font-semibold">{preview.summary.total} rows:</span>
            {["new", "update", "warning", "unchanged", "error"].map((key) =>
              preview.summary[key] > 0 ? (
                <span key={key} className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", STATUS_STYLES[key].className)}>
                  {preview.summary[key]} {STATUS_STYLES[key].label.toLowerCase()}
                </span>
              ) : null
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-bordergray mb-4">
            <table className="w-full text-sm font-body">
              <thead className="bg-warmwhite">
                <tr>
                  <th className="text-left px-3 py-2">Row</th>
                  <th className="text-left px-3 py-2">SKU</th>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r) => (
                  <tr key={r.rowNumber} className="border-t border-bordergray">
                    <td className="px-3 py-2 text-slate">{r.rowNumber}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.sku || "—"}</td>
                    <td className="px-3 py-2">{r.name || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", STATUS_STYLES[r.status].className)}>
                        {STATUS_STYLES[r.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate">
                      {r.status === "error" && r.error}
                      {r.status === "update" && r.changes.join("; ")}
                      {r.status === "warning" && (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          Similar to: {r.similar.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={applying || actionableCount === 0}
            className="h-11 px-6 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {applying && <Loader2 className="h-4 w-4 animate-spin" />}
            {applying ? "Applying..." : `Confirm & Apply ${actionableCount} Change${actionableCount === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      <p className="font-body text-xs text-slate mt-8">
        Categories must match an existing category name exactly: {categories.map((c) => c.name).join(", ")}.
      </p>
    </div>
  );
}
