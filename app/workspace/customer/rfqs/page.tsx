"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Lock,
  Plus,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { CommercialDocumentButton } from "@/components/ui/CommercialDocumentButton";
import {
  commercialCopy,
  formatBdt,
  getQuotationStatusLabel,
  getRfqStatusLabel,
} from "@/lib/i18n";
import { Quotation, Rfq } from "@/lib/types";

export default function CustomerRfqsPage() {
  const router = useRouter();
  const { locale, user, switchRole, refreshSession } = useApp();

  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingQuoteId, setAcceptingQuoteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadRfqs = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) return;
      if (user.activeRole !== "CUSTOMER" && user.roles.includes("CUSTOMER")) {
        await switchRole("CUSTOMER");
      }
      const res = await fetch("/api/rfqs?scope=CUSTOMER", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setRfqs(json.data.rfqs || []);
        setQuotations(json.data.quotations || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user, switchRole]);

  useEffect(() => {
    loadRfqs();
  }, [loadRfqs]);

  const handleAcceptQuotation = async (quotationId: string) => {
    setFeedback(null);
    setAcceptingQuoteId(quotationId);
    try {
      const res = await fetch(`/api/quotes/${quotationId}/accept`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to accept quotation.");
      }

      const orderNumber = json.data.order.orderNumber;
      const idempotent = json.data.idempotentHit;
      setFeedback({
        type: "success",
        message:
          locale === "bn"
            ? `কোটেশন গৃহীত হয়েছে এবং অর্ডার ${orderNumber} তৈরি হয়েছে (${
                idempotent ? "ডুপ্লিকেট প্রতিরোধকৃত" : "প্রাইস স্ন্যাপশট সংরক্ষিত"
              })।`
            : `Quotation accepted! Order ${orderNumber} created atomically with locked snapshots.`,
      });
      await refreshSession();
      await loadRfqs();
      setTimeout(() => {
        router.push("/workspace/customer/orders");
      }, 1000);
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to accept quotation.",
      });
    } finally {
      setAcceptingQuoteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-hairline rounded-lg p-6">
        <div>
          <Link
            href="/workspace/customer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "ক্রেতা ড্যাশবোর্ডে ফিরুন"
                : "Back to Customer Workspace"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            RFQ, IMMUTABLE QUOTATION COMPARISON & ATOMIC ACCEPTANCE
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "আপনার আরএফকিউ এবং শোরুম কোটেশন তালিকা"
              : "Your Requests for Quotation (RFQs) & Dealer Offers"}
          </h1>
        </div>
        <Link
          href="/marketplace"
          className="min-h-[42px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>
            {locale === "bn"
              ? "নতুন আরএফকিউ পাঠান"
              : "Create New RFQ from Catalogue"}
          </span>
        </Link>
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-lg border text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300"
              : "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 border-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {loading ? (
        <div className="p-8 bg-surface border border-hairline rounded-lg text-sm text-secondary">
          Loading RFQs and Quotations...
        </div>
      ) : rfqs.length === 0 ? (
        <div className="p-12 bg-surface border border-hairline rounded-lg text-center space-y-3">
          <p className="text-sm font-semibold text-ink">
            {locale === "bn"
              ? "আপনার কোনো আরএফকিউ পাওয়া যায়নি।"
              : "You have not submitted any RFQs yet."}
          </p>
          <Link
            href="/marketplace"
            className="inline-block px-4 py-2 rounded bg-accent text-white text-xs font-semibold"
          >
            {locale === "bn" ? "মার্কেটপ্লেস দেখুন" : "Browse Marketplace"}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {rfqs.map((rfq) => {
            const rfqQuotes = quotations
              .filter((q) => q.rfqId === rfq.id)
              .sort((a, b) => b.versionNumber - a.versionNumber);

            return (
              <section
                key={rfq.id}
                className="bg-surface border border-hairline rounded-lg overflow-hidden"
              >
                {/* RFQ Header */}
                <div className="p-5 bg-muted border-b border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                      {locale === "bn" ? "শোরুম:" : "Target Showroom:"}{" "}
                      <strong className="text-ink">
                        {locale === "bn"
                          ? rfq.organizationNameBn
                          : rfq.organizationNameEn}
                      </strong>{" "}
                      | {locale === "bn" ? "ডেলিভারি:" : "Delivery:"}{" "}
                      {rfq.deliveryAddress} ({rfq.deliveryDistrict})
                    </div>
                  </div>
                  <div className="text-xs font-mono text-subtle">
                    {new Date(rfq.createdAt).toLocaleDateString("en-GB")}
                  </div>
                </div>

                {/* Requested Items Table */}
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-subtle mb-2">
                      {locale === "bn"
                        ? "চাহিদাকৃত পণ্য তালিকা (Requested Items)"
                        : "Requested Material Items"}
                    </h2>
                    <div className="overflow-x-auto border border-hairline rounded">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted text-ink font-semibold border-b border-hairline">
                          <tr>
                            <th className="p-2.5">SKU / Material</th>
                            <th className="p-2.5">Dimensions & Finish</th>
                            <th className="p-2.5 text-right">Requested Boxes</th>
                            <th className="p-2.5 text-right">Total Area</th>
                            <th className="p-2.5 text-right">Indicative Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline">
                          {rfq.items.map((item) => (
                            <tr key={item.listingId}>
                              <td className="p-2.5">
                                <div className="font-semibold text-ink">
                                  {locale === "bn"
                                    ? item.titleBn
                                    : item.titleEn}
                                </div>
                                <div className="font-mono text-subtle">
                                  {item.sku}
                                </div>
                              </td>
                              <td className="p-2.5 font-mono text-secondary">
                                {item.dimensionsMm} | {item.surfaceFinish}
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-ink tabular-nums">
                                {item.requestedBoxes} boxes
                              </td>
                              <td className="p-2.5 text-right font-mono text-secondary tabular-nums">
                                {item.totalSqft} sq.ft
                              </td>
                              <td className="p-2.5 text-right font-mono text-secondary tabular-nums">
                                {formatBdt(item.indicativePricePerBoxBdt, locale)}{" "}
                                / box
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Quotations Received for this RFQ */}
                  <div className="pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-accent mb-2.5 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>
                        {locale === "bn"
                          ? `প্রাপ্ত শোরুম কোটেশনসমূহ (${rfqQuotes.length})`
                          : `Showroom Quotations Received (${rfqQuotes.length})`}
                      </span>
                    </h3>

                    {rfqQuotes.length === 0 ? (
                      <div className="p-4 rounded bg-canvas border border-hairline text-xs text-secondary">
                        <span>
                          {locale === "bn"
                            ? "ভেরিফায়েড শোরুম আপনার আরএফকিউ পর্যালোচনা করছে। শোরুম থেকে আনুষ্ঠানিক কোটেশন পাঠানো হলে তা এখানে প্রদর্শিত হবে।"
                            : "The verified showroom is reviewing your RFQ. Formal BDT quotations will appear here as soon as issued by the dealer."}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rfqQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className={`p-5 rounded-lg border ${
                              quote.status === "SENT"
                                ? "border-2 border-accent bg-canvas"
                                : "border-hairline bg-canvas"
                            } space-y-4`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-sm text-ink">
                                  {quote.quoteNumber}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-hairline text-[11px] font-mono">
                                  <Lock className="w-3 h-3 text-accent" />
                                  <span>
                                    Immutable Version v{quote.versionNumber}
                                  </span>
                                </span>
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                                  {getQuotationStatusLabel(
                                    quote.status,
                                    locale
                                  )}
                                </span>
                              </div>
                              <div className="text-xs font-mono text-secondary flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                <span>
                                  {locale === "bn" ? "মেয়াদ:" : "Valid Until:"}{" "}
                                  {new Date(quote.validUntil).toLocaleDateString(
                                    "en-GB"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Itemized Quote Lines */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="text-subtle border-b border-hairline font-mono">
                                  <tr>
                                    <th className="py-1.5">Item</th>
                                    <th className="py-1.5 text-right">
                                      Quoted Boxes
                                    </th>
                                    <th className="py-1.5 text-right">
                                      Unit Rate / Box
                                    </th>
                                    <th className="py-1.5 text-right">
                                      Rate / sq.ft
                                    </th>
                                    <th className="py-1.5 text-right">
                                      Line Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-hairline font-mono">
                                  {quote.items.map((qi) => (
                                    <tr key={qi.listingId}>
                                      <td className="py-2 font-sans font-medium text-ink">
                                        {locale === "bn"
                                          ? qi.titleBn
                                          : qi.titleEn}
                                      </td>
                                      <td className="py-2 text-right tabular-nums">
                                        {qi.quotedBoxes}
                                      </td>
                                      <td className="py-2 text-right tabular-nums">
                                        {formatBdt(
                                          qi.unitPricePerBoxBdt,
                                          locale
                                        )}
                                      </td>
                                      <td className="py-2 text-right tabular-nums">
                                        {formatBdt(
                                          qi.unitPricePerSqftBdt,
                                          locale
                                        )}
                                      </td>
                                      <td className="py-2 text-right font-bold text-ink tabular-nums">
                                        {formatBdt(qi.lineTotalBdt, locale)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Totals & Terms */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-hairline items-center">
                              <div className="md:col-span-7 text-xs space-y-1 text-secondary">
                                <div>
                                  <strong className="text-ink">
                                    {locale === "bn"
                                      ? "পেমেন্ট শর্তাবলী:"
                                      : "Payment Terms:"}
                                  </strong>{" "}
                                  {quote.paymentTerms}
                                </div>
                                <div>
                                  <strong className="text-ink">
                                    {locale === "bn"
                                      ? "ডেলিভারি শর্তাবলী:"
                                      : "Delivery Terms:"}
                                  </strong>{" "}
                                  {quote.deliveryTerms}
                                </div>
                              </div>

                              <div className="md:col-span-5 flex flex-col sm:items-end justify-between gap-2">
                                <div className="text-xs font-mono space-y-0.5 sm:text-right">
                                  <div>
                                    Subtotal:{" "}
                                    {formatBdt(quote.subtotalBdt, locale)} |
                                    Transport: +
                                    {formatBdt(quote.deliveryFeeBdt, locale)} |
                                    {commercialCopy.vat[locale]}: +
                                    {formatBdt(quote.vatBdt ?? 0, locale)} |
                                    Discount: -
                                    {formatBdt(quote.discountBdt, locale)}
                                  </div>
                                  <div className="text-base font-bold text-ink tabular-nums">
                                    {locale === "bn"
                                      ? "সর্বমোট:"
                                      : "Total Landed Offer:"}{" "}
                                    {formatBdt(quote.totalAmountBdt, locale)}
                                  </div>
                                </div>

                                <CommercialDocumentButton quote={quote} rfq={rfq} />

                                {quote.status === "SENT" && (
                                  <button
                                    type="button"
                                    disabled={acceptingQuoteId === quote.id}
                                    onClick={() =>
                                      handleAcceptQuotation(quote.id)
                                    }
                                    className="min-h-[42px] px-5 py-2 rounded bg-accent hover:bg-accent-hover disabled:opacity-55 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                      {acceptingQuoteId === quote.id
                                        ? "Creating Order..."
                                        : locale === "bn"
                                        ? "কোটেশন গ্রহণ ও অর্ডার নিশ্চিত করুন"
                                        : "Accept Quotation & Create Order"}
                                    </span>
                                  </button>
                                )}

                                {quote.status === "ACCEPTED" && (
                                  <Link
                                    href="/workspace/customer/orders"
                                    className="text-xs font-semibold text-accent hover:underline"
                                  >
                                    {locale === "bn"
                                      ? "তৈরিকৃত অর্ডার দেখুন ->"
                                      : "View Created Order ->"}
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
