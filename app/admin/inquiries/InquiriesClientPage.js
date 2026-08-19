"use client";

import Table from "@/components/admin/Table";

export default function InquiriesClientPage({ inquiries }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-charcoal">Inquiries</h1>
        <p className="font-body text-sm text-slate mt-1">
          Franchise applications and Contact form messages, newest first. An email notification
          also goes out to the business address the moment either is submitted.
        </p>
      </div>

      <Table
        emptyMessage="No inquiries yet."
        columns={[
          {
            header: "Type",
            accessor: (row) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs font-semibold ${
                  row.type === "Franchise" ? "bg-fnc-red/10 text-fnc-red" : "bg-fnc-blue/10 text-fnc-blue"
                }`}
              >
                {row.type}
              </span>
            ),
          },
          { header: "Name", accessor: (p) => p.name },
          {
            header: "Contact",
            accessor: (p) => (
              <div className="flex flex-col gap-0.5 font-body text-xs">
                <a href={`mailto:${p.email}`} className="text-fnc-red hover:underline">{p.email}</a>
                {p.phone !== "—" && (
                  <a href={`tel:${p.phone}`} className="text-slate hover:underline">{p.phone}</a>
                )}
              </div>
            ),
          },
          {
            header: "Details",
            accessor: (p) => <span className="font-body text-xs text-slate max-w-xs line-clamp-3 block">{p.detail}</span>,
          },
          {
            header: "Received",
            accessor: (p) =>
              new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          },
        ]}
        rows={inquiries}
      />
    </div>
  );
}
