"use client";

import Link from "next/link";
import { Activity, MousePointerClick, Users, FileText } from "lucide-react";
import { useAnalyticsSessions } from "@/hooks/useAnalytics";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton, EmptyState } from "@/components/ui/primitives";
import { relativeTime, formatDuration } from "@/lib/utils";

function shortId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export function AnalyticsOverview() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAnalyticsSessions();

  const summary = data?.pages[0]?.summary;
  const sessions = data?.pages.flatMap((p) => p.sessions) ?? [];

  return (
    <div className="space-y-10">
      <section>
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-4">
          Headline
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading || !summary ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[120px]" />)
          ) : (
            <>
              <StatsCard label="Sessions" value={String(summary.totalSessions)}
                delta="Unique visitors" icon={<Users className="h-4 w-4" strokeWidth={1.5} />} />
              <StatsCard label="Events" value={String(summary.totalEvents)}
                delta={`${summary.totalClicks} clicks`} icon={<Activity className="h-4 w-4" strokeWidth={1.5} />} />
              <StatsCard label="Avg / session" value={String(summary.avgEventsPerSession)}
                delta="Events per session" icon={<MousePointerClick className="h-4 w-4" strokeWidth={1.5} />} />
              <StatsCard label="Top page" value={summary.topPage ? String(summary.topPage.views) : "—"}
                delta={summary.topPage ? summary.topPage.url : "No views yet"} icon={<FileText className="h-4 w-4" strokeWidth={1.5} />} />
            </>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Sessions</h2>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {summary ? `${summary.totalSessions} total` : "—"}
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-md border border-border divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4"><Skeleton className="h-5 w-full" /></div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState title="Couldn't load sessions" description="The analytics store is unreachable." />
        ) : sessions.length === 0 ? (
          <EmptyState title="No sessions yet"
            description="Browse and click around the live site, then return — events are recorded as you go." />
        ) : (
          <>
            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Session", "Entry page", "Events", "Clicks", "Duration", "Last seen"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.sessionId} className="border-b border-border last:border-b-0 hover:bg-muted/60">
                      <td className="px-5 py-3.5">
                        <Link href={`/dashboard/analytics/sessions/${s.sessionId}`}
                          className="font-mono text-[12px] hover:underline">
                          {shortId(s.sessionId)}
                        </Link>
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-3.5 text-[13px] text-muted-foreground">{s.entryUrl}</td>
                      <td className="px-5 py-3.5 text-[13px] font-medium">{s.eventCount}</td>
                      <td className="px-5 py-3.5 text-[13px]">{s.clicks}</td>
                      <td className="px-5 py-3.5 text-[13px]">{formatDuration(s.durationMs)}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{relativeTime(s.lastSeen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading…" : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
