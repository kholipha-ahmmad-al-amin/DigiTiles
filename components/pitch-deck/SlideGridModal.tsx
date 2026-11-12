"use client";

import React from "react";
import { X, Check } from "lucide-react";
import { PITCH_DECK_SLIDES } from "@/lib/pitch-deck-data";

interface SlideGridModalProps {
  isOpen: boolean;
  currentSlideIndex: number;
  locale: "bn" | "en";
  onSelectSlide: (index: number) => void;
  onClose: () => void;
}

export function SlideGridModal({
  isOpen,
  currentSlideIndex,
  locale,
  onSelectSlide,
  onClose,
}: SlideGridModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[90vh] rounded-2xl border border-hairline bg-surface p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {locale === "bn" ? "সকল স্লাইড ওভারভিউ (গ্রিড ভিউ)" : "All Slides Grid Overview"}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              {locale === "bn"
                ? "যেকোনো স্লাইডে তাৎক্ষণিকভাবে জাম্প করতে কার্ডে ক্লিক করুন।"
                : "Click any slide card to immediately jump into that topic."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-secondary hover:text-ink hover:bg-muted transition-colors"
            aria-label="Close slide grid"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 12 Slides Grid */}
        <div className="flex-1 overflow-y-auto py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 pr-1">
          {PITCH_DECK_SLIDES.map((slide, idx) => {
            const isCurrent = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => {
                  onSelectSlide(idx);
                  onClose();
                }}
                className={`group flex flex-col justify-between text-left rounded-xl p-3.5 border transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "border-accent bg-accent/10 shadow-md ring-2 ring-accent/30"
                    : "border-hairline bg-muted/40 hover:bg-muted hover:border-accent/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-accent">
                      {String(slide.id).padStart(2, "0")} / 12
                    </span>
                    {isCurrent && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-subtle block uppercase tracking-wider mb-1">
                    {slide.category[locale]}
                  </span>
                  <h4 className="text-xs font-bold text-ink leading-snug line-clamp-2">
                    {slide.title[locale]}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-hairline/60 flex items-center justify-between text-[10px] font-mono text-subtle">
                  <span>{slide.transitionType}</span>
                  <span className="text-secondary">{slide.steps.length} Pillars</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-subtle">
          <span>Shortcuts: Press &apos;G&apos; to toggle grid, &apos;Esc&apos; to close</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-muted text-ink hover:bg-canvas border border-hairline text-xs font-semibold"
          >
            {locale === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
