"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Play, Pause, RotateCcw, Type } from "lucide-react";
import { PitchSlide } from "@/lib/pitch-deck-data";

interface TeleprompterDrawerProps {
  isOpen: boolean;
  currentSlide: PitchSlide;
  locale: "bn" | "en";
  onClose: () => void;
}

export function TeleprompterDrawer({
  isOpen,
  currentSlide,
  locale,
  onClose,
}: TeleprompterDrawerProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoScrolling && scrollContainerRef.current) {
      interval = setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += 1;
        }
      }, 45);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  // Reset scroll position on slide change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsAutoScrolling(false);
  }, [currentSlide.id]);

  if (!isOpen) return null;

  const fontClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg leading-loose font-medium",
    xl: "text-xl leading-loose font-medium",
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-hairline bg-surface/98 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <div>
          <span className="text-[11px] font-mono font-bold text-accent uppercase tracking-wider block">
            Teleprompter (Slide {String(currentSlide.id).padStart(2, "0")} / 12)
          </span>
          <h3 className="text-base font-bold text-ink truncate max-w-xs mt-0.5">
            {currentSlide.title[locale]}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-secondary hover:text-ink hover:bg-muted transition-colors"
          aria-label="Close teleprompter"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between py-3 border-b border-hairline/60 bg-muted/30 px-3 rounded-lg my-3 text-xs">
        {/* Font size control */}
        <div className="flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-subtle" />
          <button
            type="button"
            onClick={() => setFontSize("sm")}
            className={`px-1.5 py-0.5 rounded font-mono ${fontSize === "sm" ? "bg-accent text-white font-bold" : "text-secondary hover:text-ink"}`}
          >
            S
          </button>
          <button
            type="button"
            onClick={() => setFontSize("base")}
            className={`px-1.5 py-0.5 rounded font-mono ${fontSize === "base" ? "bg-accent text-white font-bold" : "text-secondary hover:text-ink"}`}
          >
            M
          </button>
          <button
            type="button"
            onClick={() => setFontSize("lg")}
            className={`px-1.5 py-0.5 rounded font-mono ${fontSize === "lg" ? "bg-accent text-white font-bold" : "text-secondary hover:text-ink"}`}
          >
            L
          </button>
          <button
            type="button"
            onClick={() => setFontSize("xl")}
            className={`px-1.5 py-0.5 rounded font-mono ${fontSize === "xl" ? "bg-accent text-white font-bold" : "text-secondary hover:text-ink"}`}
          >
            XL
          </button>
        </div>

        {/* Auto scroll control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              isAutoScrolling
                ? "bg-amber-600 text-white"
                : "bg-muted hover:bg-canvas border border-hairline text-ink"
            }`}
          >
            {isAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isAutoScrolling ? "Pause" : "Scroll"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            }}
            className="p-1 text-subtle hover:text-ink"
            aria-label="Reset scroll"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Speech Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pr-2 py-2 select-text"
      >
        <div className="rounded-xl border border-hairline/80 bg-canvas/60 p-5 shadow-inner">
          <p className={`${fontClasses[fontSize]} text-ink font-sans`}>
            {currentSlide.speech[locale]}
          </p>
        </div>

        <div className="mt-5 p-4 rounded-xl border border-hairline bg-muted/30 text-xs text-subtle space-y-1.5">
          <span className="font-bold text-ink block">Speaker Notes & Cues:</span>
          <p>
            {locale === "bn"
              ? "স্লাইড চেঞ্জের আগে দর্শকের চোখের দিকে তাকিয়ে কথা শেষ করুন। কিবোর্ডে স্পেস বা অ্যারো কী চেপে পরের পয়েন্ট উন্মোচন করুন।"
              : "Pause naturally before advancing steps. Highlight metrics clearly for investors."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-hairline flex items-center justify-between text-xs text-subtle">
        <span>Presenter: Kholipha Ahmmad Al-Amin</span>
        <span className="font-mono">Press &apos;S&apos; to close</span>
      </div>
    </div>
  );
}
