"use client";
// Screen 6 · No match → AI starter app
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, TopBar } from "@/components/ui";

function draftFor(problem: string) {
  // Mock "AI": picks a starter template from the words in the problem.
  const p = problem.toLowerCase();
  if (/(photo|image|scan|picture)/.test(p)) return { name: "Snap → Do", icon: "📷", input: "Upload photo", steps: ["Read text from the photo", "Turn each line into an item", "Export to calendar / list"] };
  if (/(remind|due|deadline|alert)/.test(p)) return { name: "Nudge", icon: "🔔", input: "Add a reminder", steps: ["Add what and when", "Get a push 2 days before", "Mark done"] };
  if (/(track|count|log|%)/.test(p)) return { name: "Tracker", icon: "📋", input: "Add an entry", steps: ["Add entries daily", "See totals and %", "Get warned when it drops"] };
  return { name: "Quick Tool", icon: "🧩", input: "Start", steps: ["Enter your details", "AI does the boring part", "Share the result"] };
}

function Starter() {
  const q = useSearchParams().get("q") || "turn my timetable photo into calendar events";
  const { postRequest, requests, showToast, profile } = useStore();
  const [opened, setOpened] = useState(false);
  const d = draftFor(q);
  const alreadyPosted = requests.some((r) => r.title.toLowerCase() === q.toLowerCase());

  const useIt = () => {
    if (!profile.complete) { setOpened(true); showToast("AI draft opened (guest mode)"); return; }
    if (!alreadyPosted) postRequest({ title: q, description: "Posted automatically from an AI starter app.", niches: ["student"], bountyInr: 0 });
    setOpened(true);
    showToast("AI draft opened · your request is on the board too");
  };

  return (
    <main className="pb-10">
      <TopBar title="No app found yet" up="/search" />
      <p className="px-5 text-sm text-muted">for “{q}”</p>

      <h2 className="mt-6 px-5 text-2xl font-bold">✨ Let AI draft a starter app?</h2>
      <p className="mt-1 px-5 text-sm text-muted">Use a simple version right now. A developer can polish it later.</p>

      <div className="relative mx-5 mt-5 rounded-[20px] border-2 border-dashed border-violet/50 bg-violet-tint/50 p-5">
        <span className="absolute -top-3 right-4 rounded-full bg-violet px-3 py-1 text-xs font-bold text-white">AI draft</span>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl">{d.icon}</span>
          <div>
            <p className="font-display font-bold">{d.name}</p>
            <p className="text-xs text-muted">Generated from your problem</p>
          </div>
        </div>
        <ol className="mt-4 space-y-2 text-sm">
          {d.steps.map((s, i) => <li key={s} className="flex gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold">{i + 1}</span>{s}</li>)}
        </ol>
        <button onClick={useIt} className="mt-4 w-full rounded-xl border-2 border-violet bg-white py-2.5 text-sm font-semibold text-violet">⬆ {d.input}</button>
        {opened && <p className="mt-3 rounded-xl bg-white p-3 text-xs text-muted">Demo: in the real app, this runs an LLM-generated mini-app here. 🤖</p>}
      </div>

      <div className="mt-6 space-y-3 px-5">
        <Button className="w-full" onClick={useIt}>Use it now</Button>
        <Link href={`/requests/new?title=${encodeURIComponent(q)}`} className="block rounded-2xl border-2 border-violet py-3 text-center font-display font-semibold text-violet">
          Request a developer to polish it
        </Link>
      </div>
      <p className={`mt-4 px-5 text-center text-xs text-muted ${profile.complete ? "" : "hidden"}`}>ℹ️ Your request is also posted to the <Link href="/requests?tab=new" className="font-semibold text-violet">Requests board</Link> so others can upvote it.</p>
    </main>
  );
}

export default function Page() {
  return <Suspense><Starter /></Suspense>;
}
