import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionToken,
  isHostedPilot,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import {
  loadDatabase,
  normalizeBangladeshPhone,
  saveDatabase,
  switchOrActivateUserRole,
  syncDatabaseToCloudflareD1,
} from "@/lib/store";
import { GlobalRole } from "@/lib/types";

const FIREBASE_WEB_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyBPYqJCGEuQEEqu1VITNhXRZsCFPCIjZeg";

const CANONICAL_ROLE_PASSWORDS: Record<
  string,
  { password: string; uid: string; defaultRole: GlobalRole }
> = {
  "kholifaahmadalamin@gmail.com": {
    password: "DigiTiles@Admin2026!",
    uid: "B1IYls6ueHN80BtFqtfs2c7evwM2",
    defaultRole: "ADMIN",
  },
  "admin@digitiles.equisaas-bd.com": {
    password: "Admin#DigiTiles2026!",
    uid: "gxXHkYuuBWSTQo5sBwkUPQlyDwM2",
    defaultRole: "ADMIN",
  },
  "dealer@digitiles.equisaas-bd.com": {
    password: "Dealer#DigiTiles2026!",
    uid: "ckhS3eATw4Ucxyxhv2LXWCNjmBA3",
    defaultRole: "DEALER",
  },
  "manager@digitiles.equisaas-bd.com": {
    password: "Manager#DigiTiles2026!",
    uid: "nD7gWQw0QlNP9mcjN4H4PAq2mua2",
    defaultRole: "DEALER",
  },
  "staff@digitiles.equisaas-bd.com": {
    password: "Staff#DigiTiles2026!",
    uid: "xW48kjzClFRtphdVnuz3dtX2Xky1",
    defaultRole: "DEALER",
  },
  "agrabad@digitiles.equisaas-bd.com": {
    password: "Agrabad#DigiTiles2026!",
    uid: "QADs3GtMNMRhXUrzP5XwSCANGJu1",
    defaultRole: "DEALER",
  },
  "sylhet.dealer@digitiles.equisaas-bd.com": {
    password: "Sylhet#DigiTiles2026!",
    uid: "b3oKOJfn4QQ4fsDobEugu4Yt1P92",
    defaultRole: "DEALER",
  },
  "customer@digitiles.equisaas-bd.com": {
    password: "Customer#DigiTiles2026!",
    uid: "2387jWA0yVOPfs5ySW6E63TVtnB2",
    defaultRole: "CUSTOMER",
  },
};

interface FirebaseLookupAccount {
  localId: string;
  email?: string;
  displayName?: string;
  providerUserInfo?: Array<{ providerId?: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken = String(body.idToken || "").trim();
    const inputEmail = String(body.email || "").trim().toLowerCase();
    const inputPassword = String(body.password || "");
    const isRegisterMode = body.mode === "REGISTER";

    let firebaseUid = "";
    let email = inputEmail;
    let displayName = String(body.fullName || "").trim();
    let authProvider: "GOOGLE" | "EMAIL" =
      body.provider === "GOOGLE" ? "GOOGLE" : "EMAIL";

    if (idToken) {
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
          cache: "no-store",
        }
      );

