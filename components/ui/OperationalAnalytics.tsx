"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/AppProvider";
import { ANALYTICS_COPY as copy } from "@/lib/i18n";
import type { OperationalAnalytics as AnalyticsData } from "@/lib/analytics";

const panel = "min-w-0 space-y-2 rounded-lg border border-hairline bg-surface p-5";

export function OperationalAnalytics({ scope, userId }: { scope: "ADMIN" | "DEALER"; userId: string }) {
  const { locale } = useApp();
  const [data, setData] = useState<AnalyticsData>();
  const [failed, setFailed] = useState(false);
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", { maximumFractionDigits: 2 });
  const rate = (value: number | null) => value === null ? copy.empty[locale] : `${number.format(value)}%`;

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch(`/api/analytics?scope=${scope}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Analytics unavailable");
        setData((await response.json()).data);
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [scope, userId]);

  return (
    <section className="space-y-4" data-testid="operational-analytics">
      <h2 className="text-xl font-bold text-ink">{copy.title[locale]}</h2>
      {failed && <p role="status" className="text-secondary">{copy.error[locale]}</p>}
      {!data && !failed && <p role="status" className="text-secondary">{copy.load[locale]}</p>}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className={panel}>
              <h3 className="font-semibold text-ink">{copy.response[locale]}</h3>
              <p className="font-mono text-xl font-bold text-ink" data-testid="quote-response-time">
                {data.averageResponseHours === null ? copy.empty[locale] : `${number.format(data.averageResponseHours)} ${copy.hours[locale]}`}
              </p>
              <p className="text-sm text-secondary">{copy.responseBasis[locale]}</p>
            </article>
            <article className={panel}>
              <h3 className="font-semibold text-ink">{copy.conversion[locale]}</h3>
              <p className="font-mono text-xl font-bold text-ink" data-testid="rfq-conversion-rate">{rate(data.conversionRate)}</p>
              <p className="text-sm text-secondary">{copy.conversionBasis[locale]}</p>
            </article>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <article className={panel}>
              <h3 className="font-semibold text-ink">{copy.index[locale]}</h3>
              <p className="text-sm text-secondary">{copy.indexBasis[locale]}</p>
              {data.categoryIndex.length ? (
                <table className="w-full text-left text-sm text-ink">
                  <caption className="sr-only">{copy.index[locale]}</caption>
                  <thead><tr className="border-b border-hairline"><th scope="col" className="py-2">{copy.category[locale]}</th><th scope="col">{copy.price[locale]}</th><th scope="col">{copy.listings[locale]}</th></tr></thead>
                  <tbody>{data.categoryIndex.map((row) => (
                    <tr key={row.id} className="border-b border-hairline">
                      <th scope="row" className="py-2 font-medium">{locale === "bn" ? row.nameBn : row.nameEn}</th>
                      <td>{number.format(row.price)}</td><td>{number.format(row.count)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p className="text-sm text-secondary">{copy.empty[locale]}</p>}
            </article>
            <article className={panel}>
              <h3 className="font-semibold text-ink">{copy.branch[locale]}</h3>
              <p className="text-sm text-secondary">{copy.branchBasis[locale]}</p>
              {data.branchScores.length ? (
                <table className="w-full text-left text-sm text-ink">
                  <caption className="sr-only">{copy.branch[locale]}</caption>
                  <thead><tr className="border-b border-hairline"><th scope="col" className="py-2">{copy.branchName[locale]}</th><th scope="col">{copy.fulfilled[locale]}</th><th scope="col">{copy.score[locale]}</th></tr></thead>
                  <tbody>{data.branchScores.map((row) => (
                    <tr key={row.id} className="border-b border-hairline">
                      <th scope="row" className="py-2 font-medium">{locale === "bn" ? row.nameBn : row.nameEn}</th>
                      <td>{number.format(row.fulfilled)} / {number.format(row.count)}</td><td>{rate(row.score)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <p className="text-sm text-secondary">{copy.empty[locale]}</p>}
            </article>
          </div>
        </>
      )}
    </section>
  );
}
