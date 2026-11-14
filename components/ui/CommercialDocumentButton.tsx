"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Printer, X } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { commercialCopy, formatBdt } from "@/lib/i18n";
import type { Locale, Order, Quotation, Rfq } from "@/lib/types";

type DocumentSource = { order: Order } | { quote: Quotation; rfq: Rfq };

function commercialDetails(source: DocumentSource, locale: Locale) {
  if ("order" in source) {
    const { order } = source;
    return {
      snapshot: order.commercialSnapshot,
      reference: order.orderNumber,
      date: order.createdAt,
      items: order.itemSnapshots,
      pricing: order.pricingSnapshot,
      buyer: order.buyerSnapshot,
      legalName: locale === "bn" ? order.sellerSnapshot.tradeNameBn : order.sellerSnapshot.tradeNameEn,
      license: order.sellerSnapshot.tradeLicenseNo,
      branchName: order.sellerSnapshot.branchName,
    };
  }

  const { quote, rfq } = source;
  return {
    snapshot: quote.commercialSnapshot,
    reference: quote.quoteNumber,
    date: quote.createdAt,
    items: quote.items,
    pricing: { ...quote, grandTotalBdt: quote.totalAmountBdt },
    buyer: { ...rfq, fullName: rfq.customerName },
    legalName: locale === "bn" ? quote.organizationNameBn : quote.organizationNameEn,
    license: "",
    branchName: "",
  };
}

