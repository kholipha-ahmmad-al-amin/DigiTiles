"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  History,
  Lock,
  Truck,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { CommercialDocumentButton } from "@/components/ui/CommercialDocumentButton";
import { OrderServices } from "@/components/ui/OrderServices";
import { OrderStockReservation } from "@/components/ui/OrderStockReservation";
import type { ConstructionCrew } from "@/lib/service-directory";
import { formatBdt, getOrderStateLabel, INVENTORY_COPY } from "@/lib/i18n";
import { Order, OrderState } from "@/lib/types";

const HAPPY_PATH_STATES: OrderState[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_DISPATCH",
  "DISPATCHED",
  "DELIVERED",
  "COMPLETED",
];

export default function CustomerOrdersPage() {
  const { locale, user, quickSwitchPersona } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [crews, setCrews] = useState<ConstructionCrew[]>();
  const [loading, setLoading] = useState(true);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [disputeModalOrderId, setDisputeModalOrderId] = useState<string | null>(
    null
  );
  const [disputeReason, setDisputeReason] = useState(
    "Transit breakage on 2 cartons"
  );
  const [disputeNote, setDisputeNote] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) {
        await quickSwitchPersona("usr_customer_01", "CUSTOMER");
      }
      const res = await fetch("/api/orders?scope=CUSTOMER", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setOrders(json.data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user, quickSwitchPersona]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/services", { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) setCrews((await res.json()).data.crews);
      })
      .catch(() => { if (!controller.signal.aborted) setCrews([]); });
    return () => controller.abort();
  }, []);

  const handleTransition = async (
    orderId: string,
    toState: OrderState,
    note: string,
    reason?: string
  ) => {
    setBusyOrderId(orderId);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: "CUSTOMER",
          toState,
          note,
          disputeReason: reason,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Order update failed.");
      }
      setStatusMessage(
        locale === "bn"
          ? `অর্ডার স্ট্যাটাস সফলভাবে ${toState}-এ আপডেট করা হয়েছে।`
          : `Order updated to ${toState}.`
      );
      setDisputeModalOrderId(null);
      await loadOrders();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Failed to update order."
      );
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/customer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "ক্রেতা ড্যাশবোর্ডে ফিরুন (SCR-05)"
                : "Back to Customer Workspace (SCR-05)"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            SCR-07 | ORDER LIFECYCLE, PRICE SNAPSHOTS & DELIVERY COORDINATION (FR-10, FR-11, FR-12)
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "আপনার অর্ডার, ডেলিভারি সমন্বয় ও টাইমলাইন"
              : "Customer Orders, Delivery Coordination & State History"}
          </h1>
        </div>
        <Link
          href="/workspace/customer/rfqs"
          className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink inline-flex items-center"
        >
          {locale === "bn"
            ? "আরএফকিউ ও কোটেশন পেজ (SCR-06)"
            : "View RFQs & Quotations (SCR-06)"}
        </Link>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs font-semibold"
        >
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="p-8 bg-surface border border-hairline rounded-lg text-sm text-secondary">
          Loading customer orders...
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const currentStepIdx = HAPPY_PATH_STATES.indexOf(ord.state);

            return (
              <section
                key={ord.id}
                className="bg-surface border border-hairline rounded-lg overflow-hidden space-y-5 p-6"
              >
                {/* Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-lg text-ink">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                        {getOrderStateLabel(ord.state, locale)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-hairline text-[11px] font-mono">
                        <Lock className="w-3 h-3 text-accent" />
                        <span>Immutable Snapshot (Rule 6)</span>
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      {locale === "bn" ? "বিক্রেতা শোরুম:" : "Seller Showroom:"}{" "}
                      <strong className="text-ink">
                        {locale === "bn"
                          ? ord.sellerSnapshot.tradeNameBn
                          : ord.sellerSnapshot.tradeNameEn}
                      </strong>{" "}
                      ({ord.sellerSnapshot.branchName}) |{" "}
                      {ord.sellerSnapshot.contactPhone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <CommercialDocumentButton order={ord} />
                    <div className="text-right font-mono">
                      <span className="text-xs text-subtle block">
                        {locale === "bn" ? "সর্বমোট অর্ডার মূল্য" : "Locked Total"}
                      </span>
                      <span className="text-xl font-bold text-ink tabular-nums">
                        {formatBdt(ord.pricingSnapshot.grandTotalBdt, locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7-Step Lifecycle Progress Bar (Section 7) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {HAPPY_PATH_STATES.map((st, idx) => {
                    const isCompleted =
                      currentStepIdx >= idx &&
                      ord.state !== "CANCELLED" &&
                      ord.state !== "DISPUTED";
                    const isCurrent = ord.state === st;
                    return (
                      <div
                        key={st}
                        className={`p-2.5 rounded border text-[11px] font-mono ${
                          isCurrent
                            ? "border-2 border-accent bg-muted font-bold text-ink"
                            : isCompleted
                            ? "border-emerald-500/50 bg-emerald-50/60 dark:bg-emerald-950/30 text-ink"
                            : "border-hairline bg-canvas text-subtle"
                        }`}
                      >
                        <div className="truncate">{st.replace(/_/g, " ")}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Immutable Item Snapshots & Delivery Coordination */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  <div className="lg:col-span-7 space-y-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-subtle">
                      {locale === "bn"
                        ? "অর্ডারের পণ্য ও মূল্যের স্ন্যাপশট (Business Rule 6)"
                        : "Locked Product & Pricing Snapshot (Business Rule 6)"}
                    </h2>
                    <div className="border border-hairline rounded overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted text-ink font-semibold border-b border-hairline">
                          <tr>
                            <th className="p-2.5">Material Snapshot</th>
                            <th className="p-2.5 text-right">Boxes</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline font-mono">
                          {ord.itemSnapshots.map((item) => (
                            <tr key={item.listingId}>
                              <td className="p-2.5 font-sans">
                                <div className="font-semibold text-ink">
                                  {locale === "bn"
                                    ? item.titleBn
                                    : item.titleEn}
                                </div>
                                <div className="text-[11px] font-mono text-subtle">
                                  {item.sku} | {item.dimensionsMm}
                                </div>
                              </td>
                              <td className="p-2.5 text-right tabular-nums">
                                {item.quotedBoxes}
                              </td>
                              <td className="p-2.5 text-right tabular-nums">
                                {formatBdt(item.unitPricePerBoxBdt, locale)}
                              </td>
                              <td className="p-2.5 text-right font-bold text-ink tabular-nums">
                                {formatBdt(item.lineTotalBdt, locale)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Customer Lifecycle Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {(ord.state === "DISPATCHED" ||
                        ord.state === "DELIVERED") && (
                        <button
                          type="button"
                          disabled={busyOrderId === ord.id}
                          onClick={async () => {
                            if (ord.state === "DISPATCHED") {
                              await handleTransition(
                                ord.id,
                                "DELIVERED",
                                "Customer confirmed arrival at project site."
                              );
                            } else {
                              await handleTransition(
                                ord.id,
                                "COMPLETED",
                                "Customer verified intact delivery and completed order."
                              );
                            }
                          }}
                          className="min-h-[40px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {ord.state === "DISPATCHED"
                              ? locale === "bn"
                                ? "পণ্য সাইটে পৌঁছেছে নিশ্চিত করুন (Mark Delivered)"
                                : "Confirm Site Arrival (Mark DELIVERED)"
                              : locale === "bn"
                              ? "অর্ডার সফলভাবে সম্পন্ন করুন (Mark Completed)"
                              : "Confirm Order Completion (Mark COMPLETED)"}
                          </span>
                        </button>
                      )}

                      {ord.state === "PENDING_CONFIRMATION" && (
                        <button
                          type="button"
                          disabled={busyOrderId === ord.id}
                          onClick={() =>
                            handleTransition(
                              ord.id,
                              "CANCELLED",
                              "Cancelled by customer prior to seller confirmation."
                            )
                          }
                          className="min-h-[40px] px-4 py-2 rounded border border-red-300 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200 text-xs font-semibold cursor-pointer"
                        >
                          {locale === "bn"
                            ? "অর্ডার বাতিল করুন"
                            : "Cancel Pending Order"}
                        </button>
                      )}

                      {ord.state !== "COMPLETED" &&
                        ord.state !== "CANCELLED" &&
                        ord.state !== "DISPUTED" &&
                        ord.state !== "PENDING_CONFIRMATION" && (
                          <button
                            type="button"
                            onClick={() => setDisputeModalOrderId(ord.id)}
                            className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {locale === "bn"
                                ? "ক্ষতি বা সমস্যার অভিযোগ জানান (Raise Dispute)"
                                : "Report Issue / Raise Dispute"}
                            </span>
                          </button>
                        )}
                    </div>

                    {/* Inline Dispute Form */}
                    {disputeModalOrderId === ord.id && (
                      <div className="p-4 rounded bg-canvas border-2 border-amber-500 space-y-3">
                        <h3 className="text-xs font-bold text-ink">
                          {locale === "bn"
                            ? "অভিযোগ বা ডিসপিউট দাখিল করুন"
                            : "File Order Dispute for Platform Admin Review"}
                        </h3>
                        <input
                          type="text"
                          value={disputeReason}
                          onChange={(e) => setDisputeReason(e.target.value)}
                          placeholder="Reason (e.g., Broken tiles in transit)"
                          className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface text-xs text-ink"
                        />
                        <textarea
                          rows={2}
                          value={disputeNote}
                          onChange={(e) => setDisputeNote(e.target.value)}
                          placeholder="Describe box count or shade mismatch..."
                          className="w-full px-3 py-1.5 rounded border border-hairline bg-surface text-xs text-ink"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleTransition(
                                ord.id,
                                "DISPUTED",
                                disputeNote || disputeReason,
                                disputeReason
                              )
                            }
                            className="px-3.5 py-1.5 rounded bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            {locale === "bn"
                              ? "অভিযোগ জমা দিন"
                              : "Submit Dispute"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisputeModalOrderId(null)}
                            className="px-3 py-1.5 rounded border border-hairline text-xs text-secondary cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right 5 Columns: Delivery Coordination & Audited Transition Log */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded bg-canvas border border-hairline space-y-2 text-xs">
                      <div className="font-bold text-ink flex items-center gap-1.5 border-b border-hairline pb-2">
                        <Truck className="w-4 h-4 text-accent-teal" />
                        <span>
                          {locale === "bn"
                            ? "ডেলিভারি ও গাড়ির তথ্য (FR-12)"
                            : "Delivery Coordination Record (FR-12)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-subtle">Dispatch Branch:</span>{" "}
                        <strong className="text-ink">
                          {ord.deliveryCoordination.pickupBranchName}
                        </strong>
                      </div>
                      <div>
                        <span className="text-subtle">Drop Address:</span>{" "}
                        <strong className="text-ink">
                          {ord.deliveryCoordination.dropAddress} (
                          {ord.deliveryCoordination.dropDistrict})
                        </strong>
                      </div>
                      <div>
                        <span className="text-subtle">Packaging Check:</span>{" "}
                        <strong className="text-ink">
                          {ord.deliveryCoordination.packagingVerified
                            ? "Verified & Corner-Protected"
                            : "Awaiting Warehouse Check"}
                        </strong>
                      </div>
                    </div>

                    <OrderServices order={ord} crews={crews} />
                    <OrderStockReservation order={ord} />

                    {/* State Transition History (Business Rule 7) */}
                    <div className="p-4 rounded bg-canvas border border-hairline space-y-2 text-xs">
                      <div className="font-bold text-ink flex items-center gap-1.5 border-b border-hairline pb-2">
                        <History className="w-4 h-4 text-accent" />
                        <span>
                          {locale === "bn"
                            ? "অর্ডার ট্রানজিশন অডিট হিস্ট্রি (Rule 7)"
                            : "State Transition History (Rule 7)"}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-44 overflow-y-auto" role="region" tabIndex={0} aria-label={INVENTORY_COPY.orderHistory[locale]}>
                        {ord.stateHistory.map((h) => (
                          <div
                            key={h.id}
                            className="border-l-2 border-accent pl-2.5 py-0.5"
                          >
                            <div className="font-mono font-semibold text-ink">
                              {h.fromState} {"->"} {h.toState}
                            </div>
                            <div className="text-secondary">{h.note}</div>
                            <div className="text-[10px] font-mono text-subtle">
                              {h.actorName} ({h.actorRole}) |{" "}
                              {new Date(h.createdAt).toLocaleString("en-GB")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
