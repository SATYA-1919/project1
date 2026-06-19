import Link from "next/link";
import { Card, Badge } from "@/components/ui/primitives";
import { formatCurrency, formatEventDate } from "@/lib/utils";
import type { EventView } from "@/lib/events";

export function EventCard({ event }: { event: EventView }) {
  return (
    <Link href={`/events/${event.slug}`} data-track={`event-card-${event.slug}`}>
      <Card className="h-full p-5 transition hover:border-foreground/30 hover:shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <Badge>{event.category}</Badge>
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {event.city}
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl leading-snug">{event.title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2">
          {event.tagline}
        </p>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[12px] text-muted-foreground">
            {formatEventDate(event.date)}
          </span>
          <span className="font-display text-lg">
            {event.minPrice === 0 ? "Free" : formatCurrency(event.minPrice)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
