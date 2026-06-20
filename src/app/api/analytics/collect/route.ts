import { NextResponse } from "next/server";
import {
  getEventsCollection,
  incomingBatchSchema,
  toStoredEvent,
} from "@/lib/analytics/schema";
import { hasMongoConfig } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Where the tracker sends its events. It's public (anonymous visitors need to
// be tracked too) and reads the body as text because sendBeacon posts
// text/plain rather than JSON.
export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (!raw) return new NextResponse(null, { status: 204 });

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = incomingBatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    if (!hasMongoConfig()) return new NextResponse(null, { status: 204 });

    const col = await getEventsCollection();
    await col.insertMany(parsed.data.events.map(toStoredEvent), {
      ordered: false,
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[analytics/collect]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
