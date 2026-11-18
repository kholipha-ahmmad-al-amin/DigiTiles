import { buildDocsLiveMetrics } from "@/lib/docs-site";
import { callRemoteMcpTool } from "@/lib/mcp/client";
import { buildKnowledgeCorpus, loadPublicListings } from "@/lib/rag/corpus";
import { retrieveCatalogue, wastePercentFor } from "@/lib/rag/retrieve";
import { WORKERS_MODELS } from "@/lib/rag/workers-ai";
import { transportEstimate } from "@/lib/service-directory";
import { getVerifiedServices } from "@/lib/service-store";
import { hydrateDatabaseFromCloudflareD1, loadDatabase } from "@/lib/store";

export type McpServerKey = "catalogue" | "estimator" | "services" | "governance" | "telemetry";

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpPromptDefinition {
  name: string;
  description: string;
  arguments: Array<{ name: string; description: string; required?: boolean }>;
}

export interface McpServerDefinition {
  key: McpServerKey;
  name: string;
  version: string;
  endpoint: string;
  stdioCommand: string;
  description: string;
  reusedIn: string[];
  tools: McpToolDefinition[];
  resources: McpResourceDefinition[];
  prompts: McpPromptDefinition[];
}

export interface UsedMcpServerDescriptor {
  name: string;
  transport: "stdio" | "Streamable HTTP";
  packageOrUrl: string;
  purpose: string;
}

export const EDGE_API_MCP_ENDPOINT = "https://api.digitiles.equisaas-bd.com/mcp";

export const USED_MCP_SERVERS: UsedMcpServerDescriptor[] = [
  {
    name: "firebase-mcp-server",
    transport: "stdio",
    packageOrUrl: "npx -y firebase-tools@latest mcp",
    purpose: "Manage Firebase Authentication project digitiles-bd, verify OAuth sign-in providers, and inspect provisioned test role accounts.",
  },
  {
    name: "cloudflare-docs-mcp",
    transport: "Streamable HTTP",
    packageOrUrl: "https://docs.mcp.cloudflare.com/mcp",
    purpose: "Query up-to-date Cloudflare Workers, D1 SQLite bindings, Workers KV, Workers AI model IDs, and vinext bundler documentation.",
  },
  {
    name: "context7",
    transport: "stdio",
    packageOrUrl: "npx -y @upstash/context7-mcp",
    purpose: "Resolve version-accurate API references for Next.js 14 App Router, React 19, Prisma schema contracts, and Tailwind CSS.",
  },
  {
    name: "chrome-devtools-mcp",
    transport: "stdio",
    packageOrUrl: "npx -y chrome-devtools-mcp@latest",
    purpose: "Run headless DOM inspection, print stylesheet validation, network timing checks, and WCAG 2.1 AA contrast verification across routes.",
  },
  {
    name: "sequential-thinking",
    transport: "stdio",
    packageOrUrl: "npx -y @modelcontextprotocol/server-sequential-thinking",
    purpose: "Decompose multi-step verification state machines, Contextual RAG chunking boundaries, and atomic stock-lot reservation logic.",
  },
];

