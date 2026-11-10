"use client";

// One shared store for the whole app.
// - "local" mode: starts from the seed data and saves changes in this browser
//   (localStorage). Used when no database is connected, so the demo always works.
// - "shared" mode: when the server has a DATABASE_URL, data is loaded from
//   /api/state and every action is also sent to /api/action, so everyone using
//   the app sees the same requests, upvotes and notifications.

import { signIn, signOut } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  APPS, EMPTY_PROFILE, FREE_USES, MY_APPS, NOTIFICATIONS, REQUESTS,
  type App, type AppRequest, type MyApp, type NicheSlug, type Notification, type Profile,
} from "./data";

type State = {
  profile: Profile;
  guest: boolean; // browsing without a profile: can search and look, not post or publish
  account: { email: string; name: string } | null; // signed-in Google account
  authEnabled: boolean; // Google sign-in is set up on the server
  onboarded: boolean;
  niches: NicheSlug[];
  apps: App[];
  requests: AppRequest[];
  upvoted: string[]; // request ids
  favourites: string[]; // app slugs
  myApps: MyApp[];
  notifications: Notification[];
  feedback: { slug: string; solved: boolean; reasons: string[] }[];
};

const INITIAL: State = {
  profile: EMPTY_PROFILE,
  guest: false,
  account: null,
  authEnabled: false,
  onboarded: false,
  niches: [], // chosen on the niche screen (or left empty with Skip)
  apps: APPS,
  requests: REQUESTS,
  upvoted: ["r-attendance"],
  favourites: [],
  myApps: MY_APPS,
  notifications: NOTIFICATIONS,
  feedback: [],
};

const KEY = "solvd-demo-v1";
const UID_KEY = "solvd-uid";

const newUid = () => "u_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

