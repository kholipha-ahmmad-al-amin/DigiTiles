"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { TileSwatchPreview } from "@/components/ui/TileSwatchPreview";
import { SurfaceVisualizer } from "@/components/visualizer/SurfaceVisualizer";
import { formatBdt, VISUALIZER_COPY as copy } from "@/lib/i18n";
import { estimateSurface, surfacePlanQuery, type SurfacePlan } from "@/lib/surface-planning";
import { BANGLADESH_DISTRICTS } from "@/lib/seed-data";
import type { discoverListing } from "@/lib/public-catalogue";

export function ListingDetail({ data, initialPlan, requestRfq }: {
  data: NonNullable<ReturnType<typeof discoverListing>>;
  initialPlan: SurfacePlan;
  requestRfq: boolean;
}) {
  const { listing, organization, branches, category } = data;
  const router = useRouter();
  const { locale, user } = useApp();

  const [plan, setPlan] = useState(initialPlan);
  const rfqDialog = useRef<HTMLDialogElement>(null);
  const quoteDock = useRef<HTMLElement>(null);
  const openedFromStudio = useRef(false);

  // RFQ Form State
  const [requestedBoxes, setRequestedBoxes] = useState(Math.max(listing.minOrderBoxes || 10, 20));
  const [deliveryDistrict, setDeliveryDistrict] = useState(listing.servicingDistricts[0] ?? "Dhaka");
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    "Plot 14, Road 6, Block C, Banasree, Dhaka"
  );
  const [preferredWindow, setPreferredWindow] = useState<string>(
    "Within 4-5 working days (Morning unloading)"
  );
  const [projectNotes, setProjectNotes] = useState<string>(
    "Please ensure all boxes are from the same production shade/calibration batch."
  );
  const [submittingRfq, setSubmittingRfq] = useState(false);
  const [rfqError, setRfqError] = useState<string | null>(null);
  const [rfqSuccess, setRfqSuccess] = useState<string | null>(null);

  const estimate = estimateSurface(plan, listing);

  useEffect(() => {
    const footer = document.querySelector("footer");
    const node = quoteDock.current;
    if (!footer || !node) return;
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.release = entry.isIntersecting ? "true" : "false";
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!estimate || !rfqDialog.current || openedFromStudio.current || !requestRfq) return;
    openedFromStudio.current = true;
    setRequestedBoxes(estimate.boxes);
    rfqDialog.current.showModal();
  }, [estimate, requestRfq]);

  const openRfq = () => {
    if (estimate) setRequestedBoxes(estimate.boxes);
    rfqDialog.current?.showModal();
  };

  const visualizerQuery = surfacePlanQuery(plan);
  visualizerQuery.set("listingId", listing.id);

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRfqError(null);
    setRfqSuccess(null);

    if (!deliveryAddress.trim()) {
      setRfqError(
        locale === "bn"
          ? "অনুগ্রহ করে ডেলিভারির সম্পূর্ণ ঠিকানা লিখুন।"
          : "Please provide a delivery site address."
      );
      return;
    }

    setSubmittingRfq(true);
    try {
      if (!user) {
        router.push("/auth");
        return;
      }

      const res = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ listingId: listing.id, requestedBoxes }],
          deliveryDistrict,
          deliveryAddress,
          preferredWindow,
          projectNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to submit RFQ.");
      }

      setRfqSuccess(
        locale === "bn"
          ? `আপনার কোটেশন রিকোয়েস্ট (${json.data.rfq.rfqNumber}) সফলভাবে শোরুমে পাঠানো হয়েছে!`
          : `RFQ (${json.data.rfq.rfqNumber}) submitted to ${organization?.tradeNameEn}!`
      );
      setTimeout(() => {
        router.push("/workspace/customer/rfqs");
      }, 900);
    } catch (err) {
      setRfqError(
        err instanceof Error ? err.message : "Could not submit RFQ."
      );
    } finally {
      setSubmittingRfq(false);
    }
  };

  return (
    <div className="listing-stage">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-4 text-xs text-secondary">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {locale === "bn"
              ? "মার্কেটপ্লেসে ফিরে যান"
              : "Back to Marketplace"}
          </span>
        </Link>
        <span className="font-mono text-subtle">
          SKU: {listing.sku}
        </span>
      </div>

      {/* Main Two-Column Grid */}
      <div className="listing-bench">
        <div className="listing-main space-y-6">
          <div className="listing-hero-card overflow-hidden rounded-lg border border-hairline bg-surface">
            <TileSwatchPreview
              pattern={listing.swatchPattern}
              dimensionsMm={listing.dimensionsMm}
              surfaceFinish={listing.surfaceFinish}
              brand={listing.brand}
              className="listing-swatch h-64 sm:h-72"
            />
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-muted border border-hairline font-mono text-ink">
                  {locale === "bn" ? category?.nameBn : category?.nameEn}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {locale === "bn"
                      ? "ভেরিফায়েড ও অনুমোদিত পণ্য"
                      : "Approved Listing | Verified Dealer"}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {locale === "bn" ? listing.titleBn : listing.titleEn}
              </h1>

              <p className="text-sm text-secondary leading-relaxed">
                {locale === "bn"
                  ? listing.descriptionBn
                  : listing.descriptionEn}
              </p>

              {/* Price Overview Box */}
              <div className="p-4 rounded bg-canvas border border-hairline grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-xs text-subtle block">
                    {locale === "bn" ? "প্রতি বর্গফুট মূল্য" : "Rate / sq.ft"}
                  </span>
                  <span className="text-lg font-bold font-mono text-ink tabular-nums">
                    {formatBdt(listing.pricePerSqftBdt, locale)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-subtle block">
                    {locale === "bn" ? "প্রতি বক্স মূল্য" : "Rate / Box"}
                  </span>
                  <span className="text-lg font-bold font-mono text-accent tabular-nums">
                    {formatBdt(listing.pricePerBoxBdt, locale)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-subtle block">
                    {locale === "bn" ? "বক্স কভারেজ" : "Coverage / Box"}
                  </span>
                  <span className="text-sm font-bold font-mono text-ink tabular-nums">
                    {listing.sqftPerBox} sq.ft ({listing.piecesPerBox} pcs)
                  </span>
                </div>
                <div>
                  <span className="text-xs text-subtle block">
                    {locale === "bn" ? "সর্বনিম্ন অর্ডার" : "Minimum Order"}
                  </span>
                  <span className="text-sm font-bold font-mono text-ink tabular-nums">
                    {listing.minOrderBoxes} boxes ({listing.stockBoxes} in stock)
                  </span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="pt-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3">
                  {locale === "bn"
                    ? "টেকনিক্যাল স্পেসিফিকেশন"
                    : "Technical Specification Sheet"}
                </h2>
                <div className="border border-hairline rounded overflow-hidden text-xs">
                  <div className="grid grid-cols-2 p-3 bg-muted border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "ব্র্যান্ড / প্রস্তুতকারক" : "Manufacturer Brand"}
                    </span>
                    <span className="font-semibold text-ink">{listing.brand}</span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-surface border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "ম্যাটেরিয়াল বডি" : "Material Body Type"}
                    </span>
                    <span className="font-semibold text-ink">
                      {listing.materialType}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-muted border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "ডাইমেনশন / সাইজ" : "Nominal Dimensions"}
                    </span>
                    <span className="font-mono font-semibold text-ink">
                      {listing.dimensionsMm}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-surface border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "সারফেস ফিনিশ" : "Surface Finish"}
                    </span>
                    <span className="font-semibold text-ink">
                      {listing.surfaceFinish}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-muted border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "গ্রেড ও পুরুত্ব" : "Quality Grade & Thickness"}
                    </span>
                    <span className="font-semibold text-ink">
                      {listing.grade} ({listing.thicknessMm})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-surface border-b border-hairline">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "পানি শোষণ হার" : "Water Absorption"}
                    </span>
                    <span className="font-mono font-semibold text-ink">
                      {listing.waterAbsorption}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-3 bg-muted">
                    <span className="font-medium text-secondary">
                      {locale === "bn" ? "ব্যবহারের স্থান" : "Recommended Area"}
                    </span>
                    <span className="font-semibold text-ink">
                      {listing.applicationArea}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SurfaceVisualizer
            listing={listing}
            plan={plan}
            onChange={setPlan}
            actions={
              <>
                <Link
                  href={`/visualizer?${visualizerQuery}`}
                  className="inline-flex min-h-11 items-center rounded border border-hairline bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-canvas"
                >
                  {copy.openDedicated[locale]}
                </Link>
                <button
                  id="open-rfq"
                  type="button"
                  disabled={!estimate}
                  onClick={openRfq}
                  className="min-h-11 rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-55"
                >
                  {copy.requestQuote[locale]}
                </button>
              </>
            }
          />

          {/* Showroom & Branch Information */}
          {organization && (
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent-teal" />
                  <h2 className="text-base font-bold text-ink">
                    {locale === "bn"
                      ? organization.tradeNameBn
                      : organization.tradeNameEn}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{organization.verificationStatus}</span>
                </span>
              </div>

              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? organization.descriptionBn
                  : organization.descriptionEn}
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-subtle">
                  {locale === "bn"
                    ? "শোরুম ও ডিসপ্যাচ ব্রাঞ্চসমূহ"
                    : "Showroom & Warehouse Branches"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {branches.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded bg-canvas border border-hairline text-xs space-y-1"
                    >
                      <div className="font-bold text-ink">
                        {locale === "bn" ? b.nameBn : b.nameEn}
                      </div>
                      <div className="text-secondary flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-subtle" />
                        <span>
                          {locale === "bn" ? b.addressBn : b.addressEn}
                        </span>
                      </div>
                      <div className="text-subtle font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{b.contactPhone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="listing-quote" ref={quoteDock}>
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              {copy.requestQuote[locale]}
            </h2>
            <p className="quote-help text-sm text-secondary">{copy.quotationHelp[locale]}</p>
            <Link href={`/assistant?listing=${listing.id}`} className="btn-line w-full text-xs">
              {locale === "bn" ? "এই পণ্য নিয়ে জিজ্ঞাসা" : "Ask about this listing"}
            </Link>
            <button
              type="button"
              onClick={openRfq}
              className="min-h-11 w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {copy.requestQuote[locale]}
            </button>
          </div>
        </aside>
      </div>

      <dialog
        ref={rfqDialog}
        aria-labelledby="listing-rfq-title"
        className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-auto rounded-lg border border-hairline bg-surface p-5 text-ink backdrop:bg-black/60 sm:p-6"
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-hairline pb-3">
            <div className="space-y-1">
              <h2 id="listing-rfq-title" className="text-xl font-bold">{copy.requestQuote[locale]}</h2>
              <p className="text-sm text-secondary">{copy.quotationHelp[locale]}</p>
            </div>
            <button
              type="button"
              onClick={() => rfqDialog.current?.close()}
              aria-label={copy.close[locale]}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-hairline bg-surface text-ink hover:bg-muted"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleRfqSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="rfq-boxes"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn"
                  ? `চাহিদার পরিমাণ (বক্স) [সর্বনিম্ন ${listing.minOrderBoxes} বক্স]`
                  : `Requested Quantity (Boxes) [Min: ${listing.minOrderBoxes}]`}
              </label>
              <input
                id="rfq-boxes"
                type="number"
                min={listing.minOrderBoxes || 1}
                required
                value={requestedBoxes}
                onChange={(e) =>
                  setRequestedBoxes(Math.max(1, Number(e.target.value)))
                }
                className="w-full min-h-[42px] px-3 py-2 rounded border border-hairline bg-canvas text-sm font-mono font-bold text-ink"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs font-mono text-secondary">
                <span>
                  {locale === "bn" ? "মোট বর্গফুট:" : "Total Coverage:"}{" "}
                  <strong>
                    {(requestedBoxes * listing.sqftPerBox).toFixed(1)} sq.ft
                  </strong>
                </span>
                <span>
                  {locale === "bn" ? "নির্দেশক মূল্য:" : "Indicative Subtotal:"}{" "}
                  <strong>
                    {formatBdt(
                      requestedBoxes * listing.pricePerBoxBdt,
                      locale
                    )}
                  </strong>
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="rfq-district"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn" ? "ডেলিভারি জেলা" : "Delivery District"}
              </label>
              <select
                id="rfq-district"
                value={deliveryDistrict}
                onChange={(e) => setDeliveryDistrict(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded border border-hairline bg-canvas text-xs text-ink"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rfq-address"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn"
                  ? "প্রজেক্ট বা সাইটের বিস্তারিত ঠিকানা"
                  : "Project Site Delivery Address"}
              </label>
              <input
                id="rfq-address"
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded border border-hairline bg-canvas text-xs text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="rfq-window"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn"
                  ? "প্রত্যাশিত ডেলিভারি সময়"
                  : "Preferred Delivery Window"}
              </label>
              <input
                id="rfq-window"
                type="text"
                value={preferredWindow}
                onChange={(e) => setPreferredWindow(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 rounded border border-hairline bg-canvas text-xs text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="rfq-notes"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn"
                  ? "ব্যাচ শেড বা আনলোডিং নোট"
                  : "Shade Batch or Unloading Notes"}
              </label>
              <textarea
                id="rfq-notes"
                rows={3}
                value={projectNotes}
                onChange={(e) => setProjectNotes(e.target.value)}
                className="w-full px-3 py-2 rounded border border-hairline bg-canvas text-xs text-ink"
              />
            </div>

            {rfqError && (
              <div
                role="alert"
                className="p-3 rounded bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border border-red-300 text-xs font-medium"
              >
                {rfqError}
              </div>
            )}

            {rfqSuccess && (
              <div
                role="status"
                className="p-3 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs font-semibold"
              >
                {rfqSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submittingRfq}
              className="w-full min-h-[46px] px-5 py-3 rounded bg-accent hover:bg-accent-hover disabled:opacity-55 text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              {submittingRfq
                ? locale === "bn"
                  ? "কোটেশন রিকোয়েস্ট পাঠানো হচ্ছে..."
                  : "Submitting RFQ to Showroom..."
                : locale === "bn"
                ? "কোটেশন রিকোয়েস্ট পাঠান (Submit RFQ)"
                : "Submit Request for Quotation (RFQ)"}
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
}

