#!/usr/bin/env node
import readline from "node:readline";

const args = process.argv.slice(2);
function readFlag(name, fallback) {
  const index = args.indexOf(name);
  if (index >= 0 && index + 1 < args.length) return args[index + 1];
  return fallback;
}

const serverKey = readFlag("--server", "catalogue");
const baseWebUrl = readFlag("--endpoint", "https://digitiles.equisaas-bd.com").replace(/\/+$/, "");
const edgeApiUrl = readFlag("--edge-api", "https://api.digitiles.equisaas-bd.com").replace(/\/+$/, "");

const SERVER_MAP = {
  catalogue: {
    name: "digitiles-catalogue-mcp",
    version: "1.0.0",
    url: `${baseWebUrl}/mcp`,
    tools: [
      {
        name: "search_catalogue",
        description: "Search published DigiTiles listings, showrooms, guides, and service records with bn/en support.",
        inputSchema: {
          type: "object",
          properties: {
            question: { type: "string" },
            focusListingId: { type: "string" },
          },
          required: ["question"],
        },
      },
      {
        name: "get_listing_specs",
        description: "Fetch moderated technical specifications and BDT pricing by listing ID or SKU.",
        inputSchema: {
          type: "object",
          properties: { listingIdOrSku: { type: "string" } },
          required: ["listingIdOrSku"],
        },
      },
    ],
    resources: [
      { uri: "digitiles://catalogue/verified-showrooms", name: "Verified DigiTiles Showrooms", mimeType: "application/json" },
      { uri: "digitiles://catalogue/public-listings", name: "Published Catalogue Summary", mimeType: "application/json" },
    ],
    prompts: [{ name: "compare_tiles_bdt", description: "Compare tile specs and indicative BDT box pricing", arguments: [{ name: "requirement", required: true }] }],
  },
  estimator: {
    name: "digitiles-estimator-mcp",
    version: "1.0.0",
    url: `${baseWebUrl}/mcp/estimator`,
    tools: [
      {
        name: "calculate_tile_boxes",
        description: "Calculate tile boxes required for floor/wall sq.ft with pattern wastage (5% straight, 10% brick, 15% herringbone).",
        inputSchema: {
          type: "object",
          properties: {
            areaSqft: { type: "number" },
            pattern: { type: "string", enum: ["straight", "brick", "herringbone"] },
            listingIdOrSku: { type: "string" },
          },
          required: ["areaSqft"],
        },
      },
      {
        name: "compare_laying_patterns",
        description: "Compare straight, brick, and herringbone box quantities and BDT budgets.",
        inputSchema: {
          type: "object",
          properties: { areaSqft: { type: "number" }, listingIdOrSku: { type: "string" } },
          required: ["areaSqft"],
        },
      },
    ],
    resources: [{ uri: "digitiles://estimator/wastage-standards", name: "Tile Laying Wastage Standards", mimeType: "application/json" }],
    prompts: [{ name: "plan_room_quantities", description: "Plan box counts before submitting an RFQ", arguments: [{ name: "areaSqft", required: true }] }],
  },
  services: {
    name: "digitiles-services-mcp",
    version: "1.0.0",
    url: `${baseWebUrl}/mcp/services`,
    tools: [
      {
        name: "find_installation_crews",
        description: "Filter verified tile installation crews by Bangladesh district, specialty, and BDT rate.",
        inputSchema: { type: "object", properties: { district: { type: "string" }, specialty: { type: "string" }, maxRateBdt: { type: "number" } } },
      },
      {
        name: "estimate_transport_fare",
        description: "Calculate district freight BDT estimates by haul distance and vehicle type.",
        inputSchema: { type: "object", properties: { district: { type: "string" }, distanceKm: { type: "number" }, vehicleType: { type: "string" } }, required: ["district", "distanceKm"] },
      },
    ],
    resources: [{ uri: "digitiles://services/verified-directory", name: "Verified Crews & Transport Directory", mimeType: "application/json" }],
    prompts: [{ name: "match_crew_and_transport", description: "Match crew and delivery vehicle for a district", arguments: [{ name: "district", required: true }, { name: "distanceKm", required: true }] }],
  },
  governance: {
    name: "digitiles-governance-mcp",
    version: "1.0.0",
    url: `${baseWebUrl}/mcp/governance`,
    tools: [
      { name: "get_marketplace_metrics", description: "Read aggregated non-PII marketplace telemetry and counts.", inputSchema: { type: "object", properties: {} } },
      { name: "inspect_state_machine", description: "Inspect 7-state verification or 9-state order lifecycle rules.", inputSchema: { type: "object", properties: { machine: { type: "string", enum: ["VERIFICATION", "ORDER"] } }, required: ["machine"] } },
    ],
    resources: [{ uri: "digitiles://governance/visibility-gate", name: "Public Visibility Gate Rules", mimeType: "application/json" }],
    prompts: [{ name: "audit_marketplace_sla", description: "Summarize marketplace governance metrics", arguments: [] }],
  },
  telemetry: {
    name: "digitiles-d1-telemetry-mcp",
    version: "1.0.0",
    url: `${edgeApiUrl}/mcp`,
    tools: [
      { name: "get_d1_health", description: "Query live Cloudflare D1 row counts and stateVersion.", inputSchema: { type: "object", properties: {} } },
      { name: "list_d1_tables", description: "Inspect the 8 Cloudflare D1 relational table contracts.", inputSchema: { type: "object", properties: {} } },
      { name: "screen_prompt_safety", description: "Screen user input with Workers AI @cf/meta/llama-guard-3-8b.", inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] } },
    ],
    resources: [{ uri: "digitiles://d1/schema-contract", name: "Cloudflare D1 Schema Contract", mimeType: "application/json" }],
    prompts: [{ name: "verify_edge_lineage", description: "Verify D1 health and sync timestamps", arguments: [] }],
  },
};

const active = SERVER_MAP[serverKey];
if (!active) {
  process.stderr.write(`Unknown --server "${serverKey}". Expected one of: ${Object.keys(SERVER_MAP).join(", ")}\n`);
  process.exit(1);
}

function writeResponse(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

async function forwardRemote(requestObj) {
  const response = await fetch(active.url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(requestObj),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

async function handleMessage(msg) {
  const id = msg.id ?? null;
  const method = String(msg.method || "");

  if (method.startsWith("notifications/")) {
    return null;
  }

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
        serverInfo: { name: active.name, version: active.version },
      },
    };
  }

  if (method === "ping") {
    return { jsonrpc: "2.0", id, result: {} };
  }

  try {
    const remote = await forwardRemote(msg);
    if (remote && remote.jsonrpc === "2.0") return remote;
  } catch (err) {
    if (method === "tools/list") {
      return { jsonrpc: "2.0", id, result: { tools: active.tools } };
    }
    if (method === "resources/list") {
      return { jsonrpc: "2.0", id, result: { resources: active.resources } };
    }
    if (method === "prompts/list") {
      return { jsonrpc: "2.0", id, result: { prompts: active.prompts } };
    }
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: `Failed reaching ${active.url}: ${err instanceof Error ? err.message : String(err)}`,
      },
    };
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
const pending = [];

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  const task = (async () => {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      writeResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    const result = await handleMessage(parsed);
    if (result) writeResponse(result);
  })();
  pending.push(task);
});

rl.on("close", async () => {
  await Promise.allSettled(pending);
  process.exit(0);
});
