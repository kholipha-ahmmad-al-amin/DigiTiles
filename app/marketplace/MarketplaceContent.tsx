"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  PanelRightOpen,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { TileSwatchPreview } from "@/components/ui/TileSwatchPreview";
import { ComparisonDrawer, COMPARISON_LIMIT } from "@/components/visualizer/ComparisonDrawer";
import { COMPARISON_COPY as comparison, formatBdt } from "@/lib/i18n";
import { BANGLADESH_DISTRICTS } from "@/lib/seed-data";
import type { DealerListing } from "@/lib/types";
import type { discoverCatalogue } from "@/lib/public-catalogue";

export interface MarketplaceFilters {
  q: string;
  categoryId: string;
  district: string;
  finish: string;
  dimensions: string;
  organizationId: string;
  sort: "newest" | "price_asc" | "price_desc";
}

type Catalogue = ReturnType<typeof discoverCatalogue>;

function filterQuery({ q, ...filters }: MarketplaceFilters) {
  const params = new URLSearchParams({ q: q.trim() });
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "ALL") params.set(key, value);
  }
  return params.toString();
}

export function MarketplaceContent({ initialFilters, initialCatalogue }: {
  initialFilters: MarketplaceFilters;
  initialCatalogue: Catalogue;
}) {
  const { locale } = useApp();

  const [q, setQ] = useState(initialFilters.q);
  const [categoryId, setCategoryId] = useState(initialFilters.categoryId);
  const [district, setDistrict] = useState(initialFilters.district);
  const [finish, setFinish] = useState(initialFilters.finish);
  const [dimensions, setDimensions] = useState(initialFilters.dimensions);
  const [organizationId, setOrganizationId] = useState(initialFilters.organizationId);
  const [sort, setSort] = useState(initialFilters.sort);

  const [{ items: listings, categories, verifiedShowrooms: showrooms, totalCount }, setCatalogue] = useState(initialCatalogue);
  const [loading, setLoading] = useState(false);
  const [comparedListings, setComparedListings] = useState<DealerListing[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const toggleComparison = (item: DealerListing) => {
    setComparedListings((current) => {
      if (current.some((listing) => listing.id === item.id)) {
        return current.filter((listing) => listing.id !== item.id);
      }
      return current.length < COMPARISON_LIMIT ? [...current, item] : current;
    });
  };

  const query = filterQuery({ q, categoryId, district, finish, dimensions, organizationId, sort });
  const resultQuery = useRef(filterQuery(initialFilters));

  useEffect(() => {
    if (query === resultQuery.current) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/listings?${query}`, { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((json) => {
        if (!controller.signal.aborted && json.ok) {
          setCatalogue(json.data);
          resultQuery.current = query;
        }
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query]);

  const resetFilters = () => {
    setQ("");
    setCategoryId("ALL");
    setDistrict("ALL");
    setFinish("ALL");
    setDimensions("ALL");
    setOrganizationId("ALL");
    setSort("newest");
  };

  return (
    <div className="market-stage">
      {/* Header Banner */}
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
            MATERIAL & SHOWROOM DISCOVERY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "টাইলস, স্যানিটারি ও নির্মাণসামগ্রী মার্কেটপ্লেস"
              : "Construction Material & Dealer Discovery Hub"}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {locale === "bn"
              ? "শুধুমাত্র ভেরিফায়েড ডিলার ও অ্যাডমিন অনুমোদিত সক্রিয় পণ্যসমূহ এখানে প্রদর্শিত হচ্ছে।"
              : "Displaying only active, moderated listings from verified showrooms across Bangladesh."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded bg-muted border border-hairline text-xs font-mono">
            <span className="text-subtle block">
              {locale === "bn" ? "উপলব্ধ পণ্য" : "Approved Listings"}
            </span>
            <span className="text-base font-bold text-ink tabular-nums">
              {totalCount}
            </span>
          </div>
          <Link href="/assistant" className="btn-line text-xs">
            {locale === "bn" ? "ক্যাটালগ জিজ্ঞাসা" : "Ask catalogue"}
          </Link>
          <Link
            href="/workspace/customer/rfqs"
            className="btn-solid text-xs"
          >
            <span>
              {locale === "bn" ? "আমার কোটেশন সমূহ" : "My RFQs & Quotes"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Layout: Filter Rail + Results Grid */}
      <div className="market-bench">
        <aside aria-label="Catalogue Filters" className="market-filters">
          <details className="filter-disclosure rounded border border-hairline bg-surface p-5">
            <summary className="filter-summary text-ink">
              {locale === "bn" ? "ফিল্টার" : "Filters"}
            </summary>
            <div className="filter-panel space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2 font-bold text-sm text-ink">
              <Filter className="w-4 h-4 text-accent" />
              <span>{locale === "bn" ? "ফিল্টার অপশন" : "Filter Catalogue"}</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{locale === "bn" ? "রিসেট" : "Reset"}</span>
            </button>
          </div>

          {/* Keyword Search */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-q"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn"
                ? "নাম, ব্র্যান্ড বা মডেল (SKU)"
                : "Keyword, Brand, or SKU"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="filter-q"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={
                  locale === "bn" ? "RAK, Akij, 600x600..." : "RAK, Akij, 600x600..."
                }
                className="w-full min-h-11 pl-9 pr-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-category"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn" ? "পণ্যের ক্যাটাগরি" : "Material Category"}
            </label>
            <select
              id="filter-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-11 px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
            >
              <option value="ALL">
                {locale === "bn" ? "সকল ক্যাটাগরি" : "All Categories"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === "bn" ? cat.nameBn : cat.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery District Filter */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-district"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn" ? "ডেলিভারি জেলা" : "Servicing District"}
            </label>
            <select
              id="filter-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full min-h-11 px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
            >
              <option value="ALL">
                {locale === "bn" ? "সকল জেলা" : "All Bangladesh Districts"}
              </option>
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Surface Finish Filter */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-finish"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn" ? "সারফেস ফিনিশ" : "Surface Finish"}
            </label>
            <select
              id="filter-finish"
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="w-full min-h-11 px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
            >
              <option value="ALL">
                {locale === "bn" ? "সকল ফিনিশ" : "All Finishes"}
              </option>
              <option value="Gloss">High Gloss / Nano-Polished</option>
              <option value="Matt">Architectural Matt</option>
              <option value="Lapato">Lapato Semi-Polished</option>
              <option value="Rustic">Anti-Skid Rustic / Punch</option>
              <option value="Wood">Natural Wood Grain</option>
            </select>
          </div>

          {/* Dimensions Filter */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-dimensions"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn" ? "টাইলসের সাইজ (মিমি)" : "Dimensions (mm)"}
            </label>
            <select
              id="filter-dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full min-h-11 px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
            >
              <option value="ALL">
                {locale === "bn" ? "সকল সাইজ" : "All Sizes"}
              </option>
              <option value="600x600">600x600 mm (24x24 inch)</option>
              <option value="600x1200">600x1200 mm (24x48 inch)</option>
              <option value="300x600">300x600 mm (12x24 inch)</option>
              <option value="300x300">300x300 mm (12x12 inch)</option>
              <option value="200x1000">200x1000 mm (Wood Plank)</option>
            </select>
          </div>

          {/* Verified Showroom Filter */}
          <div className="space-y-1.5">
            <label
              htmlFor="filter-showroom"
              className="block text-xs font-semibold text-ink"
            >
              {locale === "bn" ? "ভেরিফায়েড শোরুম" : "Verified Showroom"}
            </label>
            <select
              id="filter-showroom"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className="w-full min-h-11 px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
            >
              <option value="ALL">
                {locale === "bn" ? "সকল ভেরিফায়েড শোরুম" : "All Verified Showrooms"}
              </option>
              {showrooms.map((org) => (
                <option key={org.id} value={org.id}>
                  {locale === "bn" ? org.tradeNameBn : org.tradeNameEn}
                </option>
              ))}
            </select>
          </div>
            </div>
          </details>
        </aside>

        <div className="market-results space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface px-4 py-3">
            <p aria-live="polite" className="text-sm text-secondary">
              {comparison.selected[locale]} {comparedListings.length} / {COMPARISON_LIMIT}
            </p>
            <button
              id="open-comparison"
              type="button"
              disabled={comparedListings.length === 0}
              onClick={() => setComparisonOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded border border-hairline bg-muted px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-55"
            >
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" />
              {comparison.open[locale]}
            </button>
          </div>
          {/* Sort & Summary Bar */}
          <div className="bg-surface border border-hairline rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-secondary">
              {locale === "bn"
                ? `মোট ${totalCount} টি অনুমোদিত পণ্য পাওয়া গেছে`
                : `Showing ${listings.length} of ${totalCount} approved listings`}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-subtle" />
              <label htmlFor="sort-select" className="text-xs font-medium text-ink">
                {locale === "bn" ? "সাজান:" : "Sort by:"}
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as "newest" | "price_asc" | "price_desc"
                  )
                }
                className="min-h-11 px-2.5 py-1 rounded border border-hairline bg-canvas text-xs text-ink"
              >
                <option value="newest">
                  {locale === "bn" ? "সর্বশেষ আপডেট" : "Newest Updated"}
                </option>
                <option value="price_asc">
                  {locale === "bn"
                    ? "মূল্য: কম থেকে বেশি (প্রতি বর্গফুট)"
                    : "Price: Low to High (per sq.ft)"}
                </option>
                <option value="price_desc">
                  {locale === "bn"
                    ? "মূল্য: বেশি থেকে কম (প্রতি বর্গফুট)"
                    : "Price: High to Low (per sq.ft)"}
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-lg border border-hairline bg-surface p-5 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-36 bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-surface border border-hairline rounded-lg p-12 text-center space-y-3">
              <h2 className="text-lg font-bold text-ink">
                {locale === "bn"
                  ? "আপনার ফিল্টার অনুযায়ী কোনো পণ্য পাওয়া যায়নি"
                  : "No matching listings found"}
              </h2>
              <p className="text-xs text-secondary max-w-md mx-auto">
                {locale === "bn"
                  ? "অনুগ্রহ করে ফিল্টার রিসেট করুন অথবা অন্য কোনো সাইজ বা জেলা নির্বাচন করুন।"
                  : "Try clearing one or more filters to view all verified showroom products."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded bg-accent text-white text-xs font-semibold cursor-pointer"
              >
                {locale === "bn" ? "ফিল্টার রিসেট করুন" : "Reset All Filters"}
              </button>
            </div>
          ) : (
            <div className="catalogue-grid">
              {listings.map((item) => {
                const selected = comparedListings.some((listing) => listing.id === item.id);
                return (
                <article
                  key={item.id}
                  className="bg-surface border border-hairline rounded-lg overflow-hidden flex flex-col justify-between hover:border-ink transition-colors"
                >
                  <div>
                    <TileSwatchPreview
                      pattern={item.swatchPattern}
                      dimensionsMm={item.dimensionsMm}
                      surfaceFinish={item.surfaceFinish}
                      brand={item.brand}
                    />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-subtle">{item.sku}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {locale === "bn"
                              ? item.organization?.tradeNameBn
                              : item.organization?.tradeNameEn}
                          </span>
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-ink leading-snug">
                        <Link
                          href={`/marketplace/${item.id}`}
                          className="hover:text-accent transition-colors"
                        >
                          {locale === "bn" ? item.titleBn : item.titleEn}
                        </Link>
                      </h2>

                      <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                        {locale === "bn"
                          ? item.descriptionBn
                          : item.descriptionEn}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-xs font-mono">
                        <div className="p-2 rounded bg-canvas border border-hairline">
                          <span className="block text-subtle text-[10px]">
                            {locale === "bn" ? "বক্স কভারেজ" : "Box Coverage"}
                          </span>
                          <span className="font-semibold text-ink tabular-nums">
                            {item.sqftPerBox} sq.ft
                          </span>
                        </div>
                        <div className="p-2 rounded bg-canvas border border-hairline">
                          <span className="block text-subtle text-[10px]">
                            {locale === "bn" ? "সর্বনিম্ন অর্ডার" : "Min Order"}
                          </span>
                          <span className="font-semibold text-ink tabular-nums">
                            {item.minOrderBoxes} boxes
                          </span>
                        </div>
                        <div className="p-2 rounded bg-canvas border border-hairline">
                          <span className="block text-subtle text-[10px]">
                            {locale === "bn" ? "স্টক" : "Ready Stock"}
                          </span>
                          <span className="font-semibold text-ink tabular-nums">
                            {item.stockBoxes} boxes
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-subtle flex flex-wrap gap-1 pt-1">
                        <span>
                          {locale === "bn" ? "ডেলিভারি জেলা:" : "Delivery:"}
                        </span>
                        {item.servicingDistricts.map((d) => (
                          <span
                            key={d}
                            className="px-1.5 py-0.5 rounded bg-muted text-ink font-medium"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 bg-muted border-t border-hairline flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold font-mono text-ink tabular-nums">
                        {formatBdt(item.pricePerSqftBdt, locale)}{" "}
                        <span className="text-xs font-normal text-secondary">
                          / sq.ft
                        </span>
                      </div>
                      <div className="text-xs font-mono text-secondary tabular-nums">
                        {formatBdt(item.pricePerBoxBdt, locale)} / box (
                        {item.piecesPerBox} pcs)
                      </div>
                    </div>

                    <Link
                      href={`/marketplace/${item.id}`}
                      className="btn-solid text-xs"
                    >
                      <span>
                        {locale === "bn"
                          ? "কোটেশন চান (RFQ)"
                          : "Request Quote (RFQ)"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <button
                    id={`compare-listing-${item.id}`}
                    type="button"
                    aria-pressed={selected}
                    disabled={!selected && comparedListings.length >= COMPARISON_LIMIT}
                    onClick={() => toggleComparison(item)}
                    className={`flex min-h-11 items-center gap-2 border-t border-hairline px-5 py-2 text-left text-sm font-semibold text-ink hover:bg-muted disabled:opacity-55 ${selected ? "bg-muted" : "bg-surface"}`}
                  >
                    {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />}
                    {comparison.toggle[locale]}
                    <span className="sr-only"> {locale === "bn" ? item.titleBn : item.titleEn}</span>
                  </button>
                </article>
                );
              })}
            </div>
          )}
        </div>
        <aside className="market-rail space-y-5" aria-label={locale === "bn" ? "তুলনা ও শোরুম" : "Comparison and showrooms"}>
          <div>
            <h2 className="text-base font-bold text-ink">{comparison.open[locale]}</h2>
            <p className="mt-1 text-sm text-secondary">
              {comparison.selected[locale]} {comparedListings.length} / {COMPARISON_LIMIT}
            </p>
            <button
              type="button"
              disabled={comparedListings.length === 0}
              onClick={() => setComparisonOpen(true)}
              className="btn-line mt-3 w-full text-xs"
            >
              {comparison.open[locale]}
            </button>
          </div>
          <div className="border-t border-hairline pt-4">
            <h2 className="text-base font-bold text-ink">
              {locale === "bn" ? "ভেরিফায়েড শোরুম" : "Verified showrooms"}
            </h2>
            <ul className="mt-3 space-y-2">
              {showrooms.map((org) => (
                <li key={org.id}>
                  <Link href={`/marketplace?organizationId=${org.id}`} className="text-sm font-semibold text-ink hover:text-accent">
                    {locale === "bn" ? org.tradeNameBn : org.tradeNameEn}
                  </Link>
                  <span className="block font-mono text-xs text-subtle">{org.primaryDistrict}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
      <ComparisonDrawer
        listings={comparedListings}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        onRemove={(id) => {
          setComparedListings((current) => current.filter((item) => item.id !== id));
          if (comparedListings.length === 1) setComparisonOpen(false);
        }}
      />
    </div>
  );
}