export const BUILT_MCP_SERVERS: Record<McpServerKey, McpServerDefinition> = {
  catalogue: {
    key: "catalogue",
    name: "digitiles-catalogue-mcp",
    version: "1.0.0",
    endpoint: "https://digitiles.equisaas-bd.com/mcp",
    stdioCommand: "node scripts/mcp-stdio.mjs --server catalogue",
    description: "Bilingual (bn/en) hybrid search and technical spec inspection over verified DigiTiles listings, showrooms, guides, and service records.",
    reusedIn: [
      "DigiTiles Catalogue Assistant (/assistant)",
      "External MCP Hosts (Windsurf, Claude Desktop, MCP Inspector via HTTP or stdio)",
    ],
    tools: [
      {
        name: "search_catalogue",
        description: "Search published DigiTiles listings, showrooms, guides, and service-directory records with bilingual bn/en expansion and box wastage estimates.",
        inputSchema: {
          type: "object",
          properties: {
            question: { type: "string", description: "Buyer question in Bangla or English." },
            focusListingId: { type: "string", description: "Optional listing ID to prioritize in retrieval." },
          },
          required: ["question"],
        },
      },
      {
        name: "get_listing_specs",
        description: "Fetch full moderated technical specifications, variants, coverage per box, and verified showroom details by listing ID or SKU.",
        inputSchema: {
          type: "object",
          properties: {
            listingIdOrSku: { type: "string", description: "Listing ID (e.g. lst_01) or SKU (e.g. RAK-CARRARA-6060-GL)." },
          },
          required: ["listingIdOrSku"],
        },
      },
    ],
    resources: [
      {
        uri: "digitiles://catalogue/verified-showrooms",
        name: "Verified DigiTiles Showrooms",
        description: "Public showroom profiles that have passed VERIFIED organization status.",
        mimeType: "application/json",
      },
      {
        uri: "digitiles://catalogue/public-listings",
        name: "Published Catalogue Summary",
        description: "Zero-PII snapshot of APPROVED and ACTIVE dealer listings with BDT indicative prices.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "compare_tiles_bdt",
        description: "Prompt template for comparing published tile specs and indicative BDT box pricing without inventing showroom claims.",
        arguments: [
          { name: "requirement", description: "Buyer room size, district, or tile requirement", required: true },
        ],
      },
    ],
  },
  estimator: {
    key: "estimator",
    name: "digitiles-estimator-mcp",
    version: "1.0.0",
    endpoint: "https://digitiles.equisaas-bd.com/mcp/estimator",
    stdioCommand: "node scripts/mcp-stdio.mjs --server estimator",
    description: "Deterministic tile box quantity, laying-pattern wastage allowance, and indicative BDT cost calculator backed by live listing coverage specs.",
    reusedIn: [
      "DigiTiles Room Visualizer (/visualizer)",
      "Catalogue Assistant wastage calculator (/assistant)",
      "External procurement agents via Streamable HTTP and stdio",
    ],
    tools: [
      {
        name: "calculate_tile_boxes",
        description: "Calculate whole tile boxes required for a floor or wall area in sq.ft including pattern-based wastage (5% straight, 10% brick, 15% herringbone).",
        inputSchema: {
          type: "object",
          properties: {
            areaSqft: { type: "number", description: "Target surface area in square feet." },
            pattern: { type: "string", enum: ["straight", "brick", "herringbone"], description: "Laying pattern determining wastage percentage." },
            listingIdOrSku: { type: "string", description: "Optional listing ID or SKU to resolve exact sq.ft per box and indicative BDT box price." },
          },
          required: ["areaSqft"],
        },
      },
      {
        name: "compare_laying_patterns",
        description: "Compare straight grid (5%), brick bond (10%), and herringbone (15%) box quantities and indicative BDT budgets side by side.",
        inputSchema: {
          type: "object",
          properties: {
            areaSqft: { type: "number", description: "Target surface area in square feet." },
            listingIdOrSku: { type: "string", description: "Optional listing ID or SKU for exact box coverage." },
          },
          required: ["areaSqft"],
        },
      },
    ],
    resources: [
      {
        uri: "digitiles://estimator/wastage-standards",
        name: "Tile Laying Wastage Standards",
        description: "Standard DigiTiles cutting wastage allowances per laying geometry in Bangladesh construction workflows.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "plan_room_quantities",
        description: "Prepare an itemized box quantity breakdown before opening a multi-item RFQ.",
        arguments: [
          { name: "areaSqft", description: "Floor or wall area in sq.ft", required: true },
          { name: "pattern", description: "straight, brick, or herringbone", required: false },
        ],
      },
    ],
  },
  services: {
    key: "services",
    name: "digitiles-services-mcp",
    version: "1.0.0",
    endpoint: "https://digitiles.equisaas-bd.com/mcp/services",
    stdioCommand: "node scripts/mcp-stdio.mjs --server services",
    description: "Verified installation crew lookup and district-based material transport fare estimator for construction orders across Bangladesh.",
    reusedIn: [
      "DigiTiles Services Directory (/services)",
      "Customer Order Crew Preference workflow (/workspace/customer/orders)",
    ],
    tools: [
      {
        name: "find_installation_crews",
        description: "Filter verified tile installation crews by Bangladesh district, trade specialty, and maximum BDT labour rate.",
        inputSchema: {
          type: "object",
          properties: {
            district: { type: "string", description: "District name such as Dhaka, Gazipur, Chattogram, Sylhet, or Narayanganj." },
            specialty: { type: "string", description: "Crew specialty (LARGE_FORMAT, MOSAIC, WATERPROOFING, CIVIL)." },
            maxRateBdt: { type: "number", description: "Optional ceiling labour rate in BDT." },
          },
        },
      },
      {
        name: "estimate_transport_fare",
        description: "Calculate directory BDT freight fare estimates by district, haul distance in km, and optional vehicle class.",
        inputSchema: {
          type: "object",
          properties: {
            district: { type: "string", description: "Delivery district in Bangladesh." },
            distanceKm: { type: "number", description: "Estimated route distance in kilometers." },
            vehicleType: { type: "string", description: "Optional vehicle filter (PICKUP_1_TON, COVERED_VAN_3_TON, OPEN_TRUCK_7_TON)." },
          },
          required: ["district", "distanceKm"],
        },
      },
    ],
    resources: [
      {
        uri: "digitiles://services/verified-directory",
        name: "Verified Crews & Transport Directory",
        description: "Public rate cards and district coverage for verified installation crews and haulage fleets.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "match_crew_and_transport",
        description: "Recommend a verified tile crew and delivery vehicle estimate for a district delivery.",
        arguments: [
          { name: "district", description: "Target district in Bangladesh", required: true },
          { name: "distanceKm", description: "Haul distance in km", required: true },
        ],
      },
    ],
  },
  governance: {
    key: "governance",
    name: "digitiles-governance-mcp",
    version: "1.0.0",
    endpoint: "https://digitiles.equisaas-bd.com/mcp/governance",
    stdioCommand: "node scripts/mcp-stdio.mjs --server governance",
    description: "Zero-PII operational telemetry, 7-state showroom verification rules, and 9-state order lifecycle inspection from live platform state.",
    reusedIn: [
      "DigiTiles Live Docs Dashboard (/docs)",
      "External judge and compliance evaluation clients via Streamable HTTP and stdio",
    ],
    tools: [
      {
        name: "get_marketplace_metrics",
        description: "Return aggregated non-PII marketplace counts (verified showrooms, public listings, RFQs, quotes, order state distribution, audit entries).",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "inspect_state_machine",
        description: "Inspect valid state transitions and enforcement rules for the dealer VERIFICATION machine or ORDER lifecycle machine.",
        inputSchema: {
          type: "object",
          properties: {
            machine: { type: "string", enum: ["VERIFICATION", "ORDER"], description: "State machine to inspect." },
          },
          required: ["machine"],
        },
      },
    ],
    resources: [
      {
        uri: "digitiles://governance/visibility-gate",
        name: "Public Visibility Gate Rules",
        description: "Three-condition discovery invariant and anti-PII boundary specification.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "audit_marketplace_sla",
        description: "Summarize current marketplace health and state-machine integrity from non-PII metrics.",
        arguments: [],
      },
    ],
  },
  telemetry: {
    key: "telemetry",
    name: "digitiles-d1-telemetry-mcp",
    version: "1.0.0",
    endpoint: EDGE_API_MCP_ENDPOINT,
    stdioCommand: "node scripts/mcp-stdio.mjs --server telemetry",
    description: "Cloudflare Worker + D1 edge MCP server exposing live SQLite health counters, schema contracts, and Workers AI Llama Guard 3 safety screening.",
    reusedIn: [
      "digitiles-web Catalogue Assistant safety pre-screening (lib/rag/answer.ts)",
      "digitiles-web /api/mcp/status live MCP telemetry check",
      "External MCP hosts targeting https://api.digitiles.equisaas-bd.com/mcp or /mcp/telemetry",
    ],
    tools: [
      {
        name: "get_d1_health",
        description: "Query real-time Cloudflare D1 (digitiles-prod-db) row counts across 7 relational tables plus monotonic platform_state version.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_d1_tables",
        description: "Return the canonical 8-table Cloudflare D1 SQLite schema contract and primary indexes.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "screen_prompt_safety",
        description: "Screen a buyer prompt using Cloudflare Workers AI @cf/meta/llama-guard-3-8b before retrieval and answer generation.",
        inputSchema: {
          type: "object",
          properties: {
            text: { type: "string", description: "User question or text to screen for safety." },
          },
          required: ["text"],
        },
      },
    ],
    resources: [
      {
        uri: "digitiles://d1/schema-contract",
        name: "Cloudflare D1 Schema Contract",
        description: "Relational SQLite tables and indexes deployed on digitiles-prod-db.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "verify_edge_lineage",
        description: "Audit Cloudflare D1 sync freshness and relational table counts.",
        arguments: [],
      },
    ],
  },
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id",
};

