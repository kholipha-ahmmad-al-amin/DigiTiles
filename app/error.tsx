"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="bg-surface border border-hairline rounded-xl p-8 sm:p-10 space-y-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 text-xs font-mono font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>APPLICATION RECOVERY</span>
        </div>

        <h1 className="text-2xl font-bold text-ink">
          {locale === "bn"
            ? "পেজটি লোড করার সময় একটি সাময়িক ত্রুটি ঘটেছে"
            : "A temporary error occurred while loading this view"}
        </h1>

        <p className="text-xs text-secondary max-w-lg mx-auto leading-relaxed">
          {error?.message ||
            (locale === "bn"
              ? "অনুগ্রহ করে পেজটি পুনরায় লোড করুন অথবা মূল পাতায় ফিরে যান।"
              : "Please retry the action or return to the main marketplace hub.")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{locale === "bn" ? "পুনরায় চেষ্টা করুন" : "Try Again"}</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded border border-hairline bg-canvas hover:bg-muted text-ink text-xs font-semibold transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{locale === "bn" ? "মূল পাতায় যান" : "Return Home"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
