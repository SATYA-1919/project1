import type { Collection } from "mongodb";
import { getDb } from "./mongo";
import { toView, type EventView, type EventDoc } from "./events";

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

// A user's reservations, newest first, joined with the event details.
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
  const bySlug = new Map(events.map((e) => [e.slug, toView(e)]));

  return docs.map((d) => ({
    tier: d.tier,
    createdAt: d.createdAt.toISOString(),
    event: bySlug.get(d.eventSlug) ?? null,
  }));
}
