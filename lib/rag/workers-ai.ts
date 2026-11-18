import type { KnowledgeChunk } from "@/lib/rag/corpus";

const GUARD = "@cf/meta/llama-guard-3-8b";
const EMBED = "@cf/baai/bge-base-en-v1.5";
const CHAT = "@cf/meta/llama-3.2-3b-instruct";

type AiBinding = {
  run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
};

const vectors = new Map<string, number[]>();

async function binding(): Promise<AiBinding | null> {
  try {
    const load = new Function("return import('cloudflare:workers')") as () => Promise<{ env?: { AI?: AiBinding } }>;
    const mod = await load();
    return mod.env?.AI || null;
  } catch {
    return null;
  }
}

function asVectors(payload: unknown): number[][] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as { data?: unknown; shape?: number[] };
  if (Array.isArray(record.data) && Array.isArray(record.data[0])) {
    return record.data.filter((row) => Array.isArray(row) && row.every((value) => typeof value === "number")) as number[][];
  }
  if (Array.isArray(record.data) && record.data.every((value) => typeof value === "number") && record.shape?.length === 2) {
    const [rows, columns] = record.shape;
    const flat = record.data as number[];
    const out: number[][] = [];
    for (let row = 0; row < rows; row += 1) out.push(flat.slice(row * columns, (row + 1) * columns));
    return out;
  }
  return [];
}

function cosine(left: number[], right: number[]): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] * left[index];
    rightNorm += right[index] * right[index];
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

async function embed(ai: AiBinding, texts: string[]): Promise<number[][]> {
  const missing: string[] = [];
  for (const text of texts) {
    if (!vectors.has(text)) missing.push(text);
  }
  for (let start = 0; start < missing.length; start += 16) {
    const batch = missing.slice(start, start + 16);
    const payload = await ai.run(EMBED, { text: batch });
    const rows = asVectors(payload);
    batch.forEach((text, index) => {
      if (rows[index]) vectors.set(text, rows[index]);
    });
  }
  return texts.map((text) => vectors.get(text) || []);
}

export async function workersAvailable(): Promise<boolean> {
  return Boolean(await binding());
}

export async function screenQuestion(question: string): Promise<"safe" | "unsafe" | "unavailable"> {
  const ai = await binding();
  if (!ai) return "unavailable";
  const verdict = await ai.run(GUARD, { messages: [{ role: "user", content: question.slice(0, 2000) }] });
  const text = JSON.stringify(verdict).toLowerCase();
  if (text.includes("unsafe")) return "unsafe";
  return "safe";
}

export async function rankByEmbedding(question: string, chunks: KnowledgeChunk[]): Promise<Array<KnowledgeChunk & { score: number }> | null> {
  const ai = await binding();
  if (!ai || chunks.length === 0) return null;
  const rows = await embed(ai, [question, ...chunks.map((chunk) => `${chunk.title}. ${chunk.text}`)]);
  const query = rows[0];
  if (!query?.length) return null;
  return chunks
    .map((chunk, index) => ({ ...chunk, score: cosine(query, rows[index + 1] || []) }))
    .filter((chunk) => chunk.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export async function answerWithWorkers(input: {
  question: string;
  locale: "bn" | "en";
  passages: KnowledgeChunk[];
}): Promise<{ answer: string; usedSourceIds: string[]; model: string } | null> {
  const ai = await binding();
  if (!ai) return null;
  const numbered = input.passages.map((passage) => `[${passage.id}] ${passage.title}\n${passage.text}`).join("\n\n");
  const result = await ai.run(CHAT, {
    messages: [
      {
        role: "system",
        content: [
          "You are the DigiTiles catalogue assistant for buyers in Bangladesh.",
          "Answer only from the passages. Prices are indicative asking prices in BDT, not confirmed quotations.",
          "Do not invent showrooms, warranties, discounts, stock counts, ratings, or client counts.",
          "If the passages do not contain the answer, say the published catalogue does not include it.",
          input.locale === "bn" ? "Write the answer in Bangla." : "Write the answer in English.",
          "Use a standard hyphen, not an em dash. Do not use emoji. Keep the answer under 160 words.",
          "Return JSON with keys answer and usedSourceIds.",
        ].join(" "),
      },
      {
        role: "user",
        content: `Question: ${input.question}\n\nPassages:\n${numbered}`,
      },
    ],
    max_tokens: 500,
  });
  const text = result && typeof result === "object" && "response" in result ? String((result as { response: unknown }).response) : "";
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as { answer?: string; usedSourceIds?: string[] };
    if (!parsed.answer) return null;
    return {
      answer: parsed.answer.trim(),
      usedSourceIds: Array.isArray(parsed.usedSourceIds) ? parsed.usedSourceIds.filter((id) => typeof id === "string") : [],
      model: CHAT,
    };
  } catch {
    if (cleaned.length < 20) return null;
    return {
      answer: cleaned.slice(0, 900),
      usedSourceIds: input.passages.slice(0, 3).map((passage) => passage.id),
      model: CHAT,
    };
  }
}

export const WORKERS_MODELS = { guard: GUARD, embed: EMBED, chat: CHAT };
