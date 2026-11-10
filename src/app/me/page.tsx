"use client";
// Screen 9 · Me / profile
import Link from "next/link";
import { useRouter } from "next/navigation";
import { nicheBySlug } from "@/lib/data";
import { priceLabel } from "@/lib/match";
import { useStore } from "@/lib/store";
import { AppIcon, Avatar, Pill, TabBar } from "@/components/ui";

export default function Me() {
  const { niches, myApps, apps, requests, reset, showToast, profile } = useStore();
  const router = useRouter();
  const mine = myApps.map((m) => ({ m, app: apps.find((a) => a.slug === m.slug)! })).filter((x) => x.app);
  const monthly = mine.filter((x) => x.m.state === "kept" && x.app.pricingType === "monthly").reduce((s, x) => s + x.app.priceInr, 0)
    + mine.filter((x) => x.m.state === "kept" && x.app.pricingType === "per_use").reduce((s, x) => s + x.app.priceInr * 3, 0);
  const myRequests = requests.filter((r) => r.mine ?? r.author === profile.name);

  const rows: [string, string, () => void][] = [
    ["🔔", "Notifications", () => router.push("/notifications")],
    ["🔒", "Privacy & permissions", () => showToast("Apps only see what you allow. (demo)")],
    ["🛠️", profile.role === "developer" ? "Developer hub" : "Switch to developer mode", () => router.push("/dev")],
    ["❓", "Help", () => showToast("Help centre coming soon")],
    ["↺", "Start over as a new user", () => { reset(); showToast("Signed out · starting fresh"); router.push("/welcome"); }],
  ];

  return (
    <main>
      <section className="flex flex-col items-center bg-violet-tint px-5 pb-6 pt-8">
        <Avatar name={profile.name || "?"} className="h-20 w-20 text-3xl ring-4 ring-white" />
        <h1 className="mt-3 text-2xl font-bold">{profile.name || "You"}</h1>
        {profile.role === "developer" && <Pill className="mt-2 bg-yellow">🛠️ Developer{profile.github ? ` · @${profile.github}` : ""}</Pill>}
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {niches.map((n) => <Pill key={n} className="bg-white">{nicheBySlug(n)?.icon} {nicheBySlug(n)?.label}</Pill>)}
          {!niches.length && <Pill className="bg-white text-muted">No niches picked yet</Pill>}
        </div>
        <div className="mt-2 flex gap-4 text-sm font-semibold text-violet">
          <Link href="/welcome?edit=1">Edit profile</Link>
          <Link href="/onboarding?edit=1">Edit niches</Link>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h2 className="font-display font-semibold">My apps</h2>
        <ul className="mt-2 divide-y divide-line">
          {mine.map(({ m, app }) => (
            <li key={app.slug}>
              <Link href={`/app/${app.slug}`} className="flex items-center gap-3 py-3">
                <AppIcon app={app} size="sm" />
                <span className="flex-1 font-semibold">{app.name}</span>
                {m.state === "kept"
                  ? <Pill className="bg-green-tint text-green">Kept · {priceLabel(app)}</Pill>
                  : <Pill className="bg-yellow-tint">Trial · {m.usesLeft} use{m.usesLeft === 1 ? "" : "s"} left</Pill>}
              </Link>
            </li>
          ))}
          {!mine.length && <li className="py-4 text-sm text-muted">No apps yet. Try one from your feed.</li>}
        </ul>
      </section>

      <section className="mx-5 mt-3 rounded-[20px] bg-yellow-tint p-4 ring-1 ring-yellow">
        <p className="font-display font-semibold">This month: ₹{monthly} across {mine.filter((x) => x.m.state === "kept").length} apps</p>
        <p className="text-sm text-ink/70">One bill, cancel anytime.</p>
      </section>

      <section className="px-5 pt-6">
        <h2 className="font-display font-semibold">My requests</h2>
        <ul className="mt-2 space-y-2">
          {myRequests.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-2xl bg-canvas px-4 py-3 text-sm">
              <span className="font-medium">{r.title}</span>
              <span className="shrink-0 pl-2 text-muted">▲{r.upvotes} · <span className={r.status === "live" ? "text-green" : r.status === "building" ? "text-violet" : ""}>{r.status === "building" ? "Building" : r.status === "live" ? "Live" : "Open"}</span></span>
            </li>
          ))}
          {!myRequests.length && <li className="text-sm text-muted">No requests yet. <Link href="/requests/new" className="font-semibold text-violet">Post one →</Link></li>}
        </ul>
      </section>

      <section className="mt-6 border-t border-line">
        {rows.map(([icon, label, fn]) => (
          <button key={label} onClick={fn} className="flex w-full items-center gap-3 border-b border-line px-5 py-4 text-left hover:bg-canvas">
            <span className="w-6 text-center">{icon}</span><span className="flex-1 font-medium">{label}</span><span className="text-muted">›</span>
          </button>
        ))}
      </section>
      <TabBar />
    </main>
  );
}
