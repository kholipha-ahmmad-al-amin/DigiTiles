"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, Lock, Send } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { CommercialDocumentButton } from "@/components/ui/CommercialDocumentButton";
import {
  commercialCopy,
  formatBdt,
  getQuotationStatusLabel,
  getRfqStatusLabel,
} from "@/lib/i18n";
import { Quotation, Rfq } from "@/lib/types";

export default function DealerRfqsPage() {
  const { locale, user, switchRole, refreshSession } = useApp();

  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRfqId, setActiveRfqId] = useState<string | null>(null);
  const [itemBoxRates, setItemBoxRates] = useState<Record<string, number>>({});
  const [deliveryFeeBdt, setDeliveryFeeBdt] = useState<number>(2200);
  const [discountBdt, setDiscountBdt] = useState<number>(500);
  const [vatBdt, setVatBdt] = useState(0);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [paymentTerms, setPaymentTerms] = useState<string>(
    "30% advance booking via Bank/bKash; 70% upon arrival at site before unloading."
  );
  const [deliveryTerms, setDeliveryTerms] = useState<string>(
    "1.5 Ton Covered Pickup from showroom warehouse within 3 working days."
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDealerRfqs = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) return;
      if (user.activeRole !== "DEALER" && user.roles.includes("DEALER")) {
        await switchRole("DEALER");
      }
      const res = await fetch("/api/rfqs?scope=DEALER", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        const list: Rfq[] = json.data.rfqs || [];
        setRfqs(list);
        setQuotations(json.data.quotations || []);
        const firstOpen =
          list.find((r) => r.status === "OPEN") || list[0] || null;
        if (firstOpen) {
          setActiveRfqId(firstOpen.id);
          const initialRates: Record<string, number> = {};
          for (const item of firstOpen.items) {
            initialRates[item.listingId] = item.indicativePricePerBoxBdt;
          }
          setItemBoxRates(initialRates);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, switchRole]);

  useEffect(() => {
    loadDealerRfqs();
  }, [loadDealerRfqs]);

  const handleSelectRfqForQuote = (rfq: Rfq) => {
    setActiveRfqId(rfq.id);
    setVatBdt(0);
    const rates: Record<string, number> = {};
    for (const item of rfq.items) {
      rates[item.listingId] = item.indicativePricePerBoxBdt;
    }
    setItemBoxRates(rates);
  };

  const handleIssueQuote = async (rfq: Rfq) => {
    if (!Number.isSafeInteger(vatBdt) || vatBdt < 0) {
      setFeedback(commercialCopy.vatInvalid[locale]);
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const itemPrices = rfq.items.map((item) => ({
        listingId: item.listingId,
        quotedBoxes: item.requestedBoxes,
        unitPricePerBoxBdt:
          itemBoxRates[item.listingId] || item.indicativePricePerBoxBdt,
      }));

      const res = await fetch(`/api/rfqs/${rfq.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemPrices,
          deliveryFeeBdt,
          discountBdt,
          vatBdt,
          validUntil: validUntil ? new Date(`${validUntil}T23:59:59+06:00`).toISOString() : "",
          paymentTerms,
          deliveryTerms,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to send quotation.");
      }

      setFeedback(
        locale === "bn"
          ? `অপরিবর্তনীয় কোটেশন (${json.data.quotation.quoteNumber}) সফলভাবে ক্রেতার কাছে পাঠানো হয়েছে!`
          : `Immutable Quotation (${json.data.quotation.quoteNumber}) issued to customer!`
      );
      await refreshSession();
      await loadDealerRfqs();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Failed to issue quotation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/dealer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "ডিলার ড্যাশবোর্ডে ফিরুন"
                : "Back to Dealer Dashboard"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            DEALER RFQ INBOX & IMMUTABLE QUOTATION BUILDER
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "ক্রেতার আরএফকিউ ইনবক্স এবং কোটেশন প্রদান"
              : "Dealer RFQ Inbox & Versioned Quotation Builder"}
          </h1>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs font-semibold"
        >
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="p-8 bg-surface border border-hairline rounded-lg text-sm text-secondary">
          Loading showroom RFQ inbox...
        </div>
      ) : (
        <div className="space-y-6">
          {rfqs.map((rfq) => {
            const existingQuotes = quotations
              .filter((q) => q.rfqId === rfq.id)
              .sort((a, b) => b.versionNumber - a.versionNumber);
            const isBuilderOpen = activeRfqId === rfq.id;

            return (
              <section
                key={rfq.id}
                className="bg-surface border border-hairline rounded-lg overflow-hidden"
              >
                <div className="p-5 bg-muted border-b border-hairline flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-base text-ink">
                        {rfq.rfqNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-surface border border-hairline text-xs font-semibold text-ink">
                        {getRfqStatusLabel(rfq.status, locale)}
                      </span>
                    </div>
                    <div className="text-xs text-secondary mt-1">
                      Buyer: <strong className="text-ink">{rfq.customerName}</strong>{" "}
                      ({rfq.customerPhone}) | Site: {rfq.deliveryAddress} (
                      {rfq.deliveryDistrict})
                    </div>
                  </div>
                  {(rfq.status === "OPEN" || rfq.status === "QUOTED") && (
                    <button
                      type="button"
                      onClick={() => handleSelectRfqForQuote(rfq)}
                      className="min-h-[38px] px-4 py-1.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>
                        {existingQuotes.length > 0
                          ? locale === "bn"
                            ? `নতুন ভার্সন কোটেশন পাঠান (v${
                                existingQuotes.length + 1
                              })`
                            : `Issue Revised Quote Version (v${
                                existingQuotes.length + 1
                              })`
                          : locale === "bn"
                          ? "কোটেশন তৈরি করুন"
                          : "Build Quotation (v1)"}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-5">
                  <div className="text-xs text-secondary bg-canvas p-3 rounded border border-hairline">
                    <strong className="text-ink">Buyer Project Notes:</strong>{" "}
                    {rfq.projectNotes || "Standard delivery"} |{" "}
                    <strong className="text-ink">Window:</strong>{" "}
                    {rfq.preferredWindow}
                  </div>

                  {/* Interactive Quotation Builder for Selected RFQ */}
                  {isBuilderOpen &&
                    (rfq.status === "OPEN" || rfq.status === "QUOTED") && (
                      <div className="p-5 rounded-lg border-2 border-accent bg-canvas space-y-4">
                        <div className="flex items-center justify-between border-b border-hairline pb-2.5">
                          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
                            <Lock className="w-4 h-4 text-accent" />
                            <span>
                              {locale === "bn"
                                ? `আইটেমভিত্তিক কোটেশন বিল্ডার (ভার্সন v${
                                    existingQuotes.length + 1
                                  } - পাঠানোর পর অপরিবর্তনীয়)`
                                : `Itemized Quotation Builder (Immutable Version v${
                                    existingQuotes.length + 1
                                  })`}
                            </span>
                          </h2>
                        </div>

                        <div className="space-y-3">
                          {rfq.items.map((item) => {
                            const currentBoxRate =
                              itemBoxRates[item.listingId] ??
                              item.indicativePricePerBoxBdt;
                            return (
                              <div
                                key={item.listingId}
                                className="p-3 rounded bg-surface border border-hairline grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                              >
                                <div className="sm:col-span-6">
                                  <div className="font-semibold text-ink">
                                    {locale === "bn"
                                      ? item.titleBn
                                      : item.titleEn}
                                  </div>
                                  <div className="font-mono text-subtle">
                                    {item.sku} | {item.requestedBoxes} boxes (
                                    {item.totalSqft} sq.ft)
                                  </div>
                                </div>
                                <div className="sm:col-span-3">
                                  <label
                                    htmlFor={`rate-${rfq.id}-${item.listingId}`}
                                    className="block text-[11px] font-semibold text-ink mb-1"
                                  >
                                    Quoted BDT / Box
                                  </label>
                                  <input
                                    id={`rate-${rfq.id}-${item.listingId}`}
                                    type="number"
                                    value={currentBoxRate}
                                    onChange={(e) =>
                                      setItemBoxRates((prev) => ({
                                        ...prev,
                                        [item.listingId]: Number(
                                          e.target.value
                                        ),
                                      }))
                                    }
                                    className="w-full min-h-[36px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono font-bold text-ink"
                                  />
                                </div>
                                <div className="sm:col-span-3 text-right font-mono">
                                  <span className="text-[11px] text-subtle block">
                                    Line Total
                                  </span>
                                  <span className="font-bold text-ink tabular-nums">
                                    {formatBdt(
                                      currentBoxRate * item.requestedBoxes,
                                      locale
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label
                              htmlFor={`deliv-${rfq.id}`}
                              className="block font-semibold text-ink mb-1"
                            >
                              {locale === "bn"
                                ? "পরিবহন চার্জ (BDT)"
                                : "Transport / Delivery Fee (BDT)"}
                            </label>
                            <input
                              id={`deliv-${rfq.id}`}
                              type="number"
                              value={deliveryFeeBdt}
                              onChange={(e) =>
                                setDeliveryFeeBdt(Number(e.target.value))
                              }
                              className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface font-mono text-ink"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`disc-${rfq.id}`}
                              className="block font-semibold text-ink mb-1"
                            >
                              {locale === "bn"
                                ? "ডিসকাউন্ট (BDT)"
                                : "Project Discount (BDT)"}
                            </label>
                            <input
                              id={`disc-${rfq.id}`}
                              type="number"
                              value={discountBdt}
                              onChange={(e) =>
                                setDiscountBdt(Number(e.target.value))
                              }
                              className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface font-mono text-ink"
                            />
                          </div>
                          <div>
                            <label htmlFor={`vat-${rfq.id}`} className="mb-1 block font-semibold text-ink">
                              {commercialCopy.vatInput[locale]}
                            </label>
                            <input
                              id={`vat-${rfq.id}`}
                              aria-describedby={`vat-hint-${rfq.id}`}
                              type="number"
                              min="0"
                              step="1"
                              value={vatBdt}
                              onChange={(event) => setVatBdt(Number(event.target.value))}
                              className="min-h-11 w-full rounded border border-hairline bg-surface px-3 py-1.5 font-mono text-ink"
                            />
                            <p id={`vat-hint-${rfq.id}`} className="mt-1 text-secondary">{commercialCopy.vatHint[locale]}</p>
                          </div>
                          <div>
                            <label
                              htmlFor={`valid-${rfq.id}`}
                              className="block font-semibold text-ink mb-1"
                            >
                              {locale === "bn"
                                ? "কোটেশনের মেয়াদ (Valid Until)"
                                : "Quote Validity Date"}
                            </label>
                            <input
                              id={`valid-${rfq.id}`}
                              type="date"
                              value={validUntil}
                              onChange={(e) => setValidUntil(e.target.value)}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface font-mono text-ink"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label
                              htmlFor={`pay-${rfq.id}`}
                              className="block font-semibold text-ink mb-1"
                            >
                              Payment Terms
                            </label>
                            <input
                              id={`pay-${rfq.id}`}
                              type="text"
                              value={paymentTerms}
                              onChange={(e) => setPaymentTerms(e.target.value)}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface text-ink"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`dterms-${rfq.id}`}
                              className="block font-semibold text-ink mb-1"
                            >
                              Delivery & Packaging Terms
                            </label>
                            <input
                              id={`dterms-${rfq.id}`}
                              type="text"
                              value={deliveryTerms}
                              onChange={(e) => setDeliveryTerms(e.target.value)}
                              className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface text-ink"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleIssueQuote(rfq)}
                            className="min-h-[42px] px-5 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            <span>
                              {submitting
                                ? "Sending Quotation..."
                                : locale === "bn"
                                ? "কোটেশন পাঠান (Send Immutable Quotation)"
                                : "Send Immutable Quotation"}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Sent Quotation History */}
                  {existingQuotes.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-subtle">
                        Issued Quotation Versions ({existingQuotes.length})
                      </h3>
                      {existingQuotes.map((q) => (
                        <div
                          key={q.id}
                          className="p-3 rounded bg-canvas border border-hairline flex flex-wrap items-center justify-between gap-2 text-xs font-mono"
                        >
                          <div>
                            <strong className="text-ink">
                              {q.quoteNumber}
                            </strong>{" "}
                            (v{q.versionNumber}) |{" "}
                            {getQuotationStatusLabel(q.status, locale)}
                          </div>
                          <div className="font-bold text-ink tabular-nums">
                            Total: {formatBdt(q.totalAmountBdt, locale)} (Valid
                            until{" "}
                            {new Date(q.validUntil).toLocaleDateString("en-GB")})
                          </div>
                          <CommercialDocumentButton quote={q} rfq={rfq} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
