import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionToken,
  getAuthenticatedUserFromCookies,
  isHostedPilot,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  getUserOrganization,
  loadDatabase,
  switchOrActivateUserRole,
} from "@/lib/store";
import { GlobalRole } from "@/lib/types";

export async function GET() {
  const user = getAuthenticatedUserFromCookies();

  if (!user) {
    return NextResponse.json({
      ok: true,
      data: {
        user: null,
        organizationContext: null,
        notifications: [],
      },
    });
  }

  const db = loadDatabase();
  const orgContext = getUserOrganization(db, user.id);
  const notifications = db.notifications
    .filter((n) => n.userId === user.id)
    .slice(0, 20);

  return NextResponse.json({
    ok: true,
    data: {
      user,
      organizationContext: orgContext,
      notifications,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const currentUser = getAuthenticatedUserFromCookies();
    if (!currentUser) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required." },
        },
        { status: 401 }
      );
    }

    const targetRole = body.targetRole as GlobalRole;
    if (targetRole === "ADMIN" && !currentUser.roles.includes("ADMIN")) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access is restricted to authorized administrators.",
          },
        },
        { status: 403 }
      );
    }

    const updatedUser = switchOrActivateUserRole(
      currentUser.id,
      targetRole,
      body.organizationTradeName,
      body.primaryDistrict
    );

    const token = createSignedSessionToken(updatedUser);
    const res = NextResponse.json({
      ok: true,
      data: { user: updatedUser },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHostedPilot(),
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to switch role.";
    return NextResponse.json(
      { ok: false, error: { code: "ROLE_SWITCH_ERROR", message } },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
