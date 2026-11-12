import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { getUserOrganization, loadDatabase } from "@/lib/store";

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

  if (scope === "ADMIN" && user.roles.includes("ADMIN")) {
    return NextResponse.json({
      ok: true,
      data: { orders: db.orders },
    });
  }

  if (scope === "DEALER" && user.roles.includes("DEALER")) {
    const orgContext = getUserOrganization(db, user.id);
    if (!orgContext) {
      return NextResponse.json({
        ok: true,
        data: { orders: [] },
      });
    }
    const orders = db.orders.filter(
      (o) => o.organizationId === orgContext.organization.id
    );
    const branches = db.branches.filter((branch) => branch.organizationId === orgContext.organization.id);
    return NextResponse.json({
      ok: true,
      data: { orders, branches, organization: orgContext.organization },
    });
  }

  if (scope !== "CUSTOMER" || !user.roles.includes("CUSTOMER")) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Order access denied." } }, { status: 403 });
  }
  const orders = db.orders.filter((o) => o.customerUserId === user.id);
  return NextResponse.json({
    ok: true,
    data: { orders },
  });
}
