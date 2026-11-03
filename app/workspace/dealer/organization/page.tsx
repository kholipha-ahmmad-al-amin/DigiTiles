"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { StockLedger } from "@/components/dealer/StockLedger";
import { getVerificationLabel, VERIFICATION_COPY } from "@/lib/i18n";
import { canSubmitVerification } from "@/lib/verification";
import { BANGLADESH_DISTRICTS } from "@/lib/seed-data";
import {
  Branch,
  Organization,
  OrganizationMembership,
  OrgMemberRole,
} from "@/lib/types";

export default function DealerOrganizationPage() {
  const { locale, user, quickSwitchPersona, refreshSession, organizationContext } = useApp();
  const canInviteStaff = organizationContext?.membership.memberRole === "OWNER";

  const [organization, setOrganization] = useState<Organization | null>(null);
  const canEditCredentials = canInviteStaff && !!organization && canSubmitVerification(organization.verificationStatus);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Profile & Verification Fields (FR-03, FR-04)
  const [tradeNameEn, setTradeNameEn] = useState("");
  const [tradeNameBn, setTradeNameBn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [primaryDistrict, setPrimaryDistrict] = useState("Dhaka");
  const [contactPhone, setContactPhone] = useState("");
  const [tradeLicenseNo, setTradeLicenseNo] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [ownerNid, setOwnerNid] = useState("");

  // Add Branch Form
  const [branchNameEn, setBranchNameEn] = useState("");
  const [branchDistrict, setBranchDistrict] = useState("Dhaka");
  const [branchAddressEn, setBranchAddressEn] = useState("");
  const [branchPhone, setBranchPhone] = useState("");

  // Add Staff Member Form
  const [staffPhone, setStaffPhone] = useState("");
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState<OrgMemberRole>("STAFF");

  const loadOrganizationData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user.roles.includes("DEALER")) {
        await quickSwitchPersona("usr_dealer_01", "DEALER");
      }
      const res = await fetch("/api/dealer/organization", {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.ok && json.data?.organization) {
        const org: Organization = json.data.organization;
        setOrganization(org);
        setBranches(json.data.branches || []);
        setMemberships(json.data.memberships || []);
        setTradeNameEn(org.tradeNameEn);
        setTradeNameBn(org.tradeNameBn);
        setDescriptionEn(org.descriptionEn);
        setPrimaryDistrict(org.primaryDistrict);
        setContactPhone(org.contactPhone);
        setTradeLicenseNo(org.tradeLicenseNo || "");
        setTinNumber(org.tinNumber || "");
        setOwnerNid(org.ownerNid || "");
      }
    } finally {
      setLoading(false);
    }
  }, [user, quickSwitchPersona]);

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  const handleSaveOrg = async (submitForVerification = false) => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/dealer/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeNameEn,
          tradeNameBn,
          descriptionEn,
          primaryDistrict,
          contactPhone,
          tradeLicenseNo,
          tinNumber,
          ownerNid,
          submitForVerification,
          newBranch: branchNameEn.trim()
            ? {
                nameEn: branchNameEn,
                nameBn: branchNameEn,
                district: branchDistrict,
                addressEn: branchAddressEn,
                addressBn: branchAddressEn,
                contactPhone: branchPhone || contactPhone,
              }
            : undefined,
          newStaffMember: canInviteStaff && staffPhone.trim()
            ? {
                phone: staffPhone,
                fullName: staffName || "Showroom Staff",
                memberRole: staffRole,
              }
            : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to update organization.");
      }

      setBranchNameEn("");
      setBranchAddressEn("");
      setStaffPhone("");
      setStaffName("");
      setFeedback(
        submitForVerification
          ? locale === "bn"
            ? "ভেরিফিকেশনের জন্য ডকুমেন্ট জমা দেওয়া হয়েছে (SUBMITTED)!"
            : "Credentials submitted for Platform Admin verification (SUBMITTED)!"
          : locale === "bn"
          ? "শোরুম প্রোফাইল, ব্রাঞ্চ ও স্টাফ তথ্য সংরক্ষিত হয়েছে।"
          : "Organization profile, branches, and staff memberships updated."
      );
      await refreshSession();
      await loadOrganizationData();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/dealer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "ডিলার ড্যাশবোর্ডে ফিরুন (SCR-08)"
                : "Back to Dealer Dashboard (SCR-08)"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            SCR-09 | ORGANIZATION, MULTI-BRANCH, STAFF & VERIFICATION (FR-03, FR-04)
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "শোরুম প্রোফাইল, ব্রাঞ্চ, স্টাফ রোল ও ভেরিফিকেশন"
              : "Organization Profile, Showroom Branches, Staff & Verification"}
          </h1>
        </div>
        {organization && (
          <div className="px-3.5 py-2 rounded bg-muted border border-hairline text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-teal" />
            <span>
              {getVerificationLabel(organization.verificationStatus, locale)} [
              {organization.verificationStatus}]
            </span>
          </div>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs font-semibold"
        >
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="p-8 bg-surface border border-hairline rounded-lg text-sm text-secondary">
          Loading organization settings...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Company Profile & Trade Verification (FR-03, FR-04) */}
          <div className="lg:col-span-7 bg-surface border border-hairline rounded-lg p-6 space-y-5">
            <h2 className="text-base font-bold text-ink flex items-center gap-2 border-b border-hairline pb-3">
              <Building2 className="w-5 h-5 text-accent" />
              <span>
                {locale === "bn"
                  ? "প্রতিষ্ঠানের তথ্য ও ভেরিফিকেশন ডকুমেন্ট (FR-03, FR-04)"
                  : "Company Profile & Trade Verification Credentials (FR-03, FR-04)"}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="org-en"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  Trade Name (English)
                </label>
                <input
                  id="org-en"
                  type="text"
                  value={tradeNameEn}
                  readOnly={!canEditCredentials}
                  onChange={(e) => setTradeNameEn(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="org-bn"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  শোরুমের নাম (বাংলা)
                </label>
                <input
                  id="org-bn"
                  type="text"
                  value={tradeNameBn}
                  readOnly={!canEditCredentials}
                  onChange={(e) => setTradeNameBn(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="org-desc"
                className="block text-xs font-semibold text-ink mb-1"
              >
                {locale === "bn"
                  ? "শোরুমের বিবরণ"
                  : "Showroom Description & Authorized Brands"}
              </label>
              <textarea
                id="org-desc"
                rows={2}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="org-dist"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  {locale === "bn" ? "প্রধান জেলা" : "Primary District"}
                </label>
                <select
                  id="org-dist"
                  value={primaryDistrict}
                  onChange={(e) => setPrimaryDistrict(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="org-phone"
                  className="block text-xs font-semibold text-ink mb-1"
                >
                  {locale === "bn" ? "যোগাযোগ নাম্বার" : "Showroom Contact Phone"}
                </label>
                <input
                  id="org-phone"
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs font-mono text-ink"
                />
              </div>
            </div>

            {/* Trade Verification Credentials (FR-04) */}
            <div className="p-4 rounded bg-canvas border border-hairline space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-accent">
                {VERIFICATION_COPY.section[locale]}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="org-tl"
                    className="block text-[11px] font-semibold text-ink mb-1"
                  >
                    {VERIFICATION_COPY.tradeLicense[locale]}
                  </label>
                  <input
                    id="org-tl"
                    type="text"
                    value={tradeLicenseNo}
                    readOnly={!canEditCredentials}
                    onChange={(e) => setTradeLicenseNo(e.target.value)}
                    placeholder="TRAD/DNCC/..."
                    className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-surface text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="org-tin"
                    className="block text-[11px] font-semibold text-ink mb-1"
                  >
                    {VERIFICATION_COPY.tin[locale]}
                  </label>
                  <input
                    id="org-tin"
                    type="text"
                    value={tinNumber}
                    readOnly={!canEditCredentials}
                    onChange={(e) => setTinNumber(e.target.value)}
                    placeholder="12-digit TIN"
                    className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-surface text-xs font-mono text-ink"
                  />
                </div>
                <div>
                  <label
                    htmlFor="org-nid"
                    className="block text-[11px] font-semibold text-ink mb-1"
                  >
                    {VERIFICATION_COPY.nid[locale]}
                  </label>
                  <input
                    id="org-nid"
                    type="text"
                    value={ownerNid}
                    readOnly={!canEditCredentials}
                    onChange={(e) => setOwnerNid(e.target.value)}
                    placeholder="NID Number"
                    className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-surface text-xs font-mono text-ink"
                  />
                </div>
              </div>
              {!canEditCredentials && <p className="text-sm text-secondary">{VERIFICATION_COPY.locked[locale]}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveOrg(false)}
                className="min-h-[42px] px-5 py-2 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {saving
                  ? "Saving..."
                  : locale === "bn"
                  ? "প্রোফাইল সংরক্ষণ করুন"
                  : "Save Organization Changes"}
              </button>

              {canEditCredentials && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveOrg(true)}
                  className="min-h-[42px] px-5 py-2 rounded bg-muted hover:bg-canvas border border-hairline text-xs font-semibold text-ink cursor-pointer transition-colors"
                >
                  {locale === "bn"
                    ? "ভেরিফিকেশনের জন্য জমা দিন (Submit for Review)"
                    : "Submit for Admin Verification (FR-04)"}
                </button>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Multi-Branch Management & Scoped Staff Memberships (FR-03) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Branches Card */}
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
              <h2 className="text-base font-bold text-ink flex items-center gap-2 border-b border-hairline pb-3">
                <MapPin className="w-4 h-4 text-accent-teal" />
                <span>
                  {locale === "bn"
                    ? `শোরুম ও ওয়্যারহাউস ব্রাঞ্চসমূহ (${branches.length})`
                    : `Showroom & Warehouse Branches (${branches.length})`}
                </span>
              </h2>

              <div className="space-y-2.5">
                {branches.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded bg-canvas border border-hairline text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-ink">
                      <span>{locale === "bn" ? b.nameBn : b.nameEn}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted">
                        {b.district}
                      </span>
                    </div>
                    <div className="text-secondary">
                      {locale === "bn" ? b.addressBn : b.addressEn}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-hairline space-y-2.5">
                <div className="text-xs font-semibold text-ink">
                  {locale === "bn"
                    ? "+ নতুন ব্রাঞ্চ বা ওয়্যারহাউস যুক্ত করুন"
                    : "+ Add Showroom or Dispatch Warehouse Branch"}
                </div>
                <input
                  type="text"
                  value={branchNameEn}
                  onChange={(e) => setBranchNameEn(e.target.value)}
                  placeholder="Branch Name (e.g., Badda Display Center)"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={branchDistrict}
                    onChange={(e) => setBranchDistrict(e.target.value)}
                    aria-label="Branch District"
                    className="min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-xs text-ink"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="Branch Phone"
                    className="min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-xs font-mono text-ink"
                  />
                </div>
                <input
                  type="text"
                  value={branchAddressEn}
                  onChange={(e) => setBranchAddressEn(e.target.value)}
                  placeholder="Full Street Address"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                />
                <button
                  type="button"
                  onClick={() => handleSaveOrg(false)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded bg-muted hover:bg-canvas border border-hairline text-xs font-semibold text-ink flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {locale === "bn" ? "ব্রাঞ্চ যোগ করুন" : "Add Branch"}
                  </span>
                </button>
              </div>
            </div>

            {/* Organization Staff & Scoped Roles (FR-03, Business Rule 8) */}
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-4">
              <h2 className="text-base font-bold text-ink flex items-center gap-2 border-b border-hairline pb-3">
                <Users className="w-4 h-4 text-accent" />
                <span>
                  {locale === "bn"
                    ? `প্রতিষ্ঠানের কর্মকর্তা ও স্টাফ (${memberships.length})`
                    : `Organization Staff & Scoped Permissions (${memberships.length})`}
                </span>
              </h2>

              <div className="space-y-2">
                {memberships.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded bg-canvas border border-hairline flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-ink">{m.userName}</div>
                      <div className="font-mono text-subtle">{m.userPhone}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-muted border border-hairline font-mono font-semibold text-ink">
                      {m.memberRole}
                    </span>
                  </div>
                ))}
              </div>

              {canInviteStaff && <div className="pt-3 border-t border-hairline space-y-2.5">
                <div className="text-xs font-semibold text-ink">
                  {locale === "bn"
                    ? "+ নতুন ম্যানেজার বা স্টাফ যুক্ত করুন"
                    : "+ Assign Staff Member (MANAGER / STAFF)"}
                </div>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Staff Full Name"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-xs text-ink"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-xs font-mono text-ink"
                  />
                  <select
                    value={staffRole}
                    onChange={(e) =>
                      setStaffRole(e.target.value as OrgMemberRole)
                    }
                    aria-label="Staff Role"
                    className="min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas text-xs text-ink"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="MANAGER">MANAGER</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveOrg(false)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded bg-muted hover:bg-canvas border border-hairline text-xs font-semibold text-ink flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {locale === "bn"
                      ? "স্টাফ মেম্বার যুক্ত করুন"
                      : "Add Scoped Staff Member"}
                  </span>
                </button>
              </div>}
            </div>
          </div>
        </div>
      )}
      <StockLedger refreshKey={branches.map((branch) => branch.id).join(",")} />
    </div>
  );
}
