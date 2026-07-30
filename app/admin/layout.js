import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Boxes,
  Users,
  Ticket,
  Settings as SettingsIcon,
  UserCog,
  Image as ImageIcon,
  Store as StoreIcon,
  Star,
  FileText,
} from "lucide-react";
import { requireAdminUser } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

const NAV = [
  { href: "/admin/orders", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/stores", label: "Stores", icon: StoreIcon },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const ADMIN_ONLY_NAV = [{ href: "/admin/team", label: "Team", icon: UserCog }];

export default async function AdminLayout({ children }) {
  const user = await requireAdminUser();
  const nav = user.role.name === "admin" ? [...NAV, ...ADMIN_ONLY_NAV] : NAV;

  return (
    <AdminShell user={user} nav={nav}>
      {children}
    </AdminShell>
  );
}
