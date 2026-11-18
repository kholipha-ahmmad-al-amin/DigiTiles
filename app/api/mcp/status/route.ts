import { NextResponse } from "next/server";
import { callRemoteMcpTool, listRemoteMcpTools } from "@/lib/mcp/client";
import {
  BUILT_MCP_SERVERS,
  EDGE_API_MCP_ENDPOINT,
  USED_MCP_SERVERS,
} from "@/lib/mcp/servers";

export const dynamic = "force-dynamic";

export async function GET() {
  const [edgeTools, edgeHealth] = await Promise.all([
    listRemoteMcpTools(EDGE_API_MCP_ENDPOINT),
    callRemoteMcpTool<Record<string, unknown>>(EDGE_API_MCP_ENDPOINT, "get_d1_health", {}),
  ]);

  return NextResponse.json({
    ok: true,
    protocolVersion: "2024-11-05",
    transports: ["Streamable HTTP", "stdio"],
    builtServersCount: Object.keys(BUILT_MCP_SERVERS).length,
    builtServers: Object.values(BUILT_MCP_SERVERS).map((s) => ({
      key: s.key,
      name: s.name,
      endpoint: s.endpoint,
      stdioCommand: s.stdioCommand,
      tools: s.tools.map((t) => t.name),
      resources: s.resources.map((r) => r.uri),
      prompts: s.prompts.map((p) => p.name),
      reusedIn: s.reusedIn,
    })),
    usedServersCount: USED_MCP_SERVERS.length,
    usedServers: USED_MCP_SERVERS,
    liveEdgeMcpProbe: {
      endpoint: EDGE_API_MCP_ENDPOINT,
      reachable: edgeTools.length > 0,
      toolsCount: edgeTools.length,
      tools: edgeTools.map((t) => t.name),
      d1Health: edgeHealth?.parsed || null,
    },
  });
}
