import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { loadDatabase, performAdminModeration } from "@/lib/store";

export async function GET() {
  const user = getAuthenticatedUserFromCookies();
  if (!user || !user.roles.includes("ADMIN")) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Platform Admin permission required.",
        },
      },
      { status: 403 }
    );
  }

  const db = loadDatabase();

  // Compute Section 9 Success Metrics live from the database
  const completedOrders = db.orders.filter((o) => o.state === "COMPLETED");
  const confirmedOrBeyondOrders = db.orders.filter(
    (o) => o.state !== "PENDING_CONFIRMATION" && o.state !== "CANCELLED"
  );
  const quotedOrConvertedRfqs = db.rfqs.filter(
    (r) => r.status === "QUOTED" || r.status === "ACCEPTED" || r.status === "CONVERTED"
  );
  const activeDealers = db.organizations.filter(
    (o) =>
      o.verificationStatus === "VERIFIED" &&
      db.listings.some(
        (l) =>
          l.organizationId === o.id &&
          l.visibilityStatus === "ACTIVE" &&
          l.moderationStatus === "APPROVED"
      )
  );

  return NextResponse.json({
    ok: true,
    data: {
      organizations: db.organizations,
      listings: db.listings.map((l) => ({
        ...l,
        organizationNameEn:
          db.organizations.find((o) => o.id === l.organizationId)
            ?.tradeNameEn || "Unknown",
      })),
      orders: db.orders,
      rfqs: db.rfqs,
      auditLogs: db.auditLogs,
      metrics: {
        northStarCompletedTransactions: completedOrders.length,
        totalOrders: db.orders.length,
        activeVerifiedDealers: activeDealers.length,
        rfqResponseRatePercent:
          db.rfqs.length > 0
            ? Math.round((quotedOrConvertedRfqs.length / db.rfqs.length) * 100)
            : 100,
        quoteToOrderConversionPercent:
          db.quotations.length > 0
            ? Math.round(
                (db.orders.length / Math.max(1, db.quotations.length)) * 100
              )
            : 0,
        orderCompletionRatePercent:
          confirmedOrBeyondOrders.length > 0
            ? Math.round(
                (completedOrders.length / confirmedOrBeyondOrders.length) * 100
              )
            : 100,
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user || !user.roles.includes("ADMIN")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Platform Admin permission required.",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const auditLog = performAdminModeration({
      adminUserId: user.id,
      targetType: body.targetType,
      targetId: String(body.targetId || ""),
      decision: String(body.decision || ""),
      note: body.note ? String(body.note) : undefined,
    });

    return NextResponse.json({
      ok: true,
      data: { auditLog },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Admin moderation action failed.";
    return NextResponse.json(
      { ok: false, error: { code: "ADMIN_MODERATION_ERROR", message } },
      { status: 400 }
    );
  }
}
