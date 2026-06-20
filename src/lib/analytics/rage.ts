import type { HeatmapClick } from "./schema";

export interface RageHotspot {
  x: number;
  y: number;
  count: number;
  target: string | null;
}

export interface RageResult {
  count: number;
  hotspots: RageHotspot[];
}

const RADIUS_PX = 30;
const WINDOW_MS = 3000;
const MIN_CLICKS = 3;

// "Rage clicks" are when a user jabs at the same spot in frustration. We flag a
// region when at least 3 clicks land within ~30px of each other inside a 3s
// window. Just a simple rule, no machine learning involved.
export function detectRageClicks(clicks: HeatmapClick[]): RageResult {
  const sorted = [...clicks].sort(
    (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
  );
  const used = new Array<boolean>(sorted.length).fill(false);
  const hotspots: RageHotspot[] = [];
  let count = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (used[i]) continue;
    const anchor = sorted[i];
    const anchorTs = new Date(anchor.ts).getTime();
    const cluster = [i];
    const labels: Record<string, number> = {};

    for (let j = i + 1; j < sorted.length; j++) {
      if (used[j]) continue;
      const c = sorted[j];
      if (new Date(c.ts).getTime() - anchorTs > WINDOW_MS) break;
      if (Math.hypot(c.x - anchor.x, c.y - anchor.y) <= RADIUS_PX) cluster.push(j);
    }

    if (cluster.length >= MIN_CLICKS) {
      let sx = 0;
      let sy = 0;
      for (const idx of cluster) {
        used[idx] = true;
        sx += sorted[idx].x;
        sy += sorted[idx].y;
        const t = sorted[idx].target;
        if (t) labels[t] = (labels[t] ?? 0) + 1;
      }
      count += cluster.length;
      const topTarget =
        Object.entries(labels).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      hotspots.push({
        x: Math.round(sx / cluster.length),
        y: Math.round(sy / cluster.length),
        count: cluster.length,
        target: topTarget,
      });
    }
  }

  hotspots.sort((a, b) => b.count - a.count);
  return { count, hotspots };
}
