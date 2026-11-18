"use client";

import { useId } from "react";
import type { SwatchPattern } from "@/lib/types";

const GROUND: Record<SwatchPattern, string> = {
  "carrara-marble": "#f3f1eb",
  "concrete-matt": "#8d9496",
  "terracotta-rustic": "#a34b32",
  "travertine-warm": "#e6cba8",
  "onyx-gloss": "#e8d7ae",
  "wood-oak-plank": "#8d5a34",
  "mosaic-teal": "#d6d3cd",
  "granite-speckle": "#6b686e",
  "sanitary-porcelain": "#f6f5f1",
  "adhesive-mortar": "#5c656c",
};

function Motif({ pattern, ink }: { pattern: SwatchPattern; ink: string }) {
  if (pattern === "carrara-marble") {
    return (
      <>
        <ellipse cx="70" cy="36" rx="88" ry="28" fill="#e7e4dc" />
        <ellipse cx="210" cy="120" rx="96" ry="34" fill="#eceae3" />
        <path d="M-8 132C48 78 92 64 148 96S236 28 292 12" stroke={ink} strokeWidth="1.1" fill="none" opacity="0.55" />
        <path d="M-8 142C58 92 104 78 156 108S244 44 292 26" stroke="#c5c3bb" strokeWidth="4" fill="none" opacity="0.45" />
      </>
    );
  }
  if (pattern === "concrete-matt") {
    return (
      <>
        <circle cx="18" cy="22" r="1.2" fill={ink} />
        <circle cx="46" cy="14" r="0.8" fill="#f4f3ef" />
        <circle cx="74" cy="38" r="1.4" fill={ink} />
        <circle cx="112" cy="18" r="0.9" fill={ink} />
        <circle cx="148" cy="44" r="1.1" fill="#f4f3ef" />
        <circle cx="186" cy="16" r="1.3" fill={ink} />
        <circle cx="228" cy="36" r="0.8" fill={ink} />
        <circle cx="34" cy="72" r="1" fill={ink} />
        <circle cx="88" cy="84" r="1.5" fill="#3f4749" />
        <circle cx="132" cy="68" r="0.7" fill="#f4f3ef" />
        <circle cx="176" cy="92" r="1.2" fill={ink} />
        <circle cx="214" cy="74" r="1" fill={ink} />
        <circle cx="252" cy="96" r="1.4" fill="#3f4749" />
      </>
    );
  }
  if (pattern === "terracotta-rustic") {
    return (
      <>
        <ellipse cx="36" cy="28" rx="7" ry="3" fill="#7a3122" opacity="0.55" />
        <ellipse cx="92" cy="64" rx="5" ry="2.2" fill="#f0c2a4" opacity="0.28" />
        <ellipse cx="154" cy="24" rx="8" ry="3.2" fill="#7a3122" opacity="0.4" />
        <ellipse cx="210" cy="78" rx="6" ry="2.4" fill="#6a291c" opacity="0.5" />
        <ellipse cx="248" cy="40" rx="4" ry="1.8" fill="#f0c2a4" opacity="0.22" />
        <path d="M0 96H280" stroke="#7a3122" strokeWidth="8" opacity="0.12" />
      </>
    );
  }
  if (pattern === "travertine-warm") {
    return (
      <>
        <rect x="12" y="22" width="18" height="3" rx="1" fill="#b08968" opacity="0.45" />
        <rect x="48" y="24" width="9" height="2.5" rx="1" fill="#f4e6d0" opacity="0.7" />
        <rect x="78" y="20" width="22" height="3" rx="1" fill="#b08968" opacity="0.4" />
        <rect x="124" y="26" width="14" height="2" rx="1" fill="#8c6848" opacity="0.35" />
        <rect x="168" y="21" width="26" height="3" rx="1" fill="#b08968" opacity="0.42" />
        <rect x="214" y="25" width="11" height="2" rx="1" fill="#f4e6d0" opacity="0.65" />
        <rect x="24" y="78" width="20" height="3" rx="1" fill="#b08968" opacity="0.4" />
        <rect x="70" y="82" width="12" height="2" rx="1" fill="#8c6848" opacity="0.35" />
        <rect x="110" y="76" width="28" height="3" rx="1" fill="#b08968" opacity="0.38" />
        <rect x="168" y="84" width="16" height="2.4" rx="1" fill="#f4e6d0" opacity="0.6" />
        <rect x="210" y="78" width="22" height="3" rx="1" fill="#b08968" opacity="0.4" />
      </>
    );
  }
  if (pattern === "onyx-gloss") {
    return (
      <>
        <path d="M-10 20H300" stroke="#f8efd2" strokeWidth="18" opacity="0.55" />
        <path d="M-10 48H300" stroke="#c4a15a" strokeWidth="10" opacity="0.4" />
        <path d="M-10 86H300" stroke="#8a5a32" strokeWidth="16" opacity="0.28" />
        <path d="M-10 118H300" stroke="#f8efd2" strokeWidth="8" opacity="0.4" />
        <path d="M18 -10C40 40 28 90 16 170" stroke="#fffaf0" strokeWidth="10" opacity="0.28" fill="none" />
      </>
    );
  }
  if (pattern === "wood-oak-plank") {
    return (
      <>
        <path d="M46 0V160M138 0V160M230 0V160" stroke="#5c3418" strokeWidth="3" />
        <path d="M8 18C24 14 36 24 44 18M52 28C80 20 110 36 132 26M146 42C170 34 200 48 224 40M8 70C28 64 40 78 44 70M54 88C86 80 112 98 132 86M150 104C178 96 206 112 224 102M10 124C26 118 38 132 44 122M56 140C90 132 116 150 132 138" stroke="#5c3418" strokeWidth="1" fill="none" opacity="0.7" />
      </>
    );
  }
  if (pattern === "mosaic-teal") {
    const cells = [0, 1, 2, 3, 4, 5];
    const tones = ["#1f6a64", "#3d8578", "#164e4c", "#2f7a70"];
    return (
      <>
        {cells.map((row) => cells.map((column) => (
          <rect
            key={`${row}-${column}`}
            x={4 + column * 22}
            y={4 + row * 22}
            width="18"
            height="18"
            fill={tones[(row * 3 + column) % tones.length]}
          />
        )))}
      </>
    );
  }
  if (pattern === "granite-speckle") {
    return (
      <>
        <circle cx="16" cy="18" r="1.6" fill="#d5d2cc" />
        <circle cx="40" cy="12" r="1" fill="#2e2c31" />
        <circle cx="62" cy="34" r="1.8" fill="#b7a48a" />
        <circle cx="98" cy="16" r="1.1" fill="#d5d2cc" />
        <circle cx="124" cy="40" r="1.4" fill="#2e2c31" />
        <circle cx="156" cy="14" r="1.7" fill="#b7a48a" />
        <circle cx="188" cy="36" r="1" fill="#d5d2cc" />
        <circle cx="220" cy="18" r="1.5" fill="#2e2c31" />
        <circle cx="252" cy="42" r="1.2" fill="#b7a48a" />
        <circle cx="28" cy="70" r="1.3" fill="#2e2c31" />
        <circle cx="72" cy="86" r="1.6" fill="#d5d2cc" />
        <circle cx="118" cy="74" r="1" fill="#b7a48a" />
        <circle cx="164" cy="96" r="1.8" fill="#2e2c31" />
        <circle cx="206" cy="78" r="1.1" fill="#d5d2cc" />
        <circle cx="244" cy="100" r="1.4" fill="#b7a48a" />
      </>
    );
  }
  if (pattern === "sanitary-porcelain") {
    return (
      <>
        <ellipse cx="90" cy="48" rx="70" ry="36" fill="#ffffff" opacity="0.72" />
        <path d="M24 20H250" stroke="#ffffff" strokeWidth="8" opacity="0.45" />
        <rect x="8" y="8" width="264" height="144" fill="none" stroke="#d9d6cf" strokeWidth="1" />
      </>
    );
  }
  return (
    <>
      <circle cx="14" cy="16" r="1.1" fill="#d7d4cc" />
      <circle cx="32" cy="28" r="0.7" fill="#2f363b" />
      <circle cx="54" cy="12" r="1" fill="#d7d4cc" />
      <circle cx="78" cy="34" r="0.8" fill="#2f363b" />
      <circle cx="104" cy="18" r="1.2" fill="#d7d4cc" />
      <circle cx="132" cy="30" r="0.7" fill="#2f363b" />
      <circle cx="158" cy="14" r="1" fill="#d7d4cc" />
      <circle cx="186" cy="36" r="0.9" fill="#2f363b" />
      <circle cx="214" cy="16" r="1.1" fill="#d7d4cc" />
      <circle cx="242" cy="32" r="0.8" fill="#2f363b" />
      <circle cx="24" cy="70" r="0.9" fill="#2f363b" />
      <circle cx="60" cy="84" r="1.1" fill="#d7d4cc" />
      <circle cx="96" cy="68" r="0.7" fill="#2f363b" />
      <circle cx="138" cy="90" r="1" fill="#d7d4cc" />
      <circle cx="176" cy="74" r="1.2" fill="#2f363b" />
      <circle cx="214" cy="96" r="0.8" fill="#d7d4cc" />
      <circle cx="248" cy="78" r="1" fill="#2f363b" />
    </>
  );
}

export function MaterialField({ pattern }: { pattern: SwatchPattern }) {
  const rawId = useId();
  const id = `material-${rawId.replace(/:/g, "")}`;
  const safe = GROUND[pattern] ? pattern : "carrara-marble";
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={id} width="280" height="160" patternUnits="userSpaceOnUse">
          <rect width="280" height="160" fill={GROUND[safe]} />
          <Motif pattern={safe} ink="#7d8488" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