const D1_TABLES_CONTRACT = [
  { table: "platform_state", purpose: "Canonical JSON snapshot and monotonic version counter", indexes: ["id (PRIMARY KEY)"] },
  { table: "users", purpose: "Firebase Auth identities, roles JSON array, preferred locale", indexes: ["idx_users_phone", "idx_users_email"] },
  { table: "organizations", purpose: "Showroom profiles, districts, verification status", indexes: ["verification_status", "primary_district"] },
  { table: "dealer_listings", purpose: "Tile specifications, BDT rates, moderation state", indexes: ["idx_listings_org"] },
  { table: "rfqs", purpose: "Buyer requests for itemized quotations", indexes: ["idx_rfqs_customer"] },
  { table: "quotations", purpose: "Immutable versioned BDT quotations", indexes: ["idx_quotes_rfq"] },
  { table: "orders", purpose: "Orders with frozen commercial snapshots and state history", indexes: ["idx_orders_customer", "idx_orders_org"] },
  { table: "audit_logs", purpose: "Append-only governance and moderation ledger", indexes: ["created_at"] },
];

function findListing(listingIdOrSku?: string) {
  if (!listingIdOrSku) return null;
  const target = listingIdOrSku.trim().toLowerCase();
  if (!target) return null;
  const listings = loadPublicListings();
  return (
    listings.find(
      (item) => item.id.toLowerCase() === target || item.sku.toLowerCase() === target
    ) || null
  );
}

