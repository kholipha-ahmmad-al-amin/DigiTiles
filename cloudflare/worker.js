// DigiTiles API worker. D1 digitiles-prod-db, KV DIGITILES_KV, Workers AI binding AI.
// Public hostname https://api.digitiles.equisaas-bd.com forwards here from the domain account.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, X-Digitiles-Sync-Key",
  "Content-Type": "application/json; charset=utf-8",
};

const EDGE_MCP_TOOLS = [
  {
    name: "get_d1_health",
    description: "Query live Cloudflare D1 (digitiles-prod-db) row counts across 7 relational tables and platform_state version.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_d1_tables",
    description: "Return the canonical 8-table Cloudflare D1 SQLite schema contract and indexes.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "screen_prompt_safety",
    description: "Screen user input with Workers AI @cf/meta/llama-guard-3-8b before retrieval and answer generation.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Buyer prompt or text to screen for safety." },
      },
      required: ["text"],
    },
  },
];

const EDGE_MCP_RESOURCES = [
  {
    uri: "digitiles://d1/schema-contract",
    name: "Cloudflare D1 Schema Contract",
    description: "Relational SQLite tables and indexes deployed on digitiles-prod-db.",
    mimeType: "application/json",
  },
];

const EDGE_D1_TABLES = [
  { table: "platform_state", purpose: "Canonical JSON snapshot and monotonic version counter", indexes: ["id (PRIMARY KEY)"] },
  { table: "users", purpose: "Firebase Auth identities, roles JSON array, preferred locale", indexes: ["idx_users_phone", "idx_users_email"] },
  { table: "organizations", purpose: "Showroom profiles, districts, verification status", indexes: ["verification_status", "primary_district"] },
  { table: "dealer_listings", purpose: "Tile specifications, BDT rates, moderation state", indexes: ["idx_listings_org"] },
  { table: "rfqs", purpose: "Buyer requests for itemized quotations", indexes: ["idx_rfqs_customer"] },
  { table: "quotations", purpose: "Immutable versioned BDT quotations", indexes: ["idx_quotes_rfq"] },
  { table: "orders", purpose: "Orders with frozen commercial snapshots and state history", indexes: ["idx_orders_customer", "idx_orders_org"] },
  { table: "audit_logs", purpose: "Append-only governance and moderation ledger", indexes: ["created_at"] },
];

async function readD1HealthSnapshot(env) {
  const counts = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS count FROM users"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM organizations"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM dealer_listings"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM rfqs"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM quotations"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM orders"),
    env.DB.prepare("SELECT COUNT(*) AS count FROM audit_logs"),
    env.DB.prepare("SELECT version, updated_at FROM platform_state WHERE id = 'canonical'"),
  ]);

  const kvUpdatedAt = env.DIGITILES_KV
    ? await env.DIGITILES_KV.get("canonical_updated_at").catch(() => null)
    : null;
  const stateMeta = counts[7]?.results?.[0] || null;

  return {
    ok: true,
    service: "digitiles-cloud-api",
    provider: "Cloudflare Workers + D1 SQL + Workers KV",
    d1Database: "digitiles-prod-db",
    firebaseProject: env.FIREBASE_PROJECT_ID || "digitiles-bd",
    platformDomain: env.PLATFORM_DOMAIN || "https://digitiles.equisaas-bd.com",
    stateVersion: stateMeta ? stateMeta.version : 0,
    lastSyncedAt: stateMeta ? stateMeta.updated_at : kvUpdatedAt,
    kvSyncedAt: kvUpdatedAt,
    relationalTables: {
      users: counts[0]?.results?.[0]?.count ?? 0,
      organizations: counts[1]?.results?.[0]?.count ?? 0,
      dealerListings: counts[2]?.results?.[0]?.count ?? 0,
      rfqs: counts[3]?.results?.[0]?.count ?? 0,
      quotations: counts[4]?.results?.[0]?.count ?? 0,
      orders: counts[5]?.results?.[0]?.count ?? 0,
      auditLogs: counts[6]?.results?.[0]?.count ?? 0,
    },
  };
}

