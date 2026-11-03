# DigiTiles

DigiTiles is a bilingual tile and construction materials marketplace for Bangladesh. Buyers compare verified showroom listings, estimate tile quantities, request itemized BDT quotes, and track delivery. Dealers manage catalogues, quotations, branch stock, and fulfilment. Platform administrators verify showrooms, moderate listings, and resolve disputes.

## Marketplace and workspaces

| Area | Routes | Workflow |
| --- | --- | --- |
| Discovery | `/`, `/marketplace`, `/marketplace/[listingId]` | Search approved listings, compare up to four technical specifications and landed price estimates, request a quote |
| Planning | `/visualizer`, `/guides`, `/guides/[slug]` | Preview four room presets in plan and perspective, adjust grout and lighting, calculate boxes with pattern-based wastage |
| Services | `/services` | Find crews by district and specialty, filter rates and project counts, and estimate material transport |
| Customer | `/workspace/customer`, `/workspace/customer/rfqs`, `/workspace/customer/orders` | Accept quotes, print proformas and challans, track dispatch, and save an installation crew preference |
| Dealer | `/workspace/dealer`, `/workspace/dealer/organization`, `/workspace/dealer/catalogue`, `/workspace/dealer/rfqs`, `/workspace/dealer/orders` | Manage branch lots, issue immutable quotes, confirm stock and dispatch, and review SLA analytics |
| Admin | `/workspace/admin`, `/workspace/admin/orders`, `/workspace/admin/audit` | Review organization verification, moderate listings, monitor platform analytics, and audit transactions |

## Use cases

```mermaid
flowchart LR
    Buyer[Customer] --> Discover[Compare approved listings]
    Buyer --> Plan[Preview layout and estimate boxes]
    Buyer --> Quote[Request and accept an itemized quote]
    Buyer --> Track[Track delivery and save crew preference]
    Owner[Dealer owner or manager] --> Stock[Allocate branch stock by production lot]
    Staff[Dealer team] --> Issue[Issue quote and confirm dispatch branch]
    Owner --> Metrics[Review showroom SLA analytics]
    Admin[Platform admin] --> Review[Verify showrooms and moderate listings]
    Admin --> Audit[Resolve disputes and inspect audit history]
    Admin --> Platform[Review platform SLA analytics]
```

## Architecture

```mermaid
flowchart TB
    Public[Public App Router pages] --> Catalogue[Catalogue and visibility rules]
    Public --> Services[Verified service directory]
    Public --> Search[Canonical metadata and JSON-LD]
    Workspace[Customer, dealer, and admin workspaces] --> API[Route handlers and session checks]
    API --> RBAC[Role and tenant guards]
    RBAC --> Commercial[RFQ, immutable quotes, and orders]
    RBAC --> Inventory[Branch and lot reservation]
    RBAC --> Analytics[Scoped operational analytics]
    RBAC --> Governance[Verification and immutable audit events]
    Catalogue --> Store[Transactional JSON store]
    Services --> Store
    Commercial --> Store
    Inventory --> Store
    Analytics --> Store
    Governance --> Store
    Store -. Schema contract .-> Prisma[Prisma PostgreSQL schema]
```

## Entity relationships

```mermaid
erDiagram
    USER ||--o{ ORGANIZATION_MEMBERSHIP : holds
    ORGANIZATION ||--o{ ORGANIZATION_MEMBERSHIP : scopes
    ORGANIZATION ||--o{ BRANCH : operates
    ORGANIZATION ||--o{ DEALER_LISTING : publishes
    CATEGORY ||--o{ DEALER_LISTING : classifies
    BRANCH ||--o{ STOCK_LOT : holds
    DEALER_LISTING ||--o{ STOCK_LOT : identifies
    USER ||--o{ RFQ : submits
    ORGANIZATION ||--o{ RFQ : receives
    RFQ ||--o{ QUOTATION : versions
    QUOTATION ||--o| ORDER : converts
    ORDER ||--|| COMMERCIAL_SNAPSHOT : freezes
    ORDER ||--o| STOCK_RESERVATION : allocates
    ORDER ||--o| PREFERRED_CREW : references
    ORDER ||--|{ STATE_HISTORY : records
    USER ||--o{ AUDIT_LOG : acts
```

## Verification state machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SUBMITTED
    SUBMITTED --> UNDER_REVIEW
    UNDER_REVIEW --> VERIFIED
    UNDER_REVIEW --> REJECTED
    REJECTED --> SUBMITTED
    VERIFIED --> SUSPENDED
    VERIFIED --> EXPIRED
    SUSPENDED --> UNDER_REVIEW
    SUSPENDED --> EXPIRED
    EXPIRED --> SUBMITTED
```

Public discovery and RFQs require a `VERIFIED` organization, an `ACTIVE` listing, and `APPROVED` moderation.

## Order state machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_CONFIRMATION
    PENDING_CONFIRMATION --> CONFIRMED
    CONFIRMED --> PROCESSING
    PROCESSING --> READY_FOR_DISPATCH
    READY_FOR_DISPATCH --> DISPATCHED
    DISPATCHED --> DELIVERED
    DELIVERED --> COMPLETED
    PENDING_CONFIRMATION --> CANCELLED
    CONFIRMED --> CANCELLED
    PROCESSING --> CANCELLED
    CONFIRMED --> DISPUTED
    PROCESSING --> DISPUTED
    READY_FOR_DISPATCH --> DISPUTED
    DISPATCHED --> DISPUTED
    DELIVERED --> DISPUTED
    DISPUTED --> CONFIRMED
    DISPUTED --> DELIVERED
    DISPUTED --> COMPLETED
    DISPUTED --> CANCELLED
```

## Quotation acceptance and branch reservation

```mermaid
sequenceDiagram
    actor Buyer
    actor Dealer
    participant API as DigiTiles API
    participant Store as Transactional store
    Buyer->>API: Submit RFQ for publicly eligible listings
    Dealer->>API: Send itemized quote with VAT and terms
    API->>Store: Record immutable version and proforma reference
    Buyer->>API: Accept quote
    API->>Store: Accept quote and RFQ, decline competing offers, create order and audit
    Store-->>Buyer: Order with frozen commercial snapshot
    Buyer->>API: Retry acceptance of the same quote
    API-->>Buyer: Return existing order
    Dealer->>API: Confirm with dispatch branch
    API->>Store: Reserve required cartons from eligible production lots and record state
    Store-->>Dealer: Confirmed order and lot allocation
```

## Local setup and verification

```powershell
npm ci
npm run dev
```

Open [the local app](http://localhost:3000). The pilot account picker provides seeded customer, dealer, staff, and admin identities. The local OTP simulator is for development. The hosted pilot supports seeded identities and uses ephemeral instance-local storage. Real customer onboarding requires a verified SMS delivery service and durable shared persistence. The public service directory labels its sample profiles as demo providers.

```powershell
npm run build
npx playwright test
```

Playwright runs against the production build with a separate seeded database. It checks the transaction and public discovery workflows, theme contrast with Axe, and search metadata. The public crawl entry points are `/robots.txt`, `/sitemap.xml`, `/llms.txt`, and `/llms-full.txt`.

## Deployment

`deploy.json` controls the release target and exclusion rules. The PowerShell deployment script builds the app, replaces the configured GitHub branch history with one fresh commit, and deploys to Vercel Production.

```powershell
./deploy.ps1 -Message "feat: upgrade DigiTiles marketplace and discovery"
```
