import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { StockError, unallocatedBoxes } from "@/lib/inventory";
import { getUserOrganization, loadDatabase, upsertDealerStockLot } from "@/lib/store";

export function GET() {
  const user = getAuthenticatedUserFromCookies();
  const db = loadDatabase();
  const context = user?.roles.includes("DEALER") && getUserOrganization(db, user.id);
  if (!context) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  const { organization, membership } = context;
  const listings = db.listings.filter((item) => item.organizationId === organization.id);
  const branches = db.branches.filter((item) => item.organizationId === organization.id);
  const listingIds = new Set(listings.map((item) => item.id));
  const branchIds = new Set(branches.map((item) => item.id));
  const lots = db.stockLots?.filter((lot) => listingIds.has(lot.listingId) && branchIds.has(lot.branchId)) ?? [];
  return NextResponse.json({
    ok: true,
    data: {
      canManage: membership.memberRole === "OWNER" || membership.memberRole === "MANAGER",
      listings: listings.map((listing) => ({
        id: listing.id, sku: listing.sku, titleEn: listing.titleEn, titleBn: listing.titleBn,
        unallocatedBoxes: unallocatedBoxes(listing, lots),
      })),
      branches,
      lots,
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = getAuthenticatedUserFromCookies();
  if (!user?.roles.includes("DEALER")) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }

  try {
    const body = await req.json();
    const lot = upsertDealerStockLot({ ...body, actorUserId: user.id });
    return NextResponse.json({ ok: true, data: { lot } });
  } catch (error) {
    const forbidden = error instanceof Error && error.message.startsWith("Forbidden:");
    const code = error instanceof StockError ? error.code : forbidden ? "FORBIDDEN" : "STOCK_SAVE_ERROR";
    const status = forbidden ? 403 : code === "STOCK_CHANGED" ? 409 : 400;
    return NextResponse.json({ ok: false, error: { code } }, { status });
  }
}
