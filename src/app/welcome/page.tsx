"use client";
// Screen 0 · Create your profile (first visit only; also used for "Edit profile")
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EMPTY_PROFILE, SKILLS, type Profile } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar, Button, Chip, GoogleButton, Logo } from "@/components/ui";

function Welcome() {
  const store = useStore();
  const router = useRouter();
  const editing = useSearchParams().get("edit") === "1";
  const [p, setP] = useState<Profile>(EMPTY_PROFILE);
  const [touched, setTouched] = useState(false);

  // Fill the form with the saved profile once it has loaded.
  useEffect(() => { if (store.ready) setP({ ...EMPTY_PROFILE, ...store.profile }); }, [store.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const nameOk = p.name.trim().length >= 2;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!nameOk) return;
    store.saveProfile({ ...p, skills: p.role === "developer" ? p.skills : [], github: p.role === "developer" ? p.github : "" });
    if (editing) {
      store.showToast("Profile saved");
      router.push("/me");
    } else {
      store.showToast(`Welcome to solvd., ${p.name.trim().split(" ")[0]}! 👋`);
      router.push("/onboarding");
    }
  };

  return (
    <main className="px-5 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <Logo className="text-3xl" />
        {editing && <button onClick={() => router.back()} className="text-sm font-semibold text-muted">Cancel</button>}
      </div>
      <h1 className="mt-7 text-[28px] font-bold leading-tight">{editing ? "Edit your profile" : "Create your profile"}</h1>
      <p className="mt-1 text-muted">{editing ? "Changes are saved to your account." : "Takes 10 seconds. This is how you'll appear on requests and reviews."}</p>

      {!editing && store.authEnabled && !store.account && (
        <div className="mt-6">
          <GoogleButton onClick={store.signInWithGoogle} />
          <p className="mt-2 text-center text-xs text-muted">Already have an account? This brings it back on any device.</p>
          <div className="mt-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or just enter your name<span className="h-px flex-1 bg-line" /></div>
        </div>
      )}
      {store.account && !editing && (
        <p className="mt-4 rounded-2xl bg-green-tint px-4 py-2.5 text-sm text-green">✔ Signed in as {store.account.email}</p>
      )}

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={p.name.trim() || "?"} className="h-16 w-16 text-2xl" />
          <label className="flex-1">
            <span className="text-sm font-semibold">Your name *</span>
            <input
              value={p.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={60}
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              className={`mt-1.5 w-full rounded-2xl border px-4 py-3 outline-none focus:border-violet ${touched && !nameOk ? "border-red" : "border-line"}`}
            />
          </label>
        </div>
        {touched && !nameOk && <p className="-mt-4 text-xs text-red">Please enter your name.</p>}

        <div>
          <span className="text-sm font-semibold">What brings you here?</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([
              ["user", "🔍", "Find apps", "Discover tiny apps for my problems"],
              ["developer", "🛠️", "Build apps too", "I code and want to publish apps"],
            ] as const).map(([role, icon, title, sub]) => (
              <button
                type="button"
                key={role}
                onClick={() => set("role", role)}
                aria-pressed={p.role === role}
                className={`rounded-[20px] border-2 p-4 text-left transition ${p.role === role ? "border-violet bg-violet-tint" : "border-line"}`}
              >
                <span className="text-2xl">{icon}</span>
                <p className="mt-1 font-display font-semibold">{title}</p>
                <p className="text-xs text-muted">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {p.role === "developer" && (
          <div className="animate-pop space-y-5 rounded-[20px] bg-yellow-tint p-4">
            <div>
              <span className="text-sm font-semibold">Your skills</span>
              <p className="text-xs text-muted">We&apos;ll show you requests that match.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SKILLS.map((k) => (
                  <Chip key={k} active={p.skills.includes(k)} onClick={() => set("skills", p.skills.includes(k) ? p.skills.filter((x) => x !== k) : [...p.skills, k])}>{k}</Chip>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-semibold">GitHub username <span className="font-normal text-muted">(optional)</span></span>
              <div className="mt-1.5 flex items-center rounded-2xl border border-line bg-white px-4 focus-within:border-violet">
                <span className="text-muted">github.com/</span>
                <input value={p.github} onChange={(e) => set("github", e.target.value.replace(/[^A-Za-z0-9-]/g, ""))} maxLength={39} placeholder="username" className="w-full bg-transparent py-3 outline-none" />
              </div>
            </label>
          </div>
        )}

        <Button type="submit" className="w-full text-lg">{editing ? "Save profile" : "Continue →"}</Button>
        {!editing && <p className="text-center text-xs text-muted">You can change this anytime in Me.</p>}
      </form>
    </main>
  );
}

export default function Page() {
  return <Suspense><Welcome /></Suspense>;
}
