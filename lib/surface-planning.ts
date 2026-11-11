import { VISUALIZER_COPY } from "./i18n-visualizer";
import type { DealerListing } from "./types";

export const WASTAGE_BY_PATTERN = { grid: 5, brick: 10, herringbone: 15, diagonal: 15 } as const;
export const VISUALIZER_PAGE_SIZE = 20;

export interface SurfacePlan {
  room: keyof typeof VISUALIZER_COPY.rooms;
  pattern: keyof typeof WASTAGE_BY_PATTERN;
  joint: keyof typeof VISUALIZER_COPY.groutWidths;
  grout: keyof typeof VISUALIZER_COPY.groutColors;
  light: keyof typeof VISUALIZER_COPY.lights;
  view: keyof typeof VISUALIZER_COPY.views;
  length: string;
  width: string;
  waste: number;
}

function pickOption<T extends string>(options: Record<T, unknown>, value: string | null, fallback: T): T {
  return value && Object.prototype.hasOwnProperty.call(options, value) ? value as T : fallback;
}

function parseDimension(value: string | null, fallback: string) {
  const number = Number(value);
  return number >= 1 && number <= 500 ? String(number) : fallback;
}

export function readSurfacePlan(params: URLSearchParams): SurfacePlan {
  const pattern = pickOption(WASTAGE_BY_PATTERN, params.get("pattern"), "grid");
  const waste = Number(params.get("waste"));

  return {
    room: pickOption(VISUALIZER_COPY.rooms, params.get("room"), "living"),
    pattern,
    joint: pickOption(VISUALIZER_COPY.groutWidths, params.get("joint"), "3"),
    grout: pickOption(VISUALIZER_COPY.groutColors, params.get("grout"), "cement"),
    light: pickOption(VISUALIZER_COPY.lights, params.get("light"), "daylight"),
    view: pickOption(VISUALIZER_COPY.views, params.get("view"), "perspective"),
    length: parseDimension(params.get("length"), "20"),
    width: parseDimension(params.get("width"), "15"),
    waste: [5, 10, 15, 20].includes(waste) ? waste : WASTAGE_BY_PATTERN[pattern],
  };
}

export function surfacePlanQuery(plan: SurfacePlan) {
  return new URLSearchParams({ ...plan, waste: String(plan.waste) });
}

export function boxesForArea(area: number, listing: Pick<DealerListing, "sqftPerBox" | "minOrderBoxes">) {
  if (!Number.isFinite(area) || area <= 0 || listing.sqftPerBox <= 0) return null;
  return Math.max(listing.minOrderBoxes || 1, Math.ceil(area / listing.sqftPerBox));
}

export function estimateSurface(plan: SurfacePlan, listing: DealerListing) {
  const length = Number(plan.length);
  const width = Number(plan.width);
  if (length < 1 || length > 500 || width < 1 || width > 500) return null;

  const area = length * width * (100 + plan.waste) / 100;
  const boxes = boxesForArea(area, listing);
  return boxes === null ? null : { area, boxes, total: boxes * listing.pricePerBoxBdt };
}