async function handleEdgeMcpRpc(body, env) {
  const id = body?.id ?? null;
  const method = String(body?.method || "");

  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
        },
        serverInfo: { name: "digitiles-d1-telemetry-mcp", version: "1.0.0" },
      },
    };
  }

  if (method === "ping" || method.startsWith("notifications/")) {
    return { jsonrpc: "2.0", id, result: {} };
  }

  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: EDGE_MCP_TOOLS } };
  }

  if (method === "tools/call") {
    const toolName = String(body?.params?.name || "");
    const args = body?.params?.arguments || {};

    if (toolName === "get_d1_health") {
      const snapshot = await readD1HealthSnapshot(env);
      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(snapshot) }], isError: false },
      };
    }

    if (toolName === "list_d1_tables") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: JSON.stringify({ database: "digitiles-prod-db", tables: EDGE_D1_TABLES }) }],
          isError: false,
        },
      };
    }

    if (toolName === "screen_prompt_safety") {
      const text = String(args.text || "").slice(0, 2000);
      if (text.trim().length < 2) {
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "text is required" }) }], isError: true },
        };
      }
      if (!env.AI) {
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify({ ok: false, verdict: "unavailable" }) }], isError: false },
        };
      }
      const verdict = await env.AI.run("@cf/meta/llama-guard-3-8b", {
        messages: [{ role: "user", content: text }],
      });
      const serialized = JSON.stringify(verdict).toLowerCase();
      const safe = !serialized.includes("unsafe");
      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ok: true, model: "@cf/meta/llama-guard-3-8b", safe, verdict: safe ? "safe" : "unsafe", raw: verdict }),
            },
          ],
          isError: false,
        },
      };
    }

    return { jsonrpc: "2.0", id, error: { code: -32601, message: `Unknown tool: ${toolName}` } };
  }

  if (method === "resources/list") {
    return { jsonrpc: "2.0", id, result: { resources: EDGE_MCP_RESOURCES } };
  }

  if (method === "resources/read") {
    const uri = String(body?.params?.uri || "");
    if (uri === "digitiles://d1/schema-contract") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({ database: "digitiles-prod-db", tables: EDGE_D1_TABLES }, null, 2),
            },
          ],
        },
      };
    }
    return { jsonrpc: "2.0", id, error: { code: -32002, message: `Resource not found: ${uri}` } };
  }

  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}

