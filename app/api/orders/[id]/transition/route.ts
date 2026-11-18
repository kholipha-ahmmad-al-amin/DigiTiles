import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { StockError } from "@/lib/inventory";
import { transitionOrderState } from "@/lib/store";
import { GlobalRole, OrderState } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthenticatedUserFromCookies();
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const actorRole: GlobalRole =
      body.actorRole && user.roles.includes(body.actorRole)
        ? (body.actorRole as GlobalRole)
        : user.activeRole;

    const updatedOrder = transitionOrderState({
      actorUserId: user.id,
      actorRole,
      orderId: params.id,
      toState: body.toState as OrderState | undefined,
      note: body.note ? String(body.note) : undefined,
      deliveryUpdate: body.deliveryUpdate || undefined,
      dispatchBranchId: typeof body.dispatchBranchId === "string" ? body.dispatchBranchId : undefined,
      disputeReason: body.disputeReason
        ? String(body.disputeReason)
        : undefined,
      disputeResolutionNote: body.disputeResolutionNote
        ? String(body.disputeResolutionNote)
        : undefined,
    });

    return NextResponse.json({
      ok: true,
      data: { order: updatedOrder },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update order.";
    const status = message.startsWith("Forbidden:") ? 403 : 400;
    return NextResponse.json(
      { ok: false, error: { code: err instanceof StockError ? err.code : "ORDER_TRANSITION_ERROR", message } },
      { status }
    );
  }
}
