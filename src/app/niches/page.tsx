"use client";
// Tab "Niches" · browse every niche (supports the feed)
import Link from "next/link";
import { useState } from "react";
import { NICHES, type NicheSlug } from "@/lib/data";
import { matchPercent, priceLabel } from "@/lib/match";
import { useStore } from "@/lib/store";
import { AppIcon, Chip, TabBar, VerifiedBadge } from "@/components/ui";

export default function Niches() {
  const { apps, niches } = useStore();
  const [active, setActive] = useState<NicheSlug>(niches[0] ?? "student");
  const niche = NICHES.find((n) => n.slug === active)!;
  const list = apps.filter((a) => a.niches.includes(active)).sort((a, b) => matchPercent(b, niches) - matchPercent(a, niches));

  return (
    <main>
      <header className="px-5 pt-5">
        <h1 className="text-2xl font-bold">Niches</h1>
        <p className="text-sm text-muted">Explore tiny apps made for every kind of person.</p>
      </header>
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
        {NICHES.map((n) => (
          <Chip key={n.slug} active={active === n.slug} onClick={() => setActive(n.slug)}>
            {n.icon} {n.label}{niches.includes(n.slug) ? " ✓" : ""}
          </Chip>
        ))}
      </div>

      <section className={`mx-5 mt-5 rounded-[20px] ${niche.tint} p-5`}>
        <p className="text-4xl">{niche.icon}</p>
        <h2 className="mt-2 text-xl font-bold">For {niche.plural.toLowerCase()}</h2>
        <p className="text-sm text-ink/70">{list.length} apps · ranked by merit (usage, ratings, security)</p>
      </section>

      <ul className="mt-3 divide-y divide-line px-5">
        {list.map((a) => (
          <li key={a.slug}>
            <Link href={`/app/${a.slug}`} className="flex items-center gap-3 py-3">
              <AppIcon app={a} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.name} {a.status === "beta" && <span className="ml-1 rounded-full bg-yellow px-1.5 text-[10px] font-bold">BETA</span>}</p>
                <p className="truncate text-sm text-muted">{a.tagline}</p>
                <p className="text-xs text-muted">★ {a.rating} · {priceLabel(a)} {a.verified && <>· <VerifiedBadge small /></>}</p>
              </div>
              <span className="text-xs font-bold text-green">{matchPercent(a, niches)}%</span>
            </Link>
          </li>
        ))}
        {!list.length && <li className="py-10 text-center text-muted">No apps yet. <Link className="font-semibold text-violet" href="/requests/new">Post a request →</Link></li>}
      </ul>
      <TabBar />
    </main>
  );
}
