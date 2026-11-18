import { handleMcpHttpRequest } from "@/lib/mcp/servers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleMcpHttpRequest(request, "telemetry");
}

export async function POST(request: Request) {
  return handleMcpHttpRequest(request, "telemetry");
}

export async function OPTIONS(request: Request) {
  return handleMcpHttpRequest(request, "telemetry");
}
