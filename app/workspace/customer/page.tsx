"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Layers,
  PackageCheck,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import {
  formatBdt,
  getOrderStateLabel,
  getRfqStatusLabel,
} from "@/lib/i18n";
import { Order, Quotation, Rfq } from "@/lib/types";

export default function CustomerWorkspacePage() {
  const { locale, user, quickSwitchPersona } = useApp();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (!user) {
          await quickSwitchPersona("usr_customer_01", "CUSTOMER");
        }
        const [rfqRes, ordRes] = await Promise.all([
          fetch("/api/rfqs?scope=CUSTOMER", { cache: "no-store" }),
          fetch("/api/orders?scope=CUSTOMER", { cache: "no-store" }),
        ]);
        const rfqJson = await rfqRes.json();
        const ordJson = await ordRes.json();
        if (rfqJson.ok && rfqJson.data) {
          setRfqs(rfqJson.data.rfqs || []);
          setQuotations(rfqJson.data.quotations || []);
        }
        if (ordJson.ok && ordJson.data) {
          setOrders(ordJson.data.orders || []);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, quickSwitchPersona]);

  const activeQuotes = quotations.filter((q) => q.status === "SENT");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header & Sub-Navigation */}
      <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
              SCR-05 | CUSTOMER WORKSPACE (FR-02, FR-08, FR-10, FR-11)
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
              {locale === "bn"
                ? "ক্রেতা ও প্রজেক্ট বায়ার ড্যাশবোর্ড"
                : "Customer & Project Buyer Workspace"}
            </h1>
            <p className="text-sm text-secondary mt-1">
              {locale === "bn"
                ? "আপনার পাঠানো কোটেশন রিকোয়েস্ট (RFQ), ডিলারের কোটেশন এবং চলমান অর্ডারের ডেলিভারি স্ট্যাটাস এক জায়গায় পরিচালনা করুন।"
                : "Manage your submitted RFQs, compare immutable showroom quotations, and track your active material deliveries."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/marketplace"
              className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-4 h-4 text-accent" />
              <span>
                {locale === "bn" ? "নতুন পণ্য খুঁজুন" : "Browse Catalogue"}
              </span>
            </Link>
            <Link
              href="/workspace/customer/rfqs"
              className="min-h-[40px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {locale === "bn"
                  ? "আরএফকিউ ও কোটেশন গ্রহণ (SCR-06)"
                  : "RFQs & Accept Quotes (SCR-06)"}
              </span>
            </Link>
            <Link
              href="/workspace/customer/orders"
              className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-muted hover:bg-canvas text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
            >
              <PackageCheck className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? "অর্ডার ও ডেলিভারি ট্র্যাকিং (SCR-07)"
                  : "Orders & Delivery (SCR-07)"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface border border-hairline rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-subtle">
            {locale === "bn" ? "মোট আরএফকিউ (RFQs)" : "Submitted RFQs"}
          </span>
          <div className="text-3xl font-mono font-bold text-ink tabular-nums">
            {rfqs.length}
          </div>
          <Link
            href="/workspace/customer/rfqs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn" ? "সকল আরএফকিউ দেখুন" : "Inspect RFQs"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-surface border-2 border-accent rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-accent font-bold">
            {locale === "bn"
              ? "গ্রহণের জন্য প্রস্তুত কোটেশন"
              : "Actionable Quotations"}
          </span>
          <div className="text-3xl font-mono font-bold text-ink tabular-nums">
            {activeQuotes.length}
          </div>
          <Link
            href="/workspace/customer/rfqs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn"
                ? "কোটেশন যাচাই ও অর্ডার করুন"
                : "Review & Accept Quotation"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-surface border border-hairline rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-subtle">
            {locale === "bn" ? "সক্রিয় ও সম্পন্ন অর্ডার" : "Total Orders"}
          </span>
          <div className="text-3xl font-mono font-bold text-accent-teal tabular-nums">
            {orders.length}
          </div>
          <Link
            href="/workspace/customer/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn"
                ? "ডেলিভারি টাইমলাইন দেখুন"
                : "Track Order Lifecycle"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two-Column Preview: Recent RFQs & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <span>
                {locale === "bn"
                  ? "সাম্প্রতিক কোটেশন রিকোয়েস্ট (RFQ)"
                  : "Recent Quotation Requests (RFQ)"}
              </span>
            </h2>
            <Link
              href="/workspace/customer/rfqs"
              className="text-xs font-semibold text-accent hover:underline"
            >
              {locale === "bn" ? "সব দেখুন" : "View All"}
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-secondary">Loading RFQs...</p>
          ) : rfqs.length === 0 ? (
            <p className="text-xs text-secondary">No RFQs submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {rfqs.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded bg-canvas border border-hairline space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-ink">
                      {r.rfqNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-muted border border-hairline font-medium text-ink">
                      {getRfqStatusLabel(r.status, locale)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ink">
                    {locale === "bn"
                      ? r.organizationNameBn
                      : r.organizationNameEn}
                  </div>
                  <div className="text-xs text-secondary">
                    {r.items
                      .map(
                        (i) =>
                          `${i.sku} (${i.requestedBoxes} boxes / ${i.totalSqft} sq.ft)`
                      )
                      .join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? "আপনার অর্ডার ও ডেলিভারি স্ট্যাটাস"
                  : "Active & Completed Orders"}
              </span>
            </h2>
            <Link
              href="/workspace/customer/orders"
              className="text-xs font-semibold text-accent hover:underline"
            >
              {locale === "bn" ? "বিস্তারিত ট্র্যাকিং" : "Manage Orders"}
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-secondary">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-xs text-secondary">No orders created yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded bg-canvas border border-hairline space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-ink">
                      {ord.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                      {getOrderStateLabel(ord.state, locale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>
                        {locale === "bn"
                          ? ord.sellerSnapshot.tradeNameBn
                          : ord.sellerSnapshot.tradeNameEn}
                      </span>
                    </span>
                    <span className="font-mono font-bold text-ink tabular-nums">
                      {formatBdt(ord.pricingSnapshot.grandTotalBdt, locale)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
