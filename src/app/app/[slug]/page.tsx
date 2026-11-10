"use client";
// Screen 4 · App detail (match %, trust panel, try free, reviews)
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { nicheBySlug } from "@/lib/data";
import { compactNumber, matchPercent, matchReason, priceLabel } from "@/lib/match";
import { useApp, useStore } from "@/lib/store";
import { AppIcon, Avatar, Pill, TopBar, VerifiedBadge } from "@/components/ui";

export default function AppDetail() {
  const { slug } = useParams<{ slug: string }>();
  const app = useApp(slug);
  const { apps, niches, favourites, toggleFavourite, myApps, ready } = useStore();
  if (!app) { if (ready) notFound(); return null; }

  const fav = favourites.includes(app.slug);
  const mine = myApps.find((m) => m.slug === app.slug);
  const alsoUse = apps.filter((a) => a.slug !== app.slug && a.niches.some((n) => app.niches.includes(n))).slice(0, 4);
  const crowd = nicheBySlug(app.niches[0])?.plural ?? "People";
  const updated = app.updatedDaysAgo === 0 ? "today" : `${app.updatedDaysAgo} day${app.updatedDaysAgo > 1 ? "s" : ""} ago`;
  const priceNote = app.priceInr === 0 ? "free forever · no card needed" : app.pricingType === "monthly" ? `then ₹${app.priceInr}/month · cancel anytime` : `then ₹${app.priceInr} per use`;

  return (
    <main className="pb-10">
      <TopBar
        title={app.name}
        right={
          <button aria-label="Save" onClick={() => toggleFavourite(app.slug)} className="grid h-10 w-10 place-items-center rounded-full text-2xl hover:bg-black/5">
            {fav ? "💜" : "🤍"}
          </button>
        }
      />

      {/* Preview carousel */}
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5">
        {[app.tint, "bg-canvas", "bg-violet-tint"].map((t, i) => (
          <div key={i} className={`${t} grid h-48 w-[85%] shrink-0 snap-center place-items-center rounded-[20px]`}>
            <div className="text-center">
              <div className="text-6xl">{app.icon}</div>
              <p className="mt-2 text-sm font-semibold text-ink/60">{["Home", "In action", "Results"][i]}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill className="bg-green text-white">{matchPercent(app, niches)}% match</Pill>
          <span className="text-sm text-muted">{app.niches.map((n) => nicheBySlug(n)?.label).join(" · ")}</span>
          {app.status === "beta" && <Pill className="bg-yellow">BETA · free until quality check</Pill>}
        </div>
        <p className="mt-1 text-xs text-muted">Why: {matchReason(app, niches)}, rated {app.rating}★ by verified users</p>
        <p className="mt-3 text-[15px] leading-relaxed">{app.description}</p>
        <p className="mt-2 flex items-center gap-2 text-sm">
          {app.verified ? <VerifiedBadge /> : <span className="text-xs font-semibold text-red">Not verified yet</span>}
          <span>· ★ {app.rating} · {compactNumber(app.usersCount)} users</span>
        </p>
        <p className="mt-1 text-xs text-muted">by <b>{app.developer}</b>{app.newDeveloper && " · 🌟 new developer"}</p>
      </section>

      {/* Trust panel */}
      <section className="mx-5 mt-4 rounded-[20px] bg-canvas p-4">
        <p className="mb-2 flex items-center gap-1.5 font-display text-sm font-semibold">🔒 Trust panel</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white p-3"><dt className="text-xs text-muted">Security score</dt><dd className={`font-bold ${app.securityScore >= 80 ? "text-green" : "text-red"}`}>{app.securityScore}/100 {app.securityScore >= 80 && "✔"}</dd></div>
          <div className="rounded-2xl bg-white p-3"><dt className="text-xs text-muted">Licence</dt><dd className="font-bold">{app.licence}</dd></div>
          <div className="rounded-2xl bg-white p-3"><dt className="text-xs text-muted">Updated</dt><dd className="font-bold">{updated}</dd></div>
          <div className="rounded-2xl bg-white p-3"><dt className="text-xs text-muted">Maintained</dt><dd className="font-bold text-green">{app.updatedDaysAgo <= 14 ? "Actively ✔" : "Slow"}</dd></div>
        </dl>
      </section>

      <div className="px-5 pt-5">
        <Link href={`/app/${app.slug}/run`} className="block rounded-2xl bg-green py-4 text-center font-display text-lg font-bold tracking-wide text-white shadow-soft active:scale-[.98]">
          {mine?.state === "kept" ? "OPEN APP" : "TRY FREE"}
        </Link>
        <p className="mt-2 text-center text-xs text-muted">
          {mine?.state === "kept" ? `In My apps · ${priceLabel(app)}` : mine ? `Trial · ${mine.usesLeft} free use${mine.usesLeft === 1 ? "" : "s"} left · ${priceNote}` : `3 free uses, ${priceNote}`}
        </p>
      </div>

      {alsoUse.length > 0 && (
        <section className="mt-6 px-5">
          <h2 className="font-display font-semibold">{crowd} also use</h2>
          <div className="mt-3 flex gap-4">
            {alsoUse.map((a) => (
              <Link key={a.slug} href={`/app/${a.slug}`} className="w-16 text-center">
                <AppIcon app={a} />
                <p className="mt-1 truncate text-[11px]">{a.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 px-5">
        <h2 className="font-display font-semibold">Reviews <span className="text-sm font-normal text-muted">(verified users only)</span></h2>
        {app.reviews.length === 0 && <p className="mt-2 text-sm text-muted">No reviews yet. Reviews unlock after someone actually uses the app.</p>}
        <ul className="mt-3 space-y-3">
          {app.reviews.map((r) => (
            <li key={r.name} className="rounded-[20px] border border-line p-4">
              <div className="flex items-center gap-2">
                <Avatar name={r.name} className="h-8 w-8 text-xs" />
                <p className="flex-1 text-sm font-semibold">{r.name} <span className="font-normal text-green">· used {app.name}</span></p>
                <span className="text-sm">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></span>
              </div>
              <p className="mt-2 text-sm text-ink/80">{r.text}</p>
              <p className="mt-1 text-xs text-muted">{r.daysAgo}d ago</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
