"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { TileSwatchPreview } from "@/components/ui/TileSwatchPreview";
import { formatBdt, GUIDE_COPY } from "@/lib/i18n";
import type { discoverCatalogue } from "@/lib/public-catalogue";

export function HomeContent({ items: featuredListings, verifiedShowrooms }: ReturnType<typeof discoverCatalogue>) {
  const router = useRouter();
  const { locale } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const convertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const footer = document.querySelector("footer");
    const node = convertRef.current;
    if (!footer || !node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.hidden = entry.isIntersecting;
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = searchQuery.trim()
      ? `/marketplace?q=${encodeURIComponent(searchQuery.trim())}`
      : "/marketplace";
    router.push(target);
  };

  return (
    <div className="home-stage">
      <section className="home-hero reveal space-y-6">
              <p className="eyebrow">
                <span>{locale === "bn" ? "বাংলাদেশ" : "Bangladesh"}</span>
                <span className="pipe text-accent" aria-hidden="true">|</span>
                <span>{locale === "bn" ? "মূল্য BDT" : "Prices in BDT"}</span>
              </p>

              <h1 className="display-title text-ink">
                {locale === "bn"
                  ? "ভেরিফায়েড শোরুম থেকে টাইলস খুঁজুন, কোটেশন নিন, অর্ডার ট্র্যাক করুন"
                  : "Find tiles from verified showrooms, compare quotes, track orders"}
              </h1>

              <p className="text-base sm:text-lg text-secondary leading-relaxed max-w-2xl">
                {locale === "bn"
                  ? "এক জায়গায় ক্যাটালগ দেখুন, পরিমাপ অনুযায়ী বক্স হিসাব করুন, শোরুমে RFQ পাঠান এবং ডেলিভারি পর্যন্ত হালনাগাদ রাখুন।"
                  : "Browse catalogue listings, estimate box quantities, send a quotation request to the showroom, and follow delivery updates in one place."}
              </p>

              {/* Direct Search Bar (FR-07) */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-2.5 pt-2 max-w-2xl"
              >
                <div className="relative flex-1">
                  <label htmlFor="hero-search-input" className="sr-only">
                    {locale === "bn"
                      ? "টাইলস, ব্র্যান্ড বা সাইজ খুঁজুন"
                      : "Search tiles, brands, or dimensions"}
                  </label>
                  <Search className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      locale === "bn"
                        ? "যেমন: 600x600, RAK, Akij, Porcelain, Matt..."
                        : "Search by size (600x600), brand (RAK, Akij), or finish..."
                    }
                    className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded border border-hairline bg-canvas text-ink text-sm focus:bg-surface"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-solid"
                >
                  <span>
                    {locale === "bn"
                      ? "ক্যাটালগ খুঁজুন"
                      : "Explore Catalogue"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Action Links */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/marketplace"
                  className="btn-line text-xs"
                >
                  {locale === "bn" ? "সব পণ্য" : "All listings"}
                </Link>
                <Link
                  href="/visualizer"
                  className="btn-line text-xs"
                >
                  {locale === "bn" ? "রুম প্রিভিউ" : "Room preview"}
                </Link>
                <Link
                  href="/services"
                  className="btn-line text-xs"
                >
                  {locale === "bn" ? "মিস্ত্রি ও পরিবহন" : "Crews and transport"}
                </Link>
                <Link
                  href="/assistant"
                  className="btn-line text-xs"
                >
                  {locale === "bn" ? "ক্যাটালগ জিজ্ঞাসা" : "Ask catalogue"}
                </Link>
              </div>
      </section>

      <aside className="home-loop reveal space-y-5" aria-label="Transaction loop">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">
                    {locale === "bn" ? "কিভাবে কাজ করে" : "How it works"}
                  </h2>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="p-3.5 rounded bg-surface border border-hairline flex items-start gap-3">
                  <Search className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink">
                      {locale === "bn" ? "পণ্য বেছে নিন ও বক্স হিসাব করুন" : "Choose products and estimate boxes"}
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      {locale === "bn"
                        ? "ভেরিফায়েড শোরুমের টাইলসের সাইজ, ফিনিশ, গ্রেড ও প্রতি বক্সের বর্গফুট হিসাব করে চাহিদা নির্ধারণ।"
                        : "Compare verified showroom listings by mm dimensions, finish, water absorption, and calculate exact box requirements."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-surface border border-hairline flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-accent-teal shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink">
                      {locale === "bn" ? "RFQ পাঠান, কোটেশন পান" : "Request a quote"}
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      {locale === "bn"
                        ? "ক্রেতা কোটেশন রিকোয়েস্ট পাঠালে ডিলার আইটেমভিত্তিক দাম, পরিবহন খরচ ও মেয়াদসহ আনুষ্ঠানিক কোটেশন পাঠান।"
                        : "Submit multi-item RFQs. Dealers respond with versioned, immutable BDT quotations detailing unit price, transport fee, and validity."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-surface border border-hairline flex items-start gap-3">
                  <ClipboardCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink">
                      {locale === "bn"
                        ? "অ্যাটমিক অর্ডার ও প্রাইস স্ন্যাপশট (Atomic Order Record)"
                        : "Atomic Order Acceptance & Price Lock"}
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      {locale === "bn"
                        ? "কোটেশন গ্রহণ করলেই পণ্যের বিবরণ, দাম ও ঠিকানার স্ন্যাপশটসহ ডুপ্লিকেটমুক্ত একটি অর্ডার তৈরি হয়।"
                        : "Accepting a valid quote atomically creates one order with locked product, quantity, and price snapshots."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-surface border border-hairline flex items-start gap-3">
                  <Truck className="w-5 h-5 text-accent-teal shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink">
                      {locale === "bn" ? "অর্ডার ও ডেলিভারি ট্র্যাক করুন" : "Track orders and delivery"}
                    </div>
                    <p className="text-xs text-secondary mt-0.5">
                      {locale === "bn"
                        ? "পিকআপ/কাভার্ড ভ্যানের তথ্য, প্যাকেজিং যাচাই এবং ডিসপ্যাচ থেকে সাইটে পৌঁছানো পর্যন্ত প্রতিটি ধাপ ট্র্যাক করা হয়।"
                        : "Track every state from Seller Confirmation and Packaging to Vehicle Dispatch and Customer Completion."}
                    </p>
                  </div>
                </div>
              </div>
      </aside>

      <section className="home-evidence reveal">
          <div className="max-w-3xl space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              {locale === "bn" ? "বাজারের চিত্র" : "Market context"}
            </h2>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              {locale === "bn"
                ? "তরুণ প্রজন্ম এখন সনাতন পদ্ধতির বদলে ঘরে বসে মোবাইলের মাধ্যমে পণ্য যাচাই, একাধিক দোকানের দাম তুলনা এবং কম সময়ে কেনাকাটা থেকে ডেলিভারি পর্যন্ত সম্পূর্ণ সমাধান চায়।"
                : "A young, mobile-first population is replacing traditional middleman-dependent material sourcing with transparent, verifiable digital workflows."}
            </p>
          </div>

          <div className="stat-grid">
            <div className="p-5 rounded bg-canvas border border-hairline">
              <div className="text-3xl font-mono font-bold text-ink tabular-nums">
                66%
              </div>
              <div className="text-sm font-semibold text-ink mt-1">
                {locale === "bn"
                  ? "কর্মক্ষম জনসংখ্যা (১৫-৬৪ বছর)"
                  : "Working-Age Population (15-64 yrs)"}
              </div>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                {locale === "bn"
                  ? "UNFPA (2025) অনুযায়ী বাংলাদেশের প্রধান কর্মক্ষম জনগোষ্ঠী আবাসন ও নির্মাণের মূল ক্রেতা।"
                  : "Per UNFPA (2025), two-thirds of Bangladesh's population is in the active home-building and commercial working age bracket."}
              </p>
            </div>

            <div className="p-5 rounded bg-canvas border border-hairline">
              <div className="text-3xl font-mono font-bold text-accent tabular-nums">
                26 yrs
              </div>
              <div className="text-sm font-semibold text-ink mt-1">
                {locale === "bn"
                  ? "মানুষের গড় বয়স (তরুণ প্রজন্ম)"
                  : "National Median Age"}
              </div>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                {locale === "bn"
                  ? "মোট জনসংখ্যার প্রায় অর্ধেকই তরুণ, যারা সনাতন পদ্ধতি ছেড়ে ডিজিটাল প্ল্যাটফর্মে অভ্যস্ত হচ্ছে।"
                  : "Nearly half the population belongs to a digital-native generation shifting away from opaque traditional purchasing."}
              </p>
            </div>

            <div className="p-5 rounded bg-canvas border border-hairline">
              <div className="text-3xl font-mono font-bold text-ink tabular-nums">
                98.9%
              </div>
              <div className="text-sm font-semibold text-ink mt-1">
                {locale === "bn"
                  ? "পরিবারে মোবাইল ফোন সংযোগ"
                  : "Household Mobile Reach"}
              </div>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                {locale === "bn"
                  ? "BBS (2025) এর তথ্য অনুযায়ী প্রায় প্রতিটি পরিবার মোবাইল ও ডিজিটাল যোগাযোগের আওতায়।"
                  : "Per BBS (2025), 98.9% of households have mobile access, making mobile-first digital purchasing practical across all districts."}
              </p>
            </div>

            <div className="p-5 rounded bg-canvas border border-hairline">
              <div className="text-3xl font-mono font-bold text-accent-teal tabular-nums">
                72.4%
              </div>
              <div className="text-sm font-semibold text-ink mt-1">
                {locale === "bn"
                  ? "পরিবারে স্মার্টফোন ব্যবহার"
                  : "Household Smartphone Adoption"}
              </div>
              <p className="text-xs text-secondary mt-2 leading-relaxed">
                {locale === "bn"
                  ? "BBS (2025) অনুযায়ী ৭২.৪% পরিবারে স্মার্টফোন রয়েছে, যা ঘরে বসে ক্যাটালগ দেখা ও অর্ডারের মূল ভিত্তি।"
                  : "Per BBS (2025), 72.4% of households use smartphones, creating massive readiness for mobile catalogue browsing and RFQs."}
              </p>
            </div>
          </div>
      </section>

      <section className="home-catalogue reveal space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-ink">
              {locale === "bn" ? "বৈশিষ্ট্যযুক্ত পণ্য" : "Featured listings"}
            </h2>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            <span>
              {locale === "bn" ? "সম্পূর্ণ মার্কেটপ্লেস" : "All listings"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="catalogue-grid">
          {featuredListings.map((listing) => (
            <article
              key={listing.id}
                className="bg-surface border border-hairline rounded-lg overflow-hidden flex flex-col justify-between hover:border-ink transition-[border-color]"
            >
              <div>
                <TileSwatchPreview
                  pattern={listing.swatchPattern}
                  dimensionsMm={listing.dimensionsMm}
                  surfaceFinish={listing.surfaceFinish}
                  brand={listing.brand}
                />
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-subtle">{listing.sku}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {locale === "bn"
                          ? listing.organization?.tradeNameBn
                          : listing.organization?.tradeNameEn}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-ink leading-snug">
                    <Link
                      href={`/marketplace/${listing.id}`}
                      className="hover:text-accent transition-colors"
                    >
                      {locale === "bn" ? listing.titleBn : listing.titleEn}
                    </Link>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-secondary font-mono">
                    <div className="p-2 rounded bg-canvas border border-hairline">
                      <span className="block text-subtle text-[11px]">
                        {locale === "bn" ? "বক্স কভারেজ" : "Coverage / Box"}
                      </span>
                      <span className="font-semibold text-ink tabular-nums">
                        {listing.sqftPerBox} sq.ft ({listing.piecesPerBox} pcs)
                      </span>
                    </div>
                    <div className="p-2 rounded bg-canvas border border-hairline">
                      <span className="block text-subtle text-[11px]">
                        {locale === "bn" ? "পানি শোষণ হার" : "Water Absorption"}
                      </span>
                      <span className="font-semibold text-ink">
                        {listing.waterAbsorption}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-muted border-t border-hairline flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-subtle">
                    {locale === "bn" ? "নির্দেশক মূল্য" : "Indicative Rate"}
                  </div>
                  <div className="text-base font-bold font-mono text-ink tabular-nums">
                    {formatBdt(listing.pricePerSqftBdt, locale)}{" "}
                    <span className="text-xs font-normal text-secondary">
                      / sq.ft
                    </span>
                  </div>
                  <div className="text-xs font-mono text-secondary tabular-nums">
                    {formatBdt(listing.pricePerBoxBdt, locale)} / box
                  </div>
                </div>

                <Link
                  href={`/marketplace/${listing.id}`}
                  className="btn-solid text-xs"
                >
                  <span>
                    {locale === "bn" ? "বিস্তারিত ও কোটেশন" : "Specs & RFQ"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Verified Showrooms & Role Workspaces */}
      <section className="home-showrooms reveal space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-hairline">
            <div>
              <h2 className="text-2xl font-bold text-ink">
                {locale === "bn" ? "ভেরিফায়েড শোরুম" : "Verified showrooms"}
              </h2>
            </div>
            <Link
              href="/auth"
              className="btn-line text-xs"
            >
              {locale === "bn"
                ? "আপনার শোরুম যুক্ত করুন"
                : "Onboard Your Showroom"}
            </Link>
          </div>

          <div className="showroom-grid pt-6">
            {verifiedShowrooms.map((org) => (
              <div
                key={org.id}
                className="p-5 rounded bg-canvas border border-hairline flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{locale === "bn" ? "ভেরিফায়েড" : "Verified"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-subtle">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{org.primaryDistrict}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-ink">
                    {locale === "bn" ? org.tradeNameBn : org.tradeNameEn}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed">
                    {locale === "bn" ? org.descriptionBn : org.descriptionEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-end text-xs">
                  <Link
                    href={`/marketplace?organizationId=${org.id}`}
                    className="font-semibold text-accent hover:underline"
                  >
                    {locale === "bn" ? "পণ্য দেখুন" : "View Catalogue"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
      </section>

      <section className="home-roadmap reveal">
        <div className="roadmap-grid">
          <div className="p-6 rounded-lg bg-surface border-2 border-accent space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-accent text-white text-xs font-semibold">
                {locale === "bn" ? "চালু আছে" : "Available now"}
              </span>
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-ink pt-1">
              {locale === "bn" ? "মার্কেটপ্লেস, RFQ ও অর্ডার" : "Marketplace, quotes, and orders"}
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              {locale === "bn"
                ? "কাস্টমার, ভেরিফায়েড ডিলার/শোরুম, মাল্টি-ব্রাঞ্চ ক্যাটালগ, আইটেমভিত্তিক কোটেশন, অ্যাটমিক অর্ডার এবং ডেলিভারি সমন্বয় ও অ্যাডমিন মডারেশন।"
                : "Customer & Dealer workspaces, multi-branch inventory, formal RFQ & versioned quotations, atomic order creation, delivery coordination, and admin audit."}
            </p>
          </div>

          <div className="p-6 rounded-lg bg-surface border border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-muted border border-hairline text-ink text-xs font-mono font-semibold">
                {GUIDE_COPY.visualizer[locale]}
              </span>
              <Building2 className="w-5 h-5 text-accent-teal" />
            </div>
            <h3 className="text-lg font-bold text-ink pt-1">
              <Link href="/visualizer" className="text-accent hover:underline">{GUIDE_COPY.visualizer[locale]}</Link>
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              {GUIDE_COPY.visualizerIntro[locale]}
            </p>
          </div>

          <div className="p-6 rounded-lg bg-surface border border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded bg-muted border border-hairline text-ink text-xs font-mono font-semibold">
                {GUIDE_COPY.services[locale]}
              </span>
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-lg font-bold text-ink pt-1">
              <Link href="/services" className="text-accent hover:underline">{GUIDE_COPY.services[locale]}</Link>
            </h3>
            <p className="text-xs text-secondary leading-relaxed">
              {GUIDE_COPY.servicesIntro[locale]}
            </p>
          </div>
        </div>
      </section>
      <section className="home-guides reveal space-y-3">
        <h2 className="text-xl font-bold text-ink">{GUIDE_COPY.title[locale]}</h2>
        <p className="max-w-prose text-secondary">{GUIDE_COPY.intro[locale]}</p>
        <Link href="/guides" className="inline-flex min-h-11 items-center gap-2 font-semibold text-accent underline">
          {GUIDE_COPY.read[locale]} <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
      <div className="mobile-convert" ref={convertRef}>
        <Link href="/marketplace" className="btn-solid">
          {locale === "bn" ? "ক্যাটালগ খুঁজুন" : "Explore Catalogue"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
