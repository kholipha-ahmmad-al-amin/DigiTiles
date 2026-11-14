"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Layers,
  ArrowRight,
} from "lucide-react";

interface PresenterDockProps {
  currentSlideIndex: number;
  totalSlides: number;
  revealedSteps: number;
  totalSteps: number;
  showAllSteps: boolean;
  locale: "bn" | "en";
  modalTrigger?: "modules" | "liveProduct" | "financials" | "leadership";
  onPrev: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onOpenModal?: (type: "modules" | "liveProduct" | "financials" | "leadership") => void;
}

export function PresenterDock({
  currentSlideIndex,
  totalSlides,
  revealedSteps,
  totalSteps,
  showAllSteps,
  locale,
  modalTrigger,
  onPrev,
  onNext,
  onFirst,
  onLast,
  onOpenModal,
}: PresenterDockProps) {
  const progressPercent = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);

  return (
    <footer className="relative z-30 flex flex-col border-t border-hairline/80 bg-surface/85 backdrop-blur-md px-4 sm:px-8 py-3">
      {/* Visual Progress Bar */}
      <div className="w-full bg-muted h-1 rounded-full overflow-hidden mb-3">
        <div
          className="bg-accent h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Quick Jump to First / Previous */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onFirst}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-lg border border-hairline bg-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed text-secondary hover:text-ink transition-colors cursor-pointer hidden sm:block"
            title="First Slide (Home)"
            aria-label="First Slide"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onPrev}
            disabled={currentSlideIndex === 0 && (showAllSteps || revealedSteps <= 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-ink transition-colors cursor-pointer"
            title="Previous Step or Slide (ArrowLeft / Up)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{locale === "bn" ? "পূর্ববর্তী" : "Prev"}</span>
          </button>
        </div>

        {/* Center: Slide-Specific Modal Button (if applicable) */}
        <div className="flex items-center gap-2">
          {modalTrigger && onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal(modalTrigger)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent hover:text-white text-xs font-semibold text-accent transition-all duration-200 cursor-pointer shadow-sm"
            >
              <span>
                {modalTrigger === "modules" && (locale === "bn" ? "১৫টি মডিউল দেখুন" : "View 15 Modules")}
                {modalTrigger === "liveProduct" && (locale === "bn" ? "সচল পণ্য পরীক্ষা করুন" : "Explore Live Product")}
                {modalTrigger === "financials" && (locale === "bn" ? "৩টি প্রবৃদ্ধি মডেল দেখুন" : "View Financial Models")}
                {modalTrigger === "leadership" && (locale === "bn" ? "লিডারশিপ টিম প্রোফাইল" : "View Leadership Profiles")}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-subtle">
            <span>Arrow / Space / Remote controls enabled</span>
          </div>
        </div>

        {/* Right: Next / Last Slide */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm"
            title="Next Step or Slide (ArrowRight / Space / Down)"
          >
            <span>
              {currentSlideIndex === totalSlides - 1 &&
              (showAllSteps || revealedSteps >= totalSteps)
                ? locale === "bn" ? "সমাপ্তি" : "Finish"
                : locale === "bn" ? "পরবর্তী" : "Next"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onLast}
            disabled={currentSlideIndex === totalSlides - 1}
            className="p-2 rounded-lg border border-hairline bg-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed text-secondary hover:text-ink transition-colors cursor-pointer hidden sm:block"
            title="Last Slide (End)"
            aria-label="Last Slide"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
