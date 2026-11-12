"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Box,
  Building2,
  Calculator,
  CheckCircle,
  CheckCircle2,
  Compass,
  Cpu,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  MapPin,
  Percent,
  Receipt,
  Scale,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Store,
  Target,
  Terminal,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { PitchStep } from "@/lib/pitch-deck-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Award,
  BarChart3,
  Box,
  Building2,
  Calculator,
  CheckCircle,
  CheckCircle2,
  Compass,
  Cpu,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Globe,
  Layers,
  Lock,
  Mail,
  MapPin,
  Percent,
  Receipt,
  Scale,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Store,
  Target,
  Terminal,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Users,
};

// 5 Distinct Kinetic Entrance Styles
const ENTRANCE_VARIANTS: Variants[] = [
  // 1: 3D Perspective Flip-In from top hinge
  {
    hidden: { opacity: 0, rotateX: -65, y: -40, scale: 0.9 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const },
    },
  },
  // 2: Elastic High-Jump & Settle from bottom
  {
    hidden: { opacity: 0, y: 70, scale: 0.86 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 18,
        mass: 0.9,
      },
    },
  },
  // 3: 3D Side-Sweep & Unfold
  {
    hidden: { opacity: 0, x: -60, rotateY: 35, scale: 0.92 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] as const },
    },
  },
  // 4: Deep Portal Pop-Burst
  {
    hidden: { opacity: 0, scale: 0.65, z: -300 },
    visible: {
      opacity: 1,
      scale: 1,
      z: 0,
      transition: {
        type: "spring" as const,
        stiffness: 220,
        damping: 16,
      },
    },
  },
  // 5: Gravity Drop & Rebound
  {
    hidden: { opacity: 0, y: -50, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 22,
      },
    },
  },
];

interface StepCardProps {
  step: PitchStep;
  index: number;
  locale: "bn" | "en";
  isRevealed: boolean;
}

export function StepCard({ step, index, locale, isRevealed }: StepCardProps) {
  const IconComponent = ICON_MAP[step.iconName] || Layers;
  const variant = ENTRANCE_VARIANTS[index % ENTRANCE_VARIANTS.length];

  return (
    <motion.div
      variants={variant}
      initial="hidden"
      animate={isRevealed ? "visible" : "hidden"}
      className="group relative flex flex-col justify-between rounded-xl border border-hairline bg-surface/90 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-accent/60 hover:shadow-md"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline bg-muted text-accent transition-colors group-hover:bg-accent group-hover:text-white">
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-2">
            {step.badge && (
              <span className="inline-flex items-center rounded-full border border-hairline bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-secondary">
                {step.badge[locale]}
              </span>
            )}
            {step.metric && (
              <span className="font-mono text-xs font-bold text-accent">
                {step.metric}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-ink leading-snug tracking-tight mb-2">
          {step.title[locale]}
        </h3>

        {/* Description */}
        <p className="text-xs leading-relaxed text-secondary">
          {step.desc[locale]}
        </p>
      </div>

      {/* Decorative hairline anchor */}
      <div className="mt-4 pt-3 border-t border-hairline/60 flex items-center justify-between text-[11px] font-mono text-subtle">
        <span>Pillar {index + 1}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-accent/40 group-hover:bg-accent transition-colors" />
      </div>
    </motion.div>
  );
}
