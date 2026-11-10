"use client";
// Screen 10 · Notifications
import Link from "next/link";
import { useStore } from "@/lib/store";
import { TopBar } from "@/components/ui";
import { GuestWall } from "@/components/AccountPrompt";

function ago(ts: number) {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

export default function Notifications() {
  const { notifications, markRead, profile, ready } = useStore();
  const fresh = notifications.filter((n) => !n.read);
  const earlier = notifications.filter((n) => n.read);

  if (ready && !profile.complete) {
    return (
      <main className="pb-10">
        <TopBar title="Notifications" />
        <div className="px-5"><GuestWall reason="get notified when apps you want go live" /></div>
      </main>
    );
  }

  return (
    <main className="pb-10">
      <TopBar title="Notifications" right={fresh.length > 0 && <button onClick={() => markRead()} className="text-sm font-semibold text-violet">Mark all read</button>} />
      <ul className="space-y-3 px-5">
        {fresh.map((n, i) => (
          <li key={n.id} className={`rounded-[20px] p-4 ${i === 0 ? "bg-yellow-tint ring-2 ring-yellow" : "border border-line bg-white"}`}>
            <div className="flex gap-3">
              <span className={`${n.tint} grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl`}>{n.icon}</span>
              <div className="flex-1">
                <p className="font-display font-semibold leading-snug">{n.title}</p>
                <p className="text-sm text-ink/70">{n.body}</p>
                {n.link && (
                  <Link href={n.link} onClick={() => markRead(n.id)} className={`mt-2 inline-block rounded-xl px-3.5 py-1.5 text-sm font-semibold ${i === 0 ? "bg-green text-white" : "bg-canvas text-violet"}`}>
                    {n.linkLabel ?? "Open"}
                  </Link>
                )}
              </div>
              <span className="text-xs text-muted">{ago(n.createdAt)}</span>
            </div>
          </li>
        ))}
        {!fresh.length && <li className="py-6 text-center text-sm text-muted">You&apos;re all caught up ✨</li>}
      </ul>

      {earlier.length > 0 && (
        <>
          <h2 className="mt-6 px-5 text-sm font-semibold text-muted">Earlier</h2>
          <ul className="mt-2 space-y-2 px-5 opacity-60">
            {earlier.map((n) => (
              <li key={n.id} className="flex gap-3 rounded-[20px] border border-line p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas">{n.icon}</span>
                <div className="flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-muted">{n.body}</p></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
