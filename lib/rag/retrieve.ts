import { buildKnowledgeCorpus, type KnowledgeChunk } from "@/lib/rag/corpus";

const SYNONYMS: Record<string, string[]> = {
  tile: ["tiles", "টাইলস", "টাইল"],
  tiles: ["tile", "টাইলস"],
  টাইলস: ["tile", "tiles"],
  টাইল: ["tile", "tiles"],
  price: ["দাম", "bdt", "টাকা", "rate"],
  দাম: ["price", "bdt", "টাকা"],
  টাকা: ["price", "bdt", "দাম"],
  box: ["boxes", "বক্স"],
  বক্স: ["box", "boxes"],
  quote: ["quotation", "কোটেশন", "rfq"],
  কোটেশন: ["quote", "quotation", "rfq"],
  showroom: ["শোরুম", "dealer"],
  শোরুম: ["showroom", "dealer"],
  delivery: ["transport", "পরিবহন"],
  পরিবহন: ["delivery", "transport"],
  install: ["installation", "মিস্ত্রি", "crew"],
  মিস্ত্রি: ["install", "crew"],
};

export type RetrievalHit = KnowledgeChunk & { score: number };

export type BoxEstimate = {
  listingId: string;
  listingTitle: string;
  href: string;
  areaSqft: number;
  wastePercent: number;
  sqftPerBox: number;
  minOrderBoxes: number;
  requiredSqft: number;
  boxes: number;
};

function latinDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
}

export function tokenize(value: string): string[] {
  return latinDigits(value)
    .toLowerCase()
    .split(/[^a-z0-9\u0980-\u09ff]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 || /\d/.test(token));
}

function expand(tokens: string[]): string[] {
  const next = new Set(tokens);
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] || []) next.add(synonym);
  }
  return Array.from(next);
}

function tokenSet(text: string): Set<string> {
  return new Set(tokenize(text));
}

export function scoreChunk(chunk: KnowledgeChunk, queryTokens: string[]): number {
  const tokens = tokenSet(`${chunk.title} ${chunk.text}`);
  let score = 0;
  for (const token of queryTokens) {
    if (tokens.has(token)) {
      score += chunk.title.toLowerCase().includes(token) ? 5 : 3;
      continue;
    }
    if (token.length < 3) continue;
    for (const known of Array.from(tokens)) {
      if (known.includes(token) || token.includes(known)) {
        score += 1;
        break;
      }
    }
  }
  return score;
}

export function parseAreaSqft(question: string): number | null {
  const match = latinDigits(question).match(/(\d+(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|বর্গ\s*ফুট)/i);
  if (!match) return null;
  const area = Number(match[1]);
  if (!Number.isFinite(area) || area <= 0 || area > 100000) return null;
  return area;
}

export function wastePercentFor(question: string): number {
  const text = question.toLowerCase();
  if (/herringbone|diagonal|হেরিংবোন|তির্যক/.test(text)) return 15;
  if (/brick|ইট/.test(text)) return 10;
  if (/straight|grid|সোজা/.test(text)) return 5;
  return 10;
}

function listingCoverage(chunk: KnowledgeChunk): { sqftPerBox: number; minOrderBoxes: number } | null {
  const coverage = chunk.text.match(/Coverage: ([\d.]+) sq\.ft per box/);
  const minimum = chunk.text.match(/Minimum order ([\d.]+) boxes/);
  if (!coverage) return null;
  const sqftPerBox = Number(coverage[1]);
  const minOrderBoxes = minimum ? Number(minimum[1]) : 1;
  if (!sqftPerBox) return null;
  return { sqftPerBox, minOrderBoxes };
}

export function retrieveCatalogue(question: string, focusListingId?: string): {
  hits: RetrievalHit[];
  estimate: BoxEstimate | null;
} {
  const queryTokens = expand(tokenize(question));
  const corpus = buildKnowledgeCorpus();
  const hits = corpus
    .map((chunk) => {
      let score = scoreChunk(chunk, queryTokens);
      if (focusListingId && (chunk.id === `listing:${focusListingId}` || chunk.id.startsWith(`listing:${focusListingId}:`))) score += 20;
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score);
  const expanded = expandShowroomGraph(corpus, hits).slice(0, 8);

  const area = parseAreaSqft(question);
  const listings = expanded.filter((hit) => hit.kind === "listing" && hit.text.includes("Coverage:"));
  let estimate: BoxEstimate | null = null;
  if (area && listings[0] && (!listings[1] || listings[0].score >= listings[1].score + 2)) {
    const coverage = listingCoverage(listings[0]);
    if (coverage) {
      const wastePercent = wastePercentFor(question);
      const requiredSqft = Math.round(area * (1 + wastePercent / 100) * 100) / 100;
      const boxes = Math.max(coverage.minOrderBoxes, Math.ceil(requiredSqft / coverage.sqftPerBox));
      const listingId = listings[0].id.split(":")[1];
      estimate = {
        listingId,
        listingTitle: listings[0].title,
        href: listings[0].href,
        areaSqft: area,
        wastePercent,
        sqftPerBox: coverage.sqftPerBox,
        minOrderBoxes: coverage.minOrderBoxes,
        requiredSqft,
        boxes,
      };
    }
  }

  return { hits: expanded, estimate };
}

function expandShowroomGraph(corpus: KnowledgeChunk[], hits: RetrievalHit[]): RetrievalHit[] {
  const selected = hits.slice(0, 6);
  const seen = new Set(selected.map((hit) => hit.id));
  for (const hit of hits.slice(0, 4)) {
    const showroom = hit.text.match(/Verified showroom: ([^/]+)\//)?.[1]?.trim();
    if (!showroom) continue;
    for (const chunk of corpus) {
      if (seen.has(chunk.id)) continue;
      const sameShowroom = chunk.kind === "showroom"
        ? chunk.title === showroom
        : chunk.kind === "listing" && chunk.text.includes(`Verified showroom: ${showroom}`);
      if (!sameShowroom) continue;
      seen.add(chunk.id);
      selected.push({ ...chunk, score: Math.max(1, hit.score * 0.5) });
    }
  }
  return selected.sort((a, b) => b.score - a.score);
}

export function estimatePassage(estimate: BoxEstimate): KnowledgeChunk {
  return {
    id: "estimate:boxes",
    kind: "estimate",
    title: `Box estimate for ${estimate.listingTitle}`,
    href: estimate.href,
    text: `Calculated from the published coverage of ${estimate.listingTitle}. Area ${estimate.areaSqft} sq.ft. Wastage allowance ${estimate.wastePercent} percent. Coverage ${estimate.sqftPerBox} sq.ft per box. Required coverage ${estimate.requiredSqft} sq.ft. Whole boxes to order: ${estimate.boxes}. Dealer minimum order: ${estimate.minOrderBoxes} boxes. This is an estimate for planning a quotation request, not a confirmed material quantity or price.`,
  };
}
