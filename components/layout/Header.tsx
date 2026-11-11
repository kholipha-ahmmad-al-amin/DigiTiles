"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Box,
  Building2,
  CheckCheck,
  Globe,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Presentation,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Truck,
  UserCheck,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { SERVICE_COPY, VISUALIZER_COPY } from "@/lib/i18n";
import { SITE } from "@/lib/seo";
import { GlobalRole } from "@/lib/types";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    locale,
    setLocale,
    theme,
    toggleTheme,
    user,
    organizationContext,
    notifications,
    switchRole,
    logout,
    markNotificationsRead,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  if (pathname?.startsWith("/pitch-deck")) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRoleSwitch = async (targetRole: GlobalRole) => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
    await switchRole(targetRole);
    if (targetRole === "DEALER") {
      router.push("/workspace/dealer");
    } else if (targetRole === "ADMIN") {
      router.push("/workspace/admin");
    } else {
      router.push("/workspace/customer");
    }
  };

  const navItems = [
    {
      href: "/marketplace",
      labelEn: "Marketplace",
      labelBn: "মার্কেটপ্লেস",
      icon: Layers,
    },
    {
      href: "/visualizer",
      labelEn: VISUALIZER_COPY.nav.en,
      labelBn: VISUALIZER_COPY.nav.bn,
      icon: Box,
    },
    {
      href: "/services",
      labelEn: SERVICE_COPY.nav.en,
      labelBn: SERVICE_COPY.nav.bn,
      icon: Truck,
    },
    {
      href: "/pitch-deck",
      labelEn: "Pitch Deck",
      labelBn: "পিচ ডেক",
      icon: Presentation,
    },
    ...(user
      ? [
          ...(user.roles.includes("CUSTOMER")
            ? [
                {
                  href: "/workspace/customer",
                  labelEn: "Customer Workspace",
                  labelBn: "ক্রেতা ড্যাশবোর্ড",
                  icon: ShoppingBag,
                },
              ]
            : []),
          ...(user.roles.includes("DEALER")
            ? [
                {
                  href: "/workspace/dealer",
                  labelEn: "Dealer Portal",
                  labelBn: "ডিলার পোর্টাল",
                  icon: Building2,
                },
              ]
            : []),
          ...(user.roles.includes("ADMIN")
            ? [
                {
                  href: "/workspace/admin",
                  labelEn: "Admin Console",
                  labelBn: "অ্যাডমিন প্যানেল",
                  icon: ShieldCheck,
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2.5 rounded"
            >
              <Image
                src={SITE.interfaceMark}
                alt=""
                width={38}
                height={38}
                priority
                className="shrink-0"
              />
              <div>
                <span className="font-bold text-lg tracking-tight text-ink block leading-none">
                  {SITE.name}
                </span>
                <span className="mt-0.5 hidden text-xs font-medium text-subtle sm:block">
                  {locale === "bn"
                    ? "কানেক্টেড কনস্ট্রাকশন হাব"
                    : "Construction Commerce Hub"}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              aria-label="Main Navigation"
              className="hidden items-center gap-1 xl:flex"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-muted text-ink font-semibold border border-hairline"
                        : "text-secondary hover:text-ink hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{locale === "bn" ? item.labelBn : item.labelEn}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Authenticated Account & Workspace Menu OR Sign In Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((prev) => !prev);
                    setNotifOpen(false);
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-muted hover:bg-canvas text-xs font-medium text-ink flex items-center gap-2 cursor-pointer transition-colors"
                  aria-expanded={accountOpen}
                  aria-label={`${user.fullName} (${user.activeRole})`}
                >
                  <UserCheck className="w-4 h-4 text-accent-teal shrink-0" />
                  <span className="hidden sm:inline truncate max-w-[170px]">
                    {user.fullName.split(" ")[0]} ({user.activeRole})
                  </span>
                </button>

                {accountOpen && (
                  <div className="fixed left-4 right-4 z-50 mt-2 max-h-[75dvh] overflow-y-auto rounded-lg border border-hairline bg-surface p-3.5 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:w-80">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-hairline">
                      <div>
                        <div className="text-xs font-bold text-ink">
                          {user.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-subtle">
                          {user.email || user.phone}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAccountOpen(false)}
                        className="p-1 text-subtle hover:text-ink"
                        aria-label="Close account menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] font-bold uppercase tracking-wider text-subtle mb-2">
                      {locale === "bn"
                        ? "আপনার ওয়ার্কস্পেসসমূহ"
                        : "Your Active Workspaces"}
                    </div>

                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoleSwitch("CUSTOMER")}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                          user.activeRole === "CUSTOMER"
                            ? "border-accent bg-muted font-semibold text-ink"
                            : "border-hairline hover:bg-muted text-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                          <span>
                            {locale === "bn"
                              ? "ক্রেতা ড্যাশবোর্ড"
                              : "Customer Workspace"}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-mono text-[10px] font-bold">
                          CUSTOMER
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSwitch("DEALER")}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                          user.activeRole === "DEALER"
                            ? "border-accent bg-muted font-semibold text-ink"
                            : "border-hairline hover:bg-muted text-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-accent-teal" />
                          <span>
                            {user.roles.includes("DEALER")
                              ? locale === "bn"
                                ? "ডিলার ও শোরুম পোর্টাল"
                                : "Dealer Showroom Portal"
                              : locale === "bn"
                              ? "+ ডিলার অ্যাকাউন্ট সক্রিয় করুন"
                              : "+ Activate Dealer Portal"}
                          </span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-mono text-[10px] font-bold">
                          DEALER
                        </span>
                      </button>

                      {user.roles.includes("ADMIN") && (
                        <button
                          type="button"
                          onClick={() => handleRoleSwitch("ADMIN")}
                          className={`w-full text-left px-3 py-2 rounded border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                            user.activeRole === "ADMIN"
                              ? "border-accent bg-muted font-semibold text-ink"
                              : "border-hairline hover:bg-muted text-secondary"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                            <span>
                              {locale === "bn"
                                ? "অ্যাডমিন কন্ট্রোল প্যানেল"
                                : "Platform Admin Console"}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 font-mono text-[10px] font-bold">
                            ADMIN
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between gap-2">
                      <Link
                        href="/auth"
                        onClick={() => setAccountOpen(false)}
                        className="text-xs font-semibold text-accent hover:underline"
                      >
                        {locale === "bn"
                          ? "অ্যাকাউন্ট ও প্রোফাইল সেটিংস"
                          : "Account & Profile Settings"}
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setAccountOpen(false);
                          await logout();
                          router.push("/auth");
                        }}
                        className="text-xs font-medium text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{locale === "bn" ? "সাইন আউট" : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="min-h-[40px] px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{locale === "bn" ? "লগইন / অ্যাকাউন্ট" : "Sign In"}</span>
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setAccountOpen(false);
                }}
                className="w-10 h-10 rounded border border-hairline bg-surface hover:bg-muted flex items-center justify-center relative cursor-pointer transition-colors"
                aria-expanded={notifOpen}
                aria-label={
                  locale === "bn"
                    ? `নোটিফিকেশন, ${unreadCount} টি অপঠিত`
                    : `Notifications, ${unreadCount} unread`
                }
              >
                <Bell className="w-4 h-4 text-ink" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[11px] font-mono font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="fixed left-4 right-4 z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-lg border border-hairline bg-surface p-3 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:w-96">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                    <span className="text-xs font-bold uppercase tracking-wider text-subtle">
                      {locale === "bn" ? "নোটিফিকেশনসমূহ" : "Notifications"}
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markNotificationsRead()}
                        className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>
                          {locale === "bn" ? "সব পঠিত করুন" : "Mark all read"}
                        </span>
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <p className="text-xs text-subtle py-6 text-center">
                      {locale === "bn"
                        ? "কোনো নতুন নোটিফিকেশন নেই।"
                        : "No notifications yet."}
                    </p>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.linkPath}
                          onClick={() => {
                            setNotifOpen(false);
                            if (!n.isRead) markNotificationsRead(n.id);
                          }}
                          className={`block p-2.5 rounded border text-xs transition-colors ${
                            n.isRead
                              ? "border-hairline bg-surface text-secondary"
                              : "border-accent bg-muted text-ink font-medium"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-ink">
                              {locale === "bn" ? n.titleBn : n.titleEn}
                            </span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted border border-hairline">
                              {n.category}
                            </span>
                          </div>
                          <p className="text-secondary leading-relaxed">
                            {locale === "bn" ? n.bodyBn : n.bodyEn}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bilingual Language Toggle */}
            <button
              type="button"
              onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
              className="min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-surface hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap"
              aria-label={
                locale === "bn"
                  ? "Switch language to English"
                  : "ভাষা বাংলায় পরিবর্তন করুন"
              }
            >
              <Globe className="w-3.5 h-3.5 text-accent" />
              <span>{locale === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            {/* Theme Toggle (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded border border-hairline bg-surface hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
              aria-label={
                theme === "light"
                  ? "Activate Dark Mode"
                  : "Activate Light Mode"
              }
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-ink" />
              ) : (
                <Sun className="w-4 h-4 text-ink" />
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded border border-hairline bg-surface text-ink xl:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Active Organization / User Context Sub-bar when logged in */}
        {user && (
          <div className="py-1.5 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-secondary">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-ink">
                {locale === "bn" ? "সক্রিয় অ্যাকাউন্ট:" : "Active Account:"}{" "}
                <strong>{user.fullName}</strong> ({user.email || user.phone})
              </span>
              {organizationContext && (
                <span className="px-2 py-0.5 rounded bg-muted border border-hairline font-medium text-ink">
                  {locale === "bn"
                    ? organizationContext.organization.tradeNameBn
                    : organizationContext.organization.tradeNameEn}{" "}
                  [{organizationContext.organization.verificationStatus}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="font-medium text-accent hover:underline"
              >
                {locale === "bn"
                  ? "রোল ও ওয়ার্কস্পেস ব্যবস্থাপনা"
                  : "Manage Roles & Workspaces"}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="space-y-1.5 border-t border-hairline bg-surface px-4 py-3 xl:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium ${
                  isActive
                    ? "bg-muted text-ink font-semibold"
                    : "text-secondary hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{locale === "bn" ? item.labelBn : item.labelEn}</span>
              </Link>
            );
          })}
          <Link
            href="/auth"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center mt-2 py-2.5 rounded bg-accent text-white text-sm font-semibold"
          >
            {user
              ? locale === "bn"
                ? "অ্যাকাউন্ট ও ওয়ার্কস্পেস সুইচ"
                : "Account & Workspace Switcher"
              : locale === "bn"
              ? "সাইন ইন / রেজিস্টার"
              : "Sign In / Register"}
          </Link>
        </div>
      )}
    </header>
  );
}
