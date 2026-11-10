"use client";
// Screen 1 · Pick your niche
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NICHES, type NicheSlug } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Button, Logo } from "@/components/ui";

function Onboarding() {
  const store = useStore();
  const router = useRouter();
  const editing = useSearchParams().get("edit") === "1";
  const [picked, setPicked] = useState<NicheSlug[]>(store.niches);
  useEffect(() => { if (store.ready) setPicked(store.niches); }, [store.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (s: NicheSlug) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  // Skip: no niches, so the feed shows what's popular for everyone.
  const skip = () => {
    store.finishOnboarding([]);
    store.showToast("Skipped · pick niches anytime in Me");
    router.push("/feed");
  };

  const done = () => {
    store.finishOnboarding(picked);
    if (editing) store.showToast("Niches updated · your feed is re-tuned");
    router.push(editing ? "/me" : "/feed");
  };

  return (
    <main className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <div className="flex items-center justify-between">
        <Logo className="text-3xl" />
        {!editing && (
          <button onClick={skip} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-muted hover:border-violet hover:text-violet">
            Skip
          </button>
        )}
      </div>
      <h1 className="mt-8 text-[28px] font-bold leading-tight">What describes you?</h1>
      <p className="mt-1 text-muted">Pick any that fit — we&apos;ll tailor your feed. Or skip and see what&apos;s popular.</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {NICHES.map((n) => {
          const on = picked.includes(n.slug);
          return (
            <button
              key={n.slug}
              onClick={() => toggle(n.slug)}
              aria-pressed={on}
              className={`relative flex h-[104px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 transition active:scale-[.97] ${
                on ? `${n.tint} border-ink/80 shadow-soft` : "border-line bg-white hover:border-violet/40"
              }`}
            >
              <span className="text-3xl">{n.icon}</span>
              <span className="text-sm font-semibold">{n.label}</span>
              {on && <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-white">✓</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <Button className="w-full text-lg" onClick={done} disabled={picked.length === 0}>
          {editing ? "Save niches" : "Continue →"}
        </Button>
        {!editing && (
          <button onClick={skip} className="mt-3 w-full rounded-2xl border-2 border-line py-3 font-display font-semibold text-muted hover:border-violet hover:text-violet">
            Skip for now
          </button>
        )}
        {!editing && <p className="mt-2 text-center text-xs text-muted">You can change this anytime in Me.</p>}
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense><Onboarding /></Suspense>;
}
