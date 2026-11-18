"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Grid,
  FileText,
  Maximize,
  Minimize,
  Moon,
  Sun,
  Layers,
  ArrowLeft,
  Eye,
  ListOrdered,
  EyeOff,
} from "lucide-react";
import { SITE } from "@/lib/seo";

interface PresenterHUDProps {
  currentSlideIndex: number;
  totalSlides: number;
  revealedSteps: number;
  totalSteps: number;
  showAllSteps: boolean;
  locale: "bn" | "en";
  isFullscreen: boolean;
  isBlackout: boolean;
  onToggleLocale: () => void;
  onToggleShowAllSteps: () => void;
  onToggleFullscreen: () => void;
  onToggleBlackout: () => void;
  onOpenGrid: () => void;
  onOpenTeleprompter: () => void;
}

export function PresenterHUD({
  currentSlideIndex,
  totalSlides,
  revealedSteps,
  totalSteps,
  showAllSteps,
  locale,
  isFullscreen,
  isBlackout,
  onToggleLocale,
  onToggleShowAllSteps,
  onToggleFullscreen,
  onToggleBlackout,
  onOpenGrid,
  onOpenTeleprompter,
}: PresenterHUDProps) {
  return (
    <header className="relative z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-hairline/80 bg-surface/85 backdrop-blur-md">
      {/* Brand Identity & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          title="Return to DigiTiles Home"
        >
          <Image
            src={SITE.interfaceMark}
            alt="DigiTiles Logo"
            width={32}
            height={32}
            priority
            className="shrink-0"
          />
          <div className="hidden sm:block">
            <span className="font-bold text-sm text-ink block leading-none">
              {SITE.name}
            </span>
            <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
              3D Executive Deck
            </span>
          </div>
        </Link>

        {/* Back Link */}
        <Link
          href="/marketplace"
          className="hidden md:inline-flex items-center gap-1 text-xs text-secondary hover:text-ink hover:underline pl-2 border-l border-hairline"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>{locale === "bn" ? "মার্কেটপ্লেস" : "Marketplace"}</span>
        </Link>
      </div>

      {/* Slide & Step Counters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-hairline bg-muted/60 px-3 py-1 text-xs font-mono">
          <span className="font-bold text-ink">
            {String(currentSlideIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-subtle">/</span>
          <span className="text-subtle">{String(totalSlides).padStart(2, "0")}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-hairline bg-muted/40 px-2.5 py-1 text-xs font-mono text-secondary">
          <span>Step</span>
          <span className="font-bold text-accent">
            {showAllSteps ? totalSteps : Math.min(revealedSteps, totalSteps)}
          </span>
          <span className="text-subtle">/</span>
          <span>{totalSteps}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Step Mode Toggle */}
        <button
          type="button"
          onClick={onToggleShowAllSteps}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer hidden lg:inline-flex items-center gap-1.5 ${
            showAllSteps
              ? "bg-accent/10 border-accent/40 text-accent"
              : "bg-muted hover:bg-canvas border-hairline text-secondary hover:text-ink"
          }`}
          title="Toggle between Step-by-Step reveal or Show All points at once"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>
            {showAllSteps
              ? locale === "bn" ? "সব দৃশ্যমান" : "All Visible"
              : locale === "bn" ? "স্টেপ মোড" : "Step Mode"}
          </span>
        </button>

        {/* Slide Grid View ('G') */}
        <button
          type="button"
          onClick={onOpenGrid}
          className="p-2 rounded-lg border border-hairline bg-muted hover:bg-canvas text-secondary hover:text-ink transition-colors cursor-pointer"
          title="Slide Grid Overview (G)"
          aria-label="Toggle Slide Grid"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Teleprompter Speech ('S') */}
        <button
          type="button"
          onClick={onOpenTeleprompter}
          className="p-2 rounded-lg border border-hairline bg-muted hover:bg-canvas text-secondary hover:text-ink transition-colors cursor-pointer"
          title="Speaker Notes & Speech Teleprompter (S)"
          aria-label="Toggle Speech Teleprompter"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Blackout Mode ('.') */}
        <button
          type="button"
          onClick={onToggleBlackout}
          className={`p-2 rounded-lg border transition-colors cursor-pointer ${
            isBlackout
              ? "bg-black text-white border-black ring-2 ring-accent"
              : "border-hairline bg-muted hover:bg-canvas text-secondary hover:text-ink"
          }`}
          title="Blackout Screen Mode (B or .)"
          aria-label="Toggle Blackout Screen"
        >
          <EyeOff className="w-4 h-4" />
        </button>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={onToggleLocale}
          className="px-2.5 py-1 rounded-lg border border-hairline bg-muted hover:bg-canvas text-xs font-bold text-ink transition-colors cursor-pointer"
          title="Toggle Language (বাংলা / English)"
        >
          {locale === "bn" ? "EN" : "বাংলা"}
        </button>

        {/* Fullscreen ('F') */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg border border-hairline bg-muted hover:bg-canvas text-secondary hover:text-ink transition-colors cursor-pointer hidden sm:block"
          title="Toggle Fullscreen (F)"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
