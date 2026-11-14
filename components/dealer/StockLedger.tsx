"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { INVENTORY_COPY as copy } from "@/lib/i18n";
import type { Branch, StockLot } from "@/lib/types";

interface LedgerData {
  canManage: boolean;
  listings: { id: string; sku: string; titleEn: string; titleBn: string; unallocatedBoxes: number }[];
  branches: Branch[];
  lots: StockLot[];
}

const fieldClass = "mt-1 block w-full min-h-[44px] rounded border border-hairline bg-canvas px-3 py-2 text-ink";

export function StockLedger({ refreshKey, onSaved }: { refreshKey: string; onSaved?: () => void }) {
  const { locale, user } = useApp();
  const [data, setData] = useState<LedgerData | null>(null);
  const [listingId, setListingId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [shadeCode, setShadeCode] = useState("");
  const [caliberMm, setCaliberMm] = useState("");
  const [availableBoxes, setAvailableBoxes] = useState("");
  const [editing, setEditing] = useState<StockLot | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [feedback, setFeedback] = useState<"saved" | keyof typeof copy.errors | null>(null);
  const quantityInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/dealer/inventory", { cache: "no-store", signal });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setData(result.data);
      setLoadFailed(false);
    } catch {
      if (!signal?.aborted) {
        setData(null);
        setLoadFailed(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.roles.includes("DEALER")) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, refreshKey, user]);

  function clearLot() {
    setEditing(null);
    setBatchCode("");
    setShadeCode("");
    setCaliberMm("");
    setAvailableBoxes("");
  }

  function editLot(lot: StockLot) {
    setEditing(lot);
    setListingId(lot.listingId);
    setBranchId(lot.branchId);
    setBatchCode(lot.batchCode);
    setShadeCode(lot.shadeCode);
    setCaliberMm(String(lot.caliberMm));
    setAvailableBoxes(String(lot.availableBoxes));
    setFeedback(null);
    quantityInput.current?.focus();
  }

  async function saveLot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/dealer/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId, branchId, batchCode, shadeCode, caliberMm: Number(caliberMm),
          availableBoxes: Number(availableBoxes), expectedAvailableBoxes: editing?.availableBoxes,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        const code = result.error?.code as keyof typeof copy.errors;
        setFeedback(Object.hasOwn(copy.errors, code) ? code : "STOCK_SAVE_ERROR");
        if (code === "STOCK_CHANGED") {
          clearLot();
          await load();
        }
        return;
      }
      setFeedback("saved");
      clearLot();
      await load();
      onSaved?.();
    } catch {
      setFeedback("STOCK_SAVE_ERROR");
    } finally {
      setSaving(false);
    }
  }

  if (!user?.roles.includes("DEALER")) return null;
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD");
  const listing = data?.listings.find((item) => item.id === listingId);
  return (
    <section className="space-y-4 rounded-lg border border-hairline bg-surface p-4 sm:p-6">
      <h2 className="text-lg font-bold text-ink">{copy.title[locale]}</h2>
      {!data && <p role="status" className="text-sm text-secondary">{copy[loadFailed ? "loadFailed" : "loading"][locale]}</p>}
      {data?.canManage && data.listings.length > 0 && data.branches.length > 0 && (
        <form onSubmit={saveLot} className="space-y-4">
          <p className="text-sm text-secondary">{copy.description[locale]}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="min-w-0 text-sm font-semibold text-ink">
              {copy.listing[locale]}
              <select data-testid="inventory-listing" required disabled={!!editing} value={listingId} onChange={(event) => setListingId(event.target.value)} className={fieldClass}>
                <option value="">{copy.chooseListing[locale]}</option>
                {data.listings.map((item) => <option key={item.id} value={item.id}>{locale === "bn" ? item.titleBn : item.titleEn} ({item.sku})</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              {copy.branch[locale]}
              <select data-testid="inventory-branch" required disabled={!!editing} value={branchId} onChange={(event) => setBranchId(event.target.value)} className={fieldClass}>
                <option value="">{copy.chooseBranch[locale]}</option>
                {data.branches.map((item) => <option key={item.id} value={item.id}>{locale === "bn" ? item.nameBn : item.nameEn}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              {copy.batch[locale]}
              <input data-testid="inventory-batch" required disabled={!!editing} maxLength={40} value={batchCode} onChange={(event) => setBatchCode(event.target.value)} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold text-ink">
              {copy.shade[locale]}
              <input data-testid="inventory-shade" required disabled={!!editing} maxLength={40} value={shadeCode} onChange={(event) => setShadeCode(event.target.value)} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold text-ink">
              {copy.caliber[locale]}
              <input data-testid="inventory-caliber" type="number" required disabled={!!editing} min="0.001" max="10000" step="any" value={caliberMm} onChange={(event) => setCaliberMm(event.target.value)} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold text-ink">
              {copy.boxes[locale]}
              <input ref={quantityInput} data-testid="inventory-quantity" type="number" required min="0" max="1000000" step="1" value={availableBoxes} onChange={(event) => setAvailableBoxes(event.target.value)} className={fieldClass} />
            </label>
          </div>
          {listing && <p className="text-sm text-secondary">{copy.unallocated[locale]}: {number.format(listing.unallocatedBoxes)}</p>}
          <div className="flex flex-wrap gap-3">
            <button data-testid="inventory-save" type="submit" disabled={saving} className="min-h-[44px] rounded bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed">
              {copy[saving ? "saving" : "save"][locale]}
            </button>
            {editing && <button type="button" onClick={clearLot} className="min-h-[44px] rounded border border-hairline bg-muted px-4 py-2 text-sm font-semibold text-ink">{copy.cancelEdit[locale]}</button>}
          </div>
          {feedback && <p role={feedback === "saved" ? "status" : "alert"} className="text-sm font-semibold text-ink">{feedback === "saved" ? copy.saved[locale] : copy.errors[feedback][locale]}</p>}
        </form>
      )}
      {data && data.canManage && (!data.listings.length || !data.branches.length) && <p className="text-sm text-secondary">{copy.prerequisites[locale]}</p>}
      {data && data.lots.length === 0 && <p className="text-sm text-secondary">{copy.empty[locale]}</p>}
      {data && data.lots.length > 0 && (
        <div className="overflow-x-auto rounded border border-hairline" role="region" aria-label={copy.title[locale]} tabIndex={0}>
          <table className="w-full min-w-[40rem] text-left text-sm text-ink">
            <caption className="sr-only">{copy.title[locale]}</caption>
            <thead className="bg-muted">
              <tr>
                {(["listing", "branch", "batch", "shade", "caliber", "boxes"] as const).map((key) => (
                  <th key={key} scope="col" className="p-3">{copy[key][locale]}</th>
                ))}
                {data.canManage && <th scope="col" className="p-3">{copy.actions[locale]}</th>}
              </tr>
            </thead>
            <tbody>
              {data.lots.map((lot) => {
                const branch = data.branches.find((item) => item.id === lot.branchId);
                const item = data.listings.find((row) => row.id === lot.listingId);
                return (
                  <tr key={lot.id} className="border-t border-hairline">
                    <th scope="row" className="p-3 font-mono">{item?.sku}</th>
                    <td className="p-3">{locale === "bn" ? branch?.nameBn : branch?.nameEn}</td>
                    <td className="p-3 font-mono">{lot.batchCode}</td>
                    <td className="p-3 font-mono">{lot.shadeCode}</td>
                    <td className="p-3 font-mono">{number.format(lot.caliberMm)}</td>
                    <td className="p-3 font-mono">{number.format(lot.availableBoxes)}</td>
                    {data.canManage && (
                      <td className="px-3">
                        <button type="button" onClick={() => editLot(lot)} disabled={saving} aria-label={`${copy.edit[locale]} (${item?.sku}, ${lot.batchCode})`} className="min-h-[44px] font-semibold text-accent hover:underline">{copy.edit[locale]}</button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
