import { db } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";
import InquiriesClientPage from "./InquiriesClientPage";

export const metadata = { title: "Inquiries — Admin" };

// Franchise applications and Contact form messages both save to the
// database with no admin view at all until now — merged into one list
// (each tagged with its type) since both are "someone wants to hear
// back from us" leads, just from two different forms.
export default async function AdminInquiriesPage() {
  await requireAdminUser();

  const [leads, messages] = await Promise.all([
    db.franchiseLead.findMany({ orderBy: { createdAt: "desc" } }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const combined = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      type: "Franchise",
      name: l.name,
      email: l.email,
      phone: l.phone,
      detail: `${l.city} — Budget: ${l.investmentBudget}${l.message ? ` — "${l.message}"` : ""}`,
      createdAt: l.createdAt,
    })),
    ...messages.map((m) => ({
      id: `msg-${m.id}`,
      type: "Contact",
      name: m.name,
      email: m.email,
      phone: m.phone || "—",
      detail: m.message,
      createdAt: m.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const serialized = JSON.parse(JSON.stringify(combined));
  return <InquiriesClientPage inquiries={serialized} />;
}
