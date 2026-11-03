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
  LogOut,
  Menu,
  Moon,
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
    demoAccounts,
    quickSwitchPersona,
    logout,
    markNotificationsRead,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const personaText = user
    ? `${user.fullName.split(" ")[0]} (${user.activeRole})`
    : locale === "bn" ? "পাইলট রোল সুইচার" : "Pilot Role Switcher";
  const personaAction = locale === "bn"
    ? "রোল ও ডেমো অ্যাকাউন্ট পরিবর্তন"
    : "Switch Active Role or Pilot Account";

  const handlePersonaSelect = async (
    demoUserId: string,
    targetRole: GlobalRole,
    redirectPath: string
  ) => {
    setPersonaOpen(false);
    setMobileMenuOpen(false);
    await quickSwitchPersona(demoUserId, targetRole);
    router.push(redirectPath);
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
      href: "/workspace/customer",
      labelEn: "Customer Workspace",
      labelBn: "ক্রেতা ড্যাশবোর্ড",
      icon: ShoppingBag,
    },
    {
      href: "/workspace/dealer",
      labelEn: "Dealer Portal",
      labelBn: "ডিলার পোর্টাল",
      icon: Building2,
    },
    {
      href: "/workspace/admin",
      labelEn: "Admin Console",
      labelBn: "অ্যাডমিন প্যানেল",
      icon: ShieldCheck,
    },
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
              <Image src={SITE.interfaceMark} alt="" width={38} height={38} priority className="shrink-0" />
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
                    <span className={item.href.startsWith("/workspace/") ? "sr-only" : undefined}>
                      {locale === "bn" ? item.labelBn : item.labelEn}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Pilot Role / Persona Quick Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPersonaOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-muted hover:bg-canvas text-xs font-medium text-ink flex items-center gap-2 cursor-pointer transition-colors"
                aria-expanded={personaOpen}
                aria-label={`${personaText}. ${personaAction}`}
              >
                <UserCheck className="w-4 h-4 text-accent-teal shrink-0" />
                <span className="hidden sm:inline truncate max-w-[160px]">
                  {personaText}
                </span>
              </button>

              {personaOpen && (
                <div className="fixed left-4 right-4 z-50 mt-2 max-h-[70dvh] overflow-y-auto rounded-lg border border-hairline bg-surface p-3 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:w-80">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
                    <span className="text-xs font-bold uppercase tracking-wider text-subtle">
                      {locale === "bn"
                        ? "পাইলট রোল ও অ্যাকাউন্ট টেস্ট"
                        : "Instant Pilot Role Switcher"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPersonaOpen(false)}
                      className="p-1 text-subtle hover:text-ink"
                      aria-label="Close role switcher"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-secondary mb-2.5">
                    {locale === "bn"
                      ? "এক ক্লিকে কাস্টমার, ভেরিফায়েড ডিলার বা প্ল্যাটফর্ম অ্যাডমিন হিসেবে সিস্টেমটি পরীক্ষা করুন:"
                      : "Test any persona immediately with one click or use Phone OTP login:"}
                  </p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handlePersonaSelect(
                          "usr_customer_01",
                          "CUSTOMER",
                          "/workspace/customer"
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded border border-hairline hover:bg-muted transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-ink">
                          Tanvir Ahmed (Customer Buyer)
                        </div>
                        <div className="text-subtle font-mono">
                          +8801711223344
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                        CUSTOMER
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePersonaSelect(
                          "usr_dealer_01",
                          "DEALER",
                          "/workspace/dealer"
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded border border-hairline hover:bg-muted transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-ink">
                          Hatirpool Ceramic Emporium
                        </div>
                        <div className="text-subtle font-mono">
                          Mahmudul Hasan (Verified Owner)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold">
                        DEALER
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePersonaSelect(
                          "usr_dealer_pending",
                          "DEALER",
                          "/workspace/dealer/organization"
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded border border-hairline hover:bg-muted transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-ink">
                          Surma Ceramic Center (Sylhet)
                        </div>
                        <div className="text-subtle font-mono">
                          Shafiqul Alam (Submitted Verification)
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 font-semibold">
                        PENDING
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handlePersonaSelect(
                          "usr_admin_01",
                          "ADMIN",
                          "/workspace/admin"
                        )
                      }
                      className="w-full text-left px-3 py-2 rounded border border-hairline hover:bg-muted transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-ink">
                          Nusrat Jahan (Platform Admin)
                        </div>
                        <div className="text-subtle font-mono">
                          Verification, Moderation & Audit
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 font-semibold">
                        ADMIN
                      </span>
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between gap-2">
                    <Link
                      href="/auth"
                      onClick={() => setPersonaOpen(false)}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      {locale === "bn"
                        ? "ফোন ওটিপি লগইন পেজ"
                        : "Phone OTP Login Screen"}
                    </Link>
                    {user && (
                      <button
                        type="button"
                        onClick={async () => {
                          setPersonaOpen(false);
                          await logout();
                        }}
                        className="text-xs font-medium text-red-700 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{locale === "bn" ? "লগআউট" : "Sign Out"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell (FR-13) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((prev) => !prev);
                  setPersonaOpen(false);
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
                      {locale === "bn"
                        ? "নোটিফিকেশন ফিড (FR-13)"
                        : "Notifications (FR-13)"}
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
                        ? "কোনো নোটিফিকেশন নেই। রোল সুইচার দিয়ে লগইন করুন।"
                        : "No notifications yet. Select a persona or sign in."}
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

            {/* Bilingual Language Toggle (FR-15) */}
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

            {/* Sign In Link if unauthenticated */}
            {!user && (
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-3.5 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                {locale === "bn" ? "ওটিপি লগইন" : "OTP Sign In"}
              </Link>
            )}

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
                {locale === "bn" ? "লগইন পরিচয়:" : "Signed in as:"}{" "}
                <strong>{user.fullName}</strong> ({user.phone})
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
                  ? "রোল যোগ বা পরিবর্তন (FR-02)"
                  : "Manage Roles & Identity (FR-02)"}
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
            {locale === "bn"
              ? "ফোন ওটিপি লগইন ও রোল সুইচ"
              : "Phone OTP Login & Role Switch"}
          </Link>
        </div>
      )}
    </header>
  );
}
