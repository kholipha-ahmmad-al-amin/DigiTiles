"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Cloud,
  Database,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { BANGLADESH_DISTRICTS } from "@/lib/seed-data";
import { GlobalRole } from "@/lib/types";
import {
  loginWithEmailPassword,
  loginWithGooglePopup,
  registerWithEmailPassword,
} from "@/lib/firebase-client";

interface CloudStatusData {
  ok: boolean;
  service: string;
  provider: string;
  d1Database: string;
  firebaseProject: string;
  platformDomain: string;
  stateVersion: number;
  lastSyncedAt: string | null;
  relationalTables: {
    users: number;
    organizations: number;
    dealerListings: number;
    rfqs: number;
    quotations: number;
    orders: number;
    auditLogs: number;
  };
}

export default function AuthPage() {
  const router = useRouter();
  const { locale, user, refreshSession, switchRole } = useApp();

  const [emailMode, setEmailMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [requestedRole, setRequestedRole] = useState<GlobalRole>("CUSTOMER");
  const [organizationTradeName, setOrganizationTradeName] = useState("");
  const [primaryDistrict, setPrimaryDistrict] = useState("Dhaka");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<CloudStatusData | null>(null);

  useEffect(() => {
    fetch("/api/cloud/status")
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok && json?.data) {
          setCloudStatus(json.data);
        }
      })
      .catch(() => {
        // non-blocking status indicator
      });
  }, []);

  const routeByRole = (targetRole: GlobalRole) => {
    if (targetRole === "DEALER") {
      router.push("/workspace/dealer");
    } else if (targetRole === "ADMIN") {
      router.push("/workspace/admin");
    } else {
      router.push("/workspace/customer");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      const fbUser = await loginWithGooglePopup();
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: fbUser.idToken,
          provider: "GOOGLE",
          mode: "LOGIN",
          fullName: fbUser.displayName || fullName,
          phone,
          requestedRole,
          organizationTradeName,
          primaryDistrict,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Google authentication failed.");
      }
      await refreshSession();
      routeByRole(json.data.user.activeRole);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Google Sign-In interrupted."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setLoading(true);
    try {
      let idToken = "";
      let resolvedDisplayName = fullName;
      try {
        const fbUser =
          emailMode === "REGISTER"
            ? await registerWithEmailPassword(email, password, fullName)
            : await loginWithEmailPassword(email, password);
        idToken = fbUser.idToken;
        resolvedDisplayName = fbUser.displayName || fullName;
      } catch (fbErr) {
        if (emailMode === "REGISTER") {
          throw fbErr;
        }
      }

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          email,
          password,
          mode: emailMode,
          provider: "EMAIL",
          fullName: resolvedDisplayName,
          phone,
          requestedRole,
          organizationTradeName,
          primaryDistrict,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error?.message || "Invalid email or password credentials."
        );
      }
      await refreshSession();
      routeByRole(json.data.user.activeRole);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Email authentication error."
      );
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
        routeByRole(targetRole);
      }, 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role switch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-stage">
      <div className="auth-intro space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-accent font-bold">
          ACCOUNT ACCESS & MULTI-ROLE IDENTITY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">
          {locale === "bn"
            ? "ডিজি-টাইলস অ্যাকাউন্টে সাইন-ইন ও ওয়ার্কস্পেস ব্যবস্থাপনা"
            : "Sign In to DigiTiles & Manage Your Workspaces"}
        </h1>
        <p className="text-sm text-secondary max-w-3xl">
          {locale === "bn"
            ? "আপনার গুগল অ্যাকাউন্ট, ইমেইল ও পাসওয়ার্ড অথবা ভেরিফায়েড মোবাইল নাম্বার দিয়ে লগইন করুন। একটি একক পরিচয়েই আপনি ক্রেতা (Customer), ডিলার শোরুম (Dealer) এবং অনুমোদিত অ্যাডমিন প্যানেল ব্যবহার করতে পারবেন।"
            : "Sign in with Google or Email and Password. Manage Customer, Dealer Showroom, and Admin operations from one unified account."}
        </p>
      </div>

      {/* Live Cloud Production Status Banner */}
      <div className="auth-cloud flex flex-col justify-between gap-3 rounded-lg border border-hairline bg-surface p-4 sm:flex-row sm:items-center">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-ink flex flex-wrap items-center gap-2">
              <span>CLOUDFLARE D1 & FIREBASE AUTHENTICATION</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 font-mono text-[10px]">
                {cloudStatus?.ok ? "PRODUCTION ONLINE" : "CONNECTED"}
              </span>
            </div>
            <p className="text-xs text-secondary mt-0.5 font-mono">
              Firebase: {cloudStatus?.firebaseProject || "digitiles-bd"} | D1 Database: {cloudStatus?.d1Database || "digitiles-prod-db"} | Edge API: api.digitiles.equisaas-bd.com
            </p>
          </div>
        </div>
        {cloudStatus?.relationalTables && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-subtle">
            <Database className="w-3.5 h-3.5 text-accent-teal shrink-0" />
            <span>
              {cloudStatus.relationalTables.users} Users | {cloudStatus.relationalTables.dealerListings} Listings | {cloudStatus.relationalTables.rfqs} RFQs | {cloudStatus.relationalTables.orders} Orders
            </span>
          </div>
        )}
      </div>

      <div className="auth-bench">
        <div className="space-y-6">
          <div className="bg-surface border border-hairline rounded-lg p-6 space-y-5">
              <div className="space-y-5">
                {/* Google Sign-In Button */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleGoogleSignIn}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded border border-hairline bg-canvas hover:bg-muted text-ink font-semibold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2.5"
                  >
                    <Globe className="w-4 h-4 text-accent" />
                    <span>
                      {loading
                        ? "Connecting to Google..."
                        : locale === "bn"
                        ? "গুগল দিয়ে সাইন-ইন"
                        : "Continue with Google"}
                    </span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-hairline" />
                  <span className="shrink mx-3 text-[11px] font-mono uppercase text-subtle">
                    {locale === "bn" ? "অথবা ইমেইল ও পাসওয়ার্ড" : "OR EMAIL & PASSWORD"}
                  </span>
                  <div className="grow border-t border-hairline" />
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-accent-teal" />
                      <span>
                        {emailMode === "LOGIN"
                          ? locale === "bn"
                            ? "ইমেইল ও পাসওয়ার্ড দিয়ে লগইন"
                            : "Sign In with Email & Password"
                          : locale === "bn"
                          ? "নতুন অ্যাকাউন্ট রেজিস্ট্রেশন"
                          : "Create a New Account"}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailMode(emailMode === "LOGIN" ? "REGISTER" : "LOGIN");
                        setError(null);
                      }}
                      className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                    >
                      {emailMode === "LOGIN"
                        ? locale === "bn"
                          ? "নতুন অ্যাকাউন্ট খুলুন"
                          : "Create new account"
                        : locale === "bn"
                        ? "আগে থেকেই অ্যাকাউন্ট আছে? লগইন"
                        : "Already have an account? Sign In"}
                    </button>
                  </div>

                  {emailMode === "REGISTER" && (
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor="fb-full-name"
                            className="block text-xs font-semibold text-ink mb-1"
                          >
                            {locale === "bn" ? "আপনার পূর্ণ নাম" : "Full Name"}
                          </label>
                          <input
                            id="fb-full-name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full min-h-[40px] px-3 py-2 rounded border border-hairline bg-canvas text-xs text-ink"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="fb-phone"
                            className="block text-xs font-semibold text-ink mb-1"
                          >
                            {locale === "bn" ? "মোবাইল নাম্বার" : "Bangladesh Mobile"}
                          </label>
                          <input
                            id="fb-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+8801XXXXXXXXX"
                            className="w-full min-h-[40px] px-3 py-2 rounded border border-hairline bg-canvas text-xs font-mono text-ink"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-xs font-semibold text-ink mb-1.5">
                          {locale === "bn"
                            ? "অ্যাকাউন্টের ধরন নির্বাচন করুন"
                            : "Select Account Type"}
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
                                ? "টাইলস যাচাই, আরএফকিউ ও অর্ডার"
                                : "Compare tiles, request quotes, order"}
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
                                : "Dealer / Tile Showroom"}
                            </div>
                            <div className="text-[11px] text-subtle mt-0.5">
                              {locale === "bn"
                                ? "পণ্য ক্যাটালগ, কোটেশন ও ডেলিভারি"
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
                              required
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
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="fb-email"
                      className="block text-xs font-semibold text-ink mb-1"
                    >
                      {locale === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full min-h-[42px] px-3.5 py-2 rounded border border-hairline bg-canvas text-sm text-ink"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fb-password"
                      className="block text-xs font-semibold text-ink mb-1"
                    >
                      {locale === "bn" ? "পাসওয়ার্ড" : "Password"}
                    </label>
                    <div className="relative">
                      <input
                        id="fb-password"
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full min-h-[42px] px-3.5 py-2 rounded border border-hairline bg-canvas text-sm text-ink"
                      />
                      <Lock className="w-4 h-4 text-subtle absolute right-3 top-3" />
                    </div>
                  </div>

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
                      ? "Authenticating..."
                      : emailMode === "REGISTER"
                      ? locale === "bn"
                        ? "অ্যাকাউন্ট তৈরি ও প্রবেশ করুন"
                        : "Create Account & Continue"
                      : locale === "bn"
                      ? "ইমেইল দিয়ে সাইন-ইন করুন"
                      : "Sign In with Email"}
                  </button>
                </form>
              </div>
          </div>

          {/* Active Multi-Role Switcher Card if Authenticated */}
          {user && (
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent-teal" />
                  <h2 className="text-base font-bold text-ink">
                    {locale === "bn"
                      ? "আপনার সক্রিয় অ্যাকাউন্ট ও ওয়ার্কস্পেস সুইচার"
                      : "Your Active Identity & Workspace Manager"}
                  </h2>
                </div>
                <span className="font-mono text-xs text-subtle">
                  {user.email || user.phone}
                </span>
              </div>

              <p className="text-xs text-secondary">
                {locale === "bn"
                  ? `লগইনকৃত ব্যবহারকারী: ${user.fullName} | অনুমোদিত রোলসমূহ: ${user.roles.join(
                      ", "
                    )}`
                  : `Signed in as ${user.fullName} | Authorized Roles: ${user.roles.join(
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
                    ? "ক্রেতা ড্যাশবোর্ডে যান (Customer)"
                    : "Open Customer Workspace"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAddOrSwitchRole("DEALER")}
                  className="min-h-[40px] px-4 py-2 rounded border border-hairline bg-canvas hover:bg-muted text-xs font-semibold text-ink cursor-pointer"
                >
                  {user.roles.includes("DEALER")
                    ? locale === "bn"
                      ? "ডিলার পোর্টালে যান (Dealer)"
                      : "Open Dealer Portal"
                    : locale === "bn"
                    ? "+ ডিলার রোল সক্রিয় করুন"
                    : "+ Activate Dealer Role"}
                </button>
                {user.roles.includes("ADMIN") && (
                  <button
                    type="button"
                    onClick={() => handleAddOrSwitchRole("ADMIN")}
                    className="min-h-[40px] px-4 py-2 rounded border border-accent bg-muted text-xs font-semibold text-ink cursor-pointer"
                  >
                    {locale === "bn"
                      ? "অ্যাডমিন কন্ট্রোল প্যানেল (Admin)"
                      : "Open Admin Console"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Production Workspace Architecture & Role Capabilities */}
        <div className="space-y-4 rounded-lg border border-hairline bg-surface p-6">
          <div className="border-b border-hairline pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-accent-teal font-bold">
              ROLE-BASED WORKSPACES
            </span>
            <h2 className="text-lg font-bold text-ink mt-1">
              {locale === "bn"
                ? "একক পরিচয়ে সম্পূর্ণ কনস্ট্রাকশন ইকোসিস্টেম"
                : "Unified Construction Commerce Access"}
            </h2>
            <p className="text-xs text-secondary mt-1">
              {locale === "bn"
                ? "DigiTiles-এ আপনার অনুমোদিত রোলের ওপর ভিত্তি করে নিচের বিশেষায়িত ওয়ার্কস্পেসগুলো স্বয়ংক্রিয়ভাবে সক্রিয় হয়:"
                : "Your authenticated DigiTiles account unlocks role-scoped workspaces backed by Cloudflare D1 and Firebase Authentication:"}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                  <span>
                    {locale === "bn"
                      ? "ক্রেতা ও প্রজেক্ট বায়ার ওয়ার্কস্পেস"
                      : "Customer & Project Buyer Workspace"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-mono font-bold">
                  CUSTOMER
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "ভেরিফায়েড শোরুম থেকে টাইলস তুলনা করুন, বক্স ও ওয়েস্টেজ হিসাব করুন, আইটেমাইজড আরএফকিউ পাঠান এবং প্রোফর্মা ইনভয়েস ও ডেলিভারি চালান ট্র্যাক করুন।"
                  : "Compare verified showroom listings, calculate required boxes with wastage, request itemized BDT quotes, and track confirmed orders and challans."}
              </p>
            </div>

            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-accent-teal" />
                  <span>
                    {locale === "bn"
                      ? "ভেরিফায়েড ডিলার ও শোরুম পোর্টাল"
                      : "Verified Dealer & Showroom Portal"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-mono font-bold">
                  DEALER
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "শোরুমের ট্রেড লাইসেন্স ও টিআইএন জমা দিয়ে ভেরিফিকেশন সম্পন্ন করুন, মাল্টি-ব্রাঞ্চ শেড/ব্যাচ লট স্টক পরিচালনা করুন এবং ক্রেতাদের আরএফকিউ-তে কোটেশন পাঠান।"
                  : "Submit trade license and TIN credentials for verification, manage multi-branch batch/shade lot inventory, issue binding BDT quotations, and coordinate dispatch."}
              </p>
            </div>

            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>
                    {locale === "bn"
                      ? "প্ল্যাটফর্ম গভর্ন্যান্স ও অ্যাডমিন প্যানেল"
                      : "Platform Governance & Admin Console"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 text-xs font-mono font-bold">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "ডিলার শোরুম ভেরিফিকেশন অনুমোদন, নতুন পণ্য ক্যাটালগ মডারেশন, অর্ডার ডিসপিউট নিষ্পত্তি এবং অপরিবর্তনীয় অডিট লগ পর্যবেক্ষণ।"
                  : "Restricted to authorized platform administrators for showroom verification, catalogue moderation, dispute resolution, and immutable audit inspection."}
              </p>
            </div>

            <div className="p-3.5 rounded bg-muted border border-hairline flex items-start gap-2.5 text-xs text-secondary">
              <CheckCircle2 className="w-4 h-4 text-accent-teal shrink-0 mt-0.5" />
              <span>
                {locale === "bn"
                  ? "সকল সেশন HMAC-SHA256 স্বাক্ষরিত HTTP-Only কুকি, Firebase Identity Toolkit এবং Cloudflare D1 রিলেশনাল ডাটাবেস দ্বারা সুরক্ষিত।"
                  : "All sessions are secured via HMAC-SHA256 HTTP-Only cookies, Firebase Identity Toolkit verification, and Cloudflare D1 transactional persistence."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
