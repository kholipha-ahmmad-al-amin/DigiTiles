"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { PitchSlide } from "@/lib/pitch-deck-data";
import { StepCard } from "./StepCard";
import { ArrowRight, ShieldCheck, UserCheck, Layers, Building2 } from "lucide-react";

interface SlideCardProps {
  slide: PitchSlide;
  locale: "bn" | "en";
  revealedSteps: number;
  showAllSteps: boolean;
  onOpenModal?: (type: "modules" | "liveProduct" | "financials" | "leadership") => void;
}

// 12 Distinct 3D Slide Transition Variants
const SLIDE_TRANSITION_VARIANTS: Record<string, Variants> = {
  // 1: 3D Cinema Curtain Rise
  curtain: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? 45 : -45,
      y: dir > 0 ? 180 : -180,
      scale: 0.9,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? -45 : 45,
      y: dir > 0 ? -180 : 180,
      scale: 0.9,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 2: 3D Book Leaf / Page Swing
  book: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? -88 : 88,
      transformOrigin: dir > 0 ? "left center" : "right center",
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? 88 : -88,
      transformOrigin: dir > 0 ? "right center" : "left center",
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 3: 3D Cube Face Rotation
  cube: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? 85 : -85,
      z: -450,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateY: 0,
      z: 0,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? -85 : 85,
      z: -450,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 4: 3D Depth Portal Zoom-Through
  portal: {
    initial: (dir: number) => ({
      opacity: 0,
      scale: dir > 0 ? 0.45 : 1.45,
      z: dir > 0 ? -750 : 400,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      scale: 1,
      z: 0,
      transition: { duration: 0.84, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: dir > 0 ? 1.45 : 0.45,
      z: dir > 0 ? 400 : -750,
      transition: { duration: 0.74, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 5: 3D Architectural Hinge Fold
  hinge: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? 40 : -40,
      rotateY: dir > 0 ? -40 : 40,
      scale: 0.88,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? -40 : 40,
      rotateY: dir > 0 ? 40 : -40,
      scale: 0.88,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 6: 3D Carousel Orbit Sweep
  carousel: {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 600 : -600,
      rotateY: dir > 0 ? 45 : -45,
      z: -350,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      z: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -600 : 600,
      rotateY: dir > 0 ? -45 : 45,
      z: -350,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 7: 3D Vault Door Swing
  vault: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? 88 : -88,
      transformOrigin: "right center",
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateY: dir > 0 ? -88 : 88,
      transformOrigin: "left center",
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 8: 3D Isometric Blueprint Tilt-In
  blueprint: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? 55 : -55,
      rotateZ: dir > 0 ? -15 : 15,
      y: dir > 0 ? 140 : -140,
      scale: 0.88,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateX: 0,
      rotateZ: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.84, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? -55 : 55,
      rotateZ: dir > 0 ? 15 : -15,
      y: dir > 0 ? -140 : 140,
      scale: 0.88,
      transition: { duration: 0.74, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 9: 3D Horizon Flip-Up
  horizon: {
    initial: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? -82 : 82,
      transformOrigin: "center bottom",
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      rotateX: 0,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      rotateX: dir > 0 ? 82 : -82,
      transformOrigin: "center top",
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 10: 3D Parallax Deck Glide
  parallax: {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 450 : -450,
      z: -500,
      rotateY: dir > 0 ? -25 : 25,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      x: 0,
      z: 0,
      rotateY: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -450 : 450,
      z: -500,
      rotateY: dir > 0 ? 25 : -25,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 11: 3D Gallery Stage Reveal
  gallery: {
    initial: (dir: number) => ({
      opacity: 0,
      scale: 0.84,
      rotateX: dir > 0 ? 25 : -25,
      y: dir > 0 ? 80 : -80,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.84,
      rotateX: dir > 0 ? -25 : 25,
      y: dir > 0 ? -80 : 80,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
    }),
  },
  // 12: 3D Sovereign Finale Ascent
  ascent: {
    initial: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? 180 : -180,
      z: -450,
      rotateX: dir > 0 ? -28 : 28,
      transformPerspective: 1800,
    }),
    animate: {
      opacity: 1,
      y: 0,
      z: 0,
      rotateX: 0,
      transition: { duration: 0.88, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      y: dir > 0 ? -180 : 180,
      z: -450,
      rotateX: dir > 0 ? 28 : -28,
      transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
    }),
  },
};

export function SlideCard({
  slide,
  locale,
  revealedSteps,
  showAllSteps,
  onOpenModal,
}: SlideCardProps) {
  const transitionConfig =
    SLIDE_TRANSITION_VARIANTS[slide.transitionType] ||
    SLIDE_TRANSITION_VARIANTS.curtain;

  return (
    <motion.div
      key={slide.id}
      custom={1}
      variants={transitionConfig}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative flex flex-col justify-between w-full h-full max-w-6xl mx-auto rounded-2xl border border-hairline bg-surface/95 p-6 sm:p-10 shadow-xl backdrop-blur-xl"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(#b45309 1px, transparent 1px), radial-gradient(#0f766e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        }}
      />

      {/* Slide Header */}
      <div className="relative z-10 mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {slide.category[locale]}
            </span>
            <span className="text-xs font-mono text-subtle">
              Slide {String(slide.id).padStart(2, "0")} / 12
            </span>
          </div>

          {slide.modalTrigger && onOpenModal && (
            <button
              type="button"
              onClick={() => onOpenModal(slide.modalTrigger!)}
              className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
            >
              <span>
                {slide.modalTrigger === "modules" && (locale === "bn" ? "১৫টি মডিউল দেখুন" : "View 15 Modules")}
                {slide.modalTrigger === "liveProduct" && (locale === "bn" ? "সচল পণ্য পরীক্ষা করুন" : "Explore Live Product")}
                {slide.modalTrigger === "financials" && (locale === "bn" ? "৩টি প্রবৃদ্ধি মডেল দেখুন" : "View Financial Models")}
                {slide.modalTrigger === "leadership" && (locale === "bn" ? "লিডারশিপ টিম প্রোফাইল" : "View Leadership Profiles")}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight leading-tight mb-2.5">
          {slide.title[locale]}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-secondary max-w-4xl leading-relaxed">
          {slide.subtitle[locale]}
        </p>
      </div>

      {/* Intra-Slide 4 Step Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 my-auto">
        {slide.steps.map((step, idx) => {
          const isStepRevealed = showAllSteps || idx < revealedSteps;
          return (
            <StepCard
              key={idx}
              step={step}
              index={idx}
              locale={locale}
              isRevealed={isStepRevealed}
            />
          );
        })}
      </div>

      {/* Slide Bottom Bar with Presenter Credit */}
      <div className="relative z-10 mt-6 pt-4 border-t border-hairline/80 flex flex-wrap items-center justify-between gap-3 text-xs text-subtle">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-ink">
            {locale === "bn" ? "উপস্থাপক:" : "Presenter:"}
          </span>
          <span className="text-secondary font-medium">
            খলিফা আহম্মেদ আল-আমিন (Kholipha Ahmmad Al-Amin)
          </span>
          <span className="hidden sm:inline text-hairline">|</span>
          <span className="hidden sm:inline text-subtle">
            Founder & Systems Architect, EquiSaaS BD
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Transition: {slide.transitionType}</span>
          <span className="text-hairline">|</span>
          <span>DigiTiles Executive 2026</span>
        </div>
      </div>
    </motion.div>
  );
}