async function executeTool(
  serverKey: McpServerKey,
  toolName: string,
  args: Record<string, unknown>
): Promise<{ output: unknown; isError?: boolean }> {
  await hydrateDatabaseFromCloudflareD1().catch(() => undefined);

  if (serverKey === "catalogue") {
    if (toolName === "search_catalogue") {
      const question = String(args.question || "").slice(0, 500);
      const focusListingId = typeof args.focusListingId === "string" ? args.focusListingId : undefined;
      if (!question.trim()) {
        return { output: { error: "Missing required argument: question" }, isError: true };
      }
      const found = retrieveCatalogue(question, focusListingId);
      const hits = found.hits.map((hit) => ({
        id: hit.id,
        title: hit.title,
        href: hit.href,
        kind: hit.kind,
        score: Number(hit.score.toFixed(3)),
      }));
      return { output: { hits, estimate: found.estimate } };
    }

    if (toolName === "get_listing_specs") {
      const key = String(args.listingIdOrSku || "");
      const listing = findListing(key);
      if (!listing) {
        return { output: { found: false, message: "No verified public listing matched that ID or SKU." } };
      }
      return {
        output: {
          found: true,
          listing: {
            id: listing.id,
            sku: listing.sku,
            titleEn: listing.titleEn,
            titleBn: listing.titleBn,
            brand: listing.brand,
            materialType: listing.materialType,
            dimensionsMm: listing.dimensionsMm,
            surfaceFinish: listing.surfaceFinish,
            grade: listing.grade,
            waterAbsorption: listing.waterAbsorption,
            thicknessMm: listing.thicknessMm,
            slipResistance: listing.slipResistance,
            peiRating: listing.peiRating,
            applicationArea: listing.applicationArea,
            sqftPerBox: listing.sqftPerBox,
            piecesPerBox: listing.piecesPerBox,
            pricePerSqftBdt: listing.pricePerSqftBdt,
            pricePerBoxBdt: listing.pricePerBoxBdt,
            minOrderBoxes: listing.minOrderBoxes,
            servicingDistricts: listing.servicingDistricts,
            showroom: listing.organization
              ? {
                  id: listing.organization.id,
                  tradeNameEn: listing.organization.tradeNameEn,
                  tradeNameBn: listing.organization.tradeNameBn,
                  primaryDistrict: listing.organization.primaryDistrict,
                }
              : null,
            variants: listing.variants,
          },
        },
      };
    }
  }

  if (serverKey === "estimator") {
    if (toolName === "calculate_tile_boxes") {
      const areaSqft = Number(args.areaSqft);
      if (!Number.isFinite(areaSqft) || areaSqft <= 0 || areaSqft > 100000) {
        return { output: { error: "areaSqft must be a positive number up to 100000" }, isError: true };
      }
      const pattern = String(args.pattern || "brick").toLowerCase();
      const wastePercent = wastePercentFor(pattern);
      const listing = findListing(typeof args.listingIdOrSku === "string" ? args.listingIdOrSku : undefined);
      const sqftPerBox = listing?.sqftPerBox || 15.5;
      const minOrderBoxes = listing?.minOrderBoxes || 1;
      const requiredSqft = Math.round(areaSqft * (1 + wastePercent / 100) * 100) / 100;
      const boxes = Math.max(minOrderBoxes, Math.ceil(requiredSqft / sqftPerBox));
      const indicativeSubtotalBdt = listing ? Math.round(boxes * listing.pricePerBoxBdt) : null;
      return {
        output: {
          areaSqft,
          pattern: pattern === "straight" || pattern === "herringbone" ? pattern : "brick",
          wastePercent,
          sqftPerBox,
          requiredSqft,
          boxes,
          minOrderBoxes,
          listingId: listing?.id || null,
          sku: listing?.sku || null,
          indicativeSubtotalBdt,
          note: "Indicative box estimate for planning a BDT quotation request, not a confirmed dealer quote.",
        },
      };
    }

    if (toolName === "compare_laying_patterns") {
      const areaSqft = Number(args.areaSqft);
      if (!Number.isFinite(areaSqft) || areaSqft <= 0 || areaSqft > 100000) {
        return { output: { error: "areaSqft must be a positive number up to 100000" }, isError: true };
      }
      const listing = findListing(typeof args.listingIdOrSku === "string" ? args.listingIdOrSku : undefined);
      const sqftPerBox = listing?.sqftPerBox || 15.5;
      const minOrderBoxes = listing?.minOrderBoxes || 1;
      const patterns = (["straight", "brick", "herringbone"] as const).map((pattern) => {
        const wastePercent = wastePercentFor(pattern);
        const requiredSqft = Math.round(areaSqft * (1 + wastePercent / 100) * 100) / 100;
        const boxes = Math.max(minOrderBoxes, Math.ceil(requiredSqft / sqftPerBox));
        return {
          pattern,
          wastePercent,
          requiredSqft,
          boxes,
          indicativeSubtotalBdt: listing ? Math.round(boxes * listing.pricePerBoxBdt) : null,
        };
      });
      return {
        output: {
          areaSqft,
          sqftPerBox,
          listingSku: listing?.sku || "GENERIC-15.5-SQFT-BOX",
          patterns,
        },
      };
    }
  }

  if (serverKey === "services") {
    const directory = getVerifiedServices();
    if (toolName === "find_installation_crews") {
      const district = typeof args.district === "string" ? args.district.trim().toLowerCase() : "";
      const specialty = typeof args.specialty === "string" ? args.specialty.trim().toUpperCase() : "";
      const maxRateBdt = typeof args.maxRateBdt === "number" ? args.maxRateBdt : null;
      const crews = directory.crews.filter((crew) => {
        if (district && !crew.districts.some((d) => d.toLowerCase() === district)) return false;
        if (specialty && !crew.specialties.some((s) => s === specialty)) return false;
        if (maxRateBdt !== null && crew.rateBdt > maxRateBdt) return false;
        return true;
      });
      return { output: { count: crews.length, crews } };
    }

    if (toolName === "estimate_transport_fare") {
      const district = typeof args.district === "string" ? args.district.trim() : "";
      const distanceKm = Number(args.distanceKm);
      const vehicleType = typeof args.vehicleType === "string" ? args.vehicleType.trim().toUpperCase() : "";
      if (!district || !Number.isFinite(distanceKm) || distanceKm <= 0) {
        return { output: { error: "district and positive distanceKm are required" }, isError: true };
      }
      const estimates = directory.transport
        .filter((fleet) => !vehicleType || fleet.vehicleType === vehicleType)
        .map((fleet) => {
          const matchedDistrict = Object.keys(fleet.rates).find(
            (key) => key.toLowerCase() === district.toLowerCase()
          );
          if (!matchedDistrict) return null;
          const rate = fleet.rates[matchedDistrict as keyof typeof fleet.rates];
          if (!rate) return null;
          return {
            id: fleet.id,
            nameEn: fleet.nameEn,
            nameBn: fleet.nameBn,
            vehicleType: fleet.vehicleType,
            district: matchedDistrict,
            distanceKm,
            baseBdt: rate.baseBdt,
            perKmBdt: rate.perKmBdt,
            estimatedFareBdt: transportEstimate(rate, distanceKm),
          };
        })
        .filter(Boolean);
      return { output: { count: estimates.length, estimates } };
    }
  }

  if (serverKey === "governance") {
    if (toolName === "get_marketplace_metrics") {
      const db = loadDatabase();
      return { output: { metrics: buildDocsLiveMetrics(db), timestamp: new Date().toISOString() } };
    }

    if (toolName === "inspect_state_machine") {
      const machine = String(args.machine || "").toUpperCase();
      if (machine === "VERIFICATION") {
        return {
          output: {
            machine: "VERIFICATION",
            states: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED", "SUSPENDED", "EXPIRED"],
            transitions: {
              DRAFT: ["SUBMITTED (owner submits trade license and TIN)"],
              SUBMITTED: ["UNDER_REVIEW (admin claims review)"],
              UNDER_REVIEW: ["VERIFIED", "REJECTED"],
              REJECTED: ["SUBMITTED (owner resubmits updated docs)"],
              VERIFIED: ["SUSPENDED", "EXPIRED"],
              SUSPENDED: ["UNDER_REVIEW", "EXPIRED"],
              EXPIRED: ["SUBMITTED"],
            },
            publicVisibilityGate: "organization.verificationStatus === VERIFIED AND listing.moderationStatus === APPROVED AND listing.visibilityStatus === ACTIVE",
          },
        };
      }
      if (machine === "ORDER") {
        return {
          output: {
            machine: "ORDER",
            states: ["PENDING_CONFIRMATION", "CONFIRMED", "PROCESSING", "READY_FOR_DISPATCH", "DISPATCHED", "DELIVERED", "COMPLETED", "CANCELLED", "DISPUTED"],
            transitions: {
              PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
              CONFIRMED: ["PROCESSING", "CANCELLED", "DISPUTED"],
              PROCESSING: ["READY_FOR_DISPATCH", "CANCELLED", "DISPUTED"],
              READY_FOR_DISPATCH: ["DISPATCHED", "DISPUTED"],
              DISPATCHED: ["DELIVERED", "DISPUTED"],
              DELIVERED: ["COMPLETED", "DISPUTED"],
              COMPLETED: [],
              CANCELLED: [],
              DISPUTED: ["CONFIRMED", "DELIVERED", "COMPLETED", "CANCELLED"],
            },
            invariants: [
              "Quotation acceptance freezes an immutable BDT commercial snapshot and rejects competing offers.",
              "Dealer order confirmation reserves cartons from a single eligible production lot (shade and caliber consistency).",
              "Cancellation releases reserved lot stock atomically.",
              "Dispute resolution requires ADMIN role and appends to audit_logs.",
            ],
          },
        };
      }
      return { output: { error: "machine must be VERIFICATION or ORDER" }, isError: true };
    }
  }

  if (serverKey === "telemetry") {
    if (toolName === "list_d1_tables") {
      return {
        output: {
          database: "digitiles-prod-db",
          provider: "Cloudflare D1 Serverless SQLite (APAC)",
          tables: D1_TABLES_CONTRACT,
        },
      };
    }
    if (toolName === "get_d1_health") {
      const remote = await callRemoteMcpTool(EDGE_API_MCP_ENDPOINT, "get_d1_health", {});
      if (remote?.parsed) return { output: remote.parsed };
      try {
        const res = await fetch("https://api.digitiles.equisaas-bd.com/health", { cache: "no-store" });
        if (res.ok) return { output: await res.json() };
      } catch {
        // fallback below
      }
      return { output: { error: "Unable to reach Cloudflare D1 health endpoint" }, isError: true };
    }
    if (toolName === "screen_prompt_safety") {
      const text = String(args.text || "").slice(0, 2000);
      if (text.trim().length < 2) {
        return { output: { error: "text must be at least 2 characters" }, isError: true };
      }
      const remote = await callRemoteMcpTool(EDGE_API_MCP_ENDPOINT, "screen_prompt_safety", { text });
      if (remote?.parsed) return { output: remote.parsed };
      try {
        const res = await fetch("https://api.digitiles.equisaas-bd.com/api/ai/screen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          cache: "no-store",
        });
        if (res.ok) return { output: await res.json() };
      } catch {
        // fallback below
      }
      return { output: { ok: false, verdict: "unavailable", model: WORKERS_MODELS.guard } };
    }
  }

  return { output: { error: `Unknown tool: ${toolName}` }, isError: true };
}

