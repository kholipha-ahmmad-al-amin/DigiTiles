import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";
import { loadDatabase, saveDatabase } from "@/lib/store";

export async function GET() {
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

  const db = loadDatabase();
  const notifications = db.notifications.filter((n) => n.userId === user.id);

  return NextResponse.json({
    ok: true,
    data: { notifications },
  });
}

export async function PATCH(req: NextRequest) {
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

  const body = await req.json().catch(() => ({}));
  const db = loadDatabase();

  for (const n of db.notifications) {
    if (n.userId === user.id) {
      if (!body.notificationId || n.id === body.notificationId) {
        n.isRead = true;
      }
    }
  }
  saveDatabase(db);

  return NextResponse.json({
    ok: true,
    data: {
      notifications: db.notifications.filter((n) => n.userId === user.id),
    },
  });
}
