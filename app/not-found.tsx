"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Box, Compass, Home, Layers, Truck } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export default function NotFound() {
  const { locale } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-surface border border-hairline rounded-xl p-8 sm:p-12 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-hairline text-xs font-mono font-bold text-accent uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>HTTP 404 | PAGE NOT FOUND</span>
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-ink tracking-tight">
            {locale === "bn"
              ? "আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি"
              : "The requested page could not be found"}
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            {locale === "bn"
              ? "লিঙ্কটি পরিবর্তিত হয়ে থাকতে পারে অথবা পণ্যটি ক্যাটালগ থেকে সরানো হয়েছে। নিচের যেকোনো মূল মডিউল থেকে আপনার প্রয়োজনীয় সেবা বা টাইলস খুঁজে নিন।"
              : "The URL may have changed or the listing is no longer active. Use any of the primary platform modules below to continue browsing DigiTiles."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 text-left">
          <Link
            href="/"
            className="p-4 rounded-lg border border-hairline bg-canvas hover:bg-muted transition-colors space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Home className="w-4 h-4 text-accent" />
              <span>{locale === "bn" ? "মূল পাতা" : "Home Hub"}</span>
            </div>
            <p className="text-[11px] text-secondary">
              {locale === "bn"
                ? "ডিজি-টাইলস হোমপেজে ফিরে যান"
                : "Return to the main platform overview"}
            </p>
          </Link>

          <Link
            href="/marketplace"
            className="p-4 rounded-lg border border-hairline bg-canvas hover:bg-muted transition-colors space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Layers className="w-4 h-4 text-accent-teal" />
              <span>{locale === "bn" ? "মার্কেটপ্লেস" : "Marketplace"}</span>
            </div>
            <p className="text-[11px] text-secondary">
              {locale === "bn"
                ? "ভেরিফায়েড টাইলস ও স্যানিটারি ক্যাটালগ"
                : "Browse verified showroom listings"}
            </p>
          </Link>

          <Link
            href="/visualizer"
            className="p-4 rounded-lg border border-hairline bg-canvas hover:bg-muted transition-colors space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Box className="w-4 h-4 text-accent" />
              <span>
                {locale === "bn" ? "রুম ভিজ্যুয়ালাইজার" : "Room Visualizer"}
              </span>
            </div>
            <p className="text-[11px] text-secondary">
              {locale === "bn"
                ? "লেআউট প্রিভিউ ও বক্স ক্যালকুলেটর"
                : "Preview patterns & estimate boxes"}
            </p>
          </Link>

          <Link
            href="/services"
            className="p-4 rounded-lg border border-hairline bg-canvas hover:bg-muted transition-colors space-y-1"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-ink">
              <Truck className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn" ? "মিস্ত্রি ও পরিবহন" : "Crews & Transport"}
              </span>
            </div>
            <p className="text-[11px] text-secondary">
              {locale === "bn"
                ? "টাইলস মিস্ত্রি ও ডেলিভারি ট্রাক ডিরেক্টরি"
                : "Verified installation crews & trucks"}
            </p>
          </Link>
        </div>

        <div className="pt-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {locale === "bn"
                ? "মার্কেটপ্লেসে ফিরে যান"
                : "Browse Tile Marketplace"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
