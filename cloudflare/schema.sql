-- DigiTiles Production D1 SQL Schema (APAC Region)
-- Database: digitiles-prod-db (3f5d86a9-5a1a-4303-a7df-3ff40d713e49)

CREATE TABLE IF NOT EXISTS platform_state (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  firebase_uid TEXT,
  auth_provider TEXT DEFAULT 'OTP',
  active_role TEXT NOT NULL,
  roles_json TEXT NOT NULL,
  preferred_locale TEXT NOT NULL DEFAULT 'bn',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  trade_name_en TEXT NOT NULL,
  trade_name_bn TEXT NOT NULL,
  primary_district TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  trade_license_no TEXT NOT NULL,
  tin_number TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dealer_listings (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  price_per_sqft_bdt REAL NOT NULL,
  price_per_box_bdt REAL NOT NULL,
  stock_status TEXT NOT NULL,
  moderation_status TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  rfq_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  project_title TEXT NOT NULL,
  delivery_district TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  rfq_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  total_amount_bdt REAL NOT NULL,
  status TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  rfq_id TEXT NOT NULL,
  quote_id TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  total_amount_bdt REAL NOT NULL,
  status TEXT NOT NULL,
  snapshot_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_listings_org ON dealer_listings(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_customer ON rfqs(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_rfq ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(organization_id);
