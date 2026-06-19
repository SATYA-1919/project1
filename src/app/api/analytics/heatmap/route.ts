import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/lib/analytics/schema";
import { requireOrganiser } from "@/lib/auth/session";
import type { HeatmapClick, HeatmapResponse } from "@/lib/analytics/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClickRow {
  x: number;
  y: number;
  vw: number;
  vh: number;
  ts: Date;
  target?: string;
}

export async function GET(req: NextRequest) {
  if (!(await requireOrganiser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing required `url` query parameter" },
      { status: 400 },
    );
  }
  try {
    const col = await getEventsCollection();
    const rows = await col
      .find(
        {
          url,
          type: "click",
          x: { $exists: true },
          y: { $exists: true },
          vw: { $exists: true },
          vh: { $exists: true },
        },
        { projection: { _id: 0, x: 1, y: 1, vw: 1, vh: 1, ts: 1, target: 1 } },
      )
      .sort({ ts: 1 })
      .toArray();

    const clicks: HeatmapClick[] = (rows as unknown as ClickRow[]).map((r) => ({
      x: r.x,
      y: r.y,
      vw: r.vw,
      vh: r.vh,
      ts: r.ts.toISOString(),
      target: r.target ?? null,
    }));

    const body: HeatmapResponse = { url, clicks };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[analytics/heatmap]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
