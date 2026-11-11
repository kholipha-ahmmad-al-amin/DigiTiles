import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import {
  getUserOrganization,
  loadDatabase,
  upsertDealerListing,
} from "@/lib/store";

export async function GET() {
  const user = getAuthenticatedUserFromCookies();
  if (!user || !user.roles.includes("DEALER")) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FORBIDDEN", message: "Dealer access required." },
      },
      { status: 403 }
    );
  }

  const db = loadDatabase();
  const orgContext = getUserOrganization(db, user.id);
  if (!orgContext) {
    return NextResponse.json({
      ok: true,
      data: {
        listings: [],
        categories: db.categories,
        branches: [],
        organization: null,
      },
    });
  }

  // Business Rule 8: Tenant-isolated listings
  const listings = db.listings.filter(
    (l) => l.organizationId === orgContext.organization.id
  );
  const branches = db.branches.filter(
    (b) => b.organizationId === orgContext.organization.id
  );

  return NextResponse.json({
    ok: true,
    data: {
      listings,
      categories: db.categories,
      branches,
      organization: orgContext.organization,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user || !user.roles.includes("DEALER")) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Dealer access required." },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const listing = upsertDealerListing({
      ...body,
      actorUserId: user.id,
    });

    return NextResponse.json({
      ok: true,
      data: { listing },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save listing.";
    const status = message.startsWith("Forbidden:") ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: "LISTING_SAVE_ERROR", message } },
      { status }
    );
  }
}
