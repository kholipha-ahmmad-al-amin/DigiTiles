"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
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

  const [busy, setBusy] = useState<null | "google" | "email" | "role">(null);
  const loading = busy !== null;
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
    setBusy("google");
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
      setBusy(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMsg(null);
    setBusy("email");
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
      setBusy(null);
    }
  };

  const handleAddOrSwitchRole = async (targetRole: GlobalRole) => {
    setError(null);
    setStatusMsg(null);
    setBusy("role");
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
      setBusy(null);
    }
  };

  return (
    <div className="auth-stage">
      <div className="auth-intro space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-ink">
          {locale === "bn" ? "অ্যাকাউন্টে প্রবেশ" : "Sign in"}
        </h1>
        <p className="text-sm text-secondary max-w-2xl leading-relaxed">
          {locale === "bn"
            ? "গুগল, ইমেইল বা ফোন নম্বর দিয়ে লগইন করুন। একই অ্যাকাউন্টে ক্রেতা, ডিলার বা (অনুমোদিত হলে) অ্যাডমিন ওয়ার্কস্পেস খুলে নিতে পারবেন।"
            : "Sign in with Google, email, or phone. The same account can open the buyer, dealer, or admin workspace when you have access."}
        </p>
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
                      {busy === "google"
                        ? "Connecting to Google..."
                        : locale === "bn"
                        ? "গুগল দিয়ে সাইন-ইন"
                        : "Continue with Google"}
                    </span>
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="grow border-t border-hairline" />
                  <span className="shrink mx-3 text-xs text-subtle">
                    {locale === "bn" ? "অথবা" : "or"}
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
                    {busy === "email"
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
                    {locale === "bn" ? "আপনার ওয়ার্কস্পেস" : "Your workspaces"}
                  </h2>
                </div>
                <span className="font-mono text-xs text-subtle">
                  {user.email || user.phone}
                </span>
              </div>

              <p className="text-xs text-secondary">
                {locale === "bn"
                  ? `${user.fullName} হিসেবে আছেন। উপলব্ধ ভূমিকা: ${user.roles.join(", ")}।`
                  : `Signed in as ${user.fullName}. Available roles: ${user.roles.join(", ")}.`}
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

        <aside className="space-y-4 rounded-lg border border-hairline bg-surface p-6" aria-labelledby="auth-workspaces-title">
          <div className="border-b border-hairline pb-3">
            <h2 id="auth-workspaces-title" className="text-lg font-bold text-ink">
              {locale === "bn" ? "একটি অ্যাকাউন্ট, তিন ধরনের কাজ" : "One account, three workspaces"}
            </h2>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              {locale === "bn"
                ? "আপনি যে ভূমিকায় কাজ করবেন, সেই অনুযায়ী মেনু ও টুল বদলে যাবে।"
                : "Menus and tools change depending on whether you are buying, selling, or moderating the platform."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-accent" />
                  <span>
                    {locale === "bn" ? "ক্রেতার ওয়ার্কস্পেস" : "Buyer workspace"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-muted border border-hairline text-[11px] font-semibold text-secondary">
                  {locale === "bn" ? "ক্রেতা" : "Buyer"}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "ক্যাটালগ দেখুন, বক্স হিসাব করুন, শোরুমে RFQ পাঠান এবং অর্ডারের অবস্থা দেখুন।"
                  : "Browse the catalogue, estimate boxes, send an RFQ, and follow order status."}
              </p>
            </div>

            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-accent-teal" />
                  <span>
                    {locale === "bn" ? "ডিলার শোরুম" : "Dealer showroom"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-muted border border-hairline text-[11px] font-semibold text-secondary">
                  {locale === "bn" ? "ডিলার" : "Dealer"}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "শোরুম ভেরিফাই করুন, স্টক আপডেট রাখুন এবং ক্রেতার RFQ-তে কোটেশন দিন।"
                  : "Verify your showroom, update stock, and reply to buyer quotation requests."}
              </p>
            </div>

            <div className="p-4 rounded border border-hairline bg-canvas space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>
                    {locale === "bn" ? "অ্যাডমিন পরিচালনা" : "Administration"}
                  </span>
                </span>
                <span className="px-2 py-0.5 rounded bg-muted border border-hairline text-[11px] font-semibold text-secondary">
                  {locale === "bn" ? "অ্যাডমিন" : "Admin"}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                {locale === "bn"
                  ? "শোরুম অনুমোদন, ক্যাটালগ যাচাই এবং অর্ডার বিবাদ দেখভাল।"
                  : "For staff who verify showrooms, review catalogue entries, and resolve order disputes."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
