# Convene — events platform + user analytics

Convene is a small events platform (browse tech events, register, reserve a pass)
that doubles as the demo site for a **user-analytics tool**. A tiny tracking
script records what visitors do, and an organiser dashboard shows it back as
session journeys and a click heatmap.

Built for the "Build a Simple User Analytics Application" assignment. Everything
— login, events and the analytics — is stored in **MongoDB**.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values (see below)
npm run seed                 # adds an organiser account + sample events
npm run dev                  # http://localhost:3000
```

`.env.local` needs three values:

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=convene
AUTH_SECRET=any-long-random-string    # signs the login cookie
```

Log in to the dashboard with the seeded organiser account:

```
organiser@convene.dev  /  convene123
```

## How to try it

1. Browse the site — open events, click around, move between pages. The tracker
   logs a `page_view` and `click` events as you go.
2. Open **/dashboard** (organiser only).
   - **Sessions** lists every visitor session with its event count. Click a row
     to see that session's events in order (the user journey).
   - **Heatmap** lets you pick a page and see where people clicked.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **MongoDB** for all data — auth, events and analytics events
- **Tailwind CSS v4** for styling
- **jose** for the login JWT, **Zod** for validating incoming events
- **TanStack Query** for data fetching on the dashboard
- A plain `<canvas>` heatmap (no charting library)

## How it's put together

- **Tracker** — [`public/tracker.js`](public/tracker.js). Plain JavaScript, no
  build step. Keeps a `session_id` in localStorage, batches events and sends
  them with `sendBeacon`.
- **Collect API** — `POST /api/analytics/collect` validates each event and
  stores it in the `analytics_events` collection.
- **Query APIs** — sessions list, single-session journey, and per-page click
  data, all built with MongoDB aggregation (see the table below).
- **Dashboard** — `/dashboard` (sessions) and `/dashboard/analytics/heatmap`.

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/analytics/collect` | Receive and store events (used by the tracker) |
| GET | `/api/analytics/sessions` | List sessions with event counts |
| GET | `/api/analytics/sessions/[id]` | All events for one session, in order |
| GET | `/api/analytics/heatmap?url=` | Click data for a page |
| GET | `/api/analytics/pages` | Pages that have click data (for the dropdown) |

## What each event stores

```
session_id, type (page_view | click), url, timestamp,
x / y + viewport size (clicks only), referrer, clicked element
```

The collection is indexed by session, by page, and by time so the dashboard
queries stay fast.

## Assumptions & trade-offs

- **One database.** Auth, events and analytics all live in MongoDB. The
  assignment asks for MongoDB and the app isn't big enough to need a second store.
- **The collect endpoint is public** so anonymous visitors get tracked. The
  query endpoints are organiser-only.
- **Click coordinates are saved with the viewport size** and scaled on render,
  so the heatmap looks right on any screen size.
- **No payments.** Reserving a pass is free and instant — that's out of scope.
- **Extra credit:** the heatmap also flags "rage clicks" (repeated clicks in the
  same spot), and the journey view animates as a timeline.
