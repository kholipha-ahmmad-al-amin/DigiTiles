import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionToken,
  getAuthenticatedUserFromCookies,
  isDemoUser,
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
  const db = loadDatabase();
  const user = getAuthenticatedUserFromCookies();
  const demoAccounts = db.users.filter(isDemoUser).map((u) => ({
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    roles: u.roles,
    activeRole: u.activeRole,
  }));

  if (!user) {
    return NextResponse.json({
      ok: true,
      data: {
        user: null,
        organizationContext: null,
        notifications: [],
        demoAccounts,
      },
    });
  }

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
      demoAccounts,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = loadDatabase();

    // Support instant pilot persona login or role switching (FR-02)
    if (body.demoUserId) {
      const demoUser = db.users.find((u) => u.id === body.demoUserId && isDemoUser(u));
      if (!demoUser) {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "NOT_FOUND", message: "Demo user not found." },
          },
          { status: 404 }
        );
      }
      const targetUser = { ...demoUser };
      if (targetUser.roles.includes(body.targetRole)) targetUser.activeRole = body.targetRole as GlobalRole;
      const token = createSignedSessionToken(targetUser);
      const res = NextResponse.json({
        ok: true,
        data: { user: targetUser },
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: isHostedPilot(),
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
      return res;
    }

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

    const updatedUser = switchOrActivateUserRole(
      currentUser.id,
      body.targetRole as GlobalRole,
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
