import React from "react";
import { SwatchPattern } from "@/lib/types";
import { MaterialField } from "@/components/ui/MaterialField";

interface TileSwatchPreviewProps {
  pattern: SwatchPattern;
  dimensionsMm: string;
  surfaceFinish: string;
  brand?: string;
  showGrid?: boolean;
  className?: string;
}

export function TileSwatchPreview({
  pattern,
  dimensionsMm,
  surfaceFinish,
  brand,
  showGrid = true,
  className = "h-48",
}: TileSwatchPreviewProps) {
  const swatchClass = `swatch-${pattern || "carrara-marble"}`;
  const jointed = showGrid && !["mosaic-teal", "wood-oak-plank", "sanitary-porcelain", "adhesive-mortar"].includes(pattern);

  return (
    <div
      className={`relative overflow-hidden border-b border-hairline select-none ${swatchClass} ${className}`}
      role="img"
      aria-label={`${brand ? `${brand} ` : ""}${surfaceFinish} surface swatch (${dimensionsMm})`}
    >
      <MaterialField pattern={pattern || "carrara-marble"} />
      {jointed && <div className="swatch-joint" aria-hidden="true" />}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-surface text-ink border border-hairline rounded shadow-sm tabular-nums">
          {dimensionsMm}
        </span>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
        <span className="px-2.5 py-1 text-xs font-medium bg-surface text-ink border border-hairline rounded shadow-sm truncate">
          {surfaceFinish}
        </span>
        {brand && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-ink text-surface rounded shadow-sm truncate">
            {brand}
          </span>
        )}
      </div>
    </div>
  );
}
