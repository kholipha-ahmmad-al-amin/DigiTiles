import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import {
  getUserOrganization,
  loadDatabase,
  updateDealerOrganization,
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
      data: { organization: null, branches: [], memberships: [] },
    });
  }

  const branches = db.branches.filter(
    (b) => b.organizationId === orgContext.organization.id
  );
  const memberships = db.memberships.filter(
    (m) => m.organizationId === orgContext.organization.id
  );

  return NextResponse.json({
    ok: true,
    data: {
      organization: orgContext.organization,
      currentMembership: orgContext.membership,
      branches,
      memberships,
    },
  });
}

export async function PUT(req: NextRequest) {
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
    const updated = updateDealerOrganization({
      ...body,
      actorUserId: user.id,
    });

    return NextResponse.json({
      ok: true,
      data: updated,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update organization.";
    const status = message.startsWith("Forbidden:") ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: "ORG_UPDATE_ERROR", message } },
      { status }
    );
  }
}