async function readResource(serverKey: McpServerKey, uri: string): Promise<string | null> {
  await hydrateDatabaseFromCloudflareD1().catch(() => undefined);
  if (serverKey === "catalogue") {
    const listings = loadPublicListings();
    if (uri === "digitiles://catalogue/verified-showrooms") {
      const seen = new Map<string, unknown>();
      for (const l of listings) {
        if (l.organization && !seen.has(l.organization.id)) {
          seen.set(l.organization.id, l.organization);
        }
      }
      return JSON.stringify(Array.from(seen.values()), null, 2);
    }
    if (uri === "digitiles://catalogue/public-listings") {
      return JSON.stringify(
        listings.map((l) => ({
          id: l.id,
          sku: l.sku,
          titleEn: l.titleEn,
          titleBn: l.titleBn,
          pricePerSqftBdt: l.pricePerSqftBdt,
          pricePerBoxBdt: l.pricePerBoxBdt,
          sqftPerBox: l.sqftPerBox,
          servicingDistricts: l.servicingDistricts,
        })),
        null,
        2
      );
    }
  }
  if (serverKey === "estimator" && uri === "digitiles://estimator/wastage-standards") {
    return JSON.stringify(
      {
        straight_grid: { wastePercent: 5, note: "Minimal off-cuts for rectangular rooms" },
        brick_bond: { wastePercent: 10, note: "Recommended default for staggered joints" },
        herringbone_diagonal: { wastePercent: 15, note: "Higher perimeter trim allowance" },
      },
      null,
      2
    );
  }
  if (serverKey === "services" && uri === "digitiles://services/verified-directory") {
    return JSON.stringify(getVerifiedServices(), null, 2);
  }
  if (serverKey === "governance" && uri === "digitiles://governance/visibility-gate") {
    const db = loadDatabase();
    return JSON.stringify(
      {
        rule: "Public discovery and AI RAG indexing require organization.verificationStatus === VERIFIED, listing.moderationStatus === APPROVED, and listing.visibilityStatus === ACTIVE.",
        liveMetrics: buildDocsLiveMetrics(db),
        ragChunksCount: buildKnowledgeCorpus().length,
      },
      null,
      2
    );
  }
  if (serverKey === "telemetry" && uri === "digitiles://d1/schema-contract") {
    return JSON.stringify({ database: "digitiles-prod-db", tables: D1_TABLES_CONTRACT }, null, 2);
  }
  return null;
}