type Store = State & {
  ready: boolean;
  mode: "local" | "shared";
  toast: string | null;
  showToast: (msg: string) => void;
  saveProfile: (p: Omit<Profile, "complete">) => void;
  startGuest: () => void;
  /** True if the person has a profile; otherwise shows the "create a profile" prompt. */
  requireAccount: (reason: string) => boolean;
  accountPrompt: string | null;
  closeAccountPrompt: () => void;
  signInWithGoogle: () => void;
  signOutOfGoogle: () => Promise<void>;
  setNiches: (n: NicheSlug[]) => void;
  finishOnboarding: (n: NicheSlug[]) => void;
  toggleUpvote: (id: string) => void;
  toggleFavourite: (slug: string) => void;
  postRequest: (r: Pick<AppRequest, "title" | "description" | "niches" | "bountyInr">) => string;
  spendTrialUse: (slug: string) => number; // returns uses left after this use
  keepApp: (slug: string) => void;
  removeApp: (slug: string) => void;
  sendFeedback: (slug: string, solved: boolean, reasons: string[]) => void;
  markRead: (id?: string) => void;
  startBuilding: (requestId: string) => void;
  publishApp: (input: { requestId?: string; app: App }) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mode, setMode] = useState<"local" | "shared">("local");
  const [accountPrompt, setAccountPrompt] = useState<string | null>(null);
  const [uid, setUid] = useState("");

  // Load shared data from the database (if the server has one).
  const refresh = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/state?uid=${id}`, { cache: "no-store" });
      if (res.status === 409) {
        // This browser's id belongs to a Google account that has signed out: start as a new guest.
        const fresh = newUid();
        localStorage.setItem(UID_KEY, fresh);
        setUid(fresh);
        setState(INITIAL);
        return refresh(fresh);
      }
      if (!res.ok) return false;
      const data = await res.json();
      // Signed in with Google: the server tells us which account this is.
      if (data.uid && data.uid !== id) {
        localStorage.setItem(UID_KEY, data.uid);
        setUid(data.uid);
      }
      const serverProfileDone = Boolean(data.profile?.complete);
      setState((s) => ({
        ...s,
        account: data.account ?? null,
        authEnabled: Boolean(data.authEnabled),
        // A returning account on a new device skips onboarding and gets its saved niches.
        onboarded: s.onboarded || (serverProfileDone && data.uid !== id),
        niches: serverProfileDone && data.uid !== id ? data.niches : s.niches,
        apps: data.apps,
        requests: data.requests,
        upvoted: data.upvoted,
        myApps: data.myApps,
        notifications: data.notifications,
        // The database remembers your profile; keep the local one if the server has none yet.
        profile: serverProfileDone ? data.profile : { ...s.profile, name: s.profile.name || data.profile?.name || "" },
      }));
      setMode("shared");
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {}
    let id = localStorage.getItem(UID_KEY);
    if (!id) { id = newUid(); localStorage.setItem(UID_KEY, id); }
    setUid(id);
    // Don't keep the app waiting on a slow or sleeping database: after 2.5 s,
    // carry on with what's saved on this device and update when the server answers.
    const slow = setTimeout(() => setReady(true), 2500);
    refresh(id).finally(() => { clearTimeout(slow); setReady(true); });
  }, [refresh]);

  // Pick up other people's new requests and votes when you come back to the tab.
  useEffect(() => {
    if (mode !== "shared" || !uid) return;
    const onFocus = () => { if (document.visibilityState === "visible") refresh(uid); };
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, [mode, uid, refresh]);

  // Send one action to the database (does nothing in local mode).
  const send = useCallback(
    (action: Record<string, unknown>) => {
      if (mode !== "shared") return Promise.resolve();
      return fetch("/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action }),
      }).then((r) => { if (!r.ok) console.warn("Could not save", action.type); }).catch(() => {});
    },
    [mode, uid],
  );

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  }, []);

  const notify = (s: State, n: Omit<Notification, "id" | "read" | "createdAt">): State => ({
    ...s,
    notifications: [{ ...n, id: `n-${Date.now()}`, read: false, createdAt: Date.now() }, ...s.notifications],
  });

  // Guests can browse and search; anything that writes needs a profile.
  const allowed = (reason: string) => {
    if (state.profile.complete) return true;
    setAccountPrompt(reason);
    return false;
  };

  const store = useMemo<Store>(() => ({
    ...state,
    accountPrompt,
    closeAccountPrompt: () => setAccountPrompt(null),
    requireAccount: allowed,
    startGuest: () => setState((s) => ({ ...s, guest: true })),
    ready,
    mode,
    toast,
    showToast,
    signInWithGoogle: () => {
      // After Google, come back to the start; the server links this guest to the Google account.
      signIn("google", { callbackUrl: "/" });
    },
    signOutOfGoogle: async () => {
      await signOut({ redirect: false });
      localStorage.removeItem(KEY);
      const id = newUid();
      localStorage.setItem(UID_KEY, id);
      setUid(id);
      setState(INITIAL);
      await refresh(id);
    },
    saveProfile: (p) => {
      const profile: Profile = { ...p, name: p.name.trim(), complete: true };
      setState((s) => ({ ...s, profile, guest: false }));
      send({ type: "saveProfile", profile });
    },
    setNiches: (niches) => { setState((s) => ({ ...s, niches })); send({ type: "setNiches", niches }); },
    finishOnboarding: (niches) => { setState((s) => ({ ...s, niches, onboarded: true })); send({ type: "setNiches", niches }); },
    toggleUpvote: (id) => {
      if (!allowed("upvote requests")) return;
      send({ type: "toggleUpvote", requestId: id });
      setState((s) => {
        const on = s.upvoted.includes(id);
        return {
          ...s,
          upvoted: on ? s.upvoted.filter((x) => x !== id) : [...s.upvoted, id],
          requests: s.requests.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + (on ? -1 : 1) } : r)),
        };
      });
    },
    toggleFavourite: (slug) =>
      setState((s) => ({
        ...s,
        favourites: s.favourites.includes(slug) ? s.favourites.filter((x) => x !== slug) : [...s.favourites, slug],
      })),
    postRequest: (r) => {
      if (!allowed("post a request")) return "";
      const id = `r-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      send({ type: "postRequest", id, ...r });
      setState((s) => ({
        ...s,
        upvoted: [...s.upvoted, id],
        requests: [
          { ...r, id, upvotes: 1, status: "open", builders: 0, author: s.profile.name || "You", createdAt: Date.now(), mine: true },
          ...s.requests,
        ],
      }));
      return id;
    },
    spendTrialUse: (slug) => {
      const existing = state.myApps.find((m) => m.slug === slug);
      if (existing?.state === "kept") return Infinity;
      const left = existing ? Math.max(0, existing.usesLeft - 1) : FREE_USES - 1;
      send({ type: "spendTrialUse", slug });
      setState((s) => ({
        ...s,
        myApps: existing
          ? s.myApps.map((m) => (m.slug === slug ? { ...m, usesLeft: left } : m))
          : [...s.myApps, { slug, state: "trial", usesLeft: left }],
      }));
      return left;
    },
    keepApp: (slug) => {
      if (!allowed("keep apps")) return;
      send({ type: "keepApp", slug });
      setState((s) => ({
        ...s,
        myApps: s.myApps.some((m) => m.slug === slug)
          ? s.myApps.map((m) => (m.slug === slug ? { ...m, state: "kept" } : m))
          : [...s.myApps, { slug, state: "kept", usesLeft: 0 }],
      }));
    },
    removeApp: (slug) => { send({ type: "removeApp", slug }); setState((s) => ({ ...s, myApps: s.myApps.filter((m) => m.slug !== slug) })); },
    sendFeedback: (slug, solved, reasons) => {
      if (!state.profile.complete) return; // guests' feedback isn't saved
      send({ type: "sendFeedback", slug, solved, reasons });
      setState((s) => ({ ...s, feedback: [...s.feedback, { slug, solved, reasons }] }));
    },
    markRead: (id) => {
      send({ type: "markRead", id });
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
      }));
    },
    startBuilding: (requestId) => {
      if (!allowed("build apps")) return;
      send({ type: "startBuilding", requestId });
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === requestId ? { ...r, status: "building", builders: r.builders + 1 } : r,
        ),
      }));
    },
    publishApp: ({ requestId, app }) => {
      if (!allowed("publish apps")) return;
      // After saving, reload so the new notification comes from the database.
      send({ type: "publishApp", requestId, app }).then(() => { if (mode === "shared") refresh(uid); });
      setState((s) => {
        const exists = s.apps.some((a) => a.slug === app.slug);
        const req = s.requests.find((r) => r.id === requestId);
        let next: State = {
          ...s,
          apps: exists ? s.apps.map((a) => (a.slug === app.slug ? { ...a, updatedDaysAgo: 0, pricingType: app.pricingType, priceInr: app.priceInr } : a)) : [app, ...s.apps],
          requests: s.requests.map((r) =>
            r.id === requestId ? { ...r, status: "live", linkedAppSlug: app.slug } : r,
          ),
        };
        // The loop: everyone who posted or upvoted the request is notified.
        if (req) {
          next = notify(next, {
            type: "live", icon: "🎉", tint: "bg-yellow",
            title: `${app.name} is live!`,
            body: `The request “${req.title}” (▲${req.upvotes}) now has an app. All upvoters were notified.`,
            link: `/app/${app.slug}`, linkLabel: "Try free",
          });
        }
        return next;
      });
    },
    reset: () => {
      // Start over as a brand-new user (in shared mode, other people's data stays).
      localStorage.removeItem(KEY);
      const id = newUid();
      localStorage.setItem(UID_KEY, id);
      setUid(id);
      setState(INITIAL);
      refresh(id);
    },
  }), [state, ready, mode, toast, showToast, send, refresh, uid, accountPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export function useApp(slug: string) {
  const { apps } = useStore();
  return apps.find((a) => a.slug === slug);
}
