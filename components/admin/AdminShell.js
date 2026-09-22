"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
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
  Undo2,
  ShoppingBag,
  Bike,
  MessageSquare,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { BRAND } from "@/lib/constants";

const ICONS = {
  LayoutDashboard,
  BarChart3,
  Package,
  Layers,
  Boxes,
  Users,
  Ticket,
  SettingsIcon,
  UserCog,
  ImageIcon,
  StoreIcon,
  Star,
  FileText,
  Undo2,
  ShoppingBag,
  Bike,
  MessageSquare,
};

export default function AdminShell({ user, nav, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({ orders: 0, refunds: 0, inquiries: 0 });

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/notifications/counts");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setCounts(data);
        }
      } catch (err) {}
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getBadge = (href) => {
    if (href === "/admin/orders" && counts.orders > 0) return counts.orders;
    if (href === "/admin/refunds" && counts.refunds > 0) return counts.refunds;
    if (href === "/admin/inquiries" && counts.inquiries > 0) return counts.inquiries;
    return null;
  };

  return (
    <div className="h-screen overflow-hidden flex bg-warmwhite">
      {/* Sidebar — its own scroll region so a long nav list never drags
          the header/footer off-screen, independent of the main content
          column's scroll below. */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} shrink-0 flex-col bg-charcoal text-white transition-all duration-200 h-screen overflow-y-auto`}
      >
        <div className="h-24 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <Image src={BRAND.logo} alt={BRAND.name} width={64} height={64} className="h-14 w-14 rounded-lg object-contain bg-white p-1 shrink-0" />
            {!collapsed && <span className="font-display text-base font-bold truncate">F&amp;C Admin</span>}
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          {nav.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            const active = href === "/admin" ? pathname === "/admin" : (pathname === href || pathname.startsWith(`${href}/`));
            const badgeCount = getBadge(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? `${label} ${badgeCount ? `(${badgeCount})` : ""}` : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-sm font-medium transition-colors relative ${
                  active ? "bg-fnc-red text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate flex-1">{label}</span>}
                {badgeCount !== null && (
                  <span
                    className={`h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                      active ? "bg-white text-fnc-red" : "bg-fnc-red text-white"
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" /> : <PanelLeftClose className="h-4.5 w-4.5 shrink-0" />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <Link
            href="/"
            className="px-3.5 py-2 font-body text-xs text-white/50 hover:text-white/80 transition-colors truncate"
          >
            {collapsed ? "←" : "← Back to site"}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header */}
        <header className="h-24 shrink-0 flex items-center justify-between px-6 sm:px-8 bg-white border-b border-bordergray">
          <div className="md:hidden flex items-center gap-2">
            <Image src={BRAND.logo} alt={BRAND.name} width={64} height={64} className="h-14 w-14 rounded-lg object-contain bg-white p-1 shrink-0" />
            <span className="font-display text-lg font-bold text-charcoal">F&amp;C Admin</span>
          </div>
          <div className="hidden md:block font-body text-sm text-slate">
            Signed in as <span className="font-semibold text-charcoal">{user.name}</span>{" "}
            <span className="text-xs uppercase tracking-wide text-fnc-red font-semibold ml-1">
              {user.role.name.replace("_", " ")}
            </span>
          </div>
          <SignOutButton />
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden shrink-0 flex overflow-x-auto gap-1 px-4 py-3 bg-white border-b border-bordergray">
          {nav.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const badgeCount = getBadge(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-body text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  active ? "bg-fnc-red text-white" : "text-charcoal bg-warmwhite"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {badgeCount !== null && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-fnc-red text-white">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
