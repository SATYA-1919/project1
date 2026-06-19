import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "convene";
if (!uri) {
  console.error("MONGODB_URI not set. Run with: npm run seed");
  process.exit(1);
}

function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

const DAY = 86400_000;
const now = Date.now();
const organiserName = "Aanya Rao";

const events = [
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
      "TechNova is the headline event of the season — three days of keynotes, demos and deep-dives spanning AI, systems, security and product.\n\nExpect talks from industry engineers, a sprawling project expo, and a closing showcase that crowns the best builds of the fest.",
    tiers: [
      { name: "Student", price: 0, capacity: 600 },
      { name: "Professional", price: 49900, capacity: 200 },
    ],
  },
  {
    slug: "hackoverflow-36h",
    title: "HackOverflow — 36h Hackathon",
    tagline: "Build something absurd between two sunrises.",
    category: "Hackathon",
    venue: "Innovation Lab",
    city: "Hyderabad",
    daysOut: 16,
    durationMins: 2160,
    description:
      "A 36-hour overnight hackathon with tracks for AI agents, dev-tools, fintech and hardware.\n\nMentors on call, free cold brew on tap, and a hardware lab stocked for the brave. Top three teams split the prize pool and a fast-track interview slot.",
    tiers: [{ name: "Team entry", price: 0, capacity: 120 }],
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
      "A hands-on workshop where you build a small neural network from first principles — forward pass, backprop and gradient descent — in plain code, no frameworks.\n\nBring a laptop. Leave understanding what the libraries actually do.",
    tiers: [{ name: "Seat", price: 19900, capacity: 60 }],
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
      "An evening of rapid-fire talks on memory safety, async runtimes, and squeezing performance out of modern hardware — followed by open mic and pizza.",
    tiers: [{ name: "Free entry", price: 0, capacity: 150 }],
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
  },
  {
    slug: "design-systems-irl",
    title: "Design Systems IRL",
    tagline: "From Figma tokens to shipped components.",
    category: "Workshop",
    venue: "Studio 1",
    city: "Hyderabad",
    daysOut: 11,
    durationMins: 210,
    description:
      "Walk through building a real design system: tokens, theming, accessible components and the handoff to code. Practical, opinionated and example-led.",
    tiers: [{ name: "Seat", price: 14900, capacity: 50 }],
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
      "An intimate fireside with founders and early engineers on the unglamorous middle of building a company — followed by structured networking over chai.",
    tiers: [{ name: "RSVP", price: 0, capacity: 90 }],
  },
  {
    slug: "robotics-arena",
    title: "Robotics Arena",
    tagline: "Bots, line-followers and a sumo ring.",
    category: "Competition",
    venue: "Open Ground",
    city: "Hyderabad",
    daysOut: 17,
    durationMins: 360,
    description:
      "Bring your bot. Line-following, maze-solving and a crowd-favourite sumo bracket. Pit access, charging stations and on-site repairs all day.",
    tiers: [
      { name: "Spectator", price: 0, capacity: 400 },
      { name: "Competitor", price: 9900, capacity: 80 },
    ],
  },
  {
    slug: "cloud-native-day",
    title: "Cloud Native Day",
    tagline: "Kubernetes, edge and everything between.",
    category: "Conference",
    venue: "Hall B",
    city: "Hyderabad",
    daysOut: 20,
    durationMins: 420,
    description:
      "A single-track day on running things in production: containers, observability, cost, and the edge. Practitioner talks, no vendor fluff.",
    tiers: [
      { name: "Student", price: 0, capacity: 300 },
      { name: "Professional", price: 39900, capacity: 150 },
    ],
  },
];

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // organiser + attendee accounts
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  for (const u of [
    { email: "organiser@convene.dev", name: organiserName, password: "convene123", role: "organiser" },
    { email: "attendee@convene.dev", name: "Sam Patel", password: "convene123", role: "attendee" },
  ]) {
    await users.updateOne(
      { email: u.email },
      {
        $set: { name: u.name, role: u.role, passwordHash: hashPassword(u.password) },
        $setOnInsert: { email: u.email, createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  // events
  const col = db.collection("events");
  await col.createIndex({ slug: 1 }, { unique: true });
  await col.deleteMany({});
  await col.insertMany(
    events.map((e) => ({
      slug: e.slug,
      title: e.title,
      tagline: e.tagline,
      description: e.description,
      category: e.category,
      venue: e.venue,
      city: e.city,
      date: new Date(now + e.daysOut * DAY),
      durationMins: e.durationMins,
      tiers: e.tiers,
      organiserName,
      status: "Published",
    })),
  );

  console.log(`Seeded ${events.length} events + 2 users into "${dbName}".`);
  console.log("Organiser login → organiser@convene.dev / convene123");
  await client.close();
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
