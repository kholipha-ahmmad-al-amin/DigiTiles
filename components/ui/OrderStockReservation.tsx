"use client";

import { useApp } from "@/components/providers/AppProvider";
import { INVENTORY_COPY as copy } from "@/lib/i18n";
import type { Order } from "@/lib/types";

export function OrderStockReservation({ order }: { order: Order }) {
  const { locale } = useApp();
  const reservation = order.stockReservation;
  if (!reservation) return null;

  const { branch } = reservation;
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD");
  return (
    <section data-testid={`stock-reservation-${order.id}`} className="space-y-3 rounded border border-hairline bg-canvas p-4 text-sm text-ink">
      <h3 className="font-bold">{copy.reserved[locale]}</h3>
      <div>
        <p className="font-semibold">{locale === "bn" ? branch.nameBn : branch.nameEn}</p>
        <p className="text-secondary">{locale === "bn" ? branch.addressBn : branch.addressEn}</p>
      </div>
      {reservation.releasedAt && <p className="rounded bg-muted px-2 py-1 font-semibold">{copy.released[locale]}</p>}
      <ul className="space-y-2">
        {reservation.items.map((item) => (
          <li key={item.listingId} className="border-t border-hairline pt-2">
            <p className="break-words font-mono font-semibold">{item.sku}</p>
            <dl className="grid grid-cols-2 gap-x-2 gap-y-1">
              <dt className="text-secondary">{copy.reservedBoxes[locale]}</dt>
              <dd className="font-mono">{number.format(item.boxes)}</dd>
              {item.batchCode && item.shadeCode && item.caliberMm != null && (
                <>
                  <dt className="text-secondary">{copy.batch[locale]}</dt>
                  <dd className="break-words font-mono">{item.batchCode}</dd>
                  <dt className="text-secondary">{copy.shade[locale]}</dt>
                  <dd className="break-words font-mono">{item.shadeCode}</dd>
                  <dt className="text-secondary">{copy.caliber[locale]}</dt>
                  <dd className="font-mono">{number.format(item.caliberMm)}</dd>
                </>
              )}
            </dl>
            {!item.batchCode && <p className="text-secondary">{copy.untrackedLot[locale]}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
