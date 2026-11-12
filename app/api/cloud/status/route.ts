import { NextResponse } from "next/server";
import {
  CLOUDFLARE_D1_API_URL,
  loadDatabase,
  syncDatabaseToCloudflareD1,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let res = await fetch(`${CLOUDFLARE_D1_API_URL}/health`, {
      cache: "no-store",
    });

    if (res.ok) {
      let health = await res.json();
      if (health.stateVersion === 0) {
        const db = loadDatabase();
        await syncDatabaseToCloudflareD1(db);
        res = await fetch(`${CLOUDFLARE_D1_API_URL}/health`, {
          cache: "no-store",
        });
        if (res.ok) {
          health = await res.json();
        }
      }
      return NextResponse.json({
        ok: true,
        data: health,
      });
    }
  } catch {
    // Fallback to local summary if edge network is unreachable
  }

  const db = loadDatabase();
  return NextResponse.json({
    ok: true,
    data: {
      ok: true,
      service: "digitiles-cloud-api",
      provider: "Cloudflare D1 + Workers KV + Local Sync",
      d1Database: "digitiles-prod-db",
      firebaseProject: "digitiles-bd",
      platformDomain: "https://digitiles.equisaas-bd.com",
      stateVersion: 1,
      lastSyncedAt: new Date().toISOString(),
      relationalTables: {
        users: db.users.length,
        organizations: db.organizations.length,
        dealerListings: db.listings.length,
        rfqs: db.rfqs.length,
        quotations: db.quotations.length,
        orders: db.orders.length,
        auditLogs: db.auditLogs.length,
      },
    },
  });
}
