"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { COMPARISON_COPY as copy, VISUALIZER_COPY } from "@/lib/i18n";
import { boxesForArea } from "@/lib/surface-planning";
import type { DealerListing } from "@/lib/types";

export const COMPARISON_LIMIT = 4;

export function ComparisonDrawer({
  listings,
  open,
  onClose,
  onRemove,
}: {
  listings: DealerListing[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const { locale } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const [area, setArea] = useState("300");
  const [fees, setFees] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);

  const tag = locale === "bn" ? "bn-BD" : "en-BD";
  const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 });
  const currency = new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "BDT",
    currencyDisplay: locale === "bn" ? "symbol" : "code",
  });
  const rows = listings.map((listing) => {
    const boxes = boxesForArea(Number(area), listing);
    const fee = Number(fees[listing.id] ?? "0");
    return {
      ...listing,
      boxes,
      cost: boxes && Number.isFinite(fee) && fee >= 0
        ? currency.format((boxes * listing.pricePerBoxBdt + fee) / Number(area))
        : copy.missing[locale],
    };
  });
  const specs = [
    { title: copy.absorption, value: (item: typeof rows[number]) => item.waterAbsorption || copy.missing[locale] },
    { title: copy.wear, value: (item: typeof rows[number]) => item.peiRating || copy.missing[locale] },
    { title: copy.slip, value: (item: typeof rows[number]) => item.slipResistance?.match(/\bR(?:9|10|11|12)\b/i)?.[0].toUpperCase() ?? copy.missing[locale] },
    { title: copy.coverage, value: (item: typeof rows[number]) => `${number.format(item.sqftPerBox)} ${VISUALIZER_COPY.squareFeet[locale]}` },
    { title: copy.boxRate, value: (item: typeof rows[number]) => currency.format(item.pricePerBoxBdt) },
    { title: copy.boxesNeeded, value: (item: typeof rows[number]) => item.boxes === null ? copy.missing[locale] : number.format(item.boxes) },
  ];

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="comparison-title"
      className="fixed inset-y-0 right-0 left-auto m-0 h-[100dvh] max-h-[100dvh] w-full max-w-5xl overflow-y-auto border-l border-hairline bg-surface text-ink backdrop:bg-black/60"
    >
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-hairline pb-4">
          <div className="space-y-1">
            <h2 id="comparison-title" className="text-xl font-bold text-ink">{copy.title[locale]}</h2>
            <p className="text-sm text-secondary">{copy.description[locale]}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={VISUALIZER_COPY.close[locale]}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-hairline bg-surface text-ink hover:bg-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {rows.length > 0 && (
          <>
            <label htmlFor="compare-area" className="block max-w-xs space-y-1 text-sm font-semibold">
              <span>{copy.area[locale]}</span>
              <input
                id="compare-area"
                type="number"
                min={1}
                step="any"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="min-h-11 w-full rounded border border-hairline bg-canvas px-3 py-2 text-ink"
              />
            </label>
            <div role="region" aria-label={copy.title[locale]} tabIndex={0} className="overflow-x-auto rounded border border-hairline">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted text-ink">
                  <tr>
                    <th scope="col" className="sticky left-0 min-w-28 bg-muted p-3 text-left align-top sm:min-w-36">{copy.attribute[locale]}</th>
                    {rows.map((item) => {
                      const title = locale === "bn" ? item.titleBn : item.titleEn;
                      return (
                        <th key={item.id} scope="col" className="min-w-44 border-l border-hairline p-3 text-left align-top">
                          <span className="block break-words">{title}</span>
                          <span className="block break-words font-mono text-xs font-normal text-secondary">{item.sku}</span>
                          <button
                            type="button"
                            aria-label={`${copy.remove[locale]}: ${title}`}
                            onClick={() => onRemove(item.id)}
                            className="min-h-11 py-2 text-left text-sm font-semibold text-accent hover:underline"
                          >
                            {copy.remove[locale]}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {specs.map((spec) => (
                    <tr key={spec.title.en} className="border-t border-hairline">
                      <th scope="row" className="sticky left-0 bg-surface p-3 text-left font-semibold">{spec.title[locale]}</th>
                      {rows.map((item) => <td key={item.id} className="border-l border-hairline p-3 text-secondary">{spec.value(item)}</td>)}
                    </tr>
                  ))}
                  <tr className="border-t border-hairline">
                    <th scope="row" className="sticky left-0 bg-surface p-3 text-left font-semibold">{copy.transport[locale]}</th>
                    {rows.map((item) => (
                      <td key={item.id} className="border-l border-hairline p-3">
                        <input
                          id={`compare-delivery-${item.id}`}
                          aria-label={`${copy.transport[locale]}: ${locale === "bn" ? item.titleBn : item.titleEn}`}
                          type="number"
                          min={0}
                          step="0.01"
                          value={fees[item.id] ?? "0"}
                          onChange={(event) => setFees({ ...fees, [item.id]: event.target.value })}
                          className="min-h-11 w-full min-w-24 rounded border border-hairline bg-canvas px-3 py-2 text-ink"
                        />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-hairline bg-muted">
                    <th scope="row" className="sticky left-0 bg-muted p-3 text-left font-semibold">{copy.landed[locale]}</th>
                    {rows.map((item) => <td key={item.id} className="border-l border-hairline p-3 font-mono font-bold text-ink">{item.cost}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-secondary">{copy.methodology[locale]}</p>
          </>
        )}
      </div>
    </dialog>
  );
}
