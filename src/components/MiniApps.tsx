"use client";
// The tiny apps themselves. In the real product each one is a separate web app
// (deployed on Vercel) shown inside solvd. Here two are fully interactive demos.
import { useState } from "react";
import type { App } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "./ui";

export function BillSplitApp() {
  const { showToast } = useStore();
  const [total, setTotal] = useState(1800);
  const [friends, setFriends] = useState([
    { name: "Priya", paid: true }, { name: "Ananya", paid: true }, { name: "Rohit", paid: false },
    { name: "Meera", paid: true }, { name: "Karthik", paid: false }, { name: "Sana", paid: false },
  ]);
  const each = Math.round(total / friends.length);
  const due = friends.filter((f) => !f.paid);
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-mint p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">Mess extras · November</p>
        <div className="mt-1 flex items-baseline gap-2 font-display text-2xl font-bold">
          ₹<input type="number" value={total} onChange={(e) => setTotal(Math.max(0, +e.target.value))} className="w-24 rounded-lg bg-white/60 px-1 outline-none" />
          <span className="text-base font-semibold text-ink/70">÷ {friends.length} = ₹{each} each</span>
        </div>
      </div>
      <ul className="divide-y divide-line rounded-[20px] border border-line">
        {friends.map((f, i) => (
          <li key={f.name} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar name={f.name} />
            <span className="flex-1 font-medium">{f.name}</span>
            <button
              onClick={() => setFriends((x) => x.map((y, j) => (j === i ? { ...y, paid: !y.paid } : y)))}
              className={`rounded-full px-3 py-1 text-xs font-bold ${f.paid ? "bg-green-tint text-green" : "bg-red-tint text-red"}`}
            >
              {f.paid ? "Paid ✔" : `₹${each} due`}
            </button>
          </li>
        ))}
      </ul>
      <button
        disabled={!due.length}
        onClick={() => showToast(`UPI reminders sent to ${due.map((d) => d.name).join(", ")} (demo)`)}
        className="w-full rounded-2xl bg-green py-3.5 font-display font-semibold text-white disabled:opacity-50"
      >
        {due.length ? `Send UPI reminders (${due.length})` : "Everyone has paid 🎉"}
      </button>
    </div>
  );
}

export function AttendCalcApp() {
  const [subjects, setSubjects] = useState([
    { name: "Maths I", attended: 28, total: 34 },
    { name: "Physics", attended: 22, total: 31 },
    { name: "CP", attended: 30, total: 32 },
    { name: "Thermo", attended: 19, total: 27 },
  ]);
  const bump = (i: number, came: boolean) =>
    setSubjects((s) => s.map((x, j) => (j === i ? { ...x, total: x.total + 1, attended: x.attended + (came ? 1 : 0) } : x)));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Target: 75%. Tap ✓ or ✗ after each class.</p>
      {subjects.map((s, i) => {
        const pct = Math.round((s.attended / s.total) * 100);
        const canSkip = Math.floor(s.attended / 0.75 - s.total);
        const mustAttend = Math.ceil((0.75 * s.total - s.attended) / 0.25);
        const ok = pct >= 75;
        return (
          <div key={s.name} className="rounded-[20px] border border-line p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{s.name}</p>
              <p className={`font-display text-xl font-bold ${ok ? "text-green" : "text-red"}`}>{pct}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-canvas"><div className={`h-2 rounded-full ${ok ? "bg-green" : "bg-red"}`} style={{ width: `${pct}%` }} /></div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted">{s.attended}/{s.total} · {ok ? `can skip ${canSkip} more` : `attend next ${mustAttend} to reach 75%`}</span>
              <span className="flex gap-1.5">
                <button onClick={() => bump(i, true)} className="rounded-lg bg-green-tint px-2.5 py-1 font-bold text-green">✓</button>
                <button onClick={() => bump(i, false)} className="rounded-lg bg-red-tint px-2.5 py-1 font-bold text-red">✗</button>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GenericApp({ app }: { app: App }) {
  const { showToast } = useStore();
  const [items, setItems] = useState<string[]>([]);
  const [text, setText] = useState("");
  return (
    <div className="space-y-4">
      <div className={`${app.tint} rounded-[20px] p-5 text-center`}>
        <div className="text-5xl">{app.icon}</div>
        <p className="mt-2 font-display text-lg font-bold">{app.name}</p>
        <p className="text-sm text-ink/70">{app.tagline}</p>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { setItems((x) => [text.trim(), ...x]); setText(""); showToast("Saved"); } }}
        className="flex gap-2"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an item to try it…" className="flex-1 rounded-2xl border border-line px-4 py-3 outline-none focus:border-violet" />
        <button className="rounded-2xl bg-violet px-4 font-semibold text-white">Add</button>
      </form>
      <ul className="space-y-2">
        {items.map((t, i) => <li key={i} className="rounded-xl bg-canvas px-4 py-2.5 text-sm">{t}</li>)}
        {!items.length && <li className="text-center text-sm text-muted">This is a demo preview. The full app is built by {app.developer}.</li>}
      </ul>
    </div>
  );
}
