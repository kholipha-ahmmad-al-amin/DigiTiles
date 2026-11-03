"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  KeyRound,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { HOSTED_OTP_UNAVAILABLE } from "@/lib/i18n";
import { BANGLADESH_DISTRICTS } from "@/lib/seed-data";
import { GlobalRole } from "@/lib/types";

export default function AuthPage() {
  const router = useRouter();
  const { locale, user, refreshSession, quickSwitchPersona, switchRole } =
    useApp();

  const [phone, setPhone] = useState("+8801711223344");
  const [fullName, setFullName] = useState("Tanvir Ahmed");
  const [requestedRole, setRequestedRole] = useState<GlobalRole>("CUSTOMER");
  const [organizationTradeName, setOrganizationTradeName] = useState("");
  const [primaryDistrict, setPrimaryDistrict] = useState("Dhaka");

  const [otpStep, setOtpStep] = useState<"PHONE" | "VERIFY">("PHONE");
  const [otpCode, setOtpCode] = useState("246810");
  const [pilotOtpPreview, setPilotOtpPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.code === "HOSTED_OTP_UNAVAILABLE" ? HOSTED_OTP_UNAVAILABLE[locale] : json.error?.message || "Failed to send OTP.");
      }
      setPilotOtpPreview(json.data.pilotOtpCode);
      setOtpCode(json.data.pilotOtpCode);
      setOtpStep("VERIFY");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP request error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otpCode,
          fullName,
          requestedRole,
          organizationTradeName,
          primaryDistrict,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.code === "HOSTED_OTP_UNAVAILABLE" ? HOSTED_OTP_UNAVAILABLE[locale] : json.error?.message || "Invalid OTP code.");
      }
      await refreshSession();
      const targetRole: GlobalRole = json.data.user.activeRole;
      if (targetRole === "DEALER") {
        router.push("/workspace/dealer");
      } else if (targetRole === "ADMIN") {
        router.push("/workspace/admin");
      } else {
        router.push("/workspace/customer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification error.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrSwitchRole = async (targetRole: GlobalRole) => {
    setError(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      await switchRole(targetRole, organizationTradeName, primaryDistrict);
      setStatusMsg(
        locale === "bn"
          ? `সক্রিয় ওয়ার্কস্পেস ${targetRole}-এ পরিবর্তন করা হয়েছে।`
          : `Active workspace switched to ${targetRole}.`
      );
      setTimeout(() => {
        router.push(
          targetRole === "DEALER"
            ? "/workspace/dealer"
            : targetRole === "ADMIN"
            ? "/workspace/admin"
            : "/workspace/customer"
        );
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role switch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
          SCR-04 | IDENTITY, PHONE OTP & MULTI-ROLE WORKSPACES (FR-01, FR-02)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">
          {locale === "bn"
            ? "ফোন ওটিপি লগইন এবং একক পরিচয়ে একাধিক রোল ব্যবস্থাপনা"
            : "Phone OTP Sign-In & Canonical Multi-Role Identity"}
        </h1>
        <p className="text-sm text-secondary max-w-3xl">
          {locale === "bn"
            ? "DigiTiles-এ একটিমাত্র মোবাইল নাম্বার দিয়েই আপনি ক্রেতা (Customer) এবং ডিলার (Dealer) উভয় রোল ব্যবহার করতে পারবেন। আলাদা অ্যাকাউন্ট খোলার প্রয়োজন নেই (Business Rule 1)।"
            : "One canonical Bangladesh phone identity can hold multiple roles without duplicate accounts. Switch cleanly between Customer, Dealer, and Admin workspaces (Business Rule 1)."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Phone OTP Flow + Active Identity Role Manager */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface border border-hairline rounded-lg p-6 space-y-5">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2 border-b border-hairline pb-3">
              <Phone className="w-5 h-5 text-accent" />
              <span>
                {locale === "bn"
                  ? "বাংলাদেশ মোবাইল নাম্বার দিয়ে ওটিপি লগইন (FR-01)"
                  : "Sign In or Register with Bangladesh Phone OTP (FR-01)"}
              </span>
            </h2>

            {otpStep === "PHONE" ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label
                    htmlFor="auth-phone"
                    className="block text-xs font-semibold text-ink mb-1"
                  >
                    {locale === "bn"
                      ? "মোবাইল নাম্বার (+8801XXXXXXXXX বা 01XXXXXXXXX)"
                      : "Bangladesh Mobile Number"}
                  </label>
                  <input
                    id="auth-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801711223344"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded border border-hairline bg-canvas text-sm font-mono text-ink"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold text-ink mb-1"
                  >
                    {locale === "bn"
                      ? "আপনার নাম (নতুন অ্যাকাউন্টের জন্য)"
                      : "Full Name (for new registration)"}
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tanvir Ahmed"
                    className="w-full min-h-[42px] px-3.5 py-2 rounded border border-hairline bg-canvas text-sm text-ink"
                  />
                </div>

                <div>
                  <span className="block text-xs font-semibold text-ink mb-1.5">
                    {locale === "bn"
                      ? "প্রাথমিক ওয়ার্কস্পেস নির্বাচন করুন (FR-02)"
                      : "Select Primary Workspace Role (FR-02)"}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRequestedRole("CUSTOMER")}
                      className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                        requestedRole === "CUSTOMER"
                          ? "border-accent bg-muted font-semibold text-ink"
                          : "border-hairline bg-canvas text-secondary"
                      }`}
                    >
                      <div className="font-bold text-ink">
                        {locale === "bn"
                          ? "ক্রেতা / প্রজেক্ট বায়ার"
                          : "Customer / Project Buyer"}
                      </div>
                      <div className="text-[11px] text-subtle mt-0.5">
                        {locale === "bn"
                          ? "ক্যাটালগ দেখা, আরএফকিউ ও অর্ডার"
                          : "Browse, submit RFQs, accept quotes"}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRequestedRole("DEALER")}
                      className={`p-3 rounded border text-left text-xs cursor-pointer transition-colors ${
                        requestedRole === "DEALER"
                          ? "border-accent bg-muted font-semibold text-ink"
                          : "border-hairline bg-canvas text-secondary"
                      }`}
                    >
                      <div className="font-bold text-ink">
                        {locale === "bn"
                          ? "ডিলার / টাইলস শোরুম"
                          : "Dealer / Showroom Owner"}
                      </div>
                      <div className="text-[11px] text-subtle mt-0.5">
                        {locale === "bn"
                          ? "পণ্য যোগ, কোটেশন প্রদান ও ডিসপ্যাচ"
                          : "Publish catalogue, quote RFQs, dispatch"}
                      </div>
                    </button>
                  </div>
                </div>

                {requestedRole === "DEALER" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded bg-canvas border border-hairline">
                    <div>
                      <label
                        htmlFor="org-trade-name"
                        className="block text-xs font-semibold text-ink mb-1"
                      >
                        {locale === "bn"
                          ? "শোরুম বা প্রতিষ্ঠানের নাম"
                          : "Showroom / Company Name"}
                      </label>
                      <input
                        id="org-trade-name"
                        type="text"
                        value={organizationTradeName}
                        onChange={(e) =>
                          setOrganizationTradeName(e.target.value)
                        }
                        placeholder="e.g., Mirpur Ceramic Point"
                        className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface text-xs text-ink"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="org-district"
                        className="block text-xs font-semibold text-ink mb-1"
                      >
                        {locale === "bn" ? "প্রধান জেলা" : "Primary District"}
                      </label>
                      <select
                        id="org-district"
                        value={primaryDistrict}
                        onChange={(e) => setPrimaryDistrict(e.target.value)}
                        className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-surface text-xs text-ink"
                      >
                        {BANGLADESH_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="p-3 rounded bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 text-xs font-medium"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white font-semibold text-sm cursor-pointer transition-colors"
                >
                  {loading
                    ? "Sending OTP..."
                    : locale === "bn"
                    ? "ওটিপি কোড পাঠান (Send OTP)"
                    : "Send 6-Digit Phone OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 rounded bg-muted border border-hairline text-xs space-y-1">
                  <div className="font-semibold text-ink">
                    {locale === "bn"
                      ? `${phone} নাম্বারে ৬-সংখ্যার ওটিপি পাঠানো হয়েছে`
                      : `6-digit OTP challenge generated for ${phone}`}
                  </div>
                  <div className="font-mono text-accent">
                    {locale === "bn"
                      ? `পাইলট স্যান্ডবক্স ওটিপি কোড: ${pilotOtpPreview || "246810"}`
                      : `Zero-Cost Pilot Sandbox OTP Code: ${
                          pilotOtpPreview || "246810"
                        }`}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="otp-code-input"
                    className="block text-xs font-semibold text-ink mb-1"
                  >
                    {locale === "bn"
                      ? "৬-সংখ্যার ওটিপি কোড লিখুন"
                      : "Enter 6-Digit OTP Code"}
                  </label>
                  <input
                    id="otp-code-input"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2 rounded border border-hairline bg-canvas text-lg font-mono font-bold tracking-widest text-ink"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="p-3 rounded bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200 text-xs font-medium"
                  >
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 min-h-[44px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white font-semibold text-sm cursor-pointer transition-colors"
                  >
                    {loading
                      ? "Verifying..."
                      : locale === "bn"
                      ? "ওটিপি যাচাই ও লগইন করুন"
                      : "Verify OTP & Enter Workspace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpStep("PHONE")}
                    className="min-h-[44px] px-4 py-2.5 rounded border border-hairline bg-canvas text-xs font-semibold text-ink cursor-pointer"
                  >
                    {locale === "bn" ? "নাম্বার পরিবর্তন" : "Change Phone"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Active Multi-Role Switcher Card if Authenticated (FR-02) */}
          {user && (
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent-teal" />
                  <h2 className="text-base font-bold text-ink">
                    {locale === "bn"
                      ? "আপনার বর্তমান পরিচয় ও মাল্টি-রোল সুইচার (FR-02)"
                      : "Your Canonical Identity & Multi-Role Manager (FR-02)"}
                  </h2>
                </div>
                <span className="font-mono text-xs text-subtle">
                  {user.phone}
                </span>
              </div>

              <p className="text-xs text-secondary">
                {locale === "bn"
                  ? `লগইনকৃত ব্যবহারকারী: ${user.fullName} | সক্রিয় রোলসমূহ: ${user.roles.join(
                      ", "
                    )}`
                  : `Signed in as ${user.fullName} | Assigned Roles: ${user.roles.join(
                      ", "
                    )}`}
              </p>

              {statusMsg && (
                <div className="p-3 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-semibold">
                  {statusMsg}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleAddOrSwitchRole("CUSTOMER")}
                  className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink cursor-pointer"
                >
                  {locale === "bn"
                    ? "ক্রেতা ওয়ার্কস্পেসে যান (Customer)"
                    : "Switch to Customer Workspace"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOrSwitchRole("DEALER")}
                  className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink cursor-pointer"
                >
                  {user.roles.includes("DEALER")
                    ? locale === "bn"
                      ? "ডিলার পোর্টালে যান (Dealer)"
                      : "Switch to Dealer Portal"
                    : locale === "bn"
                    ? "+ ডিলার রোল যুক্ত করুন (Add Dealer Role)"
                    : "+ Activate Dealer Role on This Account"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Instant One-Click Pilot Persona Accounts */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-lg p-6 space-y-4">
          <div className="border-b border-hairline pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-teal font-bold">
              INSTANT PILOT ACCOUNTS
            </span>
            <h2 className="text-lg font-bold text-ink mt-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? "এক ক্লিকে ডেমো অ্যাকাউন্টে প্রবেশ করুন"
                  : "One-Click Pilot Persona Access"}
              </span>
            </h2>
            <p className="text-xs text-secondary mt-1">
              {locale === "bn"
                ? "সবগুলো ওয়ার্কস্পেস (ক্রেতা, ভেরিফায়েড ডিলার, পেন্ডিং ডিলার এবং অ্যাডমিন) দ্রুত পরীক্ষার জন্য নিচের যেকোনো প্রোফাইলে ক্লিক করুন:"
                : "Select any pre-seeded Bangladesh persona below to inspect their live RFQs, quotations, orders, or moderation queues immediately:"}
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={async () => {
                await quickSwitchPersona("usr_customer_01", "CUSTOMER");
                router.push("/workspace/customer");
              }}
              className="w-full p-4 rounded border border-hairline bg-canvas hover:bg-muted text-left transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                  <span>Tanvir Ahmed (Project Buyer)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-mono font-bold">
                  CUSTOMER
                </span>
              </div>
              <p className="text-xs text-secondary">
                Has an active Quotation (QT-2026-5001-V1) ready to accept and an in-transit Order (ORD-2026-9001).
              </p>
            </button>

            <button
              type="button"
              onClick={async () => {
                await quickSwitchPersona("usr_dealer_01", "DEALER");
                router.push("/workspace/dealer");
              }}
              className="w-full p-4 rounded border border-hairline bg-canvas hover:bg-muted text-left transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-accent-teal" />
                  <span>Hatirpool Ceramic Emporium</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-mono font-bold">
                  VERIFIED DEALER
                </span>
              </div>
              <p className="text-xs text-secondary">
                Mahmudul Hasan (Owner). Manage multi-branch catalogue, quote incoming RFQ-2026-1002, and dispatch orders.
              </p>
            </button>

            <button
              type="button"
              onClick={async () => {
                await quickSwitchPersona("usr_dealer_pending", "DEALER");
                router.push("/workspace/dealer/organization");
              }}
              className="w-full p-4 rounded border border-hairline bg-canvas hover:bg-muted text-left transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-subtle" />
                  <span>Surma Ceramic Center (Sylhet)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-muted border border-hairline text-ink text-xs font-mono font-semibold">
                  SUBMITTED
                </span>
              </div>
              <p className="text-xs text-secondary">
                Shafiqul Alam. Inspect a dealer organization awaiting Platform Admin verification (Business Rule 2).
              </p>
            </button>

            <button
              type="button"
              onClick={async () => {
                await quickSwitchPersona("usr_admin_01", "ADMIN");
                router.push("/workspace/admin");
              }}
              className="w-full p-4 rounded border border-hairline bg-canvas hover:bg-muted text-left transition-colors cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>Nusrat Jahan (Platform Admin)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 text-xs font-mono font-bold">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-secondary">
                Approve dealer verifications, moderate pending listings (AKIJ-ONYX-8080-GL), monitor disputes, and audit logs.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
