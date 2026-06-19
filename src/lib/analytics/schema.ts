import { z } from "zod";

export const ANALYTICS_EVENT_TYPES = ["page_view", "click"] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const incomingEventSchema = z.object({
  sessionId: z.string().min(1).max(128),
  type: z.enum(ANALYTICS_EVENT_TYPES),
  url: z.string().min(1).max(2048),
  referrer: z.string().max(2048).nullable().optional(),
  ts: z.number().int().positive(),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  vw: z.number().finite().positive().optional(),
  vh: z.number().finite().positive().optional(),
  target: z.string().max(256).optional(),
});

export const incomingBatchSchema = z.object({
  events: z.array(incomingEventSchema).min(1).max(200),
});

export type IncomingEvent = z.infer<typeof incomingEventSchema>;

export interface AnalyticsEvent {
  sessionId: string;
  type: AnalyticsEventType;
  url: string;
  referrer: string | null;
  ts: Date;
  x?: number;
  y?: number;
  vw?: number;
  vh?: number;
  target?: string;
}

export function toStoredEvent(e: IncomingEvent): AnalyticsEvent {
  const doc: AnalyticsEvent = {
    sessionId: e.sessionId,
    type: e.type,
    url: e.url,
    referrer: e.referrer ?? null,
    ts: new Date(e.ts),
  };
  if (e.x !== undefined) doc.x = e.x;
  if (e.y !== undefined) doc.y = e.y;
  if (e.vw !== undefined) doc.vw = e.vw;
  if (e.vh !== undefined) doc.vh = e.vh;
  if (e.target !== undefined) doc.target = e.target;
  return doc;
}

export interface SessionSummary {
  sessionId: string;
  eventCount: number;
  pageViews: number;
  clicks: number;
  firstSeen: string;
  lastSeen: string;
  durationMs: number;
  entryUrl: string;
}

export interface SessionsResponse {
  sessions: SessionSummary[];
  nextCursor: string | null;
  summary: {
    totalSessions: number;
    totalEvents: number;
    totalClicks: number;
    avgEventsPerSession: number;
    topPage: { url: string; views: number } | null;
  };
}

export interface JourneyEvent {
  type: AnalyticsEventType;
  url: string;
  ts: string;
  x?: number;
  y?: number;
  target?: string;
}

export interface SessionJourneyResponse {
  sessionId: string;
  events: JourneyEvent[];
}

export interface HeatmapClick {
  x: number;
  y: number;
  vw: number;
  vh: number;
  ts: string;
  target: string | null;
}

export interface HeatmapResponse {
  url: string;
  clicks: HeatmapClick[];
}

export interface PageWithClicks {
  url: string;
  clicks: number;
}

/** Typed analytics collection, indexes ensured once. */
import { getDb } from "../mongo";
import type { Collection } from "mongodb";

let indexesEnsured = false;

export async function getEventsCollection(): Promise<Collection<AnalyticsEvent>> {
  const db = await getDb();
  const col = db.collection<AnalyticsEvent>("analytics_events");
  if (!indexesEnsured) {
    await col.createIndexes([
      { key: { sessionId: 1, ts: 1 } },
      { key: { url: 1, type: 1 } },
      { key: { ts: -1 } },
    ]);
    indexesEnsured = true;
  }
  return col;
}
