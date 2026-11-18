export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: unknown;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

export interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolCallResult {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

export async function callMcpRpc<T = unknown>(
  endpoint: string,
  method: string,
  params?: Record<string, unknown>,
  timeoutMs = 4500
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `${method}-${Date.now()}`,
        method,
        ...(params ? { params } : {}),
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as JsonRpcResponse<T>;
    if (payload.error) return null;
    return payload.result ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function initializeMcpServer(endpoint: string) {
  return callMcpRpc<{
    protocolVersion: string;
    capabilities?: Record<string, unknown>;
    serverInfo?: { name: string; version: string };
  }>(endpoint, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "digitiles-web-mcp-client", version: "1.0.0" },
  });
}

export async function listRemoteMcpTools(endpoint: string): Promise<McpToolDescriptor[]> {
  const res = await callMcpRpc<{ tools?: McpToolDescriptor[] }>(endpoint, "tools/list");
  return Array.isArray(res?.tools) ? res.tools : [];
}

export async function callRemoteMcpTool<T = unknown>(
  endpoint: string,
  name: string,
  args: Record<string, unknown>
): Promise<{ raw: McpToolCallResult; parsed: T | null } | null> {
  const result = await callMcpRpc<McpToolCallResult>(endpoint, "tools/call", {
    name,
    arguments: args,
  });
  if (!result) return null;
  const text = result.content?.find((item) => item.type === "text")?.text;
  if (!text) return { raw: result, parsed: null };
  try {
    return { raw: result, parsed: JSON.parse(text) as T };
  } catch {
    return { raw: result, parsed: null };
  }
}
