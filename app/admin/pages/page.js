import { listPages } from "@/services/pages";
import PagesClientPage from "./PagesClientPage";

export const metadata = { title: "Pages — Admin" };

export default async function AdminPagesPage() {
  const pages = await listPages();
  const serialized = JSON.parse(JSON.stringify(pages));
  return <PagesClientPage pages={serialized} />;
}
