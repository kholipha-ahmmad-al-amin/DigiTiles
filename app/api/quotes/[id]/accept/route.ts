import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { acceptQuotationAndCreateOrder } from "@/lib/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Please sign in to accept a quotation.",
          },
        },
        { status: 401 }
      );
    }

    if (!user.roles.includes("CUSTOMER")) {
      return NextResponse.json(
        { ok: false, error: { code: "FORBIDDEN", message: "Customer access is required." } },
        { status: 403 }
      );
    }

    const result = acceptQuotationAndCreateOrder({
      customerUserId: user.id,
      quotationId: params.id,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to accept quotation.";
    const status = message.startsWith("Forbidden:") ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: "QUOTE_ACCEPT_ERROR", message } },
      { status }
    );
  }
}
