"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { App } from "@/lib/data";
import { priceLabel } from "@/lib/match";
import { useStore } from "@/lib/store";

export function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight text-ink ${className}`}>
      solvd<span className="text-yellow [text-shadow:0_0_1px_#c9a300]">.</span>
    </span>
  );
}

export function AppIcon({ app, size = "md" }: { app: Pick<App, "icon" | "tint" | "name">; size?: "sm" | "md" | "lg" | "xl" }) {
  const s = { sm: "h-10 w-10 text-xl rounded-xl", md: "h-14 w-14 text-2xl rounded-2xl", lg: "h-24 w-24 text-5xl rounded-3xl", xl: "h-28 w-full text-6xl rounded-2xl" }[size];
  return (
    <div className={`${s} ${app.tint} grid shrink-0 place-items-center`} aria-label={app.name}>
      <span>{app.icon}</span>
    </div>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 font-semibold text-green ${small ? "text-[11px]" : "text-xs"}`}>
      <svg viewBox="0 0 20 20" className={small ? "h-3 w-3" : "h-3.5 w-3.5"} fill="currentColor"><path d="M10 1l2.4 1.8 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L10 19l-2.4-1.8-3 .2-.9-2.9L1.3 12.7l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2z"/><path d="M6.5 10.2l2.2 2.2 4.8-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Verified
    </span>
  );
}

export function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "border-violet bg-violet text-white" : "border-line bg-white text-ink hover:border-violet/50"
      }`}
    >
      {children}
    </button>
  );
}

/** Small app card used in feed rows (Netflix-style) */
export function AppCard({ app }: { app: App }) {
  return (
    <Link href={`/app/${app.slug}`} className="w-[120px] shrink-0 snap-start">
      <div className="relative">
        <div className={`${app.tint} grid h-[120px] w-[120px] place-items-center rounded-2xl text-5xl shadow-soft`}>{app.icon}</div>
        {app.newDeveloper && <Pill className="absolute left-2 top-2 bg-yellow text-ink !px-2 !py-0.5 text-[10px]">NEW</Pill>}
        {app.status === "beta" && !app.newDeveloper && <Pill className="absolute left-2 top-2 bg-white text-ink !px-2 !py-0.5 text-[10px]">BETA</Pill>}
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{app.name}</p>
      <p className="text-xs text-muted">★ {app.rating} · {priceLabel(app)}</p>
    </Link>
  );
}

export function TopBar({ title, back = true, right, className = "bg-white" }: { title?: React.ReactNode; back?: boolean; right?: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <header className={`sticky top-0 z-20 flex h-14 items-center gap-2 px-4 ${className}`}>
      {back && (
        <button aria-label="Back" onClick={() => (history.length > 1 ? router.back() : router.push("/feed"))} className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-black/5">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}
      <h1 className="flex-1 truncate font-display text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}

export function CloseButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button aria-label="Close" onClick={() => (href ? router.push(href) : router.back())} className="grid h-10 w-10 place-items-center rounded-full bg-canvas text-lg hover:bg-line">✕</button>
  );
}

const TABS = [
  { href: "/feed", label: "Feed", icon: (a: boolean) => <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" fill={a ? "currentColor" : "none"} /> },
  { href: "/niches", label: "Niches", icon: (a: boolean) => <><rect x="3" y="3" width="7.5" height="7.5" rx="2" fill={a ? "currentColor" : "none"} /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" fill={a ? "currentColor" : "none"} /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" fill={a ? "currentColor" : "none"} /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" fill={a ? "currentColor" : "none"} /></> },
  { href: "/requests", label: "Requests", icon: (a: boolean) => <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" fill={a ? "currentColor" : "none"} /> },
  { href: "/me", label: "Me", icon: (a: boolean) => <><circle cx="12" cy="8" r="4" fill={a ? "currentColor" : "none"} /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" fill={a ? "currentColor" : "none"} /></> },
];

export function TabBar() {
  const path = usePathname();
  return (
    <>
      <div className="h-20" />
      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = path.startsWith(t.href);
            return (
              <li key={t.href}>
                <Link href={t.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${active ? "text-violet" : "text-muted"}`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{t.icon(active)}</svg>
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export function Avatar({ name, className = "h-9 w-9 text-sm" }: { name: string; className?: string }) {
  const tints = ["bg-pink", "bg-sky", "bg-mint", "bg-peach", "bg-yellow", "bg-violet-tint"];
  const tint = tints[name.charCodeAt(0) % tints.length];
  return <div className={`${className} ${tint} grid shrink-0 place-items-center rounded-full font-bold text-ink`}>{name[0]}</div>;
}

export function BellButton() {
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Link href="/notifications" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-black/5">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0" /></svg>
      {unread > 0 && <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red px-1 text-[10px] font-bold text-white">{unread}</span>}
    </Link>
  );
}

export function GoogleButton({ onClick, label = "Continue with Google" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white py-3.5 font-display font-semibold transition hover:border-violet active:scale-[.98]">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      {label}
    </button>
  );
}

export function Button({ children, variant = "violet", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "violet" | "green" | "yellow" | "outline" | "ghost" }) {
  const v = {
    violet: "bg-violet text-white hover:bg-violet-dark shadow-soft",
    green: "bg-green text-white hover:brightness-95 shadow-soft",
    yellow: "bg-yellow text-ink hover:brightness-95 shadow-soft",
    outline: "border-2 border-violet text-violet bg-white hover:bg-violet-tint",
    ghost: "text-muted hover:bg-canvas",
  }[variant];
  return (
    <button {...props} className={`rounded-2xl px-5 py-3.5 font-display font-semibold transition active:scale-[.98] disabled:opacity-50 ${v} ${className}`}>
      {children}
    </button>
  );
}
