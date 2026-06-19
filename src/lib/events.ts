import { getDb, hasMongoConfig } from "./mongo";

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

type DemoEvent = Omit<EventDoc, "date" | "status"> & { daysOut: number };

const DAY_MS = 86_400_000;
const DEMO_EVENTS: DemoEvent[] = [
  {
    slug: "technova-2026",
    title: "TechNova 2026",
    tagline: "The flagship 3-day campus tech festival.",
    category: "Conference",
    venue: "Main Auditorium",
    city: "Hyderabad",
    daysOut: 14,
    durationMins: 480,
    description:
      "TechNova is the headline event of the season: three days of keynotes, demos and deep-dives spanning AI, systems, security and product.\n\nExpect talks from industry engineers, a sprawling project expo, and a closing showcase that crowns the best builds of the fest.",
    tiers: [
      { name: "Student", price: 0, capacity: 600 },
      { name: "Professional", price: 49900, capacity: 200 },
    ],
    organiserName: "Aanya Rao",
  },
  {
    slug: "hackoverflow-36h",
    title: "HackOverflow 36h Hackathon",
    tagline: "Build something absurd between two sunrises.",
    category: "Hackathon",
    venue: "Innovation Lab",
    city: "Hyderabad",
    daysOut: 16,
    durationMins: 2160,
    description:
      "A 36-hour overnight hackathon with tracks for AI agents, dev-tools, fintech and hardware.\n\nMentors on call, cold brew on tap, and a hardware lab stocked for the brave. Top teams split the prize pool and a fast-track interview slot.",
    tiers: [{ name: "Team entry", price: 0, capacity: 120 }],
    organiserName: "Aanya Rao",
  },
  {
    slug: "ml-from-scratch",
    title: "ML From Scratch",
    tagline: "Implement a neural net with zero libraries.",
    category: "Workshop",
    venue: "Lab Block C",
    city: "Hyderabad",
    daysOut: 9,
    durationMins: 180,
    description:
      "A hands-on workshop where you build a small neural network from first principles: forward pass, backprop and gradient descent in plain code, no frameworks.\n\nBring a laptop. Leave understanding what the libraries actually do.",
    tiers: [{ name: "Seat", price: 19900, capacity: 60 }],
    organiserName: "Aanya Rao",
  },
  {
    slug: "rust-systems-night",
    title: "Rust & Systems Night",
    tagline: "Lightning talks on going low-level.",
    category: "Talk",
    venue: "Seminar Hall 2",
    city: "Hyderabad",
    daysOut: 6,
    durationMins: 150,
    description:
      "An evening of rapid-fire talks on memory safety, async runtimes, and squeezing performance out of modern hardware, followed by open mic and pizza.",
    tiers: [{ name: "Free entry", price: 0, capacity: 150 }],
    organiserName: "Aanya Rao",
  },
  {
    slug: "capture-the-flag",
    title: "Capture The Flag",
    tagline: "A live security competition. Find the bugs.",
    category: "Competition",
    venue: "Cyber Range",
    city: "Hyderabad",
    daysOut: 15,
    durationMins: 300,
    description:
      "A jeopardy-style CTF spanning web, pwn, crypto and forensics. Solo or in teams of up to four.\n\nScoreboard goes live at kickoff; first blood bonuses on every category.",
    tiers: [{ name: "Competitor", price: 0, capacity: 200 }],
    organiserName: "Aanya Rao",
  },
  {
    slug: "founder-fireside",
    title: "Founder Fireside",
    tagline: "Honest stories from people who shipped.",
    category: "Networking",
    venue: "Rooftop Lawn",
    city: "Hyderabad",
    daysOut: 13,
    durationMins: 120,
    description:
      "An intimate fireside with founders and early engineers on the unglamorous middle of building a company, followed by structured networking over chai.",
    tiers: [{ name: "RSVP", price: 0, capacity: 90 }],
    organiserName: "Aanya Rao",
  },
];

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

function demoEventDocs(): EventDoc[] {
  const now = Date.now();
  return DEMO_EVENTS.map(({ daysOut, ...event }) => ({
    ...event,
    date: new Date(now + daysOut * DAY_MS),
    status: "Published",
  }));
}

function demoEventViews(category?: string): EventView[] {
  const activeCategory = category && category !== "All" ? category : undefined;
  return demoEventDocs()
    .filter((event) => !activeCategory || event.category === activeCategory)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(toView);
}

function logFallback(context: string, err: unknown) {
  const detail = err instanceof Error ? err.message : String(err);
  console.error(`[events] ${context}; using demo events. ${detail}`);
}

export async function listEvents(category?: string): Promise<EventView[]> {
  if (!hasMongoConfig()) return demoEventViews(category);

  try {
    const db = await getDb();
    const filter: Record<string, unknown> = { status: "Published" };
    if (category && category !== "All") filter.category = category;
    const docs = await db
      .collection<EventDoc>("events")
      .find(filter)
      .sort({ date: 1 })
      .toArray();
    return docs.map(toView);
  } catch (err) {
    logFallback("Unable to load MongoDB events", err);
    return demoEventViews(category);
  }
}

export async function getEvent(slug: string): Promise<EventView | null> {
  if (!hasMongoConfig()) {
    return demoEventViews().find((event) => event.slug === slug) ?? null;
  }

  try {
    const db = await getDb();
    const doc = await db.collection<EventDoc>("events").findOne({ slug });
    return doc ? toView(doc) : null;
  } catch (err) {
    logFallback("Unable to load MongoDB event", err);
    return demoEventViews().find((event) => event.slug === slug) ?? null;
  }
}