function getPrompt(serverKey: McpServerKey, name: string, args: Record<string, string> = {}) {
  const prompt = BUILT_MCP_SERVERS[serverKey].prompts.find((item) => item.name === name);
  if (!prompt) return null;
  if (name === "compare_tiles_bdt") {
    return {
      description: prompt.description,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare verified DigiTiles options for: ${args.requirement || "600x600 porcelain floor tiles in Dhaka"}. Cite exact SKUs and note that BDT figures are indicative asking prices until a dealer issues a quotation.`,
          },
        },
      ],
    };
  }
  if (name === "plan_room_quantities") {
    return {
      description: prompt.description,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Calculate tile boxes for ${args.areaSqft || "400"} sq.ft using ${args.pattern || "brick"} laying pattern, then list whole boxes and minimum order thresholds.`,
          },
        },
      ],
    };
  }
  if (name === "match_crew_and_transport") {
    return {
      description: prompt.description,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find verified installation crews and transport fleet BDT fare estimates for ${args.district || "Dhaka"} across ${args.distanceKm || "20"} km.`,
          },
        },
      ],
    };
  }
  return {
    description: prompt.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Inspect live DigiTiles governance metrics and Cloudflare D1 health without exposing buyer or dealer PII.`,
        },
      },
    ],
  };
}

