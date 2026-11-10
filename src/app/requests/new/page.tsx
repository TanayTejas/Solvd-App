"use client";
// Screen 8 · Post a request (+ "an app may already exist" check)
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { type NicheSlug } from "@/lib/data";
import { searchApps } from "@/lib/match";
import { useStore } from "@/lib/store";
import { Button, Chip, CloseButton } from "@/components/ui";

const WHO: { slug: NicheSlug; label: string }[] = [
  { slug: "student", label: "Students" }, { slug: "hosteller", label: "Hostellers" },
  { slug: "shop_owner", label: "Shop owners" }, { slug: "freelancer", label: "Freelancers" },
  { slug: "parent", label: "Parents" }, { slug: "commuter", label: "Commuters" },
];

function PostRequest() {
  const params = useSearchParams();
  const router = useRouter();
  const { apps, postRequest, showToast } = useStore();
  const [title, setTitle] = useState(params.get("title") ?? "");
  const [desc, setDesc] = useState("");
  const [who, setWho] = useState<NicheSlug[]>(["student"]);
  const [bounty, setBounty] = useState("");

  const maybe = title.trim().length > 6 ? searchApps(apps, title)[0] : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    postRequest({ title: title.trim(), description: desc.trim(), niches: who, bountyInr: Math.max(0, Number(bounty) || 0) });
    showToast("Request posted! You'll be notified when it's built 🎉");
    router.push("/requests?tab=new");
  };

  return (
    <main className="px-5 pb-10">
      <header className="flex h-14 items-center">
        <h1 className="flex-1 font-display text-lg font-bold">Post a request</h1>
        <CloseButton />
      </header>

      <form onSubmit={submit} className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold">What&apos;s the problem?</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Timetable photo → calendar events" className="mt-1.5 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-violet" />
        </label>

        {maybe && (
          <div className="animate-pop rounded-[20px] bg-yellow-tint p-4 ring-1 ring-yellow">
            <p className="text-sm">✨ <b>Wait!</b> “{maybe.name}” may already solve this.</p>
            <Link href={`/app/${maybe.slug}`} className="mt-1 inline-block text-sm font-semibold text-violet">Check it first →</Link>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-semibold">Describe it</span>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="When does it happen? What would a perfect app do?" className="mt-1.5 w-full resize-none rounded-2xl border border-line px-4 py-3 outline-none focus:border-violet" />
        </label>

        <div>
          <span className="text-sm font-semibold">Who has this problem?</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {WHO.map((w) => (
              <Chip key={w.slug} active={who.includes(w.slug)} onClick={() => setWho((x) => (x.includes(w.slug) ? x.filter((y) => y !== w.slug) : [...x, w.slug]))}>
                {w.label}{who.includes(w.slug) ? " ✔" : ""}
              </Chip>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">Add a bounty <span className="font-normal text-muted">(optional)</span></span>
          <div className="mt-1.5 flex items-center rounded-2xl border border-line px-4 focus-within:border-violet">
            <span className="font-semibold text-muted">₹</span>
            <input inputMode="numeric" value={bounty} onChange={(e) => setBounty(e.target.value.replace(/\D/g, ""))} placeholder="500" className="w-full bg-transparent px-2 py-3 outline-none" />
          </div>
          <span className="mt-1 block text-xs text-muted">Paid to the developer only when the app goes live (mock).</span>
        </label>

        <Button type="submit" className="w-full text-lg" disabled={!title.trim()}>Post request</Button>
      </form>
    </main>
  );
}

export default function Page() {
  return <Suspense><PostRequest /></Suspense>;
}
