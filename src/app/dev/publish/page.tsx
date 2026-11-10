"use client";
// Screen 12 · Publish from GitHub (security check, deploy, pricing, spotlight)
// Everything here is simulated for the demo. Later: GitHub OAuth, a real
// dependency/secret/licence scan, and the Vercel deploy API.
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { handleFor, type App, type PricingType } from "@/lib/data";
import { slugify } from "@/lib/match";
import { useStore } from "@/lib/store";
import { Button, TopBar } from "@/components/ui";

const REPOS = [
  { repo: "attend-calc", name: "AttendCalc", icon: "📊", tint: "bg-violet-tint", forTitle: "attendance" },
  { repo: "timetable-snap", name: "TimeSnap", icon: "🗓️", tint: "bg-sky", forTitle: "timetable" },
  { repo: "library-nudge", name: "LibNudge", icon: "📚", tint: "bg-mint", forTitle: "library" },
  { repo: "laundry-slots", name: "SlotWash", icon: "🧺", tint: "bg-sky", forTitle: "laundry" },
  { repo: "kirana-stock", name: "KiranaPing", icon: "📦", tint: "bg-peach", forTitle: "kirana" },
];

const CHECKS = ["Dependencies safe", "No leaked secrets", "Licence found (MIT)"];

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="relative pl-11">
      <span className={`absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${done ? "bg-green text-white" : "bg-violet-tint text-violet"}`}>{done ? "✓" : n}</span>
      <h2 className="font-display font-semibold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Publish() {
  const params = useSearchParams();
  const router = useRouter();
  const { requests, startBuilding, publishApp, showToast, profile } = useStore();
  const handle = handleFor(profile);
  const openReqs = requests.filter((r) => r.status !== "live");
  const [reqId, setReqId] = useState(params.get("request") ?? "r-attendance");
  const req = requests.find((r) => r.id === reqId);
  // Pick the matching demo repo, or make one from the request title (e.g. "water-cooler-status").
  const custom = req && {
    repo: slugify(req.title).split("-").slice(0, 3).join("-"),
    name: req.title.split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("").replace(/[^A-Za-z0-9]/g, ""),
    icon: "✨", tint: "bg-violet-tint", forTitle: "",
  };
  const matched = REPOS.find((r) => req?.title.toLowerCase().includes(r.forTitle));
  const repos = matched || !custom ? REPOS : [custom, ...REPOS];
  const guess = matched ?? repos[0];
  const [repo, setRepo] = useState(guess.repo);
  const [checked, setChecked] = useState(0); // how many checks passed
  const [deployed, setDeployed] = useState(false);
  const [pricing, setPricing] = useState<PricingType>("free");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { setRepo(guess.repo); }, [reqId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulated pipeline: run the 3 checks, then deploy.
  useEffect(() => {
    setChecked(0); setDeployed(false);
    const timers = [1, 2, 3].map((i) => setTimeout(() => setChecked(i), i * 600));
    timers.push(setTimeout(() => setDeployed(true), 2600));
    return () => timers.forEach(clearTimeout);
  }, [repo]);

  const meta = repos.find((r) => r.repo === repo) ?? guess;

  const publish = () => {
    setPublishing(true);
    if (req?.status === "open") startBuilding(req.id);
    const app: App = {
      slug: slugify(meta.name), name: meta.name, icon: meta.icon, tint: meta.tint,
      tagline: req?.title ?? "A tiny app", description: req?.description || `${meta.name}: ${req?.title}`,
      developer: profile.name || handle, mine: true, niches: req?.niches ?? ["student"], pricingType: pricing,
      priceInr: pricing === "free" ? 0 : pricing === "monthly" ? 9 : 2,
      rating: 4.7, usersCount: req?.upvotes ?? 0, status: pricing === "free" ? "beta" : "live",
      verified: true, securityScore: 92, licence: "MIT", updatedDaysAgo: 0, newDeveloper: true,
      keywords: req?.title.toLowerCase().split(/\W+/) ?? [], reviews: [],
    };
    setTimeout(() => {
      publishApp({ requestId: req?.id, app });
      showToast(`🚀 ${app.name} is live! ${req?.upvotes ?? 0} upvoters notified`);
      router.push("/notifications");
    }, 900);
  };

  return (
    <main className="pb-10">
      <TopBar title="Publish your app" />
      <div className="px-5">
        <label className="block rounded-2xl bg-violet-tint px-4 py-3 text-sm">
          <span className="text-muted">Solving:</span>
          <select value={reqId} onChange={(e) => setReqId(e.target.value)} className="mt-0.5 block w-full bg-transparent font-semibold text-violet outline-none">
            {openReqs.map((r) => <option key={r.id} value={r.id}>{r.title} (▲{r.upvotes})</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 space-y-7 px-5">
        <Step n={1} title="Connect GitHub repo" done>
          <select value={repo} onChange={(e) => setRepo(e.target.value)} className="w-full rounded-2xl border border-line bg-white px-4 py-3 font-mono text-sm outline-none focus:border-violet">
            {repos.map((r) => <option key={r.repo} value={r.repo}>{handle} / {r.repo}</option>)}
          </select>
        </Step>

        <Step n={2} title="Security & licence check" done={checked === 3}>
          <ul className="space-y-1.5 text-sm">
            {CHECKS.map((c, i) => (
              <li key={c} className={i < checked ? "text-green" : "text-muted"}>{i < checked ? "✔" : "◌"} {c}{i === checked && " …"}</li>
            ))}
          </ul>
          {checked === 3 && <span className="animate-pop mt-2 inline-block rounded-full bg-green px-3 py-1 text-xs font-bold text-white">Security score 92/100</span>}
        </Step>

        <Step n={3} title="Deploy" done={deployed}>
          <p className={`text-sm ${deployed ? "font-semibold text-green" : "text-muted"}`}>{deployed ? `✔ Live on Vercel · ${repo}.vercel.app` : "Waiting for checks…"}</p>
        </Step>

        <Step n={4} title="Pricing">
          <div className="flex flex-wrap gap-2">
            {([["free", "Free beta"], ["per_use", "Pay per use"], ["monthly", "Monthly"]] as [PricingType, string][]).map(([v, l]) => (
              <button key={v} onClick={() => setPricing(v)} className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${pricing === v ? "border-violet bg-violet text-white" : "border-line"}`}>{l}{pricing === v ? " ✔" : ""}</button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">{pricing === "free" ? "Beta apps stay free until they pass the quality checklist." : pricing === "monthly" ? "₹9/month suggested for students." : "₹2 per use suggested."}</p>
        </Step>
      </div>

      <p className="mx-5 mt-7 rounded-2xl bg-yellow-tint p-3 text-center text-sm">New developers get a free <b>Launch-Day Spotlight</b> 🌟</p>
      <div className="px-5 pt-4">
        <Button className="w-full text-lg" disabled={!deployed || publishing} onClick={publish}>{publishing ? "Publishing…" : "🚀 Publish in 1 click"}</Button>
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense><Publish /></Suspense>;
}