async function syncRelationalTables(db, state) {
  const stmts = [];
  const nowIso = new Date().toISOString();

  if (Array.isArray(state.users)) {
    for (const u of state.users) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO users (id, phone, full_name, email, firebase_uid, auth_provider, active_role, roles_json, preferred_locale, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
          )
          .bind(
            String(u.id ?? ""),
            String(u.phone ?? u.id ?? ""),
            String(u.fullName ?? "DigiTiles User"),
            u.email ? String(u.email) : null,
            u.firebaseUid ? String(u.firebaseUid) : null,
            String(u.authProvider ?? "EMAIL"),
            String(u.activeRole ?? "CUSTOMER"),
            JSON.stringify(u.roles ?? ["CUSTOMER"]),
            String(u.preferredLocale ?? "bn"),
            String(u.createdAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.organizations)) {
    for (const o of state.organizations) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO organizations (id, slug, trade_name_en, trade_name_bn, primary_district, contact_phone, verification_status, trade_license_no, tin_number, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
          )
          .bind(
            String(o.id ?? ""),
            String(o.slug ?? ""),
            String(o.tradeNameEn ?? ""),
            String(o.tradeNameBn ?? ""),
            String(o.primaryDistrict ?? "Dhaka"),
            String(o.contactPhone ?? ""),
            String(o.verificationStatus ?? "DRAFT"),
            String(o.tradeLicenseNo ?? ""),
            String(o.tinNumber ?? ""),
            String(o.updatedAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.listings)) {
    for (const l of state.listings) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO dealer_listings (id, organization_id, product_id, sku, price_per_sqft_bdt, price_per_box_bdt, stock_status, moderation_status, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
          )
          .bind(
            String(l.id ?? ""),
            String(l.organizationId ?? ""),
            String(l.categoryId ?? l.productId ?? ""),
            String(l.sku ?? ""),
            Number(l.pricePerSqftBdt ?? 0),
            Number(l.pricePerBoxBdt ?? 0),
            String(l.visibilityStatus ?? `${l.stockBoxes ?? 0}_BOXES`),
            String(l.moderationStatus ?? "APPROVED"),
            String(l.updatedAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.rfqs)) {
    for (const r of state.rfqs) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO rfqs (id, rfq_number, customer_id, project_title, delivery_district, status, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
          )
          .bind(
            String(r.id ?? ""),
            String(r.rfqNumber ?? ""),
            String(r.customerUserId ?? r.customerId ?? ""),
            String(r.projectNotes ?? r.projectTitle ?? ""),
            String(r.deliveryDistrict ?? "Dhaka"),
            String(r.status ?? "OPEN"),
            String(r.createdAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.quotations)) {
    for (const q of state.quotations) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO quotations (id, quote_number, rfq_id, organization_id, total_amount_bdt, status, valid_until, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
          )
          .bind(
            String(q.id ?? ""),
            String(q.quoteNumber ?? ""),
            String(q.rfqId ?? ""),
            String(q.organizationId ?? ""),
            Number(q.totalAmountBdt ?? 0),
            String(q.status ?? "SENT"),
            String(q.validUntil ?? nowIso),
            String(q.createdAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.orders)) {
    for (const ord of state.orders) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO orders (id, order_number, rfq_id, quote_id, customer_id, organization_id, total_amount_bdt, status, snapshot_json, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
          )
          .bind(
            String(ord.id ?? ""),
            String(ord.orderNumber ?? ""),
            String(ord.rfqId ?? ""),
            String(ord.quotationId ?? ord.quoteId ?? ""),
            String(ord.customerUserId ?? ord.customerId ?? ""),
            String(ord.organizationId ?? ""),
            Number(ord.pricingSnapshot?.grandTotalBdt ?? ord.snapshot?.totalAmountBdt ?? 0),
            String(ord.state ?? ord.status ?? "PENDING_CONFIRMATION"),
            JSON.stringify(ord.commercialSnapshot ?? ord.pricingSnapshot ?? {}),
            String(ord.updatedAt ?? nowIso)
          )
      );
    }
  }

  if (Array.isArray(state.auditLogs)) {
    for (const log of state.auditLogs.slice(0, 100)) {
      stmts.push(
        db
          .prepare(
            `INSERT OR REPLACE INTO audit_logs (id, actor_user_id, actor_name, actor_role, action, entity_type, entity_id, summary, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
          )
          .bind(
            String(log.id ?? ""),
            String(log.actorUserId ?? ""),
            String(log.actorName ?? ""),
            String(log.actorRole ?? "ADMIN"),
            String(log.action ?? ""),
            String(log.entityType ?? "ORDER"),
            String(log.entityId ?? ""),
            String(log.summary ?? ""),
            String(log.createdAt ?? nowIso)
          )
      );
    }
  }

  if (stmts.length > 0) {
    await db.batch(stmts);
  }
}

function embeddingRows(payload) {
  const data = payload?.data;
  if (Array.isArray(data) && Array.isArray(data[0])) return data;
  if (Array.isArray(data) && Array.isArray(payload?.shape) && payload.shape.length === 2) {
    const [rows, columns] = payload.shape;
    const out = [];
    for (let row = 0; row < rows; row += 1) out.push(data.slice(row * columns, (row + 1) * columns));
    return out;
  }
  return [];
}

function cosine(left, right) {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

const worker = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/" || path === "/health" || path === "/api/sql-stats") {
        const snapshot = await readD1HealthSnapshot(env);
        return jsonResponse(snapshot);
      }

      if (path === "/mcp") {
        if (request.method === "GET") {
          return jsonResponse({
            name: "digitiles-d1-telemetry-mcp",
            version: "1.0.0",
            protocolVersion: "2024-11-05",
            transports: ["streamable-http", "stdio"],
            transport: "streamable-http",
            endpoint: "https://api.digitiles.equisaas-bd.com/mcp",
            tools: EDGE_MCP_TOOLS.map((t) => t.name),
            resources: EDGE_MCP_RESOURCES.map((r) => r.uri),
          });
        }
        if (request.method === "POST") {
          let payload;
          try {
            payload = await request.json();
          } catch {
            return jsonResponse({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400);
          }
          if (Array.isArray(payload)) {
            const results = await Promise.all(payload.map((item) => handleEdgeMcpRpc(item, env)));
            return jsonResponse(results);
          }
          const rpcResult = await handleEdgeMcpRpc(payload, env);
          return jsonResponse(rpcResult, rpcResult.error?.code === -32601 ? 404 : 200);
        }
      }

      if (path === "/api/ai/answer" && request.method === "POST") {
        if (!env.AI) return jsonResponse({ ok: false, error: "Workers AI is not bound" }, 503);
        const body = await request.json();
        const question = String(body.question || "").slice(0, 500);
        const locale = body.locale === "en" ? "en" : "bn";
        const passages = Array.isArray(body.passages) ? body.passages.slice(0, 8) : [];
        if (question.length < 2 || passages.length === 0) {
          return jsonResponse({ ok: false, error: "Question and passages are required" }, 400);
        }
        const guard = await env.AI.run("@cf/meta/llama-guard-3-8b", {
          messages: [{ role: "user", content: question }],
        });
        if (JSON.stringify(guard).toLowerCase().includes("unsafe")) {
          return jsonResponse({
            ok: true,
            model: "@cf/meta/llama-guard-3-8b",
            answer: locale === "bn"
              ? "এই প্রশ্ন ক্যাটালগ সহায়কের বাইরে। প্রকাশিত পণ্য, স্পেসিফিকেশন বা বক্স হিসাব জিজ্ঞাসা করুন।"
              : "That question is outside the catalogue assistant. Ask about a published product, specification, or box estimate.",
            usedSourceIds: [],
          });
        }
        const documents = passages.map((passage) => `${passage.title || ""}. ${String(passage.text || "").slice(0, 1200)}`);
        const embedded = await env.AI.run("@cf/baai/bge-base-en-v1.5", { text: [question, ...documents] });
        const rows = embeddingRows(embedded);
        const ranked = passages
          .map((passage, index) => ({ passage, score: cosine(rows[0] || [], rows[index + 1] || []) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 4);
        const context = ranked
          .map(({ passage }) => `[${passage.id}] ${passage.title}\n${String(passage.text || "").slice(0, 1200)}`)
          .join("\n\n");
        const chat = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
          messages: [
            {
              role: "system",
              content: "Answer only from the passages. Prices are indicative BDT asking prices, not quotations. Do not invent showrooms, stock, or discounts. Return JSON with keys answer and usedSourceIds. " + (locale === "bn" ? "Write the answer in Bangla." : "Write the answer in English."),
            },
            { role: "user", content: `Question: ${question}\n\nPassages:\n${context}` },
          ],
          max_tokens: 400,
        });
        const raw = String(chat?.response || "").replace(/```json|```/g, "").trim();
        let answer = raw;
        let usedSourceIds = ranked.map(({ passage }) => String(passage.id || ""));
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (parsed.answer) answer = String(parsed.answer);
            if (Array.isArray(parsed.usedSourceIds)) usedSourceIds = parsed.usedSourceIds.map(String);
          } catch {
            answer = raw;
          }
        }
        return jsonResponse({
          ok: true,
          model: "@cf/meta/llama-3.2-3b-instruct",
          embedModel: "@cf/baai/bge-base-en-v1.5",
          answer,
          usedSourceIds,
        });
      }

      if (path === "/api/ai/screen" && request.method === "POST") {
        if (!env.AI) {
          return jsonResponse({ ok: false, error: "Workers AI is not bound" }, 503);
        }
        const body = await request.json();
        const text = String(body.text || "").slice(0, 2000);
        if (text.length < 2) {
          return jsonResponse({ ok: false, error: "Text is required" }, 400);
        }
        const verdict = await env.AI.run("@cf/meta/llama-guard-3-8b", {
          messages: [{ role: "user", content: text }],
        });
        return jsonResponse({ ok: true, model: "@cf/meta/llama-guard-3-8b", verdict });
      }

      if (path === "/api/state" && request.method === "GET") {
        const row = await env.DB.prepare(
          "SELECT payload, version, updated_at FROM platform_state WHERE id = 'canonical'"
        ).first();

        if (!row || !row.payload) {
          return jsonResponse({ found: false, state: null }, 200);
        }

        return jsonResponse({
          found: true,
          version: row.version,
          updatedAt: row.updated_at,
          state: JSON.parse(row.payload),
        });
      }

      if (path === "/api/state" && (request.method === "PUT" || request.method === "POST")) {
        const syncKey = request.headers.get("X-Digitiles-Sync-Key");
        if (env.SYNC_SHARED_KEY && syncKey !== env.SYNC_SHARED_KEY) {
          return jsonResponse({ error: "Unauthorized sync key" }, 401);
        }

        const body = await request.json();
        const state = body.state || body;
        const now = new Date().toISOString();
        const payload = JSON.stringify(state);

        await env.DB.prepare(
          `INSERT INTO platform_state (id, payload, version, updated_at)
           VALUES ('canonical', ?1, 1, ?2)
           ON CONFLICT(id) DO UPDATE SET
             payload = excluded.payload,
             version = platform_state.version + 1,
             updated_at = excluded.updated_at`
        )
          .bind(payload, now)
          .run();

        await syncRelationalTables(env.DB, state);

        if (env.DIGITILES_KV) {
          await env.DIGITILES_KV.put("canonical_updated_at", now);
        }

        return jsonResponse({
          ok: true,
          updatedAt: now,
        });
      }

      return jsonResponse({ error: "Route not found", path }, 404);
    } catch (err) {
      return jsonResponse(
        {
          error: "Internal D1 Worker Error",
          message: err instanceof Error ? err.message : String(err),
        },
        500
      );
    }
  },
};

export default worker;
