import { NextRequest, NextResponse } from "next/server";
import { discoverListing } from "@/lib/public-catalogue";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const data = discoverListing(params.id);
  if (!data) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "NOT_FOUND", message: "Product listing not found." },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
