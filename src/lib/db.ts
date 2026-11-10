// Server-only database code (runs in Next.js API routes, never in the browser).
// Uses the DATABASE_URL that Vercel adds when you connect a Neon database.
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import {
  APPS, FREE_USES, NOTIFICATION_STYLE, NOTIFICATIONS, REQUESTS,
  type App, type AppRequest, type MyApp, type NicheSlug, type Notification, type NotificationType, type Profile,
} from "./data";

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
export const hasDatabase = Boolean(url);

// One shared connection pool per server instance.
const g = globalThis as unknown as { _solvdPool?: Pool };
function pool(): Pool {
  if (!g._solvdPool) {
    g._solvdPool = new Pool({
      connectionString: url,
      max: 3,
      ssl: url && /sslmode=require|neon\.tech/.test(url) ? { rejectUnauthorized: false } : undefined,
    });
  }
  return g._solvdPool;
}

async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(text, params);
  return res.rows as T[];
}

/**
 * Creates the tables and loads the sample data the first time the app talks to
 * an empty database, so nobody has to run SQL by hand. Uses db/schema.sql and
 * db/seed.sql. A Postgres lock stops two servers from doing it at the same time.
 */
let schemaReady: Promise<void> | null = null;
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await pool().connect();
      try {
        await client.query("select pg_advisory_lock(424242)");
        const { rows } = await client.query("select to_regclass('public.apps') is not null as ok");
        const hasApps = rows[0].ok && (await client.query("select count(*)::int as n from apps")).rows[0].n > 0;
        if (!hasApps) {
          const dir = path.join(process.cwd(), "db");
          await client.query(readFileSync(path.join(dir, "schema.sql"), "utf8"));
          await client.query(readFileSync(path.join(dir, "seed.sql"), "utf8"));
          console.log("solvd: created tables and loaded sample data");
        } else {
          // Database already set up: add any columns from newer versions of schema.sql.
          await client.query(readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
        }
      } finally {
        await client.query("select pg_advisory_unlock(424242)").catch(() => {});
        client.release();
      }
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

const DAY = 86_400_000;
const seedApp = (slug: string) => APPS.find((a) => a.slug === slug);
const tints = ["bg-pink", "bg-sky", "bg-mint", "bg-peach", "bg-yellow", "bg-violet-tint"];
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export type GoogleInfo = { sub: string; email: string; name: string };

/** The client's guest id belongs to a Google account, but nobody is signed in. */
export class SignedOutError extends Error {}

/** A guest (no profile) tried something that needs a profile. */
export class ProfileRequiredError extends Error {}

/**
 * Works out which user this request is for.
 * - Signed in with Google: the user linked to that Google account. The first time,
 *   the current guest account (with its profile and data) becomes the Google account.
 * - Not signed in: the guest id from this browser, unless it belongs to a Google account.
 */
export async function resolveUid(clientUid: string, google: GoogleInfo | null): Promise<string> {
  await ensureUser(clientUid);
  const linked = (await q<{ id: string }>(`select id from users where google_sub = $1`, [google?.sub ?? "-"]))[0];
  if (google) {
    if (linked) return linked.id;
    const claimed = await q(
      `update users set google_sub = $2,
         email = case when exists (select 1 from users where email = $3) then email else nullif($3, '') end
       where id = $1 and google_sub is null returning id`,
      [clientUid, google.sub, google.email],
    );
    if (claimed.length) return clientUid;
    // This browser's guest id is already linked to someone else: make a fresh account.
    const id = `u_g${google.sub.replace(/[^a-z0-9]/gi, "").toLowerCase()}`.slice(0, 34);
    await ensureUser(id);
    await q(`update users set google_sub = $2 where id = $1 and google_sub is null`, [id, google.sub]);
    return id;
  }
  const owner = (await q<{ google_sub: string | null }>(`select google_sub from users where id = $1`, [clientUid]))[0];
  if (owner?.google_sub) throw new SignedOutError();
  return clientUid;
}

/** Makes sure this browser's user exists. New users get the starter notifications. */
export async function ensureUser(uid: string) {
  await ensureSchema();
  const created = await q(
    `insert into users (id, name, role) values ($1, $2, 'user') on conflict (id) do nothing returning id`,
    [uid, `Guest ${uid.slice(-4)}`],
  );
  if (created.length) {
    for (const n of [...NOTIFICATIONS].reverse()) {
      await q(
        `insert into notifications (user_id, type, title, body, link, read, created_at) values ($1, $2, $3, $4, $5, $6, now() - $7 * interval '1 millisecond')`,
        [uid, n.type ?? "welcome", n.title, n.body, n.link ?? null, n.read, Math.max(0, Date.UTC(2026, 10, 10) - n.createdAt)],
      );
    }
  }
}

/** Everything the app needs for one user, in the same shape as the demo store. */
export async function loadState(uid: string, google: GoogleInfo | null = null) {
  await ensureUser(uid);

  const appRows = await q<{
    id: string; developer_id: string; name: string; tagline: string; description: string; icon_url: string;
    status: "beta" | "live"; pricing_type: App["pricingType"]; price_inr: number; security_score: number;
    licence: string; last_updated: Date; users_count: number; rating_avg: string; verified: boolean;
    new_developer: boolean; keywords: string[]; niches: NicheSlug[] | null; developer_name: string | null;
  }>(`
    select a.*, du.name as developer_name, array_remove(array_agg(n.slug order by n.id), null) as niches
    from apps a
    left join users du on du.id = a.developer_id
    left join app_niches an on an.app_id = a.id
    left join niches n on n.id = an.niche_id
    where a.status <> 'removed'
    group by a.id, du.name
    order by a.users_count desc`);

  const reviewRows = await q<{ app_id: string; name: string; rating: number; text: string; created_at: Date }>(
    `select r.app_id, u.name, r.rating, r.text, r.created_at from reviews r join users u on u.id = r.user_id order by r.created_at desc`,
  );

  const apps: App[] = appRows.map((r, i) => ({
    slug: r.id,
    name: r.name,
    icon: r.icon_url || "🧩",
    tint: seedApp(r.id)?.tint ?? tints[i % tints.length],
    tagline: r.tagline ?? "",
    description: r.description ?? "",
    // Seed developers have handles like "rahul-dev"; real users show their profile name.
    developer: r.developer_id?.startsWith("u_") ? r.developer_name ?? "a student developer" : r.developer_id,
    mine: r.developer_id === uid,
    niches: r.niches ?? [],
    pricingType: r.pricing_type,
    priceInr: r.price_inr,
    rating: Number(r.rating_avg),
    usersCount: r.users_count,
    status: r.status,
    verified: r.verified,
    securityScore: r.security_score ?? 0,
    licence: r.licence ?? "—",
    updatedDaysAgo: Math.max(0, Math.floor((Date.now() - new Date(r.last_updated).getTime()) / DAY)),
    newDeveloper: r.new_developer,
    keywords: r.keywords ?? [],
    reviews: reviewRows
      .filter((x) => x.app_id === r.id)
      .map((x) => ({ name: cap(x.name), rating: x.rating, text: x.text, daysAgo: Math.floor((Date.now() - new Date(x.created_at).getTime()) / DAY) })),
  }));

  const reqRows = await q<{
    id: string; author_id: string; author_name: string; title: string; description: string; bounty_inr: number;
    status: AppRequest["status"]; linked_app_id: string | null; upvotes_count: number; created_at: Date;
    niches: NicheSlug[] | null; builders: number;
  }>(`
    select r.*, u.name as author_name,
      array_remove(array_agg(distinct n.slug), null) as niches,
      (select count(*)::int from request_builders b where b.request_id = r.id) as builders
    from requests r
    left join users u on u.id = r.author_id
    left join request_niches rn on rn.request_id = r.id
    left join niches n on n.id = rn.niche_id
    group by r.id, u.name`);

  const requests: AppRequest[] = reqRows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    niches: r.niches ?? [],
    upvotes: r.upvotes_count,
    bountyInr: r.bounty_inr,
    status: r.status,
    // Seed requests list their builder count in data.ts; new ones count real builders.
    builders: Math.max(r.builders, REQUESTS.find((s) => s.id === r.id)?.builders ?? 0),
    author: cap(r.author_name ?? "someone"),
    linkedAppSlug: r.linked_app_id ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
    mine: r.author_id === uid,
  }));

  const upvoted = (await q<{ request_id: string }>(`select request_id from upvotes where user_id = $1`, [uid])).map((r) => r.request_id);

  const kept = await q<{ app_id: string }>(`select app_id from subscriptions where user_id = $1 and status = 'active'`, [uid]);
  const trials = await q<{ app_id: string; uses_left: number }>(`select app_id, uses_left from trials where user_id = $1 order by started_at`, [uid]);
  const myApps: MyApp[] = [
    ...kept.map((k) => ({ slug: k.app_id, state: "kept" as const, usesLeft: 0 })),
    ...trials.filter((t) => !kept.some((k) => k.app_id === t.app_id)).map((t) => ({ slug: t.app_id, state: "trial" as const, usesLeft: t.uses_left })),
  ];

  const notifRows = await q<{ id: number; type: NotificationType; title: string; body: string; link: string | null; read: boolean; created_at: Date }>(
    `select * from notifications where user_id = $1 order by created_at desc limit 50`, [uid],
  );
  const notifications: Notification[] = notifRows.map((n) => ({
    id: String(n.id),
    type: n.type,
    ...(NOTIFICATION_STYLE[n.type] ?? NOTIFICATION_STYLE.welcome),
    title: n.title,
    body: n.body,
    link: n.link ?? undefined,
    linkLabel: n.link ? (n.type === "live" ? "Try free" : "Open") : undefined,
    read: n.read,
    createdAt: new Date(n.created_at).getTime(),
  }));

  const nicheRows = await q<{ slug: NicheSlug }>(
    `select n.slug from user_niches un join niches n on n.id = un.niche_id where un.user_id = $1 order by n.id`, [uid],
  );

  const u = (await q<{ name: string; role: Profile["role"]; skills: string[]; github: string | null; profile_complete: boolean }>(
    `select name, role, skills, github, profile_complete from users where id = $1`, [uid],
  ))[0];
  const profile: Profile = {
    name: u?.profile_complete ? u.name : "",
    role: u?.role ?? "user",
    skills: u?.skills ?? [],
    github: u?.github ?? "",
    complete: Boolean(u?.profile_complete),
  };

  // First sign-in with an empty profile: suggest the name from Google.
  if (!profile.complete && google?.name) profile.name = google.name;

  return {
    uid,
    account: google ? { email: google.email, name: google.name } : null,
    apps, requests, upvoted, myApps, notifications, niches: nicheRows.map((n) => n.slug), profile,
  };
}

