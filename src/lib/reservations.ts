import type { Collection } from "mongodb";
import { getDb } from "./mongo";
import type { EventView, EventDoc } from "./events";

export interface ReservationDoc {
  userId: string;
  eventSlug: string;
  tier: string;
  createdAt: Date;
}

export interface ReservationView {
  tier: string;
  createdAt: string;
  event: EventView | null;
}

let indexEnsured = false;

async function getReservations(): Promise<Collection<ReservationDoc>> {
  const db = await getDb();
  const col = db.collection<ReservationDoc>("reservations");
  if (!indexEnsured) {
    await col.createIndex({ userId: 1, createdAt: -1 });
    await col.createIndex({ userId: 1, eventSlug: 1, tier: 1 }, { unique: true });
    indexEnsured = true;
  }
  return col;
}

/** Create (or no-op if it already exists) a reservation for a user. */
export async function createReservation(
  userId: string,
  eventSlug: string,
  tier: string,
): Promise<void> {
  const col = await getReservations();
  await col.updateOne(
    { userId, eventSlug, tier },
    { $setOnInsert: { userId, eventSlug, tier, createdAt: new Date() } },
    { upsert: true },
  );
}

function toEventView(e: EventDoc): EventView {
  return {
    slug: e.slug,
    title: e.title,
    tagline: e.tagline,
    description: e.description,
    category: e.category,
    venue: e.venue,
    city: e.city,
    date: e.date.toISOString(),
    durationMins: e.durationMins,
    tiers: e.tiers,
    organiserName: e.organiserName,
    minPrice: e.tiers.length ? Math.min(...e.tiers.map((t) => t.price)) : 0,
    capacity: e.tiers.reduce((s, t) => s + t.capacity, 0),
  };
}

/** A user's reservations, newest first, joined with event details. */
export async function listReservations(userId: string): Promise<ReservationView[]> {
  const col = await getReservations();
  const docs = await col.find({ userId }).sort({ createdAt: -1 }).toArray();
  if (docs.length === 0) return [];

  const db = await getDb();
  const slugs = [...new Set(docs.map((d) => d.eventSlug))];
  const events = await db
    .collection<EventDoc>("events")
    .find({ slug: { $in: slugs } })
    .toArray();
  const bySlug = new Map(events.map((e) => [e.slug, toEventView(e)]));

  return docs.map((d) => ({
    tier: d.tier,
    createdAt: d.createdAt.toISOString(),
    event: bySlug.get(d.eventSlug) ?? null,
  }));
}
