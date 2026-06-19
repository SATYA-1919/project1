import Link from "next/link";
import { listEvents, EVENT_CATEGORIES } from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category ?? "All";
  const events = await listEvents(active);
  const categories = ["All", ...EVENT_CATEGORIES];

  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <p className="eyebrow mb-3">The line-up</p>
      <h1 className="font-display text-4xl mb-8">Events</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c}
            href={c === "All" ? "/events" : `/events?category=${c}`}
            data-track={`filter-${c}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] transition",
              active === c
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No events in this category. Try another, or seed the demo data."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.slug} event={e} />
          ))}
        </div>
      )}
    </main>
  );
}
