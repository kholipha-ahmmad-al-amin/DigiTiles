import { DOCS_CONTENT } from "./docs-content";
import type { DocsBlock } from "./docs-content";
import {
  DOCS_SECTION_GROUPS,
  DOCS_SECTIONS,
  getDocsSectionTitle,
  type DocsLiveMetrics,
} from "./docs-site";
import type { DocsSiteConfig } from "./types";

function blockToMarkdown(block: DocsBlock, metrics?: DocsLiveMetrics): string[] {
  switch (block.type) {
    case "lead":
    case "p":
      return ["", block.text, ""];
    case "h3":
      return ["", `### ${block.text}`, ""];
    case "list":
      return ["", ...block.items.map((item) => `- ${item}`), ""];
    case "table": {
      const lines = ["", `| ${block.head.join(" | ")} |`, `| ${block.head.map(() => "---").join(" | ")} |`];
      for (const row of block.rows) {
        lines.push(`| ${row.map((cell) => String(cell).replace(/\|/g, "\\|")).join(" | ")} |`);
      }
      lines.push("");
      return lines;
    }
    case "callout":
      return ["", `> **${block.title || "Note"}:** ${block.text}`, ""];
    case "code":
      return ["", "```", block.text, "```", ""];
    case "diagram":
      return ["", `*[Diagram: ${block.id === "architecture" ? "System architecture" : "Data flow"} - see the live page for the rendered figure.]*`, ""];
    case "pitch-slides":
      return ["", "*[Interactive pitch deck - see the live page at /pitch-deck or the rendered slide cards above.]*", ""];
    case "team":
      return ["", "*[Team grid - see the live page for photos, roles, and contact details.]*", ""];
    case "live": {
      if (block.kind === "metrics" && metrics) {
        return [
          "",
          "| Metric | Live value |",
          "| --- | --- |",
          `| Users | ${metrics.totalUsers} |`,
          `| Verified dealers | ${metrics.verifiedOrganizations} |`,
          `| Public listings | ${metrics.publicListings} |`,
          `| RFQs | ${metrics.totalRfqs} |`,
          `| Quotations | ${metrics.totalQuotations} |`,
          `| Orders | ${metrics.totalOrders} |`,
          `| Completed orders | ${metrics.completedOrders} |`,
          `| Audit log entries | ${metrics.totalAuditLogs} |`,
          "",
        ];
      }
      if (block.kind === "analytics" && metrics) {
        return [
          "",
          `Live KPIs: ${metrics.completedOrders} completed transactions (North Star), ${metrics.totalOrders} total orders, ${metrics.disputedOrders} disputed, ${metrics.publicListings} public listings across ${metrics.verifiedOrganizations} verified showrooms in ${metrics.verifiedDistricts.join(", ") || "Bangladesh"}.`,
          "",
        ];
      }
      if (block.kind === "feature-matrix") {
        return ["", "*[Feature matrix with live status indicators - see the live page.]*", ""];
      }
      if (block.kind === "order-states" && metrics) {
        const states = Object.entries(metrics.orderStateCounts)
          .map(([state, count]) => `${state}: ${count}`)
          .join(", ");
        return ["", `Order state distribution: ${states || "no orders yet"}.`, ""];
      }
      return [];
    }
    default:
      return [];
  }
}

export function buildDocsMarkdown(input: {
  config: DocsSiteConfig;
  metrics: DocsLiveMetrics;
  locale: "bn" | "en";
  generatedAt?: Date;
}): string {
  const { config, metrics, locale } = input;
  const lines: string[] = [
    "# DigiTiles - Product & Engineering Documentation",
    "",
    `Exported: ${(input.generatedAt || new Date()).toISOString()}`,
    `Docs version: v${config.version}`,
    "",
  ];

  for (const group of DOCS_SECTION_GROUPS) {
    const sections = DOCS_SECTIONS.filter((s) => s.group === group.id);
    if (sections.length === 0) continue;
    lines.push(`## ${group.labelEn}`, "");
    for (const meta of sections) {
      const title = getDocsSectionTitle(meta.id, locale, config.sectionOverrides);
      lines.push(`### ${title}`, "");
      const content = DOCS_CONTENT[meta.id];
      if (content?.kicker) {
        lines.push(`*${content.kicker.en}*`, "");
      }
      for (const block of content?.blocks || []) {
        lines.push(...blockToMarkdown(block, metrics));
      }
    }
  }

  if (config.teamMembers.length > 0) {
    lines.push("## Team Directory", "");
    lines.push("| Name | Role | Email |", "| --- | --- | --- |");
    for (const member of config.teamMembers) {
      lines.push(`| ${member.name} | ${member.role} | ${member.email} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
