"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  FileSearch,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { OperationalAnalytics } from "@/components/ui/OperationalAnalytics";
import {
  formatBdt,
  getModerationLabel,
  getVerificationLabel,
  VERIFICATION_COPY,
} from "@/lib/i18n";
import { DealerListing, Organization } from "@/lib/types";
import { availableVerificationDecisions } from "@/lib/verification";

interface AdminMetrics {
  northStarCompletedTransactions: number;
  totalOrders: number;
  activeVerifiedDealers: number;
  rfqResponseRatePercent: number;
  quoteToOrderConversionPercent: number;
  orderCompletionRatePercent: number;
}

interface AdminListing extends DealerListing {
  organizationNameEn?: string;
}

export default function AdminWorkspacePage() {
  const { locale, user, switchRole, refreshSession } = useApp();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<"saved" | "failed" | null>(null);
  const [busyTarget, setBusyTarget] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) return;
      if (user.activeRole !== "ADMIN" && user.roles.includes("ADMIN")) {
        await switchRole("ADMIN");
      }
      const res = await fetch("/api/admin/moderate", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        setOrganizations(json.data.organizations || []);
        setListings(json.data.listings || []);
        setMetrics(json.data.metrics || null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, switchRole]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleModerate = async (
    targetType: "ORGANIZATION" | "LISTING",
    targetId: string,
    decision: string,
    note: string
  ) => {
    setFeedback(null);
    setBusyTarget(targetId);
    try {
      const res = await fetch("/api/admin/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, decision, note }),
      });
      if (!res.ok) throw new Error();
      setFeedback("saved");
      await refreshSession();
      await loadAdminData();
    } catch {
      setFeedback("failed");
    } finally {
      setBusyTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Header */}
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
            PLATFORM ADMIN OPERATIONS, VERIFICATION & MODERATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "প্ল্যাটফর্ম অ্যাডমিন ও মডারেশন প্যানেল"
              : "Platform Admin Verification & Moderation Console"}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {locale === "bn"
              ? "ডিলার ভেরিফিকেশন, পণ্যের ক্যাটালগ অনুমোদন, অর্ডার মনিটরিং এবং অপরিবর্তনীয় অডিট লগ।"
              : "Permission-scoped dealer verification, listing moderation, platform KPIs, and audited governance."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/workspace/admin/orders"
            className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
          >
            <ClipboardList className="w-4 h-4 text-accent" />
            <span>
              {locale === "bn"
                ? "অর্ডার ও ডিসপিউট মনিটরিং"
                : "Orders & Disputes"}
            </span>
          </Link>
          <Link
            href="/workspace/admin/audit"
            className="min-h-[40px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSearch className="w-4 h-4" />
            <span>
              {locale === "bn"
                ? "অপরিবর্তনীয় অডিট লগ"
                : "Immutable Audit Trail"}
            </span>
          </Link>
        </div>
      </div>

      {user?.roles.includes("ADMIN") && <OperationalAnalytics key={user.id} userId={user.id} scope="ADMIN" />}

      {feedback && (
        <div
          role={feedback === "failed" ? "alert" : "status"}
          className="rounded-lg border border-hairline bg-muted p-4 text-sm font-semibold text-ink"
        >
          {VERIFICATION_COPY[feedback][locale]}
        </div>
      )}

      {/* Section 9 Success Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-surface border-2 border-accent space-y-1">
            <span className="text-[11px] font-mono uppercase text-accent font-bold block">
              NORTH STAR METRIC
            </span>
            <div className="text-2xl font-mono font-bold text-ink tabular-nums">
              {metrics.northStarCompletedTransactions}
            </div>
            <div className="text-xs text-secondary">
              {locale === "bn"
                ? "সম্পন্ন কনস্ট্রাকশন লেনদেন"
                : "Fulfilled Transactions"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
            <span className="text-[11px] font-mono uppercase text-subtle block">
              ACTIVE DEALERS
            </span>
            <div className="text-2xl font-mono font-bold text-ink tabular-nums">
              {metrics.activeVerifiedDealers}
            </div>
            <div className="text-xs text-secondary">
              {locale === "bn" ? "সক্রিয় ভেরিফায়েড ডিলার" : "Verified Showrooms"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
            <span className="text-[11px] font-mono uppercase text-subtle block">
              RFQ RESPONSE RATE
            </span>
            <div className="text-2xl font-mono font-bold text-accent-teal tabular-nums">
              {metrics.rfqResponseRatePercent}%
            </div>
            <div className="text-xs text-secondary">
              {locale === "bn" ? "আরএফকিউ সাড়া হার" : "RFQs Receiving Quote"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
            <span className="text-[11px] font-mono uppercase text-subtle block">
              QUOTE CONVERSION
            </span>
            <div className="text-2xl font-mono font-bold text-ink tabular-nums">
              {metrics.quoteToOrderConversionPercent}%
            </div>
            <div className="text-xs text-secondary">
              {locale === "bn"
                ? "কোটেশন থেকে অর্ডার হার"
                : "Quote-to-Order Rate"}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-hairline space-y-1">
            <span className="text-[11px] font-mono uppercase text-subtle block">
              COMPLETION RATE
            </span>
            <div className="text-2xl font-mono font-bold text-ink tabular-nums">
              {metrics.orderCompletionRatePercent}%
            </div>
            <div className="text-xs text-secondary">
              {locale === "bn" ? "অর্ডার সম্পন্ন হার" : "Completed / Confirmed"}
            </div>
          </div>
        </div>
      )}

      {/* Dealer Organization Verification Queue */}
      <section className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent-teal" />
            <span>
              {locale === "bn"
                ? "ডিলার ও শোরুম ভেরিফিকেশন কিউ"
                : "Dealer Verification Queue"}
            </span>
          </h2>
          <span className="text-xs font-mono text-subtle">
            {organizations.length} Organizations
          </span>
        </div>

        {loading ? (
          <p className="text-xs text-secondary">Loading organizations...</p>
        ) : (
          <div className="overflow-x-auto border border-hairline rounded" role="region" aria-label={VERIFICATION_COPY.queue[locale]} tabIndex={0}>
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-ink font-semibold border-b border-hairline">
                <tr>
                  <th className="p-3">Showroom / Organization</th>
                  <th className="p-3">District & Phone</th>
                  <th className="p-3">Trade License / TIN / NID</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3 text-right">Admin Actions (Audited)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td className="p-3">
                      <div className="font-bold text-ink">
                        {locale === "bn" ? org.tradeNameBn : org.tradeNameEn}
                      </div>
                      <div className="text-subtle text-[11px]">
                        {org.moderationNote}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-secondary">
                      {org.primaryDistrict} | {org.contactPhone}
                    </td>
                    <td className="p-3 font-mono text-secondary">
                      <div>TL: {org.tradeLicenseNo || "N/A"}</div>
                      <div>
                        TIN: {org.tinNumber || "N/A"} | NID:{" "}
                        {org.ownerNid || "N/A"}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          org.verificationStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                            : org.verificationStatus === "SUBMITTED"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-muted text-ink"
                        }`}
                      >
                        {getVerificationLabel(org.verificationStatus, locale)}
                      </span>
                    </td>
                    <td className="p-3">
                      {availableVerificationDecisions(org.verificationStatus).length > 0 && (
                        <form
                          key={org.verificationStatus}
                          className="min-w-[11rem] space-y-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const { submitter } = event.nativeEvent as SubmitEvent;
                            if (!(submitter instanceof HTMLButtonElement)) return;
                            const reason = String(new FormData(event.currentTarget).get("reason") ?? "");
                            void handleModerate("ORGANIZATION", org.id, submitter.value, reason);
                          }}
                        >
                          <label className="block font-semibold text-ink">
                            {VERIFICATION_COPY.reason[locale]}
                            <input name="reason" required maxLength={500} className="mt-1 block min-h-[44px] w-full rounded border border-hairline bg-canvas px-3 py-2 text-ink" />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableVerificationDecisions(org.verificationStatus).map((decision) => (
                              <button key={decision} type="submit" value={decision} disabled={busyTarget !== null} className="min-h-[44px] rounded border border-hairline bg-muted px-3 py-2 font-semibold text-ink hover:bg-canvas">
                                {VERIFICATION_COPY.actions[decision][locale]}
                              </button>
                            ))}
                          </div>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Product Listing Moderation Queue */}
      <section className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            <span>
              {locale === "bn"
                ? "ক্যাটালগ লিস্টিং মডারেশন কিউ"
                : "Product Listing Moderation Queue"}
            </span>
          </h2>
          <span className="text-xs font-mono text-subtle">
            {listings.length} Listings
          </span>
        </div>

        <div className="overflow-x-auto border border-hairline rounded">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-ink font-semibold border-b border-hairline">
              <tr>
                <th className="p-3">SKU & Product Title</th>
                <th className="p-3">Showroom</th>
                <th className="p-3">Specs & Rate</th>
                <th className="p-3">Moderation Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {listings.map((lst) => (
                <tr key={lst.id}>
                  <td className="p-3">
                    <div className="font-bold text-ink">
                      {locale === "bn" ? lst.titleBn : lst.titleEn}
                    </div>
                    <div className="font-mono text-subtle">{lst.sku}</div>
                  </td>
                  <td className="p-3 text-secondary">
                    {lst.organizationNameEn}
                  </td>
                  <td className="p-3 font-mono text-secondary">
                    {lst.dimensionsMm} |{" "}
                    {formatBdt(lst.pricePerSqftBdt, locale)}/sq.ft
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        lst.moderationStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                          : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                      }`}
                    >
                      {getModerationLabel(lst.moderationStatus, locale)}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                    {lst.moderationStatus !== "APPROVED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerate(
                            "LISTING",
                            lst.id,
                            "APPROVED",
                            VERIFICATION_COPY.listingApprovedReason[locale]
                          )
                        }
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                      >
                        {VERIFICATION_COPY.approveListing[locale]}
                      </button>
                    )}
                    {lst.moderationStatus !== "REJECTED" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleModerate(
                            "LISTING",
                            lst.id,
                            "REJECTED",
                            VERIFICATION_COPY.listingRejectedReason[locale]
                          )
                        }
                        className="px-2.5 py-1 rounded border border-red-300 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 font-semibold cursor-pointer"
                      >
                        {VERIFICATION_COPY.actions.REJECTED[locale]}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
