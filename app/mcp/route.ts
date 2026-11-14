import { retrieveCatalogue } from "@/lib/rag/retrieve";
import { WORKERS_MODELS } from "@/lib/rag/workers-ai";

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    name: "search_catalogue",
    description: "Search published DigiTiles listings, showrooms, guides, and service-directory records.",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "Buyer question in Bangla or English." },
      },
      required: ["question"],
    },
  },
];

function rpc(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result });
}

export async function GET() {
  return Response.json({
    name: "digitiles-catalogue",
    transport: "streamable-http",
    endpoint: "/mcp",
    tools: TOOLS.map((tool) => tool.name),
    models: WORKERS_MODELS,
  });
}

export async function POST(request: Request) {
  let body: { id?: unknown; method?: string; params?: { name?: string; arguments?: { question?: string } } };
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  if (body.method === "initialize") {
    return rpc(body.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "digitiles-catalogue", version: "1.0.0" },
    });
  }

  if (body.method === "tools/list") {
    return rpc(body.id, { tools: TOOLS });
  }

  if (body.method === "tools/call" && body.params?.name === "search_catalogue") {
    const question = String(body.params.arguments?.question || "").slice(0, 500);
    const found = retrieveCatalogue(question);
    const hits = found.hits.map((hit) => ({
      id: hit.id,
      title: hit.title,
      href: hit.href,
      kind: hit.kind,
      score: Number(hit.score.toFixed(3)),
    }));
    return rpc(body.id, {
      content: [{ type: "text", text: JSON.stringify({ hits, estimate: found.estimate }) }],
    });
  }

  return Response.json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32601, message: "Method not found" } }, { status: 404 });
}
