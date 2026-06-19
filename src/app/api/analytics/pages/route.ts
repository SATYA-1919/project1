import { NextResponse } from "next/server";
import { getEventsCollection } from "@/lib/analytics/schema";
import { requireOrganiser } from "@/lib/auth/session";
import type { PageWithClicks } from "@/lib/analytics/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageRow {
  url: string;
  clicks: number;
}

export async function GET() {
  if (!(await requireOrganiser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const col = await getEventsCollection();
    const rows = await col
      .aggregate<PageRow>([
        { $match: { type: "click" } },
        { $group: { _id: "$url", clicks: { $sum: 1 } } },
        { $project: { _id: 0, url: "$_id", clicks: 1 } },
        { $sort: { clicks: -1 } },
      ])
      .toArray();

    const pages: PageWithClicks[] = rows.map((r) => ({ url: r.url, clicks: r.clicks }));
    return NextResponse.json({ pages });
  } catch (err) {
    console.error("[analytics/pages]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