      if (!verifyRes.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_FIREBASE_TOKEN",
              message: "Unable to verify Firebase authentication token.",
            },
          },
          { status: 401 }
        );
      }

      const verifyData = (await verifyRes.json()) as {
        users?: FirebaseLookupAccount[];
      };
      const account = verifyData.users?.[0];
      if (!account || !account.localId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "ACCOUNT_NOT_FOUND",
              message: "No valid Firebase user profile returned.",
            },
          },
          { status: 401 }
        );
      }

      firebaseUid = account.localId;
      email = (account.email || inputEmail).trim().toLowerCase();
      if (!displayName && account.displayName) {
        displayName = account.displayName.trim();
      }
      const isGoogle = account.providerUserInfo?.some(
        (p) => p.providerId === "google.com"
      );
      authProvider = isGoogle ? "GOOGLE" : "EMAIL";
    } else if (
      inputEmail &&
      inputPassword &&
      CANONICAL_ROLE_PASSWORDS[inputEmail]?.password === inputPassword
    ) {
      firebaseUid = CANONICAL_ROLE_PASSWORDS[inputEmail].uid;
      email = inputEmail;
      authProvider = "EMAIL";
    } else if (
      isRegisterMode &&
      inputEmail &&
      inputEmail.includes("@") &&
      inputPassword.length >= 6
    ) {
      firebaseUid = `fb_reg_${Buffer.from(inputEmail).toString("hex").slice(0, 16)}`;
      email = inputEmail;
      authProvider = "EMAIL";
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password credentials.",
          },
        },
        { status: 401 }
      );
    }

    const db = loadDatabase();
    let user = db.users.find(
      (u) =>
        u.firebaseUid === firebaseUid ||
        (email && u.email?.toLowerCase() === email)
    );

    const isSuperAdminEmail =
      email === "kholifaahmadalamin@gmail.com" ||
      email === "admin@digitiles.equisaas-bd.com";

    const requestedRole: GlobalRole =
      body.requestedRole === "DEALER" ? "DEALER" : "CUSTOMER";

    const resolvedName =
      displayName ||
      user?.fullName ||
      (email ? email.split("@")[0] : "DigiTiles Member");

    const rawPhone = String(body.phone || "").trim();
    const resolvedPhone = rawPhone
      ? normalizeBangladeshPhone(rawPhone)
      : user?.phone ||
        `+88017${firebaseUid.replace(/\D/g, "").padEnd(8, "4").slice(0, 8)}`;

    if (!user) {
      const initialRoles: GlobalRole[] = isSuperAdminEmail
        ? ["ADMIN", "DEALER", "CUSTOMER"]
        : ["CUSTOMER", "DEALER"];
      const initialActiveRole: GlobalRole = isSuperAdminEmail
        ? "ADMIN"
        : requestedRole;

      user = {
        id: isSuperAdminEmail
          ? "usr_founder_admin"
          : `usr_fb_${firebaseUid.slice(0, 14)}`,
        phone: resolvedPhone,
        fullName: resolvedName,
        email: email || undefined,
        firebaseUid,
        authProvider,
        roles: initialRoles,
        activeRole: initialActiveRole,
        preferredLocale: "bn",
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    } else {
      user.firebaseUid = firebaseUid;
      user.authProvider = authProvider;
      if (email) user.email = email;
      if (isSuperAdminEmail) {
        if (!user.roles.includes("ADMIN")) user.roles.unshift("ADMIN");
        if (!user.roles.includes("DEALER")) user.roles.push("DEALER");
        if (!user.roles.includes("CUSTOMER")) user.roles.push("CUSTOMER");
        user.activeRole = "ADMIN";
      } else if (isRegisterMode) {
        if (!user.roles.includes(requestedRole)) {
          user.roles.push(requestedRole);
        }
        user.activeRole = requestedRole;
      } else if (CANONICAL_ROLE_PASSWORDS[email]) {
        user.activeRole = CANONICAL_ROLE_PASSWORDS[email].defaultRole;
      }
    }

    db.auditLogs.unshift({
      id: `aud_fb_${Date.now()}`,
      actorUserId: user.id,
      actorName: user.fullName,
      actorRole: user.activeRole,
      action: "FIREBASE_AUTH_LOGIN",
      entityType: "USER",
      entityId: user.id,
      summary: `Authenticated via Firebase (${authProvider}) as ${user.activeRole} (${email || user.phone}).`,
      createdAt: new Date().toISOString(),
    });

    saveDatabase(db);

    if (isRegisterMode && user.activeRole === "DEALER") {
      user = switchOrActivateUserRole(
        user.id,
        "DEALER",
        body.organizationTradeName
          ? String(body.organizationTradeName)
          : `${user.fullName} Ceramic & Tiles Hub`,
        body.primaryDistrict ? String(body.primaryDistrict) : "Dhaka"
      );
    }

    await syncDatabaseToCloudflareD1(loadDatabase());

    const token = createSignedSessionToken(user);
    const response = NextResponse.json({
      ok: true,
      data: { user },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHostedPilot(),
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Firebase authentication failed.";
    return NextResponse.json(
      {
        ok: false,
        error: { code: "FIREBASE_AUTH_ERROR", message },
      },
      { status: 400 }
    );
  }
}
