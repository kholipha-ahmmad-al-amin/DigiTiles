import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { attachPreferredCrew } from "@/lib/service-store";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthenticatedUserFromCookies();
  if (!user?.roles.includes("CUSTOMER")) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN" } }, { status: 403 });
  }
  try {
    const { crewId } = await req.json();
    if (crewId !== null && (typeof crewId !== "string" || !crewId)) {
      return NextResponse.json({ ok: false, error: { code: "CREW_UNAVAILABLE" } }, { status: 400 });
    }
    const preferredCrew = attachPreferredCrew(user.id, params.id, crewId);
    return NextResponse.json({ ok: true, data: { preferredCrew } });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    const status = reason === "ORDER_NOT_FOUND" ? 404 : reason === "ORDER_INACTIVE" ? 409 : reason === "CREW_UNAVAILABLE" ? 400 : 500;
    const code = status === 500 ? "CREW_UPDATE_FAILED" : reason;
    return NextResponse.json({ ok: false, error: { code } }, { status });
  }
}
