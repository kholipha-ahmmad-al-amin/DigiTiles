"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSearch, Lock } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { AuditLog } from "@/lib/types";

export default function AdminAuditPage() {
  const { locale, user, quickSwitchPersona } = useApp();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user.roles.includes("ADMIN")) {
        await quickSwitchPersona("usr_admin_01", "ADMIN");
      }
      const res = await fetch("/api/admin/moderate", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        setAuditLogs(json.data.auditLogs || []);
      }
    } finally {
      setLoading(false);
    }
  }, [user, quickSwitchPersona]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "অ্যাডমিন প্যানেলে ফিরুন (SCR-13)"
                : "Back to Admin Console (SCR-13)"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            SCR-15 | IMMUTABLE AUDIT LOG & SECURITY OVERSIGHT (FR-14, BUSINESS RULE 9)
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1 flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-accent" />
            <span>
              {locale === "bn"
                ? "অপরিবর্তনীয় সিস্টেম অডিট ট্রেইল"
                : "Immutable Platform Audit Log"}
            </span>
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-muted border border-hairline text-xs font-mono">
          <Lock className="w-3.5 h-3.5 text-accent" />
          <span>Append-Only Audit Ledger ({auditLogs.length} entries)</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 bg-surface border border-hairline rounded-lg text-sm text-secondary">
          Loading immutable audit trail...
        </div>
      ) : (
        <div className="bg-surface border border-hairline rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted text-ink font-semibold border-b border-hairline font-mono">
                <tr>
                  <th className="p-3">Timestamp (UTC)</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action Code</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Audit Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3 font-mono text-subtle whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-ink">
                        {log.actorName}
                      </div>
                      <div className="font-mono text-[10px] text-subtle">
                        {log.actorRole} ({log.actorUserId})
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-accent">
                      {log.action}
                    </td>
                    <td className="p-3 font-mono text-secondary">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="p-3 text-ink">{log.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
