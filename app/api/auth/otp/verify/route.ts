import { NextRequest, NextResponse } from "next/server";
import {
  createSignedSessionToken,
  HostedOtpUnavailable,
  isHostedPilot,
  SESSION_COOKIE_NAME,
  verifyPhoneOtpAndLogin,
} from "@/lib/auth";
import { GlobalRole } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = verifyPhoneOtpAndLogin({
      phoneInput: String(body.phone || ""),
      otpCode: String(body.otpCode || ""),
      fullName: body.fullName ? String(body.fullName) : undefined,
      requestedRole: body.requestedRole as GlobalRole | undefined,
      organizationTradeName: body.organizationTradeName
        ? String(body.organizationTradeName)
        : undefined,
      primaryDistrict: body.primaryDistrict
        ? String(body.primaryDistrict)
        : undefined,
    });

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
    const unavailable = err instanceof HostedOtpUnavailable;
    const message =
      err instanceof Error ? err.message : "OTP verification failed.";
    return NextResponse.json(
      { ok: false, error: { code: unavailable ? "HOSTED_OTP_UNAVAILABLE" : "OTP_VERIFY_ERROR", message } },
      { status: unavailable ? 503 : 400 }
    );
  }
}
