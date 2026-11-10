// "AI" matching for the demo. This is a simple keyword scorer so the demo works
// with no API key. Later it can be swapped for an LLM / embeddings call
// (build order step 2 in 01_PROJECT_CONTEXT.md, section 9.3).
import type { App, NicheSlug } from "./data";

const STOP = new Set([
  "a", "an", "the", "my", "for", "to", "of", "in", "on", "and", "or", "with", "me", "i", "all",
  "between", "into", "from", "is", "it", "app", "want", "need", "how", "can", "help", "before", "get",
]);

const SYNONYMS: Record<string, string[]> = {
  bill: ["split", "expense", "money"],
  divide: ["split"],
  share: ["split"],
  roommates: ["hostel", "friends"],
  hostel: ["mess", "hostel"],
  remind: ["reminder", "due"],
  deadline: ["due"],
  books: ["library", "book"],
  bunk: ["attendance"],
  marks: ["grades", "gpa"],
  washing: ["laundry"],
  inventory: ["stock"],
  workout: ["gym"],
  recipe: ["cook"],
  schedule: ["timetable", "calendar"],
};

export function tokens(text: string): string[] {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9%₹ ]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
  const out = new Set<string>();
  for (const t of base) {
    out.add(t);
    if (t.endsWith("s") && t.length > 3) out.add(t.slice(0, -1));
    for (const s of SYNONYMS[t] ?? []) out.add(s);
  }
  return [...out];
}

/** How well an app fits a typed problem, 0..1 */
export function problemScore(app: App, query: string): number {
  const q = tokens(query);
  if (!q.length) return 0;
  const hay = new Set([
    ...app.keywords,
    ...tokens(app.name),
    ...tokens(app.tagline),
    ...tokens(app.description),
  ]);
  let hits = 0;
  for (const t of q) if (hay.has(t)) hits++;
  return hits / q.length;
}

export function searchApps(apps: App[], query: string): App[] {
  return apps
    .map((a) => ({ a, s: problemScore(a, query) }))
    .filter((x) => x.s >= 0.34)
    .sort((x, y) => y.s - x.s || Number(y.a.verified) - Number(x.a.verified) || y.a.rating - x.a.rating)
    .map((x) => x.a);
}

/** The "92% match" number: niche overlap + quality signals (merit, not ads). */
export function matchPercent(app: App, niches: NicheSlug[], query?: string): number {
  const overlap = app.niches.filter((n) => niches.includes(n)).length;
  // No niches picked (Skip): rank on quality alone.
  let score = (niches.length ? 48 + overlap * 20 : 72) + (app.rating - 4) * 8 + (app.verified ? 0 : -8);
  if (query) score += problemScore(app, query) * 20;
  return Math.max(35, Math.min(98, Math.round(score)));
}

export function matchReason(app: App, niches: NicheSlug[]): string {
  const shared = app.niches.filter((n) => niches.includes(n));
  if (!shared.length) return "Popular on solvd.";
  return `Because you're a ${shared.map((s) => s.replace("_", " ")).join(" & ")}`;
}

export function priceLabel(app: Pick<App, "pricingType" | "priceInr">): string {
  if (app.pricingType === "free" || app.priceInr === 0) return "₹0";
  if (app.pricingType === "monthly") return `₹${app.priceInr}/mo`;
  return `₹${app.priceInr}/use`;
}

export function compactNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
