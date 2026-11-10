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
1. Pick **Student + Hosteller** and press Continue. The feed fills with rows for your niches.
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
| Requests, upvotes, posting | Real, saved in the browser (localStorage) | Postgres, shared by all users |
| Free trial uses, Keep it, feedback | Real, saved in the browser | Postgres + payments |
| BillSplit, AttendCalc mini-apps | Working mini-apps | Each one a separate Vercel app |
| AI starter app | Template picked from keywords | LLM-generated app |
| GitHub publish, security check, deploy | Simulated with timers | GitHub OAuth, real scan, Vercel API |
| Payments in ₹ | Mock ("one bill") | Razorpay / UPI |
| Login | Fixed user "Priya" | Supabase Auth or Clerk (Google) |

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

## 5. Next stage: the database (Neon or Supabase)

The schema follows the section 9.2 data model.

1. Create a free Postgres database on https://neon.tech (or https://supabase.com).
2. Open its **SQL editor**, paste in `db/schema.sql` and run it. Then do the same with `db/seed.sql`, which loads the same sample apps and requests as the demo.
3. Copy the connection string and add it to Vercel as an environment variable called `DATABASE_URL` (Project → Settings → Environment Variables).
4. Swap the store actions one at a time for API routes. Start with requests and upvotes, since those must be shared between users:
   - `src/lib/store.tsx` has one function per action (`toggleUpvote`, `postRequest`, `keepApp`, …).
   - For each one, add a route such as `src/app/api/requests/route.ts` that runs the SQL, and make the store call it with `fetch`.

If you edit `src/lib/data.ts`, run `npm run db:seed-sql` to rebuild `db/seed.sql`.

## 6. Where things are

```
src/app/          one folder per screen (page.tsx), with the screen number in a comment
src/components/   shared UI (logo, cards, chips, tab bar, buttons) and the mini-apps
src/lib/data.ts   all sample data (apps, requests, notifications)
src/lib/match.ts  the search and match % logic
src/lib/store.tsx app state + actions (saved to localStorage)
src/app/globals.css  design tokens: violet #7C5CFF, yellow #FFD84D, green #22A55B …
db/               Postgres schema and seed
```

**Bringing in Stitch designs:** export a screen from Stitch as HTML/Tailwind, then copy its layout into that screen's `page.tsx`. The colour names are already set up as Tailwind classes (`bg-violet`, `bg-yellow`, `text-green`, `bg-mint`, `bg-peach`…), so most Stitch classes only need the hex values swapped for these names.
