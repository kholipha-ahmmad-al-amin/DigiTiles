import React from "react";
import { SwatchPattern } from "@/lib/types";

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

  return (
    <div
      className={`relative overflow-hidden border-b border-hairline select-none ${swatchClass} ${className}`}
      role="img"
      aria-label={`${brand ? `${brand} ` : ""}${surfaceFinish} surface swatch (${dimensionsMm})`}
    >
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17, 24, 39, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(17, 24, 39, 0.25) 1px, transparent 1px)",
            backgroundSize: "50% 50%",
          }}
        />
      )}
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