export function CommercialDocumentButton(source: DocumentSource) {
  const { locale } = useApp();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const copy = (key: keyof typeof commercialCopy) => commercialCopy[key][locale];
  const isOrder = "order" in source;
  const title = copy(isOrder ? "challan" : "proforma");
  const details = commercialDetails(source, locale);
  const { snapshot } = details;
  const seller = snapshot?.seller;
  const buyer = snapshot?.buyer ?? details.buyer;
  const pricing = snapshot?.pricing ?? details.pricing;
  const branch = seller
    ? [locale === "bn" ? seller.branchNameBn : seller.branchNameEn, locale === "bn" ? seller.branchAddressBn : seller.branchAddressEn].filter(Boolean).join(", ")
    : details.branchName;
  const dispatch = isOrder ? source.order.stockReservation?.branch : undefined;
  const dateFormat = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Dhaka",
  });
  const date = (value: string) => Number.isFinite(Date.parse(value)) ? dateFormat.format(new Date(value)) : copy("unavailable");
  const quantity = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN", { maximumFractionDigits: 2 });
  const bdt = (amount: number) => Number.isInteger(amount)
    ? formatBdt(amount, locale)
    : `${locale === "bn" ? "৳" : "BDT"} ${quantity.format(amount)}`;

  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal();
  }, [open]);

  const identityFields = [
    ["seller", seller ? (locale === "bn" ? seller.legalNameBn : seller.legalNameEn) : details.legalName],
    ["customer", buyer.fullName],
    ["license", seller?.tradeLicenseNo ?? details.license],
    ["address", [buyer.deliveryAddress, buyer.deliveryDistrict].filter(Boolean).join(", ")],
    ["tin", seller?.tinNumber],
    ["branch", branch],
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded border border-hairline bg-surface px-3 text-sm font-semibold text-accent hover:bg-muted"
      >
        <FileText aria-hidden="true" className="h-4 w-4" />
        {copy(isOrder ? "viewChallan" : "viewProforma")}
      </button>

      {open && createPortal(
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          aria-labelledby={titleId}
          className="commercial-print-dialog m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-4xl overflow-y-auto rounded-lg border border-hairline bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/60"
        >
          <div className="commercial-print-controls flex flex-wrap justify-end gap-2 border-b border-hairline bg-muted p-3 sm:px-6">
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded bg-accent px-4 text-sm font-semibold text-white hover:bg-accent-hover">
              <Printer aria-hidden="true" className="h-4 w-4" /> {copy("print")}
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className="inline-flex min-h-11 items-center gap-2 rounded border border-hairline bg-surface px-3 text-sm font-semibold text-ink hover:bg-canvas">
              <X aria-hidden="true" className="h-4 w-4" /> {copy("close")}
            </button>
          </div>

          <article className="space-y-5 p-4 sm:p-6">
            <header className="border-b border-hairline pb-3">
              <div className="font-mono text-sm font-bold text-accent">DigiTiles</div>
              <h2 id={titleId} className="text-2xl font-bold">{title}</h2>
              <p className="font-mono text-sm text-secondary">{details.reference}</p>
              <p className="text-sm text-secondary">
                {copy("issued")} {date(details.date)}
                {!isOrder && <> | {copy("valid")} {date(snapshot?.validUntil ?? source.quote.validUntil)}</>}
                {isOrder && snapshot && <> | {copy("quotation")} {snapshot.quoteNumber}</>}
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {identityFields.map(([key, value]) => (
                <div key={key} className="min-w-0 break-words">
                  <dt className="font-semibold text-ink">{copy(key)}</dt>
                  <dd className="text-secondary">{value || copy("unavailable")}</dd>
                </div>
              ))}
              {dispatch && (
                <div>
                  <dt className="font-semibold">{copy("dispatch")}</dt>
                  <dd className="text-secondary">
                    {locale === "bn" ? `${dispatch.nameBn}, ${dispatch.addressBn}` : `${dispatch.nameEn}, ${dispatch.addressEn}`}
                  </dd>
                </div>
              )}
            </dl>

            <div role="region" aria-label={copy("item")} tabIndex={0} className="commercial-print-table overflow-x-auto rounded border border-hairline">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th scope="col" className="min-w-32 p-2">{copy("item")}</th>
                    {(["area", "boxes", "boxRate", "areaRate", "lineTotal"] as const).map((key) => (
                      <th key={key} scope="col" className="p-2 text-right">{copy(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {(snapshot?.items ?? details.items).map((item) => (
                    <tr key={item.listingId}>
                      <th scope="row" className="p-2 font-semibold">
                        {locale === "bn" ? item.titleBn : item.titleEn}
                        <span className="block break-words font-mono text-xs font-normal text-secondary">{item.sku}</span>
                      </th>
                      <td className="p-2 text-right tabular-nums">{quantity.format(item.totalSqft)}</td>
                      <td className="p-2 text-right tabular-nums">{quantity.format(item.quotedBoxes)}</td>
                      <td className="p-2 text-right tabular-nums">{bdt(item.unitPricePerBoxBdt)}</td>
                      <td className="p-2 text-right tabular-nums">{bdt(item.unitPricePerSqftBdt)}</td>
                      <td className="p-2 text-right tabular-nums">{bdt(item.lineTotalBdt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="ml-auto max-w-sm space-y-1 text-sm">
              {([
                ["subtotal", pricing.subtotalBdt], ["transport", pricing.deliveryFeeBdt], ["vat", pricing.vatBdt ?? 0],
                ["discount", pricing.discountBdt], ["net", pricing.grandTotalBdt],
              ] as const).map(([key, amount]) => (
                <div key={key} className={`flex justify-between gap-4 ${key === "net" ? "border-t border-hairline pt-2 font-bold" : ""}`}>
                  <dt>{copy(key)}</dt>
                  <dd className="font-mono tabular-nums">{key === "discount" && amount > 0 ? "-" : ""}{bdt(amount)}</dd>
                </div>
              ))}
            </dl>

            <dl className="space-y-2 border-t border-hairline pt-3 text-sm">
              <div>
                <dt className="font-semibold">{copy("paymentTerms")}</dt>
                <dd className="break-words text-secondary">{pricing.paymentTerms}</dd>
              </div>
              <div>
                <dt className="font-semibold">{copy("deliveryTerms")}</dt>
                <dd className="break-words text-secondary">{pricing.deliveryTerms}</dd>
              </div>
              <div>
                <dt className="font-semibold">{copy("hash")}</dt>
                <dd className="break-all font-mono text-xs text-secondary">{snapshot?.verificationReference || copy("unavailable")}</dd>
              </div>
            </dl>
          </article>
        </dialog>,
        document.body
      )}
    </>
  );
}
