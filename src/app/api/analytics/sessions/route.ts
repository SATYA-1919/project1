import { NextRequest, NextResponse } from "next/server";
import { getEventsCollection } from "@/lib/analytics/schema";
import { requireOrganiser } from "@/lib/auth/session";
import type { SessionsResponse, SessionSummary } from "@/lib/analytics/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

interface SessionAggRow {
  sessionId: string;
  eventCount: number;
  pageViews: number;
  clicks: number;
  firstSeen: Date;
  lastSeen: Date;
  durationMs: number;
  entryUrl: string;
}

interface FacetResult {
  sessions: SessionAggRow[];
  summary: { totalSessions: number; totalEvents: number; totalClicks: number }[];
}

interface TopPageRow {
  url: string;
  views: number;
}

export async function GET(req: NextRequest) {
  if (!(await requireOrganiser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sp = req.nextUrl.searchParams;
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number(sp.get("limit") ?? DEFAULT_LIMIT)),
    );
    const cursorRaw = sp.get("cursor");
    const cursor = cursorRaw ? new Date(cursorRaw) : null;
    const cursorValid = cursor && !Number.isNaN(cursor.getTime());

    const col = await getEventsCollection();

    const [faceted] = await col
      .aggregate<FacetResult>([
        { $sort: { ts: 1 } },
        {
          $group: {
            _id: "$sessionId",
            eventCount: { $sum: 1 },
            pageViews: { $sum: { $cond: [{ $eq: ["$type", "page_view"] }, 1, 0] } },
            clicks: { $sum: { $cond: [{ $eq: ["$type", "click"] }, 1, 0] } },
            firstSeen: { $min: "$ts" },
            lastSeen: { $max: "$ts" },
            entryUrl: { $first: "$url" },
          },
        },
        {
          $project: {
            _id: 0,
            sessionId: "$_id",
            eventCount: 1,
            pageViews: 1,
            clicks: 1,
            firstSeen: 1,
            lastSeen: 1,
            entryUrl: 1,
            durationMs: { $subtract: ["$lastSeen", "$firstSeen"] },
          },
        },
        { $sort: { lastSeen: -1 } },
        {
          $facet: {
            sessions: [
              ...(cursorValid ? [{ $match: { lastSeen: { $lt: cursor } } }] : []),
              { $limit: limit + 1 },
            ],
            summary: [
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  totalEvents: { $sum: "$eventCount" },
                  totalClicks: { $sum: "$clicks" },
                },
              },
            ],
          },
        },
      ])
      .toArray();

    const rows = faceted?.sessions ?? [];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const sessions: SessionSummary[] = pageRows.map((r) => ({
      sessionId: r.sessionId,
      eventCount: r.eventCount,
      pageViews: r.pageViews,
      clicks: r.clicks,
      firstSeen: r.firstSeen.toISOString(),
      lastSeen: r.lastSeen.toISOString(),
      durationMs: r.durationMs,
      entryUrl: r.entryUrl,
    }));

    const nextCursor =
      hasMore && sessions.length > 0 ? sessions[sessions.length - 1].lastSeen : null;

    const totals = faceted?.summary?.[0] ?? {
      totalSessions: 0,
      totalEvents: 0,
      totalClicks: 0,
    };

    const [topPage] = await col
      .aggregate<TopPageRow>([
        { $match: { type: "page_view" } },
        { $group: { _id: "$url", views: { $sum: 1 } } },
        { $project: { _id: 0, url: "$_id", views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    const body: SessionsResponse = {
      sessions,
      nextCursor,
      summary: {
        totalSessions: totals.totalSessions,
        totalEvents: totals.totalEvents,
        totalClicks: totals.totalClicks,
        avgEventsPerSession:
          totals.totalSessions > 0
            ? Math.round((totals.totalEvents / totals.totalSessions) * 10) / 10
            : 0,
        topPage: topPage ? { url: topPage.url, views: topPage.views } : null,
      },
    };
    return NextResponse.json(body);
  } catch (err) {
    console.error("[analytics/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
