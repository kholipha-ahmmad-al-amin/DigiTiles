"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { GUIDE_COPY, UI_COPY } from "@/lib/i18n";
import { SITE } from "@/lib/seo";

export function Footer() {
  const pathname = usePathname();
  const { locale } = useApp();

  if (pathname?.startsWith("/pitch-deck")) {
    return null;
  }

  return (
    <footer className="border-t border-hairline bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded">
              <Image src={SITE.interfaceMark} alt="" width={42} height={42} className="shrink-0" />
              <div>
                <span className="block text-lg font-bold text-ink">{SITE.name}</span>
                <span className="block text-xs text-secondary">{UI_COPY.nav.brandTagline[locale]}</span>
              </div>
            </Link>
            <p className="text-sm text-secondary max-w-xl leading-relaxed">
              {locale === "bn"
                ? "বাংলাদেশের নির্মাণসামগ্রী ক্রেতা, ভেরিফায়েড টাইলস শোরুম এবং ডেলিভারি সমন্বয়ের ডিজিটাল প্ল্যাটফর্ম। স্বচ্ছ স্পেসিফিকেশন, আরএফকিউ কোটেশন এবং নিরাপদ অর্ডার ব্যবস্থাপনা।"
                : "Bangladesh-first construction commerce platform connecting project buyers with verified tile showrooms through structured specifications, immutable quotations, and tracked order fulfilment."}
            </p>
            <p className="text-xs font-mono text-subtle">
              Traditional Industry. Digital Future. Connected Opportunities.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
              {locale === "bn" ? "প্ল্যাটফর্ম মডিউল" : "Platform Workspaces"}
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/marketplace"
                  className="text-secondary hover:text-ink transition-colors"
                >
                  {locale === "bn"
                    ? "টাইলস ও স্যানিটারি মার্কেটপ্লেস"
                    : "Material Discovery Hub"}
                </Link>
              </li>
              <li>
                <Link
                  href="/workspace/customer"
                  className="text-secondary hover:text-ink transition-colors"
                >
                  {locale === "bn"
                    ? "ক্রেতা আরএফকিউ ও অর্ডার"
                    : "Customer RFQ & Orders"}
                </Link>
              </li>
              <li>
                <Link
                  href="/workspace/dealer"
                  className="text-secondary hover:text-ink transition-colors"
                >
                  {locale === "bn"
                    ? "ডিলার ও শোরুম পোর্টাল"
                    : "Dealer Showroom Portal"}
                </Link>
              </li>
              <li>
                <Link
                  href="/workspace/admin"
                  className="text-secondary hover:text-ink transition-colors"
                >
                  {locale === "bn"
                    ? "অ্যাডমিন ভেরিফিকেশন ও অডিট"
                    : "Admin Oversight & Audit"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
              {GUIDE_COPY.label[locale]}
            </h2>
            <ul className="space-y-2 text-sm text-secondary">
              <li><Link href="/guides" className="hover:underline">{GUIDE_COPY.read[locale]}</Link></li>
              <li><Link href="/visualizer" className="hover:underline">{GUIDE_COPY.visualizer[locale]}</Link></li>
              <li><Link href="/services" className="hover:underline">{GUIDE_COPY.services[locale]}</Link></li>
              <li>
                <Link
                  href="/pitch-deck"
                  className="hover:underline text-accent font-medium"
                >
                  {locale === "bn" ? "৩ডি এক্সিকিউটিভ পিচ ডেক" : "3D Executive Pitch Deck"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-subtle">
          <span>
            DigiTiles Bangladesh. Currency: BDT. Bilingual Ready (Bangla / English).
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{GUIDE_COPY.engineered[locale]} <a href={SITE.agency.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.agency.name}</a></span>
            <a href={SITE.parent.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.parent.name}</a>
            <span>{GUIDE_COPY.architect[locale]} <a href={SITE.creator.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.creator.name}</a></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
