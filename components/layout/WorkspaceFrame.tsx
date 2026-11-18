"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { GlobalRole } from "@/lib/types";

const LINKS: Record<GlobalRole, { href: string; en: string; bn: string }[]> = {
  CUSTOMER: [
    { href: "/workspace/customer", en: "Overview", bn: "সারাংশ" },
    { href: "/workspace/customer/rfqs", en: "Quotes", bn: "কোটেশন" },
    { href: "/workspace/customer/orders", en: "Orders", bn: "অর্ডার" },
    { href: "/marketplace", en: "Catalogue", bn: "ক্যাটালগ" },
  ],
  DEALER: [
    { href: "/workspace/dealer", en: "Overview", bn: "সারাংশ" },
    { href: "/workspace/dealer/organization", en: "Showroom", bn: "শোরুম" },
    { href: "/workspace/dealer/catalogue", en: "Catalogue", bn: "ক্যাটালগ" },
    { href: "/workspace/dealer/rfqs", en: "Quotes", bn: "কোটেশন" },
    { href: "/workspace/dealer/orders", en: "Dispatch", bn: "ডেলিভারি" },
  ],
  ADMIN: [
    { href: "/workspace/admin", en: "Review", bn: "পর্যালোচনা" },
    { href: "/workspace/admin/orders", en: "Orders", bn: "অর্ডার" },
    { href: "/workspace/admin/audit", en: "Audit", bn: "অডিট" },
  ],
};

export function WorkspaceFrame({
  role,
  children,
}: {
  role: GlobalRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale, user, organizationContext } = useApp();
  const links = LINKS[role] ?? [];

  return (
    <div className="ws-frame">
      <nav className="ws-nav" aria-label={locale === "bn" ? "ওয়ার্কস্পেস" : "Workspace"}>
        {links.map((item) => {
          const current = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined}>
              {locale === "bn" ? item.bn : item.en}
            </Link>
          );
        })}
      </nav>
      <div className="ws-main">{children}</div>
      <aside className="ws-rail" aria-label={locale === "bn" ? "অ্যাকাউন্ট" : "Account"}>
        <p className="text-xs font-mono font-semibold uppercase tracking-wide text-subtle">
          {role}
        </p>
        <h2 className="mt-2 text-lg font-bold text-ink">
          {user?.fullName}
        </h2>
        <p className="mt-1 text-sm text-secondary">{user?.email || user?.phone}</p>
        {organizationContext && (
          <p className="mt-4 border-t border-hairline pt-4 text-sm font-semibold text-ink">
            {locale === "bn"
              ? organizationContext.organization.tradeNameBn
              : organizationContext.organization.tradeNameEn}
            <span className="mt-1 block font-mono text-xs font-medium text-secondary">
              {organizationContext.organization.verificationStatus}
            </span>
          </p>
        )}
        <Link href="/auth" className="btn-line mt-5 w-full">
          {locale === "bn" ? "রোল ব্যবস্থাপনা" : "Manage roles"}
        </Link>
      </aside>
    </div>
  );
}
