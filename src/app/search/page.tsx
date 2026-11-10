"use client";
// Screen 3 · Search results (problem-first search)
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { matchPercent, priceLabel, searchApps } from "@/lib/match";
import { useStore } from "@/lib/store";
import { AppIcon, Chip, Pill, TopBar, VerifiedBadge } from "@/components/ui";

const FILTERS = ["✔ Verified", "Free", "Under ₹20", "New devs"] as const;

function Search() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "split hostel mess bill";
  const [q, setQ] = useState(initial);
  const [filters, setFilters] = useState<string[]>([]);
  const { apps, niches } = useStore();

  let results = searchApps(apps, initial);
  if (filters.includes("✔ Verified")) results = results.filter((a) => a.verified);
  if (filters.includes("Free")) results = results.filter((a) => a.priceInr === 0);
  if (filters.includes("Under ₹20")) results = results.filter((a) => a.priceInr < 20);
  if (filters.includes("New devs")) results = results.filter((a) => a.newDeveloper);

  const go = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) router.replace(`/search?q=${encodeURIComponent(q.trim())}`); };

  return (
    <main className="pb-10">
      <TopBar title="Search" />
      <form onSubmit={go} className="px-5">
        <label className="flex items-center gap-2 rounded-2xl border-2 border-violet bg-white px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-violet" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-transparent text-[15px] outline-none" placeholder="Describe your problem" />
        </label>
      </form>
      <p className="mt-1.5 px-5 text-xs text-muted">Describe the problem, not the app name. We match on meaning and merit.</p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        {FILTERS.map((f) => (
          <Chip key={f} active={filters.includes(f)} onClick={() => setFilters((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]))}>{f}</Chip>
        ))}
      </div>

      <p className="mt-5 px-5 font-display font-semibold">
        {results.length ? `${results.length} app${results.length > 1 ? "s solve" : " solves"} this problem` : "No app solves this yet"}
      </p>

      <ul className="mt-3 space-y-3 px-5">
        {results.map((a) => (
          <li key={a.slug} className="rounded-[20px] border border-line bg-white p-4 shadow-soft">
            <div className="flex gap-3">
              <Link href={`/app/${a.slug}`}><AppIcon app={a} /></Link>
              <Link href={`/app/${a.slug}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold">{a.name}</p>
                  {a.status === "beta" && <Pill className="bg-yellow !py-0.5 text-[10px]">BETA</Pill>}
                </div>
                <p className="truncate text-sm text-muted">{a.tagline}</p>
                <p className="mt-0.5 text-xs">★ {a.rating} · <b>{priceLabel(a)}</b> {a.verified && <>· <VerifiedBadge small /></>}</p>
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Pill className="bg-green-tint text-green">{matchPercent(a, niches, initial)}% match</Pill>
              <Link href={`/app/${a.slug}/run`} className="rounded-xl bg-green px-4 py-2 text-sm font-semibold text-white">Try free</Link>
            </div>
          </li>
        ))}
      </ul>

      <Link href={`/starter?q=${encodeURIComponent(initial)}`} className="mx-5 mt-5 block rounded-[20px] border-2 border-dashed border-yellow bg-yellow-tint p-4">
        <p className="font-display font-semibold">Not what you need?</p>
        <p className="text-sm text-ink/70">✨ Let AI draft an app, or post a request →</p>
      </Link>
    </main>
  );
}

export default function Page() {
  return <Suspense><Search /></Suspense>;
}
