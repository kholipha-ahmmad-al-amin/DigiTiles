import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { issueDealerQuotation } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user || !user.roles.includes("DEALER")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Dealer access required to issue quotations.",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const quotation = issueDealerQuotation({
      actorUserId: user.id,
      rfqId: params.id,
      itemPrices: Array.isArray(body.itemPrices) ? body.itemPrices : [],
      deliveryFeeBdt: Number(body.deliveryFeeBdt || 0),
      discountBdt: Number(body.discountBdt || 0),
      vatBdt: Number(body.vatBdt ?? 0),
      validUntil: String(body.validUntil || ""),
      paymentTerms: String(body.paymentTerms || ""),
      deliveryTerms: String(body.deliveryTerms || ""),
    });

    return NextResponse.json({
      ok: true,
      data: { quotation },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to issue quotation.";
    const status = message.startsWith("Forbidden:") ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: "QUOTE_ISSUE_ERROR", message } },
      { status }
    );
  }
}
