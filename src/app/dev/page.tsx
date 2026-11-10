"use client";
// Screen 11 · Developer hub
import Link from "next/link";
import { DEVELOPER, nicheBySlug } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar, Logo, VerifiedBadge } from "@/components/ui";

const WEEKLY = [{ w: "W1", v: 90 }, { w: "W2", v: 180 }, { w: "W3", v: 340 }];

export default function DevHub() {
  const { requests, feedback, apps } = useStore();
  // Requests that match this developer's skills: open or being built, most votes first.
  const matching = requests.filter((r) => r.status !== "live").sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  const myApps = apps.filter((a) => a.developer === DEVELOPER.handle);

  return (
    <main className="pb-10">
      <header className="bg-yellow px-5 pb-5 pt-4">
        <div className="flex items-center">
          <Link href="/me" className="mr-2 text-xl" aria-label="Back">‹</Link>
          <h1 className="flex-1 font-display text-xl font-bold">Developer hub</h1>
          <Avatar name={DEVELOPER.name} className="h-9 w-9 bg-white text-sm" />
        </div>
        <p className="mt-2 text-sm">Your app: <b>MessMate</b> <VerifiedBadge /> {myApps.length > 1 && <span className="text-ink/60">+{myApps.length - 1} more</span>}</p>
      </header>

      <section className="grid grid-cols-3 gap-3 px-5 pt-5">
        {[["340", "users", "bg-violet-tint"], ["4.5★", "rating", "bg-mint"], ["₹2.1k", "earned", "bg-peach"]].map(([v, l, t]) => (
          <div key={l} className={`${t} rounded-[20px] py-4 text-center`}>
            <p className="font-display text-xl font-bold">{v}</p>
            <p className="text-xs text-ink/60">{l}</p>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 rounded-[20px] border border-line p-4">
        <p className="font-display text-sm font-semibold">Weekly users</p>
        <div className="mt-3 space-y-2">
          {WEEKLY.map((x) => (
            <div key={x.w} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted">{x.w}</span>
              <div className="h-3 flex-1 rounded-full bg-canvas"><div className="h-3 rounded-full bg-violet" style={{ width: `${(x.v / 360) * 100}%` }} /></div>
              <span className="w-8 text-right font-semibold">{x.v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display font-semibold">Requests matching your skills <span className="text-sm font-normal text-muted">({DEVELOPER.skills.join(" · ")})</span></h2>
        <ul className="mt-3 space-y-3">
          {matching.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 rounded-[20px] border border-line p-4">
              <div className="flex-1">
                <p className="font-semibold leading-snug">{r.title}</p>
                <p className="text-xs text-muted">{nicheBySlug(r.niches[0])?.plural} · {r.upvotes} votes{r.bountyInr ? ` · ₹${r.bountyInr} bounty` : ""}{r.status === "building" ? ` · ${r.builders} building` : ""}</p>
              </div>
              <Link href={`/dev/publish?request=${r.id}`} className={`rounded-xl px-3 py-2 text-sm font-semibold ${i === 0 ? "bg-violet text-white" : "border-2 border-violet text-violet"}`}>Build this</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 pt-6">
        <h2 className="flex items-center gap-2 font-display font-semibold">Feedback inbox <span className="rounded-full bg-pink px-2 py-0.5 text-xs">{3 + feedback.length} new</span></h2>
        <div className="mt-3 flex gap-3 rounded-[20px] bg-canvas p-4">
          <Avatar name="Ananya" />
          <div className="text-sm">
            <p className="font-semibold">Ananya · MessMate</p>
            <p className="text-ink/70">“Can you add a Sunday special alert? Everything else is perfect.”</p>
          </div>
        </div>
      </section>

      <div className="px-5 pt-6">
        <Link href="/dev/publish" className="block rounded-2xl bg-yellow py-4 text-center font-display text-lg font-bold shadow-soft">+ Publish from GitHub</Link>
      </div>
      <p className="mt-4 text-center text-xs text-muted">Built on <Logo className="text-xs" /> · no ad spend, ranked on merit</p>
    </main>
  );
}
