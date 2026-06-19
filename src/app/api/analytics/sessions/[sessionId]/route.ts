import { NextResponse } from "next/server";
import { getEventsCollection } from "@/lib/analytics/schema";
import { requireOrganiser } from "@/lib/auth/session";
import type {
  AnalyticsEvent,
  JourneyEvent,
  SessionJourneyResponse,
} from "@/lib/analytics/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!(await requireOrganiser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { sessionId } = await params;
    const col = await getEventsCollection();
    const docs = await col
      .find({ sessionId }, { projection: { _id: 0 } })
      .sort({ ts: 1 })
      .toArray();

    const events: JourneyEvent[] = docs.map((d: AnalyticsEvent) => {
      const e: JourneyEvent = { type: d.type, url: d.url, ts: d.ts.toISOString() };
      if (d.x !== undefined) e.x = d.x;
      if (d.y !== undefined) e.y = d.y;
      if (d.target !== undefined) e.target = d.target;
      return e;
    });

    const body: SessionJourneyResponse = { sessionId, events };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[analytics/sessions/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
