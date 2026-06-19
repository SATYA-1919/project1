import { getDb } from "./mongo";

export const EVENT_CATEGORIES = [
  "Hackathon",
  "Conference",
  "Workshop",
  "Talk",
  "Competition",
  "Networking",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface TicketTier {
  name: string;
  price: number; // paise
  capacity: number;
}

export interface EventDoc {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  date: Date;
  durationMins: number;
  tiers: TicketTier[];
  organiserName: string;
  status: "Published" | "Draft";
}

/** Plain, serialisable shape passed to client components. */
export interface EventView {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  date: string;
  durationMins: number;
  tiers: TicketTier[];
  organiserName: string;
  minPrice: number;
  capacity: number;
}

function toView(e: EventDoc): EventView {
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

export async function listEvents(category?: string): Promise<EventView[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { status: "Published" };
  if (category && category !== "All") filter.category = category;
  const docs = await db
    .collection<EventDoc>("events")
    .find(filter)
    .sort({ date: 1 })
    .toArray();
  return docs.map(toView);
}

export async function getEvent(slug: string): Promise<EventView | null> {
  const db = await getDb();
  const doc = await db.collection<EventDoc>("events").findOne({ slug });
  return doc ? toView(doc) : null;
}
