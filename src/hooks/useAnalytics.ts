"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type {
  HeatmapResponse,
  PageWithClicks,
  SessionJourneyResponse,
  SessionsResponse,
} from "@/lib/analytics/schema";

export function useAnalyticsSessions() {
  return useInfiniteQuery({
    queryKey: ["analytics", "sessions"],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<SessionsResponse> => {
      const params = new URLSearchParams({ limit: "25" });
      if (pageParam) params.set("cursor", pageParam);
      const res = await fetch(`/api/analytics/sessions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load sessions");
      return res.json();
    },
    getNextPageParam: (last) => last.nextCursor,
  });
}

export function useSessionJourney(sessionId: string) {
  return useQuery({
    queryKey: ["analytics", "journey", sessionId],
    queryFn: async (): Promise<SessionJourneyResponse> => {
      const res = await fetch(`/api/analytics/sessions/${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error("Failed to load journey");
      return res.json();
    },
    enabled: !!sessionId,
  });
}

export function useAnalyticsPages() {
  return useQuery({
    queryKey: ["analytics", "pages"],
    queryFn: async (): Promise<{ pages: PageWithClicks[] }> => {
      const res = await fetch("/api/analytics/pages");
      if (!res.ok) throw new Error("Failed to load pages");
      return res.json();
    },
  });
}

export function useHeatmap(url: string | null) {
  return useQuery({
    queryKey: ["analytics", "heatmap", url],
    queryFn: async (): Promise<HeatmapResponse> => {
      const res = await fetch(`/api/analytics/heatmap?url=${encodeURIComponent(url as string)}`);
      if (!res.ok) throw new Error("Failed to load heatmap");
      return res.json();
    },
    enabled: !!url,
  });
}
