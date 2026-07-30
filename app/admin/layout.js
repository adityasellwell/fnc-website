import { requireAdminUser } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

// icon is a lucide-react component *name* (string), not the component itself —
// icon components are functions and can't cross the server/client prop
// boundary, so AdminShell resolves these names to components on its side.
const NAV = [
  { href: "/admin/orders", label: "Orders", icon: "LayoutDashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/categories", label: "Categories", icon: "Layers" },
  { href: "/admin/inventory", label: "Inventory", icon: "Boxes" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
  { href: "/admin/coupons", label: "Coupons", icon: "Ticket" },
  { href: "/admin/banners", label: "Banners", icon: "ImageIcon" },
  { href: "/admin/stores", label: "Stores", icon: "StoreIcon" },
  { href: "/admin/pages", label: "Pages", icon: "FileText" },
  { href: "/admin/settings", label: "Settings", icon: "SettingsIcon" },
];

const ADMIN_ONLY_NAV = [{ href: "/admin/team", label: "Team", icon: "UserCog" }];

export default async function AdminLayout({ children }) {
  const user = await requireAdminUser();
  const nav = user.role.name === "admin" ? [...NAV, ...ADMIN_ONLY_NAV] : NAV;

  return (
    <AdminShell user={user} nav={nav}>
      {children}
    </AdminShell>
  );
}
