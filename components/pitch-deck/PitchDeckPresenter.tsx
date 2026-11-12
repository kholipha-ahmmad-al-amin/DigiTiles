"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { PITCH_DECK_SLIDES, PitchSlide } from "@/lib/pitch-deck-data";
import { PresenterHUD } from "./PresenterHUD";
import { PresenterDock } from "./PresenterDock";
import { SlideCard } from "./SlideCard";
import { SlideGridModal } from "./SlideGridModal";
import { TeleprompterDrawer } from "./TeleprompterDrawer";
import { DeepDiveModals } from "./DeepDiveModals";

export function PitchDeckPresenter() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(1);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [locale, setLocale] = useState<"bn" | "en">("bn");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);

  // Modals state
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [activeDeepDiveModal, setActiveDeepDiveModal] = useState<
    "modules" | "liveProduct" | "financials" | "leadership" | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentSlide = PITCH_DECK_SLIDES[currentSlideIndex];
  const totalSlides = PITCH_DECK_SLIDES.length;
  const totalSteps = currentSlide.steps.length;

  // Reset revealed steps on slide change
  useEffect(() => {
    setRevealedSteps(1);
  }, [currentSlideIndex]);

  // Step / Slide Forward
  const handleNext = useCallback(() => {
    if (showAllSteps) {
      if (currentSlideIndex < totalSlides - 1) {
        setCurrentSlideIndex((prev) => prev + 1);
      }
      return;
    }

    if (revealedSteps < totalSteps) {
      setRevealedSteps((prev) => prev + 1);
    } else if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, totalSlides, revealedSteps, totalSteps, showAllSteps]);

  // Step / Slide Backward
  const handlePrev = useCallback(() => {
    if (showAllSteps) {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex((prev) => prev - 1);
      }
      return;
    }

    if (revealedSteps > 1) {
      setRevealedSteps((prev) => prev - 1);
    } else if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      setRevealedSteps(PITCH_DECK_SLIDES[currentSlideIndex - 1].steps.length);
    }
  }, [currentSlideIndex, revealedSteps, showAllSteps]);

  const handleFirst = useCallback(() => {
    setCurrentSlideIndex(0);
    setRevealedSteps(1);
  }, []);

  const handleLast = useCallback(() => {
    setCurrentSlideIndex(totalSlides - 1);
    setRevealedSteps(PITCH_DECK_SLIDES[totalSlides - 1].steps.length);
  }, [totalSlides]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  }, []);

  const toggleBlackout = useCallback(() => {
    setIsBlackout((prev) => !prev);
  }, []);

  // Keyboard and Remote Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
        case "PageDown":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          handlePrev();
          break;
        case "Home":
          e.preventDefault();
          handleFirst();
          break;
        case "End":
          e.preventDefault();
          handleLast();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "b":
        case "B":
        case ".":
          e.preventDefault();
          toggleBlackout();
          break;
        case "s":
        case "S":
          e.preventDefault();
          setIsTeleprompterOpen((prev) => !prev);
          break;
        case "g":
        case "G":
          e.preventDefault();
          setIsGridOpen((prev) => !prev);
          break;
        case "Escape":
          setIsGridOpen(false);
          setIsTeleprompterOpen(false);
          setActiveDeepDiveModal(null);
          setIsBlackout(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleFirst, handleLast, toggleFullscreen, toggleBlackout]);

  // Touch Swipe Handler for Mobile
  const touchStartXRef = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative flex flex-col w-full h-[100dvh] overflow-hidden bg-canvas text-ink select-none"
    >
      {/* Top HUD */}
      <PresenterHUD
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        revealedSteps={revealedSteps}
        totalSteps={totalSteps}
        showAllSteps={showAllSteps}
        locale={locale}
        isFullscreen={isFullscreen}
        isBlackout={isBlackout}
        onToggleLocale={() => setLocale(locale === "bn" ? "en" : "bn")}
        onToggleShowAllSteps={() => setShowAllSteps((prev) => !prev)}
        onToggleFullscreen={toggleFullscreen}
        onToggleBlackout={toggleBlackout}
        onOpenGrid={() => setIsGridOpen(true)}
        onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
      />

      {/* Main 3D Stage Area */}
      <main
        className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        style={{
          perspective: "1800px",
          transformStyle: "preserve-3d",
        }}
      >
        <AnimatePresence mode="wait">
          <SlideCard
            key={currentSlide.id}
            slide={currentSlide}
            locale={locale}
            revealedSteps={revealedSteps}
            showAllSteps={showAllSteps}
            onOpenModal={(type) => setActiveDeepDiveModal(type)}
          />
        </AnimatePresence>
      </main>

      {/* Bottom Control Dock */}
      <PresenterDock
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlides}
        revealedSteps={revealedSteps}
        totalSteps={totalSteps}
        showAllSteps={showAllSteps}
        locale={locale}
        modalTrigger={currentSlide.modalTrigger}
        onPrev={handlePrev}
        onNext={handleNext}
        onFirst={handleFirst}
        onLast={handleLast}
        onOpenModal={(type) => setActiveDeepDiveModal(type)}
      />

      {/* Blackout Mode Curtain */}
      {isBlackout && (
        <div
          onClick={toggleBlackout}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer transition-opacity duration-300"
        >
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-mono text-white/80 backdrop-blur-md animate-pulse">
            Blackout Mode Active &middot; Press &apos;B&apos; or click anywhere to resume
          </div>
        </div>
      )}

      {/* Slide Grid Modal ('G') */}
      <SlideGridModal
        isOpen={isGridOpen}
        currentSlideIndex={currentSlideIndex}
        locale={locale}
        onSelectSlide={(idx) => setCurrentSlideIndex(idx)}
        onClose={() => setIsGridOpen(false)}
      />

      {/* Teleprompter Speech Drawer ('S') */}
      <TeleprompterDrawer
        isOpen={isTeleprompterOpen}
        currentSlide={currentSlide}
        locale={locale}
        onClose={() => setIsTeleprompterOpen(false)}
      />

      {/* Deep-Dive Modals */}
      <DeepDiveModals
        activeModal={activeDeepDiveModal}
        locale={locale}
        onClose={() => setActiveDeepDiveModal(null)}
      />
    </div>
  );
}
