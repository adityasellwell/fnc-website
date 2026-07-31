import { listPages } from "@/services/pages";
import PagesClientPage from "./PagesClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Pages — Admin" };

export default async function AdminPagesPage() {
  await requireFullAdminUser();
  const pages = await listPages();
  const serialized = JSON.parse(JSON.stringify(pages));
  return <PagesClientPage pages={serialized} />;
}
