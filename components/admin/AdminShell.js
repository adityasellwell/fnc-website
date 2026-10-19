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
  Activity,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Shield,
  Bell,
  Volume2,
  VolumeX,
} from "lucide-react";
import { playOrderAlarm, playRefundAlert, playInquiryNotification } from "@/lib/utils/alarmAudio";
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
  Activity,
};

export default function AdminShell({ user, nav, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState({ orders: 0, refunds: 0, inquiries: 0 });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentAlert, setRecentAlert] = useState(null);

  // Initialize sound preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fnc_admin_sound_enabled");
      if (stored !== null) {
        setSoundEnabled(stored === "true");
      }
    } catch (e) {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fnc_admin_sound_enabled", String(next));
      } catch (e) {}
      if (next) {
        // Quick confirmation test chime when toggling ON
        playOrderAlarm();
      }
      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    let initialLoad = true;
    let prevCounts = { orders: 0, refunds: 0, inquiries: 0 };

    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/notifications/counts");
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;

          setCounts(data);

          // Only trigger alarms on updates AFTER the initial load
          if (!initialLoad) {
            const hasNewOrder = (data.orders || 0) > (prevCounts.orders || 0);
            const hasNewRefund = (data.refunds || 0) > (prevCounts.refunds || 0);
            const hasNewInquiry = (data.inquiries || 0) > (prevCounts.inquiries || 0);

            if (hasNewOrder) {
              if (soundEnabled) playOrderAlarm();
              setRecentAlert({
                type: "order",
                message: `🔔 New Order received! (${data.orders} pending)`,
                href: "/admin/orders",
              });
            } else if (hasNewRefund) {
              if (soundEnabled) playRefundAlert();
              setRecentAlert({
                type: "refund",
                message: `⚠️ New Refund Request! (${data.refunds} pending)`,
                href: "/admin/refunds",
              });
            } else if (hasNewInquiry) {
              if (soundEnabled) playInquiryNotification();
              setRecentAlert({
                type: "inquiry",
                message: `💬 New Customer Inquiry! (${data.inquiries} unread)`,
                href: "/admin/inquiries",
              });
            }
          }

          prevCounts = data;
          initialLoad = false;
        }
      } catch (err) {}
    };

    fetchCounts();
    // Poll every 15 seconds so order alerts arrive fast
    const interval = setInterval(fetchCounts, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [soundEnabled]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const getBadge = (href) => {
    if (href === "/admin/orders" && counts.orders > 0) return counts.orders;
    if (href === "/admin/refunds" && counts.refunds > 0) return counts.refunds;
    if (href === "/admin/inquiries" && counts.inquiries > 0) return counts.inquiries;
    return null;
  };

  const totalNotifications = counts.orders + counts.refunds + counts.inquiries;

  return (
    <div className="h-screen overflow-hidden flex bg-warmwhite">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-charcoal text-white z-50 flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={48}
              height={48}
              className="h-10 w-10 rounded-lg object-contain bg-white p-1 shrink-0"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold truncate">F&amp;C Admin</span>
              <span className="font-body text-[10px] text-white/60">Control Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Badge Mobile */}
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-fnc-red text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs font-bold text-white truncate">{user.name}</p>
            <p className="font-body text-[10px] text-fnc-red uppercase font-semibold">
              {user.role.name.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {nav.map(({ href, label, icon }) => {
            const Icon = ICONS[icon] || Shield;
            const active = href === "/admin" ? pathname === "/admin" : (pathname === href || pathname.startsWith(`${href}/`));
            const badgeCount = getBadge(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-body text-sm font-medium transition-colors ${
                  active ? "bg-fnc-red text-white font-bold" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
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

        <div className="p-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-body text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} shrink-0 flex-col bg-charcoal text-white transition-all duration-200 h-screen overflow-y-auto`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={64}
              height={64}
              className="h-12 w-12 rounded-lg object-contain bg-white p-1 shrink-0"
            />
            {!collapsed && <span className="font-display text-base font-bold truncate">F&amp;C Admin</span>}
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3">
          {nav.map(({ href, label, icon }) => {
            const Icon = ICONS[icon] || Shield;
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

        <div className="p-3 border-t border-white/10 flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5 shrink-0" /> : <PanelLeftClose className="h-4.5 w-4.5 shrink-0" />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
          <Link
            href="/"
            className="px-3.5 py-2 font-body text-xs text-white/50 hover:text-white/80 transition-colors truncate"
          >
            {collapsed ? "←" : "← Back to site"}
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-bordergray shadow-2xs z-10">
          {/* Left Header Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-warmwhite border border-bordergray text-charcoal hover:bg-warmwhite/80 transition-colors active:scale-95"
              aria-label="Open Admin Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/admin" className="md:hidden flex items-center gap-2">
              <Image
                src={BRAND.logo}
                alt={BRAND.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain bg-white border border-bordergray p-0.5 shrink-0"
              />
              <span className="font-display text-base font-bold text-charcoal">F&amp;C Admin</span>
            </Link>

            <div className="hidden md:block font-body text-sm text-slate">
              Signed in as <span className="font-semibold text-charcoal">{user.name}</span>{" "}
              <span className="text-xs uppercase tracking-wide text-fnc-red font-semibold ml-1">
                ({user.role.name.replace("_", " ")})
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Audio Alarm Toggle Button */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? "Order Sound Alarm: ON (Click to mute)" : "Order Sound Alarm: MUTED (Click to enable)"}
              className={`h-9 px-3 rounded-full font-body text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                soundEnabled
                  ? "bg-fnc-green/10 text-fnc-green border-fnc-green/30 hover:bg-fnc-green/20"
                  : "bg-warmwhite text-slate border-bordergray hover:text-charcoal"
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-fnc-green animate-pulse" />
                  <span className="hidden sm:inline">Alarm: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Alarm: Muted</span>
                </>
              )}
            </button>

            {totalNotifications > 0 && (
              <Link
                href="/admin/orders"
                className="h-9 px-2.5 rounded-full bg-fnc-red/10 border border-fnc-red/20 text-fnc-red font-body text-xs font-bold flex items-center gap-1.5 hover:bg-fnc-red/20 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{totalNotifications} New</span>
              </Link>
            )}
            <SignOutButton />
          </div>
        </header>

        {/* Live Floating Alert Toast */}
        {recentAlert && (
          <div className="bg-charcoal text-white px-4 py-2.5 flex items-center justify-between text-xs font-body shadow-md border-b border-white/10 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <Link href={recentAlert.href} className="font-semibold hover:underline flex items-center gap-2">
              <span>{recentAlert.message}</span>
              <span className="underline text-fnc-red font-bold">View Now →</span>
            </Link>
            <button
              type="button"
              onClick={() => setRecentAlert(null)}
              className="text-white/70 hover:text-white px-2 py-0.5 rounded text-sm font-bold"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mobile Horizontal Quick Nav */}
        <nav className="md:hidden shrink-0 flex overflow-x-auto gap-1.5 px-3 py-2.5 bg-white border-b border-bordergray/80 shadow-2xs no-scrollbar">
          {nav.map(({ href, label, icon }) => {
            const Icon = ICONS[icon] || Shield;
            const active = href === "/admin" ? pathname === "/admin" : (pathname === href || pathname.startsWith(`${href}/`));
            const badgeCount = getBadge(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  active ? "bg-fnc-red text-white shadow-2xs" : "text-charcoal bg-warmwhite border border-bordergray/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                {badgeCount !== null && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${active ? "bg-white text-fnc-red" : "bg-fnc-red text-white"}`}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Main Content Region */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
