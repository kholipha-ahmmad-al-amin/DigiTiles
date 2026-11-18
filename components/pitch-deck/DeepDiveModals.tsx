"use client";

import React from "react";
import Link from "next/link";
import { X, ExternalLink, ShieldCheck, TrendingUp, Building2, UserCheck, Layers, ArrowRight } from "lucide-react";
import { PITCH_MODULES_LIST, PITCH_FINANCIAL_SCENARIOS, PITCH_LEADERSHIP_TEAM } from "@/lib/pitch-deck-modals";

interface DeepDiveModalsProps {
  activeModal: "modules" | "liveProduct" | "financials" | "leadership" | null;
  locale: "bn" | "en";
  onClose: () => void;
}

export function DeepDiveModals({ activeModal, locale, onClose }: DeepDiveModalsProps) {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-ink">
              {activeModal === "modules" && (locale === "bn" ? "ডিজিটাইলস ১৫টি কোর মডিউল ও স্ক্রিন ম্যাপিং" : "DigiTiles 15 Enterprise Modules & Architecture")}
              {activeModal === "liveProduct" && (locale === "bn" ? "সচল সফটওয়্যার ফিচার ও লাইভ শোকেস" : "Live Product Capabilities & Proof of Work")}
              {activeModal === "financials" && (locale === "bn" ? "৩টি আর্থিক প্রবৃদ্ধি মডেল ও ইউনিট ইকোনমিক্স" : "3 Financial Growth Scenarios & Unit Economics")}
              {activeModal === "leadership" && (locale === "bn" ? "প্রতিষ্ঠাতা ও কোর লিডারশিপ টিম" : "Founder & Core Leadership Team")}
            </h2>
            <p className="text-xs text-secondary mt-1">
              {activeModal === "modules" && (locale === "bn" ? "এফআর-০১ থেকে এফআর-১৫ পর্যন্ত প্রতিটি কার্যকরী মডিউলের বিস্তারিত তথ্য।" : "Technical specification and functional boundaries across Full B2B2C Workflow.")}
              {activeModal === "liveProduct" && (locale === "bn" ? "আমাদের প্রোডাকশন-রেডি সফটওয়্যার এখনই টেস্ট করুন।" : "Directly test live production features and verified workflows.")}
              {activeModal === "financials" && (locale === "bn" ? "রক্ষণশীল, বাস্তবসম্মত এবং উচ্চ প্রবৃদ্ধি অনুমিতির বিস্তারিত হিসাব।" : "Detailed revenue waterfall and transaction margin breakdown.")}
              {activeModal === "leadership" && (locale === "bn" ? "খলিফা আহম্মেদ আল-আমিনের নেতৃত্বে প্রযুক্তি ও ফিল্ড টিম।" : "Led by Kholipha Ahmmad Al-Amin with industry and full-stack advisors.")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-secondary hover:text-ink hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-4">
          {/* 1: MODULES MODAL */}
          {activeModal === "modules" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {PITCH_MODULES_LIST.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-xl border border-hairline bg-muted/30 p-4 transition-colors hover:border-accent/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      {mod.id}
                    </span>
                    <span className="text-[11px] font-mono text-subtle">
                      {mod.scope}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-ink mb-1.5">{mod.name[locale]}</h4>
                  <p className="text-xs text-secondary leading-relaxed mb-3">{mod.desc[locale]}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-hairline/60 text-[11px]">
                    <span className="font-semibold text-subtle">{mod.badge}</span>
                    <Link
                      href={mod.route}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                    >
                      {locale === "bn" ? "লাইভ রাউট" : "Live Route"}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2: LIVE PRODUCT MODAL */}
          {activeModal === "liveProduct" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-hairline bg-muted/40 p-4">
                  <span className="font-mono text-xs font-bold text-accent block mb-1">Feature 01</span>
                  <h4 className="text-sm font-bold text-ink mb-1.5">
                    {locale === "bn" ? "টাইলস ও স্যানিটারি মার্কেটপ্লেস" : "Materials Marketplace"}
                  </h4>
                  <p className="text-xs text-secondary mb-3">
                    {locale === "bn"
                      ? "ভেরিফায়েড শোরুমের ক্যাটালগ, সাইজ, ফিনিশ, স্টক ও বিডিটি দাম ফিল্টারিং।"
                      : "Faceted search across approved listings from certified Bangladesh showrooms."}
                  </p>
                  <Link
                    href="/marketplace"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    /marketplace <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="rounded-xl border border-hairline bg-muted/40 p-4">
                  <span className="font-mono text-xs font-bold text-accent block mb-1">Feature 02</span>
                  <h4 className="text-sm font-bold text-ink mb-1.5">
                    {locale === "bn" ? "২ডি/৩ডি রুম সারফেস ভিজ্যুয়ালাইজার" : "Room Surface Visualizer"}
                  </h4>
                  <p className="text-xs text-secondary mb-3">
                    {locale === "bn"
                      ? "লিভিং রুম ও বাথরুমে বিভিন্ন লেইং প্যাটার্ন ও গ্রাউট রঙে লাইভ সিমুলেশন।"
                      : "Interactive laying patterns, custom grout widths, and ambient lighting."}
                  </p>
                  <Link
                    href="/visualizer"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    /visualizer <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="rounded-xl border border-hairline bg-muted/40 p-4">
                  <span className="font-mono text-xs font-bold text-accent block mb-1">Feature 03</span>
                  <h4 className="text-sm font-bold text-ink mb-1.5">
                    {locale === "bn" ? "কনস্ট্রাকশন মিস্ত্রি ও ট্রান্সপোর্ট" : "Services & Transport Hub"}
                  </h4>
                  <p className="text-xs text-secondary mb-3">
                    {locale === "bn"
                      ? "যাচাইকৃত টাইলস ফিটিং মিস্ত্রি ডিরেক্টরি এবং ট্রাক ভাড়ার شفاف তালিকা।"
                      : "Verified installation masons and transparent district truck tariff matrix."}
                  </p>
                  <Link
                    href="/services"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    /services <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-ink mb-1">
                    {locale === "bn" ? "ইনস্ট্যান্ট পাইলট রোল টেস্ট" : "Instant Pilot Persona Testing"}
                  </h4>
                  <p className="text-xs text-secondary">
                    {locale === "bn"
                      ? "পাসওয়ার্ড ছাড়া এক ক্লিকে তানভীর (ক্রেতা), মাহমুদুল হাসান (ডিলার) বা অ্যাডমিন রোলে সরাসরি কাজ করুন।"
                      : "Switch instantaneously into Tanvir (Customer), Mahmudul (Dealer), or Operations Admin."}
                  </p>
                </div>
                <Link
                  href="/auth"
                  target="_blank"
                  className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold shrink-0 hover:bg-accent-hover transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  {locale === "bn" ? "টেস্ট পোর্টাল খুলুন" : "Open Auth Switcher"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* 3: FINANCIALS MODAL */}
          {activeModal === "financials" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PITCH_FINANCIAL_SCENARIOS.map((scen, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-hairline bg-muted/30 p-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-ink mb-3">{scen.title[locale]}</h4>
                      <div className="space-y-2 mb-4 font-mono text-xs">
                        <div className="flex justify-between border-b border-hairline pb-1">
                          <span className="text-secondary">Showrooms:</span>
                          <span className="font-bold text-ink">{scen.dealers}</span>
                        </div>
                        <div className="flex justify-between border-b border-hairline pb-1">
                          <span className="text-secondary">Orders/Yr:</span>
                          <span className="font-bold text-ink">{scen.annualOrders}</span>
                        </div>
                        <div className="flex justify-between border-b border-hairline pb-1">
                          <span className="text-secondary">GMV:</span>
                          <span className="font-bold text-accent">{scen.gmvBdt}</span>
                        </div>
                        <div className="flex justify-between border-b border-hairline pb-1">
                          <span className="text-secondary">Revenue:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{scen.revenueBdt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-secondary">Net Margin:</span>
                          <span className="font-bold text-ink">{scen.netMargin}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-secondary border-t border-hairline pt-2">
                      {scen.notes[locale]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-hairline bg-surface p-4 text-xs text-secondary leading-relaxed">
                <span className="font-bold text-ink block mb-1">
                  {locale === "bn" ? "ইউনিট ইকোনমিক্স ও আয়ের ভিত্তি:" : "Unit Economics & Revenue Drivers:"}
                </span>
                {locale === "bn"
                  ? "গড় আবাসিক অর্ডারের সাইজ ১ লাখ টাকা। প্রতিটি অর্ডারে ২% ট্রানজ্যাকশন কমিশন (২,০০০ টাকা) + পরিবহন সমন্বয় ফি (৩৫০ টাকা) = ২,৩৫০ টাকা ব্লেন্ডেড ট্রানজ্যাকশন রাজস্ব। ডিলার প্রতি মাসিক ৪,৫০০ টাকা ফি দীর্ঘমেয়াদী রিকারিং সাবস্ক্রিপশন সুরক্ষা প্রদান করে।"
                  : "Average residential tile procurement size is BDT 100K. Blended transaction revenue per order is BDT 2,350 (2% GMV fee + BDT 350 logistics fee). DigiTiles Pro dealer subscriptions at BDT 4,500/month provide strong high-margin recurring MRR."}
              </div>
            </div>
          )}

          {/* 4: LEADERSHIP MODAL */}
          {activeModal === "leadership" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PITCH_LEADERSHIP_TEAM.map((lead, idx) => (
                <div key={idx} className="rounded-xl border border-hairline bg-muted/30 p-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm">
                      {lead.name.en.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink leading-tight">{lead.name[locale]}</h4>
                      <span className="text-[11px] text-accent font-semibold block">{lead.role[locale]}</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-subtle mb-2">
                    {lead.experience[locale]}
                  </div>
                  <p className="text-xs text-secondary leading-relaxed mb-3">
                    {lead.bio[locale]}
                  </p>
                  <div className="pt-2 border-t border-hairline text-[11px] text-subtle">
                    <span className="font-semibold text-ink">Focus:</span> {lead.focusArea[locale]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-hairline flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-muted text-ink hover:bg-canvas border border-hairline text-xs font-semibold transition-colors"
          >
            {locale === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
