import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Boxes,
  Users,
  Ticket,
  Settings as SettingsIcon,
} from "lucide-react";
import { requireAdminUser } from "@/lib/admin-auth";

const NAV = [
  { href: "/admin/orders", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default async function AdminLayout({ children }) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen flex bg-warmwhite">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-charcoal text-white">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="font-display text-lg font-bold">F&amp;C Admin</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-4">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="font-body text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 bg-white border-b border-bordergray">
          <div className="md:hidden font-display text-lg font-bold text-charcoal">F&amp;C Admin</div>
          <div className="hidden md:block font-body text-sm text-slate">
            Signed in as <span className="font-semibold text-charcoal">{user.name}</span>{" "}
            <span className="text-xs uppercase tracking-wide text-fnc-red font-semibold ml-1">
              {user.role.name.replace("_", " ")}
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 py-3 bg-white border-b border-bordergray">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full font-body text-xs font-semibold text-charcoal bg-warmwhite whitespace-nowrap shrink-0"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
