"use client";

import { useEffect, useRef } from "react";
import type { HeatmapClick } from "@/lib/analytics/schema";

function buildPalette(): Uint8ClampedArray {
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (!ctx) return new Uint8ClampedArray(256 * 4);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0.0, "rgba(181, 83, 47, 0)");
  g.addColorStop(0.35, "#e9c9a3");
  g.addColorStop(0.6, "#d08a52");
  g.addColorStop(0.82, "#b5532f");
  g.addColorStop(1.0, "#8a3a1e");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1, 256);
  return ctx.getImageData(0, 0, 1, 256).data;
}

interface Props {
  clicks: HeatmapClick[];
  mode: "density" | "dots";
}

/** Clicks normalised by viewport width (x/vw, y/vw) for a responsive, aspect-correct map. */
export function HeatmapCanvas({ clicks, mode }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (!paletteRef.current) paletteRef.current = buildPalette();

    const points = clicks
      .filter((c) => c.vw > 0)
      .map((c) => ({ nx: c.x / c.vw, ny: c.y / c.vw }));
    const maxNy = Math.max(0.6, ...points.map((p) => p.ny));

    function draw() {
      if (!wrap || !canvas) return;
      const W = wrap.clientWidth;
      const H = Math.round(W * maxNy);
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      if (points.length === 0) return;

      if (mode === "dots") {
        ctx.fillStyle = "rgba(181, 83, 47, 0.5)";
        for (const p of points) {
          ctx.beginPath();
          ctx.arc(p.nx * W, p.ny * W, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        return;
      }

      const r = Math.max(26, W * 0.06);
      for (const p of points) {
        const x = p.nx * W;
        const y = p.ny * W;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, "rgba(0,0,0,0.28)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      const img = ctx.getImageData(0, 0, W, H);
      const data = img.data;
      const pal = paletteRef.current;
      if (!pal) return;
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha) {
          const o = alpha * 4;
          data[i] = pal[o];
          data[i + 1] = pal[o + 1];
          data[i + 2] = pal[o + 2];
          data[i + 3] = Math.min(225, alpha + 50);
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [clicks, mode]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden rounded-md border border-border"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, var(--muted) 0 39px, transparent 39px 40px), repeating-linear-gradient(90deg, var(--muted) 0 39px, transparent 39px 40px)",
      }}
    >
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