// ---------- Actions (one per button in the app) ----------

export type Action =
  | { type: "saveProfile"; profile: Profile }
  | { type: "setNiches"; niches: NicheSlug[] }
  | { type: "toggleUpvote"; requestId: string }
  | { type: "postRequest"; id: string; title: string; description: string; niches: NicheSlug[]; bountyInr: number }
  | { type: "spendTrialUse"; slug: string }
  | { type: "keepApp"; slug: string }
  | { type: "removeApp"; slug: string }
  | { type: "sendFeedback"; slug: string; solved: boolean; reasons: string[] }
  | { type: "markRead"; id?: string }
  | { type: "startBuilding"; requestId: string }
  | { type: "publishApp"; requestId?: string; app: App };

// Guests (no profile yet) may only do these; everything else needs a profile.
const GUEST_ACTIONS = new Set<Action["type"]>(["saveProfile", "setNiches", "markRead", "spendTrialUse"]);

export async function runAction(uid: string, a: Action) {
  await ensureUser(uid);
  if (!GUEST_ACTIONS.has(a.type)) {
    const u = (await q<{ profile_complete: boolean }>(`select profile_complete from users where id = $1`, [uid]))[0];
    if (!u?.profile_complete) throw new ProfileRequiredError();
  }
  switch (a.type) {
    case "saveProfile": {
      const p = a.profile;
      const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
      const name = clean(p.name, 60);
      if (!name) throw new Error("name required");
      await q(
        `update users set name = $2, role = $3, skills = $4, github = $5, profile_complete = true where id = $1`,
        [uid, name, p.role === "developer" ? "developer" : "user",
          (Array.isArray(p.skills) ? p.skills : []).map((x) => clean(x, 30)).slice(0, 12), clean(p.github, 39).replace(/^@/, "")],
      );
      return;
    }

    case "setNiches":
      await q(`delete from user_niches where user_id = $1`, [uid]);
      await q(
        `insert into user_niches (user_id, niche_id) select $1, id from niches where slug = any($2::text[]) on conflict do nothing`,
        [uid, a.niches],
      );
      return;

    case "toggleUpvote": {
      const removed = await q(`delete from upvotes where request_id = $1 and user_id = $2 returning request_id`, [a.requestId, uid]);
      if (removed.length) {
        await q(`update requests set upvotes_count = greatest(0, upvotes_count - 1) where id = $1`, [a.requestId]);
      } else {
        await q(`insert into upvotes (request_id, user_id) values ($1, $2) on conflict do nothing`, [a.requestId, uid]);
        await q(`update requests set upvotes_count = upvotes_count + 1 where id = $1`, [a.requestId]);
      }
      return;
    }

    case "postRequest":
      await q(
        `insert into requests (id, author_id, title, description, bounty_inr, status, upvotes_count) values ($1, $2, $3, $4, $5, 'open', 1)`,
        [a.id, uid, a.title.slice(0, 140), a.description.slice(0, 1000), Math.max(0, Math.min(100000, a.bountyInr | 0))],
      );
      await q(
        `insert into request_niches (request_id, niche_id) select $1, id from niches where slug = any($2::text[])`,
        [a.id, a.niches],
      );
      await q(`insert into upvotes (request_id, user_id) values ($1, $2) on conflict do nothing`, [a.id, uid]);
      return;

    case "spendTrialUse":
      await q(
        `insert into trials (user_id, app_id, uses_left) values ($1, $2, $3)
         on conflict (user_id, app_id) do update set uses_left = greatest(0, trials.uses_left - 1)`,
        [uid, a.slug, FREE_USES - 1],
      );
      return;

    case "keepApp": {
      const app = (await q<{ pricing_type: string; price_inr: number }>(`select pricing_type, price_inr from apps where id = $1`, [a.slug]))[0];
      const exists = await q(`select 1 from subscriptions where user_id = $1 and app_id = $2 and status = 'active'`, [uid, a.slug]);
      if (!exists.length) {
        await q(`insert into subscriptions (user_id, app_id, plan, price_inr) values ($1, $2, $3, $4)`, [uid, a.slug, app?.pricing_type ?? "free", app?.price_inr ?? 0]);
        await q(`update apps set users_count = users_count + 1 where id = $1`, [a.slug]);
      }
      return;
    }

    case "removeApp":
      await q(`update subscriptions set status = 'cancelled' where user_id = $1 and app_id = $2`, [uid, a.slug]);
      await q(`delete from trials where user_id = $1 and app_id = $2`, [uid, a.slug]);
      return;

    case "sendFeedback":
      await q(`insert into feedback (app_id, user_id, solved, reasons) values ($1, $2, $3, $4)`, [a.slug, uid, a.solved, a.reasons]);
      return;

    case "markRead":
      if (a.id) await q(`update notifications set read = true where user_id = $1 and id = $2`, [uid, Number(a.id)]);
      else await q(`update notifications set read = true where user_id = $1`, [uid]);
      return;

    case "startBuilding":
      await q(`update requests set status = 'building' where id = $1 and status = 'open'`, [a.requestId]);
      await q(`insert into request_builders (request_id, developer_id) values ($1, $2) on conflict do nothing`, [a.requestId, uid]);
      return;

    case "publishApp": {
      const x = a.app;
      await q(
        `insert into apps (id, developer_id, name, tagline, description, icon_url, status, pricing_type, price_inr,
           security_score, licence, last_updated, users_count, rating_avg, verified, new_developer, keywords)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now(), $12, $13, true, true, $14)
         on conflict (id) do update set last_updated = now(), pricing_type = excluded.pricing_type, price_inr = excluded.price_inr`,
        [x.slug, uid, x.name, x.tagline, x.description, x.icon, x.status, x.pricingType, x.priceInr, x.securityScore, x.licence, x.usersCount, x.rating, x.keywords],
      );
      await q(`insert into security_checks (app_id, deps_ok, secrets_ok, licence_found, score) values ($1, true, true, $2, $3)`, [x.slug, x.licence, x.securityScore]);
      if (a.requestId) {
        await q(`insert into app_niches (app_id, niche_id) select $1, niche_id from request_niches where request_id = $2 on conflict do nothing`, [x.slug, a.requestId]);
        const req = (await q<{ title: string; upvotes_count: number }>(
          `update requests set status = 'live', linked_app_id = $1 where id = $2 returning title, upvotes_count`, [x.slug, a.requestId],
        ))[0];
        // The loop: everyone who posted or upvoted the request gets a notification.
        if (req) {
          await q(
            `insert into notifications (user_id, type, title, body, link)
             select distinct user_id, 'live', $1, $2, $3 from (
               select user_id from upvotes where request_id = $4
               union select author_id from requests where id = $4
               union select $5::text
             ) people where user_id is not null`,
            [`${x.name} is live!`, `The request “${req.title}” (▲${req.upvotes_count}) now has an app. Try it free.`, `/app/${x.slug}`, a.requestId, uid],
          );
        }
      }
      return;
    }
  }
}

