"use client";

import { useId, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { SERVICE_COPY as copy } from "@/lib/i18n";
import { canAttachCrew, vehicleTypes } from "@/lib/service-directory";
import type { ConstructionCrew, PreferredCrew } from "@/lib/service-directory";
import type { Order } from "@/lib/types";

export function OrderServices({ order, crews }: { order: Order; crews?: ConstructionCrew[] }) {
  const { locale } = useApp();
  const crewSelectId = useId();
  const [savedCrew, setSavedCrew] = useState(order.preferredCrew ?? null);
  const [selected, setSelected] = useState(order.preferredCrew?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<"saved" | "saveError">();
  const candidates = crews?.filter((crew) => crew.districts.some(
    (district) => district === order.buyerSnapshot.deliveryDistrict
  ));
  const displayName = (crew: Pick<PreferredCrew, "nameEn" | "nameBn" | "demo">) =>
    (locale === "bn" ? crew.nameBn : crew.nameEn) + (crew.demo ? ` (${copy.demo[locale]})` : "");

  async function save() {
    setBusy(true);
    setResult(undefined);
    try {
      const res = await fetch(`/api/orders/${order.id}/crew`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crewId: selected || null }),
      });
      if (!res.ok) throw new Error("Crew update failed");
      setSavedCrew((await res.json()).data.preferredCrew);
      setResult("saved");
    } catch {
      setResult("saveError");
    } finally {
      setBusy(false);
    }
  }

  const delivery = order.deliveryCoordination;
  const vehicle = vehicleTypes.find((type) => type === delivery.vehicleType);

  return (
    <div className="space-y-4">
      <section className="space-y-2 rounded border border-hairline bg-canvas p-4">
        <h3 className="font-bold text-ink">{copy.dispatch[locale]}</h3>
        <dl className="grid gap-2 text-sm text-secondary">
          <div>
            <dt>{copy.vehicle[locale]}</dt>
            <dd className="font-semibold text-ink">{delivery.mode === "BUYER_PICKUP" ? copy.pickup[locale] :
              vehicle ? copy.vehicles[vehicle][locale] : delivery.vehicleType || copy.unassigned[locale]}</dd>
          </div>
          <div>
            <dt>{copy.registration[locale]}</dt>
            <dd className="font-semibold text-ink">{delivery.vehicleRegistration || copy.unassigned[locale]}</dd>
          </div>
          <div>
            <dt>{copy.driver[locale]}</dt>
            <dd className="font-semibold text-ink">{[delivery.driverName, delivery.driverPhone].filter(Boolean).join(" / ") || copy.unassigned[locale]}</dd>
          </div>
        </dl>
      </section>
      {(canAttachCrew(order.state) || savedCrew) && (
        <section className="space-y-2 rounded border border-hairline bg-canvas p-4">
          <h3 className="font-bold text-ink">{copy.preferred[locale]}</h3>
          {canAttachCrew(order.state) ? (
            <>
              <p id={`${crewSelectId}-hint`} className="text-sm text-secondary">{copy.attachHint[locale]}</p>
              <label htmlFor={crewSelectId} className="sr-only">{copy.preferred[locale]}</label>
              <select id={crewSelectId} aria-describedby={`${crewSelectId}-hint`} className="min-h-11 w-full rounded border border-hairline bg-surface px-2 text-sm text-ink"
                value={selected} disabled={busy || (!candidates?.length && !savedCrew)} onChange={(event) => setSelected(event.target.value)}>
                <option value="">{copy.none[locale]}</option>
                {savedCrew && !candidates?.some((crew) => crew.id === savedCrew.id) && (
                  <option value={savedCrew.id}>{displayName(savedCrew)}</option>
                )}
                {candidates?.map((crew) => <option key={crew.id} value={crew.id}>{displayName(crew)}</option>)}
              </select>
              {candidates?.length === 0 && <p className="text-sm text-secondary">{copy.noCrews[locale]}</p>}
              <button type="button" disabled={busy || selected === (savedCrew?.id ?? "")} onClick={save}
                className="min-h-11 rounded bg-accent px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {copy[busy ? "saving" : "save"][locale]}
              </button>
              {result && <p role="status" className="text-sm text-ink">{copy[result][locale]}</p>}
            </>
          ) : savedCrew && <p className="text-sm text-secondary">{displayName(savedCrew)}</p>}
        </section>
      )}
    </div>
  );
}