function rpcOk(id: unknown, result: unknown) {
  return { jsonrpc: "2.0" as const, id: id ?? null, result };
}

function rpcErr(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id: id ?? null, error: { code, message } };
}

async function handleSingleRpc(
  serverKey: McpServerKey,
  body: {
    id?: unknown;
    method?: string;
    params?: {
      name?: string;
      arguments?: Record<string, unknown>;
      uri?: string;
    };
  }
) {
  const def = BUILT_MCP_SERVERS[serverKey];
  const method = body.method || "";

  if (method === "initialize") {
    return rpcOk(body.id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false },
        prompts: { listChanged: false },
      },
      serverInfo: { name: def.name, version: def.version },
    });
  }

  if (method === "ping" || method.startsWith("notifications/")) {
    return rpcOk(body.id, {});
  }

  if (method === "tools/list") {
    return rpcOk(body.id, { tools: def.tools });
  }

  if (method === "tools/call") {
    const toolName = String(body.params?.name || "");
    const args = (body.params?.arguments || {}) as Record<string, unknown>;
    const exists = def.tools.some((t) => t.name === toolName);
    if (!exists) {
      return rpcErr(body.id, -32601, `Tool not found on ${def.name}: ${toolName}`);
    }
    const { output, isError } = await executeTool(serverKey, toolName, args);
    return rpcOk(body.id, {
      content: [{ type: "text", text: JSON.stringify(output) }],
      isError: Boolean(isError),
    });
  }

  if (method === "resources/list") {
    return rpcOk(body.id, { resources: def.resources });
  }

  if (method === "resources/read") {
    const uri = String(body.params?.uri || "");
    const content = await readResource(serverKey, uri);
    if (content === null) {
      return rpcErr(body.id, -32002, `Resource not found: ${uri}`);
    }
    return rpcOk(body.id, {
      contents: [{ uri, mimeType: "application/json", text: content }],
    });
  }

  if (method === "prompts/list") {
    return rpcOk(body.id, { prompts: def.prompts });
  }

  if (method === "prompts/get") {
    const name = String(body.params?.name || "");
    const promptArgs = (body.params?.arguments || {}) as Record<string, string>;
    const prompt = getPrompt(serverKey, name, promptArgs);
    if (!prompt) {
      return rpcErr(body.id, -32602, `Prompt not found: ${name}`);
    }
    return rpcOk(body.id, prompt);
  }

  return rpcErr(body.id, -32601, "Method not found");
}

