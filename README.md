# Convene — events platform + user analytics

Convene is a warm, editorial events platform for tech festivals, hackathons and
workshops — and the demo site for a **user-analytics subsystem** built to the
CausalFunnel "Build a Simple User Analytics Application" brief.

Everything — **auth, events and the behavioural analytics stream — runs on
MongoDB**. There is no Supabase/SQL anywhere.

> An original implementation in a warm-paper editorial style. Not affiliated
> with any other event platform.

## What's inside

- **Public site** — home, event listing with category filter, event detail. The
  events are seeded tech-fest content stored in MongoDB.
- **Auth on MongoDB** — register / login / logout with scrypt-hashed passwords
  (Node's built-in `crypto`, no bcrypt dep) and a signed **JWT session cookie**
  (`jose`). The `proxy.ts` middleware verifies the JWT to gate the dashboard —
  no DB round-trip, edge-safe.
- **Analytics subsystem** — a drop-in tracker, ingestion + query APIs, and an
  organiser dashboard with a **sessions view** and a **click heatmap**.

## Assignment checklist

| Requirement | Where |
|---|---|
| Tracking script (vanilla, any page) | [`public/tracker.js`](public/tracker.js) |
| `page_view` + `click`, with `session_id`, type, URL, timestamp, x/y | `tracker.js` |
| Send to backend | `POST /api/analytics/collect` |
| Receive & store events | same |
| Sessions with event counts | `GET /api/analytics/sessions` |
| All events for a session | `GET /api/analytics/sessions/[id]` |
| Click data for a page | `GET /api/analytics/heatmap?url=` |
| MongoDB, structured & indexed | [`src/lib/analytics/schema.ts`](src/lib/analytics/schema.ts) |
| Dashboard — sessions + journey | `/dashboard`, `/dashboard/analytics/sessions/[id]` |
| Dashboard — heatmap | `/dashboard/analytics/heatmap` |

Extras: **rage-click detection**, animated journey timeline, density/dots heatmap.

## Tech stack

Next.js 16 (App Router, `proxy.ts`, async params) · React 19 · TypeScript ·
Tailwind v4 · **MongoDB** (auth + events + analytics) · `jose` (JWT) ·
TanStack Query · Zod · Recharts-free canvas heatmap · lucide-react · sonner.

## Setup steps

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run seed                 # organiser account + tech-fest events
npm run dev                  # http://localhost:3000
```

`.env.local`:

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=convene
AUTH_SECRET=a-long-random-string   # signs the session JWT
```

### Log in

The seed creates an organiser:

```
organiser@convene.dev  /  convene123
```

Or register a new account and tick **"Register as an organiser"**.

### Generate analytics data

Browse the live site while logged in or out — move between pages, open events,
click around. The tracker records a `page_view` on every (SPA) navigation and a
`click` on every click. Then open **/dashboard** (organiser only) → the sessions
table fills in; click a row for the journey, or open **Heatmap** and pick a page.

## API surface

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | public |
| POST | `/api/analytics/collect` | public (tracker) |
| GET | `/api/analytics/sessions` | organiser |
| GET | `/api/analytics/sessions/[id]` | organiser |
| GET | `/api/analytics/heatmap?url=` | organiser |
| GET | `/api/analytics/pages` | organiser |

## Assumptions or trade-offs

- **Single database (MongoDB)** for auth, events and analytics — the assignment
  requires MongoDB and the scope doesn't warrant a second store.
- **JWT in an HTTP-only cookie**, verified in middleware with `jose` so the
  dashboard gate needs no DB hit and stays edge-compatible.
- **Public `/collect`** so anonymous visitors are tracked; queries are
  organiser-gated.
- **Heatmap coords** are stored with the viewport size and normalised by
  viewport width on render, so the map stays aspect-correct across screen sizes.
- **`sendBeacon` + history-patch** so events survive unload and SPA navigation.
- **Reservations** are persisted per user in MongoDB and shown on `/my-tickets`;
  payment is out of scope, so reserving a pass is free and instant.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new) (framework auto-detected as Next.js).
3. Add the environment variables in the Vercel project settings:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `MONGODB_DB` — e.g. `convene`
   - `AUTH_SECRET` — a long random string (e.g. `openssl rand -hex 32`)
4. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0` so Vercel's serverless
   functions can connect.
5. Deploy. After the first deploy, run the seed once against the same database
   (locally with the production `MONGODB_URI`): `npm run seed`.
