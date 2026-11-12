"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { formatBdt, getOrderStateLabel } from "@/lib/i18n";
import { Order, OrderState } from "@/lib/types";

export default function AdminOrdersPage() {
  const { locale, user, switchRole } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAllOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (!user) return;
      if (user.activeRole !== "ADMIN" && user.roles.includes("ADMIN")) {
        await switchRole("ADMIN");
      }
      const res = await fetch("/api/orders?scope=ADMIN", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        setOrders(json.data.orders || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user, switchRole]);

  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  const handleAdminOrderAction = async (
    orderId: string,
    toState: OrderState,
    note: string
  ) => {
    setFeedback(null);
    const res = await fetch(`/api/orders/${orderId}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorRole: "ADMIN",
        toState,
        note,
        disputeResolutionNote: note,
      }),
    });
    const json = await res.json();
    if (res.ok && json.ok) {
      setFeedback(
        locale === "bn"
          ? `অ্যাডমিন কর্তৃক অর্ডার ${toState}-এ আপডেট এবং অডিট লগভুক্ত হয়েছে।`
          : `Order transitioned to ${toState} by Platform Admin and audited.`
      );
      await loadAllOrders();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "অ্যাডমিন প্যানেলে ফিরুন"
                : "Back to Admin Console"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            ADMIN ORDER MONITORING & DISPUTE RESOLUTION
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "প্ল্যাটফর্ম অর্ডার মনিটরিং এবং ডিসপিউট নিষ্পত্তি"
              : "Platform Order Monitoring & Exception / Dispute Resolution"}
          </h1>
        </div>
        <Link
          href="/workspace/admin/audit"
          className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink inline-flex items-center"
        >
          {locale === "bn"
            ? "অডিট লগ দেখুন"
            : "View Audit Trail"}
        </Link>
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
          Loading platform orders...
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-surface border border-hairline rounded-lg p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
                <div>
                  <span className="font-mono font-bold text-base text-ink mr-2.5">
                    {ord.orderNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-muted border border-hairline text-xs font-semibold text-ink">
                    {getOrderStateLabel(ord.state, locale)}
                  </span>
                </div>
                <div className="font-mono font-bold text-ink tabular-nums">
                  {formatBdt(ord.pricingSnapshot.grandTotalBdt, locale)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-secondary">
                <div>
                  <strong className="text-ink">Buyer:</strong>{" "}
                  {ord.buyerSnapshot.fullName} ({ord.buyerSnapshot.phone})
                </div>
                <div>
                  <strong className="text-ink">Showroom:</strong>{" "}
                  {ord.sellerSnapshot.tradeNameEn}
                </div>
                <div>
                  <strong className="text-ink">Vehicle:</strong>{" "}
                  {ord.deliveryCoordination.vehicleType}
                </div>
              </div>

              {ord.dispute && (
                <div className="p-3 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-300 text-xs space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>
                      Dispute [{ord.dispute.status}]: {ord.dispute.reason}
                    </span>
                  </div>
                  <div className="text-secondary">{ord.dispute.description}</div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                {ord.state === "DISPUTED" && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleAdminOrderAction(
                          ord.id,
                          "COMPLETED",
                          "Dispute resolved by Admin after replacement box confirmation."
                        )
                      }
                      className="px-3 py-1.5 rounded bg-emerald-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve & Mark COMPLETED</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAdminOrderAction(
                          ord.id,
                          "CANCELLED",
                          "Order cancelled by Admin following dispute review."
                        )
                      }
                      className="px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-900 text-xs font-semibold cursor-pointer"
                    >
                      Resolve & Mark CANCELLED
                    </button>
                  </>
                )}

                {ord.state === "DELIVERED" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAdminOrderAction(
                        ord.id,
                        "COMPLETED",
                        "Admin policy auto-complete applied after verified site delivery."
                      )
                    }
                    className="px-3 py-1.5 rounded bg-accent text-white text-xs font-semibold cursor-pointer"
                  >
                    Apply Auto-Complete Policy (COMPLETED)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
