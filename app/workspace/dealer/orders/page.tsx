"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, History, Truck } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { CommercialDocumentButton } from "@/components/ui/CommercialDocumentButton";
import { OrderStockReservation } from "@/components/ui/OrderStockReservation";
import { formatBdt, getOrderStateLabel, INVENTORY_COPY } from "@/lib/i18n";
import { Branch, Order, OrderState } from "@/lib/types";

const NEXT_DEALER_STATE: Partial<Record<OrderState, OrderState>> = {
  PENDING_CONFIRMATION: "CONFIRMED",
  CONFIRMED: "PROCESSING",
  PROCESSING: "READY_FOR_DISPATCH",
  READY_FOR_DISPATCH: "DISPATCHED",
  DISPATCHED: "DELIVERED",
};

export default function DealerOrdersPage() {
  const { locale, user, quickSwitchPersona } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [dispatchBranchIds, setDispatchBranchIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Delivery Coordination Edit State per Order
  const [vehicleInputs, setVehicleInputs] = useState<
    Record<
      string,
      {
        vehicleType: string;
        driverName: string;
        driverPhone: string;
        vehicleRegistration: string;
        packagingVerified: boolean;
      }
    >
  >({});

  const loadDealerOrders = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user.roles.includes("DEALER")) {
        await quickSwitchPersona("usr_dealer_01", "DEALER");
      }
      const res = await fetch("/api/orders?scope=DEALER", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok && json.data) {
        const list: Order[] = json.data.orders || [];
        setOrders(list);
        setBranches(json.data.branches || []);
        const map: typeof vehicleInputs = {};
        for (const o of list) {
          map[o.id] = {
            vehicleType: o.deliveryCoordination.vehicleType,
            driverName: o.deliveryCoordination.driverName,
            driverPhone: o.deliveryCoordination.driverPhone,
            vehicleRegistration: o.deliveryCoordination.vehicleRegistration,
            packagingVerified: o.deliveryCoordination.packagingVerified,
          };
        }
        setVehicleInputs(map);
      }
    } finally {
      setLoading(false);
    }
  }, [user, quickSwitchPersona]);

  useEffect(() => {
    loadDealerOrders();
  }, [loadDealerOrders]);

  const handleAdvanceOrder = async (order: Order, nextState?: OrderState) => {
    setBusyId(order.id);
    setStatusMessage(null);
    try {
      const deliveryUpdate = vehicleInputs[order.id];
      const res = await fetch(`/api/orders/${order.id}/transition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorRole: "DEALER",
          toState: nextState,
          note: nextState
            ? `Showroom updated order status to ${nextState}.`
            : "Updated delivery vehicle and packaging coordination.",
          deliveryUpdate,
          dispatchBranchId: nextState === "CONFIRMED" ? dispatchBranchIds[order.id] : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        const code = json.error?.code as keyof typeof INVENTORY_COPY.errors;
        const stockMessage = Object.hasOwn(INVENTORY_COPY.errors, code) ? INVENTORY_COPY.errors[code][locale] : null;
        throw new Error(stockMessage || json.error?.message || "Failed to update order.");
      }
      setStatusMessage(
        locale === "bn"
          ? `অর্ডার ${order.orderNumber} সফলভাবে আপডেট করা হয়েছে।`
          : `Order ${order.orderNumber} updated successfully.`
      );
      await loadDealerOrders();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Order update failed."
      );
    } finally {
      setBusyId(null);
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
                ? "ডিলার ড্যাশবোর্ডে ফিরুন (SCR-08)"
                : "Back to Dealer Dashboard (SCR-08)"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            SCR-12 | DEALER ORDER FULFILMENT & DELIVERY COORDINATION (FR-11, FR-12)
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "শোরুম অর্ডার প্রসেসিং এবং ডেলিভারি গাড়ি সমন্বয়"
              : "Showroom Order Fulfilment & Transport Coordination"}
          </h1>
        </div>
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
          Loading showroom orders...
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const nextState = NEXT_DEALER_STATE[ord.state];
            const vInput = vehicleInputs[ord.id] || {
              vehicleType: "1.5 Ton Covered Pickup",
              driverName: "",
              driverPhone: "",
              vehicleRegistration: "",
              packagingVerified: false,
            };

            return (
              <section
                key={ord.id}
                className="bg-surface border border-hairline rounded-lg p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-lg text-ink">
                        {ord.orderNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                        {getOrderStateLabel(ord.state, locale)}
                      </span>
                    </div>
                    <div className="text-xs text-secondary mt-1">
                      Buyer: <strong>{ord.buyerSnapshot.fullName}</strong> (
                      {ord.buyerSnapshot.phone}) | Drop:{" "}
                      {ord.buyerSnapshot.deliveryAddress}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <CommercialDocumentButton order={ord} />
                    <div className="text-right font-mono">
                      <span className="text-xs text-subtle block">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-ink tabular-nums">
                        {formatBdt(ord.pricingSnapshot.grandTotalBdt, locale)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Columns: Delivery Coordination Form (FR-12) */}
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-accent-teal flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>
                        {locale === "bn"
                          ? "ডেলিভারি গাড়ি ও প্যাকেজিং সমন্বয় (FR-12)"
                          : "Delivery Vehicle & Packaging Coordination (FR-12)"}
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label
                          htmlFor={`vtype-${ord.id}`}
                          className="block font-semibold text-ink mb-1"
                        >
                          Vehicle Type
                        </label>
                        <select
                          id={`vtype-${ord.id}`}
                          value={vInput.vehicleType}
                          onChange={(e) =>
                            setVehicleInputs((prev) => ({
                              ...prev,
                              [ord.id]: {
                                ...vInput,
                                vehicleType: e.target.value,
                              },
                            }))
                          }
                          className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-ink"
                        >
                          <option value="1.5 Ton Covered Pickup">
                            1.5 Ton Covered Pickup
                          </option>
                          <option value="3 Ton Covered Truck">
                            3 Ton Covered Truck
                          </option>
                          <option value="5 Ton Heavy Truck">
                            5 Ton Heavy Truck
                          </option>
                          <option value="Buyer Self-Pickup">
                            Buyer Self-Pickup
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`vreg-${ord.id}`}
                          className="block font-semibold text-ink mb-1"
                        >
                          Vehicle Registration Plate
                        </label>
                        <input
                          id={`vreg-${ord.id}`}
                          type="text"
                          value={vInput.vehicleRegistration}
                          onChange={(e) =>
                            setVehicleInputs((prev) => ({
                              ...prev,
                              [ord.id]: {
                                ...vInput,
                                vehicleRegistration: e.target.value,
                              },
                            }))
                          }
                          placeholder="Dhaka Metro-Na-14-8821"
                          className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`dname-${ord.id}`}
                          className="block font-semibold text-ink mb-1"
                        >
                          Driver Full Name
                        </label>
                        <input
                          id={`dname-${ord.id}`}
                          type="text"
                          value={vInput.driverName}
                          onChange={(e) =>
                            setVehicleInputs((prev) => ({
                              ...prev,
                              [ord.id]: {
                                ...vInput,
                                driverName: e.target.value,
                              },
                            }))
                          }
                          placeholder="Md. Rafiqul Islam"
                          className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-ink"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`dphone-${ord.id}`}
                          className="block font-semibold text-ink mb-1"
                        >
                          Driver Mobile Number
                        </label>
                        <input
                          id={`dphone-${ord.id}`}
                          type="tel"
                          value={vInput.driverPhone}
                          onChange={(e) =>
                            setVehicleInputs((prev) => ({
                              ...prev,
                              [ord.id]: {
                                ...vInput,
                                driverPhone: e.target.value,
                              },
                            }))
                          }
                          placeholder="+8801755889900"
                          className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={vInput.packagingVerified}
                        onChange={(e) =>
                          setVehicleInputs((prev) => ({
                            ...prev,
                            [ord.id]: {
                              ...vInput,
                              packagingVerified: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 rounded border-hairline"
                      />
                      <span>
                        {locale === "bn"
                          ? "কর্নার প্রটেকশন ও ব্যাচ শেড যাচাই সম্পন্ন হয়েছে"
                          : "Verify protective corner strapping and single-batch shade check"}
                      </span>
                    </label>

                    {ord.state === "PENDING_CONFIRMATION" && (
                      <div className="rounded border border-hairline bg-canvas p-3">
                        <label htmlFor={`dispatch-branch-${ord.id}`} className="block text-sm font-semibold text-ink">{INVENTORY_COPY.dispatchBranch[locale]}</label>
                        <select
                          id={`dispatch-branch-${ord.id}`}
                          data-testid={`dispatch-branch-${ord.id}`}
                          aria-describedby={`dispatch-help-${ord.id}`}
                          value={dispatchBranchIds[ord.id] || ""}
                          onChange={(event) => setDispatchBranchIds((prev) => ({ ...prev, [ord.id]: event.target.value }))}
                          className="mt-1 block min-h-[44px] w-full rounded border border-hairline bg-surface px-3 py-2 text-sm text-ink"
                        >
                          <option value="">{INVENTORY_COPY.chooseBranch[locale]}</option>
                          {branches.map((branch) => <option key={branch.id} value={branch.id}>{locale === "bn" ? branch.nameBn : branch.nameEn}</option>)}
                        </select>
                        <p id={`dispatch-help-${ord.id}`} className="mt-2 text-sm text-secondary">{INVENTORY_COPY.dispatchHelp[locale]}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={busyId === ord.id}
                        onClick={() => handleAdvanceOrder(ord, undefined)}
                        className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink cursor-pointer"
                      >
                        {locale === "bn"
                          ? "ডেলিভারি তথ্য সেভ করুন"
                          : "Save Delivery Details"}
                      </button>

                      {nextState && (
                        <button
                          type="button"
                          data-testid={`advance-order-${ord.id}`}
                          disabled={busyId === ord.id || (nextState === "CONFIRMED" && !dispatchBranchIds[ord.id])}
                          onClick={() => handleAdvanceOrder(ord, nextState)}
                          className="min-h-[40px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {getOrderStateLabel(nextState, locale)}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right 5 Columns: Order Items & Transition History */}
                  <div className="lg:col-span-5 space-y-3 text-xs">
                    <OrderStockReservation order={ord} />
                    <div className="p-3.5 rounded bg-canvas border border-hairline space-y-1.5">
                      <div className="font-bold text-ink">
                        Locked Order Items
                      </div>
                      {ord.itemSnapshots.map((item) => (
                        <div
                          key={item.listingId}
                          className="flex items-center justify-between font-mono text-secondary"
                        >
                          <span>
                            {item.sku} ({item.quotedBoxes} boxes)
                          </span>
                          <span className="font-bold text-ink">
                            {formatBdt(item.lineTotalBdt, locale)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded bg-canvas border border-hairline space-y-2">
                      <div className="font-bold text-ink flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-accent" />
                        <span>Transition Log</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto" role="region" tabIndex={0} aria-label={INVENTORY_COPY.orderHistory[locale]}>
                        {ord.stateHistory.map((h) => (
                          <div
                            key={h.id}
                            className="border-l-2 border-accent pl-2 text-[11px]"
                          >
                            <span className="font-mono font-semibold text-ink">
                              {h.toState}
                            </span>{" "}
                            - {h.note}
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
