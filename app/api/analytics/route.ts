import { NextRequest, NextResponse } from "next/server";
import { calculateAnalytics } from "@/lib/analytics";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { getUserOrganization, loadDatabase } from "@/lib/store";

export function GET(request: NextRequest) {
  const user = getAuthenticatedUserFromCookies();
  const scope = request.nextUrl.searchParams.get("scope");
  if (!user || (scope !== "ADMIN" && scope !== "DEALER") || !user.roles.includes(scope)) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  const db = loadDatabase();
  const organizationId = scope === "DEALER" ? getUserOrganization(db, user.id)?.organization.id : undefined;
  if (scope === "DEALER" && !organizationId) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  return NextResponse.json({ ok: true, data: calculateAnalytics(db, organizationId) });
}
