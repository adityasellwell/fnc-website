import { requireAdminUser } from "@/lib/admin-auth";
import AdminShell from "@/components/admin/AdminShell";

const SUPER_ADMIN_NAV = [
  { href: "/admin/orders", label: "Orders", icon: "LayoutDashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/categories", label: "Categories", icon: "Layers" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
  { href: "/admin/coupons", label: "Coupons", icon: "Ticket" },
  { href: "/admin/refunds", label: "Refunds", icon: "Undo2" },
  { href: "/admin/banners", label: "Banners", icon: "ImageIcon" },
  { href: "/admin/stores", label: "Stores", icon: "StoreIcon" },
  { href: "/admin/pages", label: "Pages", icon: "FileText" },
  { href: "/admin/settings", label: "Settings", icon: "SettingsIcon" },
  { href: "/admin/team", label: "Team", icon: "UserCog" },
];

const STORE_ADMIN_NAV = [
  { href: "/admin/orders", label: "Orders", icon: "LayoutDashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
  { href: "/admin/team", label: "Team", icon: "UserCog" },
];

const STAFF_NAV = [
  { href: "/admin/orders", label: "Orders", icon: "LayoutDashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/admin/products", label: "Products", icon: "Package" },
  { href: "/admin/customers", label: "Customers", icon: "Users" },
  { href: "/admin/reviews", label: "Reviews", icon: "Star" },
];

export default async function AdminLayout({ children }) {
  const user = await requireAdminUser();

  let nav = STAFF_NAV;
  if (user.role.name === "admin") {
    nav = SUPER_ADMIN_NAV;
  } else if (user.role.name === "store_manager") {
    nav = STORE_ADMIN_NAV;
  }

  return (
    <AdminShell user={user} nav={nav}>
      {children}
    </AdminShell>
  );
}
