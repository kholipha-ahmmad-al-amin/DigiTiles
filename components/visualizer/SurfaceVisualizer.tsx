"use client";

import type { ReactNode } from "react";
import { Box, Calculator } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { formatBdt, VISUALIZER_COPY as copy } from "@/lib/i18n";
import { estimateSurface, WASTAGE_BY_PATTERN } from "@/lib/surface-planning";
import type { SurfacePlan } from "@/lib/surface-planning";
import type { DealerListing, Locale } from "@/lib/types";
import { RoomScene } from "./RoomScene";

type Localized = Record<Locale, string>;
const controlClass = "min-h-11 w-full rounded border border-hairline bg-canvas px-3 py-2 text-sm text-ink";

function OptionField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: Localized;
  value: T;
  options: Record<T, Localized>;
  onChange: (value: T) => void;
}) {
  const { locale } = useApp();
  return (
    <label htmlFor={id} className="min-w-0 space-y-1 text-sm font-semibold text-ink">
      <span>{label[locale]}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as T)} className={controlClass}>
        {(Object.keys(options) as T[]).map((key) => (
          <option key={key} value={key}>{options[key][locale]}</option>
        ))}
      </select>
    </label>
  );
}

export function SurfaceVisualizer({
  listing,
  plan,
  onChange,
  actions,
}: {
  listing: DealerListing;
  plan: SurfacePlan;
  onChange: (plan: SurfacePlan) => void;
  actions: ReactNode;
}) {
  const { locale } = useApp();
  const estimate = estimateSurface(plan, listing);
  const recommendation = WASTAGE_BY_PATTERN[plan.pattern];
  const number = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    maximumFractionDigits: 2,
  });
  const material = locale === "bn" ? listing.titleBn : listing.titleEn;
  const change = <K extends keyof SurfacePlan>(key: K, value: SurfacePlan[K]) => {
    onChange({ ...plan, [key]: value });
  };

  return (
    <section aria-labelledby="surface-visualizer-title" className="min-w-0 overflow-hidden rounded-lg border border-hairline bg-surface">
      <div className="space-y-2 p-4 sm:p-6">
        <h2 id="surface-visualizer-title" className="flex items-center gap-2 text-xl font-bold text-ink">
          <Box className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          {copy.title[locale]}
        </h2>
        <p className="text-sm text-secondary">{copy.summary[locale]}</p>
      </div>

      <figure>
        <RoomScene
          pattern={plan.pattern}
          room={plan.room}
          joint={plan.joint}
          grout={plan.grout}
          light={plan.light}
          view={plan.view}
          swatch={listing.swatchPattern}
          dimensions={listing.dimensionsMm}
          label={`${material}, ${copy.rooms[plan.room][locale]}, ${copy.patterns[plan.pattern][locale]}, ${copy.views[plan.view][locale]}, ${copy.groutWidths[plan.joint][locale]}, ${copy.groutColors[plan.grout][locale]}, ${copy.lights[plan.light][locale]}`}
        />
        <figcaption className="border-b border-hairline bg-muted px-4 py-3 text-sm text-secondary sm:px-6">
          {copy.preview[locale]}
        </figcaption>
      </figure>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
        <OptionField id="visualizer-preset" label={copy.room} options={copy.rooms} value={plan.room} onChange={(value) => change("room", value)} />
        <OptionField id="visualizer-view" label={copy.view} options={copy.views} value={plan.view} onChange={(value) => change("view", value)} />
        <OptionField
          id="visualizer-pattern"
          label={copy.pattern}
          options={copy.patterns}
          value={plan.pattern}
          onChange={(value) => onChange({ ...plan, pattern: value, waste: WASTAGE_BY_PATTERN[value] })}
        />
        <OptionField id="visualizer-grout-width" label={copy.groutWidth} options={copy.groutWidths} value={plan.joint} onChange={(value) => change("joint", value)} />
        <OptionField id="visualizer-grout-color" label={copy.groutColor} options={copy.groutColors} value={plan.grout} onChange={(value) => change("grout", value)} />
        <OptionField id="visualizer-lighting" label={copy.lighting} options={copy.lights} value={plan.light} onChange={(value) => change("light", value)} />
      </div>

      <div className="space-y-4 border-t border-hairline bg-muted p-4 sm:p-6">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <Calculator className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          {copy.calculator[locale]}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <label htmlFor="calc-length" className="space-y-1 text-sm font-semibold text-ink">
            <span>{copy.length[locale]}</span>
            <input id="calc-length" type="number" min={1} max={500} step="any" value={plan.length} onChange={(event) => change("length", event.target.value)} className={controlClass} />
          </label>
          <label htmlFor="calc-width" className="space-y-1 text-sm font-semibold text-ink">
            <span>{copy.width[locale]}</span>
            <input id="calc-width" type="number" min={1} max={500} step="any" value={plan.width} onChange={(event) => change("width", event.target.value)} className={controlClass} />
          </label>
          <label htmlFor="calc-wastage" className="space-y-1 text-sm font-semibold text-ink">
            <span>{copy.wastage[locale]}</span>
            <select id="calc-wastage" value={plan.waste} onChange={(event) => change("waste", Number(event.target.value))} className={controlClass}>
              {[5, 10, 15, 20].map((value) => (
                <option key={value} value={value}>
                  {number.format(value)}%{value === recommendation && ` (${copy.recommended[locale]})`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div aria-live="polite" className="rounded border border-hairline bg-surface p-4 text-sm text-ink">
          {estimate ? (
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-secondary">{copy.grossArea[locale]}</dt>
                <dd className="font-mono font-semibold">{number.format(estimate.area)} {copy.squareFeet[locale]}</dd>
              </div>
              <div>
                <dt className="text-secondary">{copy.boxes[locale]}</dt>
                <dd id="calculated-boxes" className="font-mono font-semibold">{number.format(estimate.boxes)}</dd>
              </div>
              <div>
                <dt className="text-secondary">{copy.materialEstimate[locale]}</dt>
                <dd className="font-mono font-semibold">{formatBdt(estimate.total, locale)}</dd>
              </div>
            </dl>
          ) : copy.invalidEstimate[locale]}
        </div>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </div>
    </section>
  );
}
