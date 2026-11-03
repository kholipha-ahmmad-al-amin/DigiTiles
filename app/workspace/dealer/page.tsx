"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { OperationalAnalytics } from "@/components/ui/OperationalAnalytics";
import {
  formatBdt,
  getOrderStateLabel,
  getRfqStatusLabel,
  getVerificationLabel,
} from "@/lib/i18n";
import { DealerListing, Order, Organization, Rfq } from "@/lib/types";

export default function DealerWorkspacePage() {
  const { locale, user, quickSwitchPersona } = useApp();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [listings, setListings] = useState<DealerListing[]>([]);
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDealerDashboard = async () => {
      setLoading(true);
      try {
        if (!user || !user.roles.includes("DEALER")) {
          await quickSwitchPersona("usr_dealer_01", "DEALER");
        }
        const [catRes, rfqRes, ordRes] = await Promise.all([
          fetch("/api/dealer/listings", { cache: "no-store" }),
          fetch("/api/rfqs?scope=DEALER", { cache: "no-store" }),
          fetch("/api/orders?scope=DEALER", { cache: "no-store" }),
        ]);
        const catJson = await catRes.json();
        const rfqJson = await rfqRes.json();
        const ordJson = await ordRes.json();

        if (catJson.ok && catJson.data) {
          setListings(catJson.data.listings || []);
          setOrganization(catJson.data.organization || null);
        }
        if (rfqJson.ok && rfqJson.data) {
          setRfqs(rfqJson.data.rfqs || []);
        }
        if (ordJson.ok && ordJson.data) {
          setOrders(ordJson.data.orders || []);
        }
      } finally {
        setLoading(false);
      }
    };
    loadDealerDashboard();
  }, [user, quickSwitchPersona]);

  const openRfqs = rfqs.filter((r) => r.status === "OPEN");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Showroom Header & Module Bar */}
      <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
              SCR-08 | DEALER & SHOWROOM PORTAL (FR-03 TO FR-12)
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1">
              {organization
                ? locale === "bn"
                  ? organization.tradeNameBn
                  : organization.tradeNameEn
                : locale === "bn"
                ? "ডিলার ও শোরুম পোর্টাল"
                : "Dealer Showroom Portal"}
            </h1>
            {organization && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {getVerificationLabel(
                      organization.verificationStatus,
                      locale
                    )}
                  </span>
                </span>
                <span className="font-mono text-subtle">
                  License: {organization.tradeLicenseNo || "Pending"} |{" "}
                  {organization.primaryDistrict}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/workspace/dealer/organization"
              className="min-h-[40px] px-3.5 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? "শোরুম, ব্রাঞ্চ ও স্টাফ (SCR-09)"
                  : "Org, Branches & Staff (SCR-09)"}
              </span>
            </Link>
            <Link
              href="/workspace/dealer/catalogue"
              className="min-h-[40px] px-3.5 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
            >
              <Layers className="w-4 h-4 text-accent" />
              <span>
                {locale === "bn"
                  ? "ক্যাটালগ ও পণ্য যোগ (SCR-10)"
                  : "Catalogue Management (SCR-10)"}
              </span>
            </Link>
            <Link
              href="/workspace/dealer/rfqs"
              className="min-h-[40px] px-3.5 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {locale === "bn"
                  ? "আরএফকিউ ও কোটেশন প্রদান (SCR-11)"
                  : "RFQ Inbox & Quoting (SCR-11)"}
              </span>
            </Link>
            <Link
              href="/workspace/dealer/orders"
              className="min-h-[40px] px-3.5 py-2 rounded border border-hairline bg-muted hover:bg-canvas text-xs font-semibold text-ink flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? "অর্ডার ও ডিসপ্যাচ (SCR-12)"
                  : "Orders & Dispatch (SCR-12)"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-surface border border-hairline rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-subtle">
            {locale === "bn" ? "মোট ক্যাটালগ পণ্য" : "Showroom Listings"}
          </span>
          <div className="text-3xl font-mono font-bold text-ink tabular-nums">
            {listings.length}
          </div>
          <Link
            href="/workspace/dealer/catalogue"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn" ? "পণ্য যোগ বা এডিট" : "Manage Catalogue"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-surface border-2 border-accent rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-accent font-bold">
            {locale === "bn" ? "কোটেশনের অপেক্ষায় (Open RFQs)" : "Open RFQs to Quote"}
          </span>
          <div className="text-3xl font-mono font-bold text-ink tabular-nums">
            {openRfqs.length}
          </div>
          <Link
            href="/workspace/dealer/rfqs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn" ? "এখনই কোটেশন পাঠান" : "Send Quotation Now"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-surface border border-hairline rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-subtle">
            {locale === "bn" ? "মোট প্রাপ্ত আরএফকিউ" : "Total RFQs"}
          </span>
          <div className="text-3xl font-mono font-bold text-ink tabular-nums">
            {rfqs.length}
          </div>
          <Link
            href="/workspace/dealer/rfqs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>{locale === "bn" ? "ইনবক্স দেখুন" : "Open RFQ Inbox"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-surface border border-hairline rounded-lg p-5 space-y-1">
          <span className="text-xs font-mono uppercase text-subtle">
            {locale === "bn" ? "চলমান অর্ডারসমূহ" : "Active Orders"}
          </span>
          <div className="text-3xl font-mono font-bold text-accent-teal tabular-nums">
            {orders.length}
          </div>
          <Link
            href="/workspace/dealer/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline pt-1"
          >
            <span>
              {locale === "bn" ? "ডিসপ্যাচ পরিচালনা" : "Update Order Status"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {user?.roles.includes("DEALER") && organization && <OperationalAnalytics key={user.id} userId={user.id} scope="DEALER" />}

      {/* Two-Column Operational Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <span>
                {locale === "bn"
                  ? "ক্রেতাদের কোটেশন রিকোয়েস্ট (RFQ Inbox)"
                  : "Incoming Buyer RFQs"}
              </span>
            </h2>
            <Link
              href="/workspace/dealer/rfqs"
              className="text-xs font-semibold text-accent hover:underline"
            >
              {locale === "bn"
                ? "কোটেশন বিল্ডার খুলুন"
                : "Open Quotation Builder"}
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-secondary">Loading RFQs...</p>
          ) : (
            <div className="space-y-3">
              {rfqs.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded bg-canvas border border-hairline space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-ink">
                      {r.rfqNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-muted border border-hairline font-semibold text-ink">
                      {getRfqStatusLabel(r.status, locale)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ink">
                    {r.customerName} ({r.customerPhone}) | {r.deliveryDistrict}
                  </div>
                  <div className="text-xs text-secondary">
                    {r.items
                      .map((i) => `${i.sku}: ${i.requestedBoxes} boxes`)
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
                  ? "শোরুমের অর্ডার ও ডেলিভারি"
                  : "Showroom Orders & Fulfilment"}
              </span>
            </h2>
            <Link
              href="/workspace/dealer/orders"
              className="text-xs font-semibold text-accent hover:underline"
            >
              {locale === "bn"
                ? "স্ট্যাটাস ও গাড়ি আপডেট করুন"
                : "Manage Dispatch"}
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-secondary">Loading orders...</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded bg-canvas border border-hairline space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-ink">
                      {o.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-semibold">
                      {getOrderStateLabel(o.state, locale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-secondary">
                      Buyer: <strong>{o.buyerSnapshot.fullName}</strong> (
                      {o.buyerSnapshot.deliveryDistrict})
                    </span>
                    <span className="font-mono font-bold text-ink tabular-nums">
                      {formatBdt(o.pricingSnapshot.grandTotalBdt, locale)}
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
