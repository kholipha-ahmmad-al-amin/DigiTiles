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
    <footer className="site-footer">
      <div className="footer-stage">
        <div className="max-w-xl space-y-3">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 rounded">
            <Image src={SITE.interfaceMark} alt="" width={42} height={42} className="shrink-0" />
            <span>
              <span className="block text-lg font-bold text-ink">{SITE.name}</span>
              <span className="block text-xs text-secondary">{UI_COPY.nav.brandTagline[locale]}</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed text-secondary">
            {locale === "bn"
              ? "বাংলাদেশের নির্মাণসামগ্রী ক্রেতা, ভেরিফায়েড টাইলস শোরুম এবং ডেলিভারি সমন্বয়ের ডিজিটাল প্ল্যাটফর্ম। স্বচ্ছ স্পেসিফিকেশন, আরএফকিউ কোটেশন এবং নিরাপদ অর্ডার ব্যবস্থাপনা।"
              : "Bangladesh-first construction commerce platform connecting project buyers with verified tile showrooms through structured specifications, immutable quotations, and tracked order fulfilment."}
          </p>
          <p className="font-mono text-xs text-subtle">
            Traditional Industry. Digital Future. Connected Opportunities.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-ink">
              {locale === "bn" ? "প্ল্যাটফর্ম" : "Platform"}
            </h2>
            <Link href="/marketplace">{UI_COPY.nav.marketplace[locale]}</Link>
            <Link href="/assistant">{UI_COPY.nav.assistant[locale]}</Link>
            <Link href="/workspace/customer">{UI_COPY.nav.customerWorkspace[locale]}</Link>
            <Link href="/workspace/dealer">{UI_COPY.nav.dealerWorkspace[locale]}</Link>
            <Link href="/workspace/admin">{UI_COPY.nav.adminWorkspace[locale]}</Link>
          </div>
          <div>
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-ink">
              {GUIDE_COPY.label[locale]}
            </h2>
            <Link href="/guides">{GUIDE_COPY.read[locale]}</Link>
            <Link href="/visualizer">{GUIDE_COPY.visualizer[locale]}</Link>
            <Link href="/services">{GUIDE_COPY.services[locale]}</Link>
            <Link href="/pitch-deck">{locale === "bn" ? "পিচ ডেক" : "Pitch Deck"}</Link>
          </div>
          <div className="space-y-2 text-xs text-subtle">
            <p>DigiTiles Bangladesh. Currency: BDT. Bangla / English.</p>
            <p>
              {GUIDE_COPY.engineered[locale]}{" "}
              <a href={SITE.agency.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.agency.name}</a>
            </p>
            <p><a href={SITE.parent.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.parent.name}</a></p>
            <p>
              {GUIDE_COPY.architect[locale]}{" "}
              <a href={SITE.creator.url} target="_blank" rel="noopener" className="text-accent underline">{SITE.creator.name}</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
