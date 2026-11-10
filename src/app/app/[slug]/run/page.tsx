"use client";
// Screen 5 · Mini-app running (free trial) + feedback sheet
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FREE_USES } from "@/lib/data";
import { priceLabel } from "@/lib/match";
import { useApp, useStore } from "@/lib/store";
import { AttendCalcApp, BillSplitApp, GenericApp } from "@/components/MiniApps";
import { CloseButton, Pill } from "@/components/ui";

const REASONS = ["Too costly", "Confusing", "Missing feature", "Didn't work"];

export default function RunApp() {
  const { slug } = useParams<{ slug: string }>();
  const app = useApp(slug);
  const store = useStore();
  const router = useRouter();
  const spent = useRef(false);
  const [left, setLeft] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);
  const [negative, setNegative] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);

  // Opening the app uses one free try (once per visit).
  useEffect(() => {
    if (!store.ready || !app || spent.current) return;
    spent.current = true;
    const mine = store.myApps.find((m) => m.slug === app.slug);
    if (mine && mine.state === "trial" && mine.usesLeft <= 0) { setLeft(-1); return; }
    setLeft(store.spendTrialUse(app.slug));
    const t = setTimeout(() => setSheet(true), 9000);
    return () => clearTimeout(t);
  }, [store.ready, app]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!app) { if (store.ready) notFound(); return null; }
  const kept = left === Infinity;
  const trialOver = left === -1;

  const keep = () => {
    if (!store.requireAccount("keep apps")) return;
    store.keepApp(app.slug);
    store.sendFeedback(app.slug, true, []);
    store.showToast(app.priceInr ? `Kept! ${priceLabel(app)} added to your one monthly bill (mock payment)` : `${app.name} added to My apps`);
    router.push("/me");
  };

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <span className={`${app.tint} grid h-9 w-9 place-items-center rounded-xl text-lg`}>{app.icon}</span>
        <div className="flex-1">
          <p className="font-display font-bold leading-tight">{app.name}</p>
          {left !== null && !kept && !trialOver && <Pill className="mt-0.5 bg-violet-tint !py-0.5 text-[11px] text-violet">Free trial · {left} of {FREE_USES} uses left</Pill>}
          {kept && <Pill className="mt-0.5 bg-green-tint !py-0.5 text-[11px] text-green">In My apps</Pill>}
        </div>
        <CloseButton href={`/app/${app.slug}`} />
      </header>

      <div className="flex-1 p-5">
        {trialOver ? (
          <div className="rounded-[20px] bg-violet-tint p-6 text-center">
            <p className="text-4xl">⏳</p>
            <p className="mt-2 font-display text-lg font-bold">Your free tries are used up</p>
            <p className="mt-1 text-sm text-muted">Keep {app.name} for {priceLabel(app)}. One bill, cancel anytime.</p>
            <button onClick={keep} className="mt-4 w-full rounded-2xl bg-violet py-3 font-semibold text-white">Keep it · {priceLabel(app)} (mock pay)</button>
          </div>
        ) : app.slug === "billsplit" || app.slug === "splitit" ? <BillSplitApp /> : app.slug === "attendcalc" ? <AttendCalcApp /> : <GenericApp app={app} />}

        {!kept && !trialOver && !sheet && (
          <button onClick={() => setSheet(true)} className="mt-6 w-full rounded-2xl border border-line py-3 text-sm font-semibold text-muted">Done trying? Tell us if it worked</button>
        )}
      </div>

      <p className="border-t border-line py-2 text-center text-[11px] text-muted">Running in solvd. · no install · {app.verified ? "✔ verified" : "beta"}</p>

      {sheet && !kept && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30" onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} className="animate-slide-up w-full max-w-[430px] rounded-t-[28px] bg-white p-5 pb-8">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
            <p className="font-display text-lg font-bold">Did {app.name} solve your problem?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={keep} className="rounded-2xl bg-green-tint py-3.5 font-semibold text-green">👍 Yes, keep it</button>
              <button onClick={() => setNegative(true)} className={`rounded-2xl py-3.5 font-semibold ${negative ? "bg-red text-white" : "bg-red-tint text-red"}`}>👎 Not really</button>
            </div>
            {negative && (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {REASONS.map((r) => (
                    <button key={r} onClick={() => setReasons((x) => (x.includes(r) ? x.filter((y) => y !== r) : [...x, r]))} className={`rounded-full border px-3 py-1.5 text-sm ${reasons.includes(r) ? "border-violet bg-violet text-white" : "border-line"}`}>{r}</button>
                  ))}
                </div>
                <button
                  onClick={() => { store.sendFeedback(app.slug, false, reasons); store.showToast(`Thanks! ${app.developer} will see your feedback`); setSheet(false); }}
                  className="mt-4 w-full rounded-2xl bg-violet py-3 font-semibold text-white"
                >
                  Send feedback
                </button>
                <Link href={`/search?q=${encodeURIComponent(app.tagline)}`} className="mt-2 block text-center text-sm text-violet">Find a similar app instead →</Link>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