export async function handleMcpHttpRequest(
  request: Request,
  serverKey: McpServerKey,
  includeSuiteDirectory = false
) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const def = BUILT_MCP_SERVERS[serverKey];

  if (request.method === "GET") {
    return Response.json(
      {
        name: def.name,
        version: def.version,
        protocolVersion: "2024-11-05",
        transports: ["streamable-http", "stdio"],
        transport: "streamable-http",
        endpoint: def.endpoint,
        stdioCommand: def.stdioCommand,
        description: def.description,
        tools: def.tools.map((t) => t.name),
        resources: def.resources.map((r) => r.uri),
        prompts: def.prompts.map((p) => p.name),
        models: WORKERS_MODELS,
        ...(includeSuiteDirectory
          ? {
              builtServers: Object.values(BUILT_MCP_SERVERS).map((s) => ({
                key: s.key,
                name: s.name,
                endpoint: s.endpoint,
                stdioCommand: s.stdioCommand,
                tools: s.tools.map((t) => t.name),
                reusedIn: s.reusedIn,
              })),
              usedServers: USED_MCP_SERVERS,
            }
          : {}),
      },
      { headers: CORS_HEADERS }
    );
  }

  if (request.method !== "POST") {
    return Response.json(
      rpcErr(null, -32600, "Method not allowed"),
      { status: 405, headers: CORS_HEADERS }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json(
      rpcErr(null, -32700, "Parse error"),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (Array.isArray(raw)) {
    const results = await Promise.all(
      raw.map((item) => handleSingleRpc(serverKey, item as Parameters<typeof handleSingleRpc>[1]))
    );
    return Response.json(results, { headers: CORS_HEADERS });
  }

  const single = await handleSingleRpc(
    serverKey,
    raw as Parameters<typeof handleSingleRpc>[1]
  );
  const status = "error" in single && single.error?.code === -32601 ? 404 : 200;
  return Response.json(single, { status, headers: CORS_HEADERS });
}
