"use client";
// Opening animation, shown once each time the web app is opened (not on every page change).
// Sequence (~2 s): grey ring + tick draw → turns green with a pop and a burst → "solvd." slides in → fades away.
// Tap anywhere to skip. People who turn off animations on their device get a quick fade instead.
import { useEffect, useState } from "react";

export function TickMark({ className = "h-28 w-28", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="-4 -8 128 128" className={`${className} ${animated ? "splash-mark" : ""}`} aria-hidden>
      <circle className="mark-bg" cx="60" cy="60" r="50" fill={animated ? "#E9E7F0" : "#22A55B"} />
      <circle className="mark-ring" cx="60" cy="60" r="50" fill="none" stroke={animated ? "#B9B5C8" : "none"} strokeWidth="6" pathLength={100} />
      <path className="mark-tick" d="M36 62 L53 79 L86 44" fill="none" stroke={animated ? "#9C98AE" : "#fff"} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" pathLength={100} />
      {/* the full stop of "solvd." flying off the tip of the tick */}
      <circle className="mark-dot" cx="99" cy="28" r="9" fill="#FFD84D" />
    </svg>
  );
}

const BURST = [0, 45, 90, 135, 180, 225, 270, 315];
const BURST_COLORS = ["#7C5CFF", "#FFD84D", "#22A55B", "#FFD6E5"];

export default function Splash() {
  const [phase, setPhase] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveAt = reduced ? 500 : 1900;
    const t1 = setTimeout(() => setPhase("leaving"), leaveAt);
    const t2 = setTimeout(() => setPhase("gone"), leaveAt + 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      role="presentation"
      onClick={() => setPhase("gone")}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-300 ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <div className="relative grid place-items-center">
        {BURST.map((deg, i) => (
          <span
            key={deg}
            className="splash-spark absolute h-2.5 w-2.5 rounded-full"
            style={{ background: BURST_COLORS[i % 4], ["--a" as string]: `${deg}deg` }}
          />
        ))}
        <TickMark animated className="h-28 w-28" />
      </div>
      <p className="splash-word mt-5 font-display text-5xl font-extrabold tracking-tight text-ink">
        solvd<span className="splash-period inline-block text-yellow">.</span>
      </p>
      <p className="splash-tag mt-2 text-sm text-muted">Tiny apps, picked for your exact niche.</p>
    </div>
  );
}
