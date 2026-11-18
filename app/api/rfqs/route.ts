import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import {
  createCustomerRfq,
  getUserOrganization,
  loadDatabase,
} from "@/lib/store";

export async function GET(req: NextRequest) {
  const user = getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in first." },
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") || user.activeRole;
  const db = loadDatabase();

  if (scope === "DEALER") {
    if (!user.roles.includes("DEALER")) {
      return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Dealer access required." } }, { status: 403 });
    }
    const orgContext = getUserOrganization(db, user.id);
    if (!orgContext) {
      return NextResponse.json({
        ok: true,
        data: { rfqs: [], quotations: [] },
      });
    }
    // Business Rule 8: Tenant isolation
    const rfqs = db.rfqs.filter(
      (r) => r.organizationId === orgContext.organization.id
    );
    const quotations = db.quotations.filter(
      (q) => q.organizationId === orgContext.organization.id
    );
    return NextResponse.json({
      ok: true,
      data: { rfqs, quotations, organization: orgContext.organization },
    });
  }

  // Default: Customer scope
  if (scope !== "CUSTOMER" || !user.roles.includes("CUSTOMER")) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Customer access required." } }, { status: 403 });
  }
  const rfqs = db.rfqs.filter((r) => r.customerUserId === user.id);
  const rfqIds = new Set(rfqs.map((r) => r.id));
  const quotations = db.quotations.filter((q) => rfqIds.has(q.rfqId));

  return NextResponse.json({
    ok: true,
    data: { rfqs, quotations },
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Please sign in to submit an RFQ.",
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rfq = createCustomerRfq({
      customerUserId: user.id,
      items: Array.isArray(body.items) ? body.items : [],
      deliveryDistrict: String(body.deliveryDistrict || "Dhaka"),
      deliveryAddress: String(body.deliveryAddress || ""),
      preferredWindow: String(body.preferredWindow || "Within 5 days"),
      projectNotes: String(body.projectNotes || ""),
    });

    return NextResponse.json({
      ok: true,
      data: { rfq },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to submit RFQ.";
    return NextResponse.json(
      { ok: false, error: { code: "RFQ_CREATE_ERROR", message } },
      { status: message.startsWith("Forbidden:") ? 403 : 400 }
    );
  }
}
