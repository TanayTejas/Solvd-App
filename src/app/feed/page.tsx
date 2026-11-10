"use client";
// Screen 2 · Your feed (home)
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { nicheBySlug, TRENDING_SLUGS, type App } from "@/lib/data";
import { matchPercent } from "@/lib/match";
import { useStore } from "@/lib/store";
import { AppCard, Avatar, BellButton, Logo, TabBar } from "@/components/ui";

function Row({ title, apps, subtitle }: { title: string; subtitle?: string; apps: App[] }) {
  if (!apps.length) return null;
  return (
    <section className="mt-6">
      <div className="px-5">
        <h2 className="text-[17px] font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      <div className="no-scrollbar mt-3 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
        {apps.map((a) => <AppCard key={a.slug} app={a} />)}
      </div>
    </section>
  );
}

export default function Feed() {
  const { apps, niches, requests, upvoted, toggleUpvote, profile } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");

  const byMatch = (list: App[]) => [...list].sort((a, b) => matchPercent(b, niches) - matchPercent(a, niches));
  const nicheRows = niches.slice(0, 3).map((slug) => ({
    slug,
    title: `Because you're a ${nicheBySlug(slug)?.label ?? slug}`,
    apps: byMatch(apps.filter((a) => a.niches.includes(slug) && !a.newDeveloper)).slice(0, 6),
  }));
  const trending = TRENDING_SLUGS.map((s) => apps.find((a) => a.slug === s)).filter(Boolean) as App[];
  const fresh = byMatch(apps.filter((a) => a.newDeveloper)).slice(0, 6);
  // Show the top open request from your most specific niche ("Student" is the broadest, so it goes last).
  const order = [...niches.filter((n) => n !== "student"), ...niches.filter((n) => n === "student")];
  const nicheRequest = order
    .map((n) => requests.filter((r) => r.status === "open" && r.niches.includes(n)).sort((a, b) => b.upvotes - a.upvotes)[0])
    .find(Boolean);

  return (
    <main>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-1 bg-white/95 px-5 backdrop-blur">
        <Logo className="flex-1 text-[26px]" />
        <BellButton />
        <Link href="/me" aria-label="Me"><Avatar name={profile.name || "?"} /></Link>
      </header>

      <form
        className="px-5 pt-1"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}
      >
        <label className="flex items-center gap-2 rounded-2xl bg-canvas px-4 py-3">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Describe a problem… e.g. split mess bill" className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted" />
        </label>
      </form>

      {nicheRows.map((r) => <Row key={r.slug} title={r.title} apps={r.apps} />)}
      {!niches.length && (
        <>
          <Link href="/onboarding?edit=1" className="mx-5 mt-5 flex items-center justify-between rounded-[20px] bg-violet-tint px-4 py-3 text-sm">
            <span>✨ <b>Make this feed yours.</b> Pick your niches</span>
            <span className="font-semibold text-violet">→</span>
          </Link>
          <Row title="Popular on solvd." apps={[...apps].sort((a, b) => b.usersCount - a.usersCount).slice(0, 8)} />
        </>
      )}
      <Row title="Trending now 🔥" apps={trending} />
      <Row title="★ Fresh from new developers" subtitle="Launch-Day Spotlight · ranked on merit, never ads" apps={fresh} />

      {nicheRequest && (
        <section className="mx-5 mt-7 rounded-[20px] bg-yellow-tint p-4 ring-1 ring-yellow">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">💡 Requests in your niche</p>
          <div className="mt-2 flex items-center gap-3">
            <Link href="/requests" className="flex-1">
              <p className="font-display font-semibold leading-snug">{nicheRequest.title}</p>
              <p className="text-sm text-muted">{nicheRequest.upvotes} {nicheBySlug(nicheRequest.niches[0])?.plural.toLowerCase()} want this</p>
            </Link>
            <button
              onClick={() => toggleUpvote(nicheRequest.id)}
              className={`h-11 w-14 rounded-xl border-2 font-bold transition ${upvoted.includes(nicheRequest.id) ? "border-violet bg-violet text-white" : "border-ink bg-white"}`}
            >
              {upvoted.includes(nicheRequest.id) ? "✓" : "+1"}
            </button>
          </div>
        </section>
      )}

      <Link href="/dev" className="mx-5 mt-4 mb-2 flex items-center justify-between rounded-[20px] border border-dashed border-violet/40 px-4 py-3 text-sm">
        <span>🛠️ Are you a developer? <b className="text-violet">Build for real demand</b></span>
        <span className="text-violet">→</span>
      </Link>
      <TabBar />
    </main>
  );
}
