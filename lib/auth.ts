import crypto from "crypto";
import { cookies } from "next/headers";
import { GlobalRole, User } from "./types";
import {
  isValidBangladeshPhone,
  loadDatabase,
  normalizeBangladeshPhone,
  saveDatabase,
  switchOrActivateUserRole,
} from "./store";

export const SESSION_COOKIE_NAME = "digitiles_session_v1";
const DEMO_PHONES = {
  usr_founder_admin: "+8801700000000",
  usr_customer_01: "+8801711223344",
  usr_dealer_01: "+8801819556677",
  usr_dealer_staff_01: "+8801819556688",
  usr_dealer_02: "+8801912334455",
  usr_dealer_03: "+8801615778899",
  usr_dealer_pending: "+8801511998877",
  usr_admin_01: "+8801700000001",
} as const;

export function isHostedPilot() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

export function isDemoUser(user: User): boolean {
  return Object.hasOwn(DEMO_PHONES, user.id) &&
    DEMO_PHONES[user.id as keyof typeof DEMO_PHONES] === user.phone;
}

export class HostedOtpUnavailable extends Error {
  constructor() {
    super("Phone sign-in for private accounts requires an SMS provider. Use a sample persona to try the hosted pilot.");
  }
}

function requirePilotPhone(phone: string) {
  if (isHostedPilot() && !Object.values<string>(DEMO_PHONES).includes(phone)) {
    throw new HostedOtpUnavailable();
  }
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
  authProvider?: "OTP" | "GOOGLE" | "EMAIL" | "PILOT";
  exp: number;
}

export function createSignedSessionToken(user: User): string {
  if (isHostedPilot() && !isDemoUser(user) && !user.firebaseUid) {
    throw new HostedOtpUnavailable();
  }
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
    if (!user || (isHostedPilot() && !isDemoUser(user) && !user.firebaseUid)) return null;
    return user.roles.includes(payload.activeRole) ? { ...user, activeRole: payload.activeRole } : user;
  } catch {
    return null;
  }
}

export function requestPhoneOtp(phoneInput: string): {
  phone: string;
  pilotOtpCode: string;
  expiresAt: string;
  isExistingUser: boolean;
} {
  if (!isValidBangladeshPhone(phoneInput)) {
    throw new Error(
      "Please enter a valid Bangladesh mobile number (e.g., 01711223344 or +8801711223344)."
    );
  }
  const phone = normalizeBangladeshPhone(phoneInput);
  requirePilotPhone(phone);
  const db = loadDatabase();

  // Rate limit: check recent unconsumed challenges within last 60s
  const recentCount = db.otpChallenges.filter(
    (c) =>
      c.phone === phone &&
      Date.now() - new Date(c.createdAt).getTime() < 60 * 1000
  ).length;
  if (recentCount >= 5) {
    throw new Error(
      "Too many OTP requests for this phone number. Please wait a minute before retrying."
    );
  }

  const code = Object.values<string>(DEMO_PHONES).includes(phone)
    ? "246810"
    : crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  for (const challenge of db.otpChallenges) {
    if (challenge.phone === phone && !challenge.consumedAt) challenge.consumedAt = now.toISOString();
  }
  db.otpChallenges.unshift({
    id: `otp_${crypto.randomUUID()}`,
    phone,
    codeHash: otpHash(phone, code),
    attempts: 0,
    expiresAt,
    createdAt: now.toISOString(),
  });

  const isExistingUser = db.users.some((u) => u.phone === phone);
  saveDatabase(db);

  return {
    phone,
    pilotOtpCode: code,
    expiresAt,
    isExistingUser,
  };
}

function otpHash(phone: string, code: string): string {
  return crypto.createHmac("sha256", getSessionSecret()).update(`${phone}:${code}`).digest("hex");
}

export function verifyPhoneOtpAndLogin(params: {
  phoneInput: string;
  otpCode: string;
  fullName?: string;
  requestedRole?: GlobalRole;
  organizationTradeName?: string;
  primaryDistrict?: string;
}): User {
  const phone = normalizeBangladeshPhone(params.phoneInput);
  requirePilotPhone(phone);
  const db = loadDatabase();

  const challenge = db.otpChallenges.find(
    (c) => c.phone === phone && !c.consumedAt
  );

  if (!challenge) {
    throw new Error("No active OTP request found. Please request a new OTP code.");
  }

  if (new Date(challenge.expiresAt).getTime() < Date.now()) {
    throw new Error("OTP code has expired. Please request a new OTP code.");
  }

  if (challenge.attempts >= 5) {
    throw new Error("Maximum OTP verification attempts exceeded. Request a new code.");
  }

  challenge.attempts += 1;
  const code = params.otpCode.trim();
  if (challenge.codeHash ? challenge.codeHash !== otpHash(phone, code) : challenge.code !== code) {
    saveDatabase(db);
    throw new Error("Invalid OTP code.");
  }

  challenge.consumedAt = new Date().toISOString();

  let user = db.users.find((u) => u.phone === phone);
  const desiredRole: GlobalRole =
    params.requestedRole === "DEALER" ? "DEALER" : "CUSTOMER";

  if (!user) {
    user = {
      id: `usr_${crypto.randomUUID()}`,
      phone,
      fullName: params.fullName?.trim() || "DigiTiles Member",
      roles: [desiredRole],
      activeRole: desiredRole,
      preferredLocale: "bn",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDatabase(db);
  } else {
    if (params.fullName?.trim() && user.fullName === "DigiTiles Member") {
      user.fullName = params.fullName.trim();
    }
    saveDatabase(db);
  }

  if (params.requestedRole && params.requestedRole !== "ADMIN") {
    user = switchOrActivateUserRole(
      user.id,
      params.requestedRole,
      params.organizationTradeName,
      params.primaryDistrict
    );
  }

  return user;
}
