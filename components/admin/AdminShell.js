"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";
import { BRAND } from "@/lib/constants";

export default function AdminShell({ user, nav, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-warmwhite">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} shrink-0 flex-col bg-charcoal text-white transition-all duration-200`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <Image src={BRAND.logo} alt={BRAND.name} width={36} height={36} className="h-9 w-9 rounded-full object-contain bg-white shrink-0" />
            {!collapsed && <span className="font-display text-base font-bold truncate">F&amp;C Admin</span>}
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-sm font-medium transition-colors ${
                  active ? "bg-fnc-red text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
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

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 bg-white border-b border-bordergray">
          <div className="md:hidden flex items-center gap-2">
            <Image src={BRAND.logo} alt={BRAND.name} width={32} height={32} className="h-8 w-8 rounded-full object-contain" />
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
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 py-3 bg-white border-b border-bordergray">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
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
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
