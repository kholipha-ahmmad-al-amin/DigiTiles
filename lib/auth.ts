import crypto from "crypto";
import { cookies } from "next/headers";
import { GlobalRole, User } from "./types";
import { loadDatabase, saveDatabase } from "./store";

export const SESSION_COOKIE_NAME = "digitiles_session_v1";

export function isHostedPilot() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "digitiles-bangladesh-connected-construction-secret-2026"
  );
}

interface SessionPayload {
  userId: string;
  phone: string;
  activeRole: GlobalRole;
  firebaseUid?: string;
  email?: string;
  fullName?: string;
  authProvider?: "GOOGLE" | "EMAIL";
  exp: number;
}

export function createSignedSessionToken(user: User): string {
  const payload: SessionPayload = {
    userId: user.id,
    phone: user.phone,
    activeRole: user.activeRole,
    firebaseUid: user.firebaseUid,
    email: user.email,
    fullName: user.fullName,
    authProvider: user.authProvider,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf-8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySignedSessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac("sha256", getSessionSecret())
      .update(encoded)
      .digest("base64url");
    const actual = Buffer.from(sig, "utf8");
    const expected = Buffer.from(expectedSig, "utf8");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8")
    ) as SessionPayload;
    if (!Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAuthenticatedUserFromCookies(): User | null {
  try {
    const cookieStore = cookies();
    const rawCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawCookie) return null;
    const payload = verifySignedSessionToken(rawCookie);
    if (!payload) return null;
    const db = loadDatabase();
    let user = db.users.find(
      (u) =>
        (u.id === payload.userId && u.phone === payload.phone) ||
        (payload.firebaseUid && u.firebaseUid === payload.firebaseUid) ||
        (payload.email && u.email?.toLowerCase() === payload.email.toLowerCase())
    );
    if (!user && payload.firebaseUid) {
      const isSuperAdmin =
        payload.email?.toLowerCase() === "kholifaahmadalamin@gmail.com" ||
        payload.email?.toLowerCase() === "admin@digitiles.equisaas-bd.com";
      user = {
        id: payload.userId,
        phone: payload.phone,
        fullName: payload.fullName || payload.email?.split("@")[0] || "DigiTiles Member",
        email: payload.email,
        firebaseUid: payload.firebaseUid,
        authProvider: payload.authProvider || "GOOGLE",
        roles: isSuperAdmin ? ["ADMIN", "DEALER", "CUSTOMER"] : ["CUSTOMER", "DEALER"],
        activeRole: isSuperAdmin ? payload.activeRole : payload.activeRole === "ADMIN" ? "CUSTOMER" : payload.activeRole,
        preferredLocale: "bn",
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDatabase(db);
    }
    if (!user) return null;
    return user.roles.includes(payload.activeRole) ? { ...user, activeRole: payload.activeRole } : user;
  } catch {
    return null;
  }
}
