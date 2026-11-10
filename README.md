# solvd.

*Tiny apps, picked for your exact niche.*

A working demo of **solvd.**, our IDT course project (BITS Pilani Hyderabad): a problem-first marketplace for tiny AI-powered micro-apps, with a personalised Netflix-style feed (Design Option B, "Made for you").

It is a Next.js app with all **12 screens** from `01_PROJECT_CONTEXT.md` section 8, the section 8.2 colours and fonts, and the section 8.3 sample data. It runs without a database: changes are kept in your browser, so it can go on Vercel today. The Postgres schema is ready in `db/` for the next stage.

---

## 1. Run it on your laptop

You need **Node.js 20 or newer** (check with `node -v`).

```bash
npm install
npm run dev
```

Open http://localhost:3000. For the phone view in Chrome, press **F12**, then the phone icon, then pick "iPhone 12 Pro" (390 × 844).

## 2. The 12 screens

| # | Screen | URL |
|---|---|---|
| 0 | Create your profile (first visit) | `/welcome` |
| 1 | Pick your niche | `/onboarding` |
| 2 | Your feed (home) | `/feed` |
| 3 | Search results | `/search?q=split hostel mess bill` |
| 4 | App detail | `/app/messmate` |
| 5 | Mini-app running (free trial) | `/app/billsplit/run`, `/app/attendcalc/run` |
| 6 | No match → AI starter app | `/starter?q=…` |
| 7 | Requests board | `/requests` |
| 8 | Post a request | `/requests/new` |
| 9 | Me / profile | `/me` |
| 10 | Notifications | `/notifications` |
| 11 | Developer hub | `/dev` |
| 12 | Publish from GitHub | `/dev/publish` |

The **Niches** tab (`/niches`) lets you browse apps by niche.

### Demo script (about 2 minutes, good for a presentation)
1. Fill in **Create your profile** (just your name), then pick **Student + Hosteller** and press Continue. The feed fills with rows for your niches.
2. Search **"split hostel mess bill"**. You get 3 apps with a match %.
3. Open **MessMate** to show the 92% match and the trust panel. Then **Try free** on BillSplit and tap the friends to mark them paid.
4. Press "Done trying?", then **Yes, keep it**. It shows up in **Me → My apps**.
5. Go to **Requests**, upvote something, then press **+** to post a request. Type "timetable photo" and watch the "may already exist" hint appear.
6. **Me → Switch to developer mode → Build this → Publish in 1 click.** The security check runs, the app goes live, and the upvoters get a notification. That is the full loop.
7. **Me → Reset demo data** puts everything back to the start.

## 3. What is real and what is mocked

| Feature | In this demo | Later |
|---|---|---|
| Niche feed, match %, search | Real logic, keyword-based (`src/lib/match.ts`) | LLM / embeddings |
| Requests, upvotes, posting | Real. Shared via Postgres when a database is connected, otherwise saved in the browser | — |
| Free trial uses, Keep it, feedback, notifications | Real, same as above | Real payments |
| BillSplit, AttendCalc mini-apps | Working mini-apps | Each one a separate Vercel app |
| AI starter app | Template picked from keywords | LLM-generated app |
| GitHub publish, security check, deploy | Simulated with timers | GitHub OAuth, real scan, Vercel API |
| Payments in ₹ | Mock ("one bill") | Razorpay / UPI |
| Profile and login | Asked on the first visit (name, finder or developer, skills, GitHub) and saved in the database. Optional Google sign-in carries it to any device | — |

## 4. Put it online with Vercel (free)

1. Create an empty repo on GitHub, for example `solvd`.
2. In this folder:
   ```bash
   git init && git add . && git commit -m "solvd. demo"
   git branch -M main
   git remote add origin https://github.com/<your-username>/solvd.git
   git push -u origin main
   ```
3. Go to https://vercel.com, sign in with GitHub, press **Add New → Project**, pick the repo and press **Deploy**. No settings are needed.
4. In about a minute you get a link like `solvd-xyz.vercel.app` that works on any phone.

Each push to `main` redeploys on its own.

## 5. Shared database (Neon Postgres)

Without a database, each browser keeps its own copy of the data ("local mode"). With one, everyone using the link sees the same requests, upvotes, kept apps and notifications ("shared mode"). The app picks the mode by itself: if the database is missing or down, it falls back to local mode, so the demo never breaks.

**Setup (one time):**
1. Vercel project → **Storage** → **Create Database** → **Neon** → connect it to this project. This adds `DATABASE_URL` for you.
2. Redeploy (Vercel → Deployments → ⋯ → Redeploy), or just push a commit.
3. Open the app. On the first visit it creates the tables and loads the sample data by itself (`ensureSchema` in `src/lib/db.ts`). You don't need to run any SQL by hand. Running `db/schema.sql` and `db/seed.sql` in an SQL editor also works.

**How it works:**
- `GET /api/state?uid=…` (`src/app/api/state/route.ts`) loads everything one user needs.
- `POST /api/action` (`src/app/api/action/route.ts`) saves one action, like `toggleUpvote` or `postRequest`. All the SQL is in `src/lib/db.ts`, in one `case` per action.
- Until login is added, each browser gets a random user id (`u_…`) saved in localStorage. Your profile is stored in the `users` table under that id. "Start over as a new user" in Me gives you a fresh id.
- Database changes for newer versions (like the profile columns) are in `db/schema.sql` as `alter table … add column if not exists`. They are applied automatically when the server starts.

**Run it locally with a database:** copy `.env.example` to `.env.local`, paste your Neon connection string, then run `npm run dev`.

If you edit `src/lib/data.ts`, run `npm run db:seed-sql` to rebuild `db/seed.sql`.

## 6. Google sign-in

Sign-in turns on by itself when these 3 environment variables are set in Vercel (Settings → Environment Variables). Without them, the app uses guest accounts and hides the Google button.

| Variable | Where it comes from |
|---|---|
| `AUTH_GOOGLE_ID` | Google Cloud → Google Auth Platform → Clients → your Web client |
| `AUTH_GOOGLE_SECRET` | same place |
| `AUTH_SECRET` | any long random string, e.g. from https://generate-secret.vercel.app/32 |

In Google Cloud, the client needs:
- Authorized JavaScript origin: `https://solvd-app-three.vercel.app`
- Authorized redirect URI: `https://solvd-app-three.vercel.app/api/auth/callback/google`

**How accounts work:** everyone starts as a guest (an id in localStorage). The first time a guest signs in with Google, that guest account (profile, apps and requests) becomes their Google account (`users.google_sub`). On another device, signing in with the same Google account loads the same profile. The code is in `src/auth.ts` and `resolveUid` in `src/lib/db.ts`.

## 7. Where things are

```
src/app/          one folder per screen (page.tsx), with the screen number in a comment
src/components/   shared UI (logo, cards, chips, tab bar, buttons) and the mini-apps
src/lib/data.ts   all sample data (apps, requests, notifications)
src/lib/match.ts  the search and match % logic
src/lib/store.tsx app state + actions (local or shared mode)
src/lib/db.ts     all database queries (server only)
src/app/api/      the two API routes
src/app/globals.css  design tokens: violet #7C5CFF, yellow #FFD84D, green #22A55B …
db/               Postgres schema and seed
```

**Bringing in Stitch designs:** export a screen from Stitch as HTML/Tailwind, then copy its layout into that screen's `page.tsx`. The colour names are already set up as Tailwind classes (`bg-violet`, `bg-yellow`, `text-green`, `bg-mint`, `bg-peach`…), so most Stitch classes only need the hex values swapped for these names.
