"use client";

import { useState } from "react";
import { Flame } from "lucide-react";
import { useAnalyticsPages, useHeatmap } from "@/hooks/useAnalytics";
import { detectRageClicks } from "@/lib/analytics/rage";
import { HeatmapCanvas } from "./HeatmapCanvas";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, Select, Skeleton, EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function HeatmapExplorer() {
  const { data: pagesData, isLoading: pagesLoading } = useAnalyticsPages();
  const pages = pagesData?.pages ?? [];

  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<"density" | "dots">("density");
  const url = selected ?? pages[0]?.url ?? null;

  const { data: heatmap, isLoading: heatmapLoading, isError } = useHeatmap(url);
  const clicks = heatmap?.clicks ?? [];
  const rage = detectRageClicks(clicks);

  if (pagesLoading) return <Skeleton className="h-[480px] w-full" />;
  if (pages.length === 0) {
    return (
      <EmptyState
        title="No click data yet"
        description="Click around the live site, then come back and pick a page."
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={url ?? ""} onChange={(e) => setSelected(e.target.value)} className="min-w-[280px]">
          {pages.map((p) => (
            <option key={p.url} value={p.url}>
              {p.url} · {p.clicks} clicks
            </option>
          ))}
        </Select>
        <div className="inline-flex rounded-md border border-border p-0.5">
          {(["density", "dots"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "h-8 rounded px-3 text-[13px] font-medium capitalize transition",
                mode === m ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard label="Clicks on page" value={String(clicks.length)} />
        <StatsCard label="Rage clicks" value={String(rage.count)}
          delta={`${rage.hotspots.length} hotspot${rage.hotspots.length === 1 ? "" : "s"}`}
          icon={<Flame className="h-4 w-4" strokeWidth={1.5} />} />
        <StatsCard label="Page"
          value={url ? String(pages.find((p) => p.url === url)?.clicks ?? 0) : "—"}
          delta={url ?? "—"} />
      </div>

      {isError ? (
        <EmptyState title="Couldn't load heatmap" description="The analytics store is unreachable." />
      ) : heatmapLoading ? (
        <Skeleton className="h-[420px] w-full" />
      ) : clicks.length === 0 ? (
        <EmptyState title="No clicks on this page" description="Pick another page or generate more activity." />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <HeatmapCanvas clicks={clicks} mode={mode} />
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>fewer</span>
              <div className="h-2 max-w-[200px] flex-1 rounded-full border border-border"
                style={{ background: "linear-gradient(90deg,#e9c9a3,#d08a52,#b5532f,#8a3a1e)" }} />
              <span>more clicks</span>
            </div>
          </div>

          <Card>
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-display text-lg">Rage hotspots</h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">≥3 clicks within 30px in 3s</p>
            </div>
            {rage.hotspots.length === 0 ? (
              <p className="px-5 py-4 text-[13px] text-muted-foreground">No rage clicks detected.</p>
            ) : (
              <ul>
                {rage.hotspots.slice(0, 6).map((h, i) => (
                  <li key={i} className="flex items-center gap-3 border-b border-border px-5 py-3 last:border-b-0">
                    <span className="w-5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[13px]">{h.target ?? `(${h.x}, ${h.y})`}</p>
                      <p className="text-[11px] text-muted-foreground">at ({h.x}, {h.y})</p>
                    </div>
                    <span className="font-display text-base">{h.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
