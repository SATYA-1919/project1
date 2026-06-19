"use client";

import Link from "next/link";
import { ArrowLeft, Eye, MousePointerClick } from "lucide-react";
import { useSessionJourney } from "@/hooks/useAnalytics";
import { Skeleton, EmptyState, Badge } from "@/components/ui/primitives";
import { relativeTime } from "@/lib/utils";

export function SessionJourney({ sessionId }: { sessionId: string }) {
  const { data, isLoading, isError } = useSessionJourney(sessionId);
  const events = data?.events ?? [];

  return (
    <div className="space-y-8">
      <Link href="/dashboard"
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All sessions
      </Link>

      <header className="border-b border-border pb-8">
        <p className="eyebrow mb-3">Session journey</p>
        <h1 className="break-all font-mono text-2xl">{sessionId}</h1>
        {data && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            {events.length} event{events.length === 1 ? "" : "s"} in order
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Couldn't load journey" description="The analytics store is unreachable." />
      ) : events.length === 0 ? (
        <EmptyState title="No events" description="This session has no recorded events." />
      ) : (
        <ol>
          {events.map((e, i) => {
            const isClick = e.type === "click";
            return (
              <li key={i} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    {isClick ? <MousePointerClick className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  </span>
                  {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{isClick ? "click" : "page view"}</Badge>
                    <span className="truncate text-[14px] font-medium">{e.url}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {relativeTime(e.ts)}
                    {isClick && e.x !== undefined && e.y !== undefined && (
                      <> · <span className="font-mono">({e.x}, {e.y})</span></>
                    )}
                    {isClick && e.target && <> · <span className="font-mono">{e.target}</span></>}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
