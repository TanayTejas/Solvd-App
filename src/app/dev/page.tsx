"use client";
// Screen 11 · Developer hub
import Link from "next/link";
import { DEVELOPER, nicheBySlug } from "@/lib/data";
import { compactNumber } from "@/lib/match";
import { useStore } from "@/lib/store";
import { goBack } from "@/lib/nav";
import { useRouter } from "next/navigation";
import { GuestWall } from "@/components/AccountPrompt";
import { Avatar, Logo, VerifiedBadge } from "@/components/ui";


export default function DevHub() {
  const { requests, feedback, apps, profile, ready } = useStore();
  const router = useRouter();
  const skills = profile.skills.length ? profile.skills : DEVELOPER.skills;
  // Requests that match this developer's skills: open or being built, most votes first.
  const matching = requests.filter((r) => r.status !== "live").sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  const myApps = apps.filter((a) => a.mine);
  // Until you publish, the hub shows the sample developer's numbers so the screen isn't empty.
  const sample = myApps.length === 0;
  const users = sample ? 340 : myApps.reduce((n, a) => n + a.usersCount, 0);
  const rating = sample ? 4.5 : myApps.reduce((n, a) => n + a.rating, 0) / myApps.length;
  const earned = sample ? "₹2.1k" : `₹${myApps.reduce((n, a) => n + a.priceInr * Math.round(a.usersCount * 0.3), 0)}`;
  const weekly = [0.26, 0.53, 1].map((f, i) => ({ w: `W${i + 1}`, v: Math.round(users * f) }));

  if (ready && !profile.complete) {
    return (
      <main className="px-5 pb-10 pt-6">
        <h1 className="mb-4 font-display text-xl font-bold">Developer hub</h1>
        <GuestWall reason="build and publish apps" />
      </main>
    );
  }

  return (
    <main className="pb-10">
      <header className="bg-yellow px-5 pb-5 pt-4">
        <div className="flex items-center">
          <button onClick={() => goBack(router, "/me")} className="-ml-2 mr-1 grid h-10 w-10 place-items-center rounded-full text-2xl hover:bg-black/5" aria-label="Back">‹</button>
          <h1 className="flex-1 font-display text-xl font-bold">Developer hub</h1>
          <Avatar name={profile.name || "?"} className="h-9 w-9 bg-white text-sm" />
        </div>
        <p className="mt-2 text-sm">Hi {profile.name.split(" ")[0] || "there"} 👋 {sample
          ? <span className="text-ink/70">No apps yet. Build one from a request below.</span>
          : <>Your app{myApps.length > 1 ? "s" : ""}: <b>{myApps.map((a) => a.name).join(", ")}</b> <VerifiedBadge /></>}</p>
      </header>

      <section className="grid grid-cols-3 gap-3 px-5 pt-5">
        {[[compactNumber(users), "users", "bg-violet-tint"], [`${rating.toFixed(1)}★`, "rating", "bg-mint"], [earned, "earned", "bg-peach"]].map(([v, l, t]) => (
          <div key={l} className={`${t} rounded-[20px] py-4 text-center`}>
            <p className="font-display text-xl font-bold">{v}</p>
            <p className="text-xs text-ink/60">{l}</p>
          </div>
        ))}
      </section>

      <section className="mx-5 mt-4 rounded-[20px] border border-line p-4">
        <p className="font-display text-sm font-semibold">Weekly users {sample && <span className="font-normal text-muted">· sample (MessMate by Rahul)</span>}</p>
        <div className="mt-3 space-y-2">
          {weekly.map((x) => (
            <div key={x.w} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted">{x.w}</span>
              <div className="h-3 flex-1 rounded-full bg-canvas"><div className="h-3 rounded-full bg-violet" style={{ width: `${(x.v / Math.max(1, weekly[2].v * 1.05)) * 100}%` }} /></div>
              <span className="w-8 text-right font-semibold">{x.v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display font-semibold">Requests matching your skills <span className="text-sm font-normal text-muted">({skills.join(" · ")})</span></h2>
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
