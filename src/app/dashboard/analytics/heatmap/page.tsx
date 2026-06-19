import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeatmapExplorer } from "@/components/analytics/HeatmapExplorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Click heatmap" };

export default function HeatmapPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/dashboard"
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>
      <header className="mb-10 mt-8 border-b border-border pb-8">
        <p className="eyebrow mb-3">Organiser</p>
        <h1 className="font-display text-5xl leading-[0.95]">Click heatmap</h1>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Where visitors click on a page — warmer means more clicks.
        </p>
      </header>
      <HeatmapExplorer />
    </main>
  );
}
