"use client";

// One shared store for the whole demo. It starts from the seed data and saves
// changes in the browser (localStorage), so the demo works on Vercel with no
// database. When Postgres is added, each action below becomes an API call.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  APPS, FREE_USES, MY_APPS, NOTIFICATIONS, REQUESTS,
  type App, type AppRequest, type MyApp, type NicheSlug, type Notification,
} from "./data";

type State = {
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
  onboarded: false,
  niches: ["student", "hosteller"],
  apps: APPS,
  requests: REQUESTS,
  upvoted: ["r-attendance"],
  favourites: [],
  myApps: MY_APPS,
  notifications: NOTIFICATIONS,
  feedback: [],
};

const KEY = "solvd-demo-v1";

type Store = State & {
  ready: boolean;
  toast: string | null;
  showToast: (msg: string) => void;
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

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

  const store = useMemo<Store>(() => ({
    ...state,
    ready,
    toast,
    showToast,
    setNiches: (niches) => setState((s) => ({ ...s, niches })),
    finishOnboarding: (niches) => setState((s) => ({ ...s, niches, onboarded: true })),
    toggleUpvote: (id) =>
      setState((s) => {
        const on = s.upvoted.includes(id);
        return {
          ...s,
          upvoted: on ? s.upvoted.filter((x) => x !== id) : [...s.upvoted, id],
          requests: s.requests.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + (on ? -1 : 1) } : r)),
        };
      }),
    toggleFavourite: (slug) =>
      setState((s) => ({
        ...s,
        favourites: s.favourites.includes(slug) ? s.favourites.filter((x) => x !== slug) : [...s.favourites, slug],
      })),
    postRequest: (r) => {
      const id = `r-${Date.now()}`;
      setState((s) => ({
        ...s,
        upvoted: [...s.upvoted, id],
        requests: [
          { ...r, id, upvotes: 1, status: "open", builders: 0, author: "Priya", createdAt: Date.now() },
          ...s.requests,
        ],
      }));
      return id;
    },
    spendTrialUse: (slug) => {
      const existing = state.myApps.find((m) => m.slug === slug);
      if (existing?.state === "kept") return Infinity;
      const left = existing ? Math.max(0, existing.usesLeft - 1) : FREE_USES - 1;
      setState((s) => ({
        ...s,
        myApps: existing
          ? s.myApps.map((m) => (m.slug === slug ? { ...m, usesLeft: left } : m))
          : [...s.myApps, { slug, state: "trial", usesLeft: left }],
      }));
      return left;
    },
    keepApp: (slug) =>
      setState((s) => ({
        ...s,
        myApps: s.myApps.some((m) => m.slug === slug)
          ? s.myApps.map((m) => (m.slug === slug ? { ...m, state: "kept" } : m))
          : [...s.myApps, { slug, state: "kept", usesLeft: 0 }],
      })),
    removeApp: (slug) => setState((s) => ({ ...s, myApps: s.myApps.filter((m) => m.slug !== slug) })),
    sendFeedback: (slug, solved, reasons) =>
      setState((s) => ({ ...s, feedback: [...s.feedback, { slug, solved, reasons }] })),
    markRead: (id) =>
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
      })),
    startBuilding: (requestId) =>
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === requestId ? { ...r, status: "building", builders: r.builders + 1 } : r,
        ),
      })),
    publishApp: ({ requestId, app }) =>
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
            icon: "🎉", tint: "bg-yellow",
            title: `${app.name} is live!`,
            body: `The request “${req.title}” (▲${req.upvotes}) now has an app. All upvoters were notified.`,
            link: `/app/${app.slug}`, linkLabel: "Try free",
          });
        }
        return next;
      }),
    reset: () => {
      localStorage.removeItem(KEY);
      setState(INITIAL);
    },
  }), [state, ready, toast, showToast]);

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
