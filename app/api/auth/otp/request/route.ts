import { NextRequest, NextResponse } from "next/server";
import { HostedOtpUnavailable, requestPhoneOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = String(body.phone || "");
    const result = requestPhoneOtp(phone);
    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err) {
    const unavailable = err instanceof HostedOtpUnavailable;
    const message =
      err instanceof Error ? err.message : "Failed to request OTP.";
    return NextResponse.json(
      { ok: false, error: { code: unavailable ? "HOSTED_OTP_UNAVAILABLE" : "OTP_REQUEST_ERROR", message } },
      { status: unavailable ? 503 : 400 }
    );
  }
}
