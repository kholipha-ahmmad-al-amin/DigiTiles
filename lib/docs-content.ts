export type DocsBlock =
  | { type: "lead"; text: string }
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; head: string[]; rows: (string | number)[][] }
  | { type: "callout"; title?: string; text: string; tone?: "info" | "warn" | "success" }
  | { type: "code"; text: string }
  | { type: "diagram"; id: "architecture" | "data-flow" }
  | { type: "live"; kind: "metrics" | "feature-matrix" | "analytics" | "order-states" }
  | { type: "pitch-slides" }
  | { type: "team" };

export interface DocsSectionContent {
  kicker?: { en: string; bn: string };
  blocks: DocsBlock[];
}

export const DOCS_CONTENT: Record<string, DocsSectionContent> = {
  overview: {
    kicker: { en: "What DigiTiles does", bn: "ডিজিটাইলস কী করে" },
    blocks: [
      {
        type: "lead",
        text: "DigiTiles is a connected construction commerce and services ecosystem for Bangladesh. It helps customers discover construction materials, starting with tiles, sanitaryware, and surface finishes, and connect directly with verified dealers through structured listings, Request for Quotation workflows, transparent quotations, and tracked orders.",
      },
      {
        type: "p",
        text: "Once the core buyer-to-dealer transaction loop is proven, later phases expand into dedicated transport matching, installation professionals (engineers, architects, contractors, masons), project procurement workflows, and AR/3D room visualization.",
      },
      { type: "h3", text: "Target users" },
      {
        type: "list",
        items: [
          "Customers and project buyers who need to compare specifications, pricing, and delivery for construction materials.",
          "Dealer owners and showroom staff who publish catalogues, answer RFQs, and fulfil orders.",
          "Platform administrators who verify dealers, moderate listings, resolve disputes, and audit every privileged action.",
        ],
      },
      { type: "h3", text: "Core use cases" },
      {
        type: "table",
        head: ["Use case", "Actors", "Outcome"],
        rows: [
          ["Material discovery", "Customer", "Search and filter approved listings by category, district, finish, dimensions, and BDT price"],
          ["Quote negotiation", "Customer + Dealer", "Structured RFQ answered with an immutable, versioned itemized quotation"],
          ["Order fulfilment", "Customer + Dealer + Admin", "Atomic order creation, enforced state machine, delivery coordination, dispute handling"],
          ["Showroom operations", "Dealer staff", "Branch-level stock lots, listing moderation, SLA analytics"],
          ["Marketplace trust", "Platform Admin", "Dealer verification lifecycle, listing moderation queue, immutable audit trail"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "North Star metric",
        text: "Monthly Successfully Fulfilled Construction Transactions: the count of orders reaching the COMPLETED state per calendar month.",
      },
    ],
  },

  "pitch-deck": {
    kicker: { en: "YC-style narrative", bn: "ওয়াইকমবিনেটর-স্টাইল উপস্থাপনা" },
    blocks: [
      {
        type: "p",
        text: "The twelve-slide executive narrative below is the same deck presented at /pitch-deck, rendered here as a readable, printable document. Each slide carries a five-step breakdown and bilingual speech notes for live presentation.",
      },
      { type: "pitch-slides" },
    ],
  },

  features: {
    kicker: { en: "Live-synced capability matrix", bn: "লাইভ-সিংকড ক্যাপাবিলিটি ম্যাট্রিক্স" },
    blocks: [
      {
        type: "p",
        text: "Current capabilities are computed live from the production database on every page load. Upcoming and planned items are tracked on the roadmap.",
      },
      { type: "live", kind: "feature-matrix" },
    ],
  },

  architecture: {
    kicker: { en: "UI to edge persistence", bn: "ইউআই থেকে এজ পারসিস্টেন্স" },
    blocks: [
      {
        type: "p",
        text: "DigiTiles is a cloud-native modular monolith. The Next.js App Router serves public pages and API route handlers; domain modules enforce business rules; writes are persisted transactionally and synchronized to Cloudflare D1.",
      },
      { type: "diagram", id: "architecture" },
      { type: "h3", text: "Domain module boundaries" },
      {
        type: "table",
        head: ["Module", "Responsibilities", "Requirements"],
        rows: [
          ["Identity & Multi-Role", "Firebase Google and Email/Password sign-in, canonical user identity, role switching, signed session cookies", "FR-01, FR-02"],
          ["Organization & Verification", "Dealer profiles, branches, staff memberships, 7-state verification machine, tenant isolation", "FR-03, FR-04"],
          ["Catalogue & Discovery", "Categories, listings, variants, public visibility gate, faceted search", "FR-05, FR-06, FR-07"],
          ["RFQ & Quotations", "Multi-item RFQs, immutable versioned quotations with validity windows", "FR-08, FR-09"],
          ["Orders & Delivery", "Atomic idempotent acceptance, state machine, delivery coordination, disputes", "FR-10, FR-11, FR-12"],
          ["Notifications, Admin & Audit", "Notification feed, moderation console, immutable audit log", "FR-13, FR-14"],
        ],
      },
    ],
  },

  "data-flow": {
    kicker: { en: "Request lifecycle", bn: "রিকোয়েস্ট লাইফসাইকেল" },
    blocks: [
      {
        type: "p",
        text: "A commercial request flows from public discovery through dealer quotation to a frozen order snapshot, with every privileged mutation recorded in the audit trail.",
      },
      { type: "diagram", id: "data-flow" },
      { type: "h3", text: "Integrity guarantees" },
      {
        type: "list",
        items: [
          "Quotations become immutable once sent; revisions are new versions that supersede prior offers.",
          "Quote acceptance is atomic and idempotent: retries return the existing order, never a duplicate.",
          "Orders store frozen buyer, seller, item, and pricing snapshots; later catalogue edits never rewrite history.",
          "Every order transition validates the actor role and previous state, and appends a timestamped history entry.",
        ],
      },
    ],
  },

  "tech-stack": {
    kicker: { en: "Production stack", bn: "প্রোডাকশন স্ট্যাক" },
    blocks: [
      { type: "live", kind: "metrics" },
      {
        type: "table",
        head: ["Layer", "Technology", "Production resource"],
        rows: [
          ["Frontend", "Next.js 14 App Router, React 18, TypeScript 5, Tailwind CSS 3.4, Framer Motion, Lucide icons", "digitiles.equisaas-bd.com"],
          ["Edge API", "Cloudflare Workers (vinext deployment)", "digitiles-cloud-api @ api.digitiles.equisaas-bd.com"],
          ["Relational DB", "Cloudflare D1 Serverless SQLite (8 tables + platform_state)", "digitiles-prod-db"],
          ["Edge cache", "Cloudflare Workers KV", "DIGITILES_KV"],
          ["Auth", "Firebase Authentication project digitiles-bd (Google + Email/Password), HMAC-SHA256 session cookies", "Project 700109702504"],
          ["AI", "Cloudflare Workers AI: llama-guard-3-8b moderation, bge-base-en-v1.5 embeddings, llama-3.2-3b-instruct answers; Gemini fallback", "Bound on API worker"],
          ["Testing", "Playwright + Axe-core WCAG 2.1 AA suite", "tests/"],
          ["Schema contract", "Prisma schema for PostgreSQL/SQLite portability", "prisma/schema.prisma"],
        ],
      },
    ],
  },

  api: {
    kicker: { en: "REST contract", bn: "রেস্ট কন্ট্রাক্ট" },
    blocks: [
      {
        type: "p",
        text: "All API routes return structured JSON envelopes: { ok: boolean, data?: T, error?: { code, message } }. Server-side authorization, role guards, and tenant isolation are enforced on every handler.",
      },
      {
        type: "table",
        head: ["Method & endpoint", "Guard", "Purpose"],
        rows: [
          ["POST /api/auth/firebase", "Public (token verified)", "Verify Firebase ID token, upsert user, set session cookie"],
          ["POST /api/auth/session", "Public / Authenticated", "Session bootstrap, role switching, logout"],
          ["GET /api/cloud/status", "Public", "Live D1 health telemetry and table counts"],
          ["GET /api/listings", "Public", "Search, filter, sort, paginate discoverable listings"],
          ["GET /api/listings/[id]", "Public", "Full listing detail with variants and verified dealer info"],
          ["GET/PUT /api/dealer/organization", "DEALER tenant-scoped", "Organization profile, branches, staff, verification"],
          ["GET/POST /api/dealer/listings", "DEALER tenant-scoped", "Dealer listing CRUD and moderation submission"],
          ["GET/POST /api/rfqs", "CUSTOMER / DEALER scoped", "RFQ creation and scoped listing"],
          ["POST /api/rfqs/[id]/quotes", "DEALER verified org", "Issue immutable versioned quotation"],
          ["POST /api/quotes/[id]/accept", "CUSTOMER owner", "Atomic idempotent quote acceptance and order creation"],
          ["GET /api/orders", "CUSTOMER / DEALER / ADMIN", "Scoped order lists"],
          ["POST /api/orders/[id]/transition", "Role-checked", "State transitions, delivery updates, disputes"],
          ["GET /api/notifications", "Authenticated", "Notification feed and read marking"],
          ["GET/POST /api/admin/moderate", "ADMIN", "Verification decisions, listing moderation, audit"],
          ["GET /api/admin/docs", "ADMIN", "Docs site configuration and public access state"],
          ["PUT /api/admin/docs", "ADMIN", "Update docs visibility, schedule, team, and content overrides"],
          ["GET/POST /api/admin/audit", "ADMIN", "Immutable audit trail"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Auth model",
        text: "Firebase ID tokens are verified server-side against Google Identity Toolkit. Sessions are HMAC-SHA256 signed, stored in httpOnly SameSite=Lax cookies, and expire after 7 days. Role switches never require re-authentication.",
      },
    ],
  },

  "data-layer": {
    kicker: { en: "Persistence and privacy", bn: "পারসিস্টেন্স ও প্রাইভেসি" },
    blocks: [
      {
        type: "p",
        text: "The transactional store persists the canonical database to Cloudflare D1 on every write. Eight relational tables mirror the domain model, and a monotonically increasing platform_state version guards consistency.",
      },
      {
        type: "table",
        head: ["Table", "Contents", "Key indexes"],
        rows: [
          ["platform_state", "Canonical JSON snapshot + version", "id = canonical"],
          ["users", "Identity, roles, auth provider, Firebase UID", "phone, firebase_uid"],
          ["organizations", "Dealer profiles, verification state, trade credentials", "verification_status, primary_district"],
          ["dealer_listings", "Catalogues, specs, BDT pricing, moderation state", "organization_id, moderation_status"],
          ["rfqs", "Buyer requests with delivery district and items", "customer_id, status"],
          ["quotations", "Immutable versioned quotes with validity", "rfq_id, organization_id"],
          ["orders", "Frozen commercial snapshots and state history", "customer_id, organization_id, status"],
          ["audit_logs", "Chronological immutable admin and lifecycle events", "created_at"],
        ],
      },
      {
        type: "list",
        items: [
          "Tenant isolation is enforced at the server layer: dealer staff can only touch their own organizationId.",
          "Public discovery never exposes draft, paused, pending, or rejected listings.",
          "Order snapshots freeze buyer, seller, item, and pricing data at acceptance time.",
          "Credentials and session secrets are never committed; docs/ and .env files stay out of the deployment commit.",
        ],
      },
    ],
  },

  "ai-layer": {
    kicker: { en: "Catalogue intelligence", bn: "ক্যাটালগ ইন্টেলিজেন্স" },
    blocks: [
      {
        type: "p",
        text: "The public assistant at /assistant answers strictly from published listings, guides, and the service directory. Retrieval happens in the web app; generation happens on the API worker.",
      },
      {
        type: "list",
        items: [
          "Each listing is chunked into a record, a specification section, and a price section; guides split into introduction, steps, and questions.",
          "A listing hit also pulls the showroom record and that showroom's other listings for grounded cross-links.",
          "The API worker screens questions with @cf/meta/llama-guard-3-8b, ranks passages with @cf/baai/bge-base-en-v1.5 embeddings, and writes answers with @cf/meta/llama-3.2-3b-instruct.",
          "Gemini is the fallback when GEMINI_API_KEY is configured; otherwise the page quotes the closest published titles.",
          "GET /mcp and POST /mcp expose a search_catalogue tool over MCP JSON-RPC for agent clients.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Explainability",
        text: "The assistant displays the model id that produced each answer and only cites passages that exist in the published catalogue. It cannot invent prices, stock, or dealer claims.",
      },
    ],
  },

  roadmap: {
    kicker: { en: "What is next", bn: "পরের ধাপ" },
    blocks: [
      {
        type: "table",
        head: ["Horizon", "Theme", "Deliverables"],
        rows: [
          ["Now (MVP live)", "Marketplace transaction loop", "Discovery, RFQ, immutable quotes, atomic orders, delivery coordination, admin moderation, bilingual bn/en, light/dark themes"],
          ["Short term", "Commercial tooling", "Printable proforma invoices and delivery challans, side-by-side quote comparison, batch/shade lot inventory ledger, multi-branch stock reservation"],
          ["Mid term", "Visualization & services", "Interactive 2D/3D room visualizer with laying patterns and grout controls, verified mason/contractor directory, transport vehicle matching with BDT estimators"],
          ["Long term", "Ecosystem expansion", "AR/3D camera room engine, project procurement workflows, supplier onboarding, escrow and split payouts after legal and payment clearance"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Sequencing rule",
        text: "AR/3D, escrow, and distributed infrastructure stay out of scope until the core marketplace transaction loop is proven at pilot volume.",
      },
    ],
  },

  performance: {
    kicker: { en: "Speed and scale targets", bn: "গতি ও স্কেল লক্ষ্য" },
    blocks: [
      {
        type: "table",
        head: ["Dimension", "Target / Strategy"],
        rows: [
          ["Catalogue reads", "p95 under 700ms for common workspace reads; filtered discovery search p95 under 1.2s at pilot load"],
          ["Availability", "99.5% monthly uptime on the zero-cost cloud tier"],
          ["Edge caching", "Cloudflare KV for state revision metadata; D1 for relational truth; no-store on session-sensitive routes"],
          ["Rendering", "Server components for public pages, lazy client islands for workspaces, print-optimized docs export"],
          ["Scale path", "Modular monolith boundaries allow extracting hot domains into workers when transaction volume justifies it"],
        ],
      },
    ],
  },

  security: {
    kicker: { en: "Trust and governance", bn: "বিশ্বাস ও গভর্নেন্স" },
    blocks: [
      {
        type: "list",
        items: [
          "Server-side authorization on every route and API handler; no client-trusted role checks.",
          "Strict tenant isolation by organizationId for all dealer-scoped resources.",
          "HTTP-only signed session tokens with HMAC-SHA256 and 7-day expiry.",
          "Rate-limited Firebase Auth endpoints and verified Identity Toolkit lookups.",
          "Public visibility gate: ACTIVE listing + APPROVED moderation + VERIFIED organization.",
          "Immutable audit log for every privileged admin action, order transition, and verification decision.",
          "WCAG 2.1 AA contrast in both light and dark modes, keyboard navigation, and 44px touch targets.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Docs site access control",
        text: "This documentation module is itself governed: admins can disable public access entirely or restrict it to a scheduled window for judging, investor previews, or showcase periods. See /docs/admin.",
      },
    ],
  },

  analytics: {
    kicker: { en: "Live system telemetry", bn: "লাইভ সিস্টেম টেলিমেট্রি" },
    blocks: [
      {
        type: "p",
        text: "The figures below are computed from the live database at render time. They are the same metrics shown to platform administrators.",
      },
      { type: "live", kind: "analytics" },
      { type: "live", kind: "order-states" },
    ],
  },

  team: {
    kicker: { en: "People behind DigiTiles", bn: "ডিজিটাইলসের পেছনের মানুষ" },
    blocks: [
      {
        type: "p",
        text: "Team membership is managed by administrators and synced to this page. Profile photos are normalized to uniform cards with a monogram fallback when no photo is provided.",
      },
      { type: "team" },
    ],
  },

  changelog: {
    kicker: { en: "Version history", bn: "ভার্সন ইতিহাস" },
    blocks: [
      {
        type: "table",
        head: ["Version", "Date", "Change"],
        rows: [
          ["Docs Site v1", "14 Nov 2026", "Initial /docs module: pitch deck, technical documentation, live metrics, admin publishing controls"],
          ["Docs Site v1", "14 Nov 2026", "Cloudflare D1 + Workers production architecture live; role credentials verified for all 8 production accounts"],
          ["Platform", "11 Nov 2026", "12-slide 3D executive pitch deck at /pitch-deck with bilingual teleprompter"],
          ["Platform", "11 Nov 2026", "Commercial tooling: proforma invoices, challans, quote comparison, lot inventory"],
          ["Platform", "03 Nov 2026", "Marketplace MVP: discovery, RFQ, immutable quotes, atomic orders, admin moderation"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Document set",
        text: "The authoritative product baseline lives in docs/01-PRD.md through docs/06-Implementation-Plan.md, with production architecture in docs/08 and credentials in docs/10 (local only, excluded from deployment).",
      },
    ],
  },
};

export function getSectionContent(sectionId: string): DocsSectionContent {
  return DOCS_CONTENT[sectionId] || { blocks: [] };
}
