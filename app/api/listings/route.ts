import { NextRequest, NextResponse } from "next/server";
import { discoverCatalogue } from "@/lib/public-catalogue";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const district = searchParams.get("district") || undefined;
  const finish = searchParams.get("finish") || undefined;
  const dimensions = searchParams.get("dimensions") || undefined;
  const organizationId = searchParams.get("organizationId") || undefined;
  const sort =
    (searchParams.get("sort") as "price_asc" | "price_desc" | "newest") ||
    "newest";
  const minPriceSqft = searchParams.get("minPriceSqft")
    ? Number(searchParams.get("minPriceSqft"))
    : undefined;
  const maxPriceSqft = searchParams.get("maxPriceSqft")
    ? Number(searchParams.get("maxPriceSqft"))
    : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = searchParams.get("pageSize")
    ? Number(searchParams.get("pageSize"))
    : 12;

  const discovery = discoverCatalogue({
    q,
    categoryId,
    district,
    finish,
    dimensions,
    minPriceSqft,
    maxPriceSqft,
    organizationId,
    sort,
    page,
    pageSize,
  });

  return NextResponse.json({
    ok: true,
    data: discovery,
  });
}
