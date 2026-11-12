import { NextResponse } from "next/server";
import { getVerifiedServices } from "@/lib/service-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, data: getVerifiedServices() });
}
