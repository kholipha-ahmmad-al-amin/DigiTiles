"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { SurfaceVisualizer } from "@/components/visualizer/SurfaceVisualizer";
import { VISUALIZER_COPY as copy } from "@/lib/i18n";
import { estimateSurface, surfacePlanQuery, VISUALIZER_PAGE_SIZE } from "@/lib/surface-planning";
import type { SurfacePlan } from "@/lib/surface-planning";
import type { DealerListing } from "@/lib/types";

const PAGE_SIZE = VISUALIZER_PAGE_SIZE;
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-hairline px-4 py-2 text-sm font-semibold";

export function VisualizerStudio({
  initialSelection,
  initialListings,
  initialTotal,
  initialPlan,
}: {
  initialSelection: DealerListing | null;
  initialListings: DealerListing[];
  initialTotal: number;
  initialPlan: SurfacePlan;
}) {
  const { locale } = useApp();
  const [plan, setPlan] = useState(initialPlan);
  const [selection, setSelection] = useState(initialSelection);
  const [listings, setListings] = useState(initialListings);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const resultQuery = useRef("1:");
  useEffect(() => {
    const key = `${page}:${query.trim()}`;
    if (resultQuery.current === key) {
      setLoading(false);
      setFailed(false);
      return;
    }
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), q: query.trim() });
    setLoading(true);
    setFailed(false);
    fetch(`/api/listings?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const json = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok || !json.ok) throw new Error();
        setListings(json.data.items);
        setTotal(json.data.totalCount);
        resultQuery.current = key;
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, query]);

  const listing = selection ?? listings[0];
  const options = listing && !listings.some((item) => item.id === listing.id)
    ? [listing, ...listings]
    : listings;
  const estimate = listing && estimateSurface(plan, listing);
  const listingHref = listing && `/marketplace/${encodeURIComponent(listing.id)}?${surfacePlanQuery(plan)}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-5 rounded-lg border border-hairline bg-surface p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{copy.studio[locale]}</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor="visualizer-search" className="space-y-1 text-sm font-semibold text-ink">
            <span>{copy.findTile[locale]}</span>
            <input
              id="visualizer-search"
              type="search"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              className="min-h-11 w-full rounded border border-hairline bg-canvas px-3 text-ink"
            />
          </label>
          <label htmlFor="visualizer-listing" className="min-w-0 space-y-1 text-sm font-semibold text-ink">
            <span>{copy.listing[locale]}</span>
            <select
              id="visualizer-listing"
              value={listing?.id ?? ""}
              disabled={!options.length || loading}
              onChange={(event) => setSelection(options.find((item) => item.id === event.target.value) ?? null)}
              className="min-h-11 w-full rounded border border-hairline bg-canvas px-3 text-ink disabled:opacity-55"
            >
              {!listing && <option value="">{copy.chooseListing[locale]}</option>}
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {locale === "bn" ? item.titleBn : item.titleEn} ({item.sku})
                </option>
              ))}
            </select>
          </label>
        </div>
        {total > PAGE_SIZE && (
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={loading || page === 1} onClick={() => setPage(page - 1)} className={`${buttonClass} bg-muted text-ink disabled:opacity-55`}>{copy.previous[locale]}</button>
            <button type="button" disabled={loading || page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)} className={`${buttonClass} bg-muted text-ink disabled:opacity-55`}>{copy.next[locale]}</button>
          </div>
        )}
        {(loading || failed || !listings.length) && (
          <p role="status" className="text-sm text-secondary">
            {loading ? copy.loading[locale] : failed ? copy.loadError[locale] : copy.empty[locale]}
          </p>
        )}
      </div>
      {listing && listingHref && (
        <SurfaceVisualizer
          listing={listing}
          plan={plan}
          onChange={setPlan}
          actions={
            <>
              <Link href={listingHref} className={`${buttonClass} bg-surface text-ink hover:bg-muted`}>{copy.openListing[locale]}</Link>
              {estimate && (
                <Link id="open-rfq" href={`${listingHref}&request=1`} className={`${buttonClass} bg-accent text-white hover:bg-accent-hover`}>
                  {copy.requestQuote[locale]} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </>
          }
        />
      )}
    </div>
  );
}
