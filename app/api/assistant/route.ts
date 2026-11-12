import { NextRequest, NextResponse } from "next/server";
import { answerFromCatalogue } from "@/lib/rag/answer";
import { hydrateDatabaseFromCloudflareD1 } from "@/lib/store";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 12;

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "local";
}

function allow(key: string): boolean {
  const store = globalThis as typeof globalThis & { __digitilesAsk?: Map<string, number[]> };
  const bucket = store.__digitilesAsk || new Map<string, number[]>();
  store.__digitilesAsk = bucket;
  const now = Date.now();
  const recent = (bucket.get(key) || []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= LIMIT) {
    bucket.set(key, recent);
    return false;
  }
  recent.push(now);
  bucket.set(key, recent);
  return true;
}

export async function POST(req: NextRequest) {
  if (!allow(clientKey(req))) {
    return NextResponse.json(
      { ok: false, error: { message: "Too many questions. Please wait a few minutes." } },
      { status: 429 }
    );
  }

  let body: { question?: unknown; locale?: unknown; listingId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { message: "Invalid request." } }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const locale = body.locale === "en" ? "en" : "bn";
  const listingId = typeof body.listingId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(body.listingId)
    ? body.listingId
    : undefined;

  if (question.length < 2 || question.length > 500) {
    return NextResponse.json(
      { ok: false, error: { message: locale === "bn" ? "প্রশ্ন ২ থেকে ৫০০ অক্ষরের মধ্যে লিখুন।" : "Write a question between 2 and 500 characters." } },
      { status: 400 }
    );
  }

  await hydrateDatabaseFromCloudflareD1();
  const data = await answerFromCatalogue({ question, locale, listingId });
  return NextResponse.json({ ok: true, data });
}
