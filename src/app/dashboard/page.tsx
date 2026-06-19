import Link from "next/link";
import { Flame } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <p className="eyebrow mb-3">Organiser{user ? ` · ${user.name}` : ""}</p>
          <h1 className="font-display text-5xl leading-[0.95]">Analytics</h1>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Behavioural sessions and click activity across Convene.
          </p>
        </div>
        <Link href="/dashboard/analytics/heatmap"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted">
          <Flame className="h-4 w-4" strokeWidth={1.5} /> Heatmap
        </Link>
      </header>

      <AnalyticsOverview />
    </main>
  );
}
