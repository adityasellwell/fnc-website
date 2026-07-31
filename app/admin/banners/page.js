import { listBanners } from "@/services/banners";
import BannersClientPage from "./BannersClientPage";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Banners — Admin" };

export default async function AdminBannersPage() {
  await requireFullAdminUser();
  const banners = await listBanners();
  const serialized = JSON.parse(JSON.stringify(banners));
  return <BannersClientPage banners={serialized} />;
}
