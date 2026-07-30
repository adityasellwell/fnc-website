import { listBanners } from "@/services/banners";
import BannersClientPage from "./BannersClientPage";

export const metadata = { title: "Banners — Admin" };

export default async function AdminBannersPage() {
  const banners = await listBanners();
  const serialized = JSON.parse(JSON.stringify(banners));
  return <BannersClientPage banners={serialized} />;
}
