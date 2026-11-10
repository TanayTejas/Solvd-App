"use client";
// Screen 7 · Requests board
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { nicheBySlug, type AppRequest } from "@/lib/data";
import { useStore } from "@/lib/store";
import { TabBar } from "@/components/ui";

type Tab = "trending" | "new" | "solved";

function Status({ r }: { r: AppRequest }) {
  if (r.status === "live") return <Link href={`/app/${r.linkedAppSlug}`} className="rounded-full bg-green px-2.5 py-1 text-xs font-bold text-white">✔ Live · Try it</Link>;
  if (r.status === "building")
    return (
      <div className="w-full">
        <div className="h-2 rounded-full bg-canvas"><div className="h-2 rounded-full bg-violet" style={{ width: `${Math.min(90, 30 + r.builders * 15)}%` }} /></div>
        <p className="mt-1 text-xs font-semibold text-violet">{r.builders} dev{r.builders > 1 ? "s" : ""} building</p>
      </div>
    );
  return <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-muted">Open</span>;
}

function Board() {
  const { requests, upvoted, toggleUpvote } = useStore();
  const [tab, setTab] = useState<Tab>((useSearchParams().get("tab") as Tab) || "trending");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  let list = requests.filter((r) => (tab === "solved" ? r.status === "live" : r.status !== "live"));
  if (q) list = list.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));
  list = [...list].sort((a, b) => (tab === "new" ? b.createdAt - a.createdAt : b.upvotes - a.upvotes));

  return (
    <main>
      <header className="flex items-center px-5 pt-5">
        <h1 className="flex-1 text-2xl font-bold">Requests</h1>
        <button aria-label="Search requests" onClick={() => setSearching((s) => !s)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </button>
      </header>
      <p className="px-5 text-sm text-muted">Problems people want solved. Upvote, and get notified when it&apos;s built.</p>
      {searching && <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search requests" className="mx-5 mt-3 w-[calc(100%-2.5rem)] rounded-2xl bg-canvas px-4 py-2.5 outline-none" />}

      <div className="mx-5 mt-4 grid grid-cols-3 rounded-2xl bg-canvas p-1 text-sm font-semibold">
        {(["trending", "new", "solved"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-2 capitalize ${tab === t ? "bg-white text-violet shadow-soft" : "text-muted"}`}>{t}</button>
        ))}
      </div>

      <ul className="mt-4 space-y-3 px-5">
        {list.map((r) => {
          const on = upvoted.includes(r.id);
          return (
            <li key={r.id} className="flex gap-3 rounded-[20px] border border-line bg-white p-4 shadow-soft">
              <button
                onClick={() => toggleUpvote(r.id)}
                aria-pressed={on}
                className={`flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl border-2 text-sm font-bold transition ${on ? "border-violet bg-violet text-white" : "border-line"}`}
              >
                <span>▲</span>{r.upvotes}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-snug">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted">{r.niches.map((n) => nicheBySlug(n)?.plural).join(" · ")} · by {r.author}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {r.bountyInr > 0 && <span className="rounded-full bg-green px-2.5 py-1 text-xs font-bold text-white">₹{r.bountyInr} bounty</span>}
                  <Status r={r} />
                </div>
              </div>
            </li>
          );
        })}
        {!list.length && <li className="py-10 text-center text-muted">Nothing here yet.</li>}
      </ul>

      <Link href="/requests/new" aria-label="Post a request" className="fixed bottom-24 right-[max(1.25rem,calc(50%-215px+1.25rem))] z-30 grid h-14 w-14 place-items-center rounded-2xl bg-violet text-3xl text-white shadow-soft">+</Link>
      <TabBar />
    </main>
  );
}

export default function Page() {
  return <Suspense><Board /></Suspense>;
}
