"use client";

import React from "react";
import Link from "next/link";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { GlobalRole } from "@/lib/types";

interface WorkspaceGuardProps {
  requiredRole: GlobalRole;
  children: React.ReactNode;
}

export function WorkspaceGuard({
  requiredRole,
  children,
}: WorkspaceGuardProps) {
  const { locale, user, loadingSession, switchRole } = useApp();

  if (loadingSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-hairline rounded-xl p-8 text-center text-sm text-secondary">
          {locale === "bn"
            ? "অ্যাকাউন্ট সেশন যাচাই করা হচ্ছে..."
            : "Verifying authenticated workspace session..."}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-hairline rounded-xl p-8 sm:p-10 space-y-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-hairline text-xs font-mono font-bold text-accent uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>

          <h1 className="text-2xl font-bold text-ink">
            {locale === "bn"
              ? "এই ওয়ার্কস্পেসে প্রবেশ করতে সাইন-ইন করুন"
              : "Sign in to access this workspace"}
          </h1>

          <p className="text-sm text-secondary max-w-lg mx-auto leading-relaxed">
            {locale === "bn"
              ? "আপনার গুগল অ্যাকাউন্ট, ইমেইল ও পাসওয়ার্ড অথবা ভেরিফায়েড মোবাইল নাম্বার দিয়ে সাইন-ইন করে আপনার ড্যাশবোর্ডে প্রবেশ করুন।"
              : "Please sign in with Google, Email and Password, or your verified Bangladesh mobile number to access your workspace."}
          </p>

          <div className="pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {locale === "bn"
                  ? "সাইন-ইন পেজে যান"
                  : "Continue to Sign In"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user.roles.includes(requiredRole)) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-surface border border-hairline rounded-xl p-8 sm:p-10 space-y-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ROLE AUTHORIZATION REQUIRED</span>
          </div>

          <h1 className="text-2xl font-bold text-ink">
            {requiredRole === "ADMIN"
              ? locale === "bn"
                ? "শুধুমাত্র অনুমোদিত প্ল্যাটফর্ম অ্যাডমিনদের জন্য সংরক্ষিত"
                : "Restricted to Authorized Platform Administrators"
              : locale === "bn"
              ? "এই ওয়ার্কস্পেস ব্যবহারের জন্য উপযুক্ত রোল সক্রিয় করুন"
              : "Activate the required role to access this workspace"}
          </h1>

          <p className="text-sm text-secondary max-w-lg mx-auto leading-relaxed">
            {requiredRole === "ADMIN"
              ? locale === "bn"
                ? `আপনি বর্তমানে ${user.fullName} (${user.email || user.phone}) হিসেবে লগইন করেছেন। অ্যাডমিন কনসোলে প্রবেশ করতে অনুমোদিত অ্যাডমিন অ্যাকাউন্ট দিয়ে সাইন-ইন করুন।`
                : `You are signed in as ${user.fullName} (${user.email || user.phone}). Please sign in with an authorized Administrator account to access the Admin Console.`
              : locale === "bn"
              ? "আপনার বর্তমান অ্যাকাউন্টে এই রোলটি যুক্ত করে তাৎক্ষণিক ওয়ার্কস্পেস ব্যবহার শুরু করতে পারেন।"
              : "You can activate this role on your current account or switch accounts from the authentication page."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {requiredRole !== "ADMIN" && (
              <button
                type="button"
                onClick={() => switchRole(requiredRole)}
                className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {locale === "bn"
                  ? `${requiredRole} রোল সক্রিয় করুন`
                  : `Activate ${requiredRole} Role`}
              </button>
            )}
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 min-h-[42px] px-5 py-2.5 rounded border border-hairline bg-canvas hover:bg-muted text-ink text-xs font-semibold transition-colors"
            >
              {locale === "bn"
                ? "অ্যাকাউন্ট পরিবর্তন করুন"
                : "Switch Account"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
