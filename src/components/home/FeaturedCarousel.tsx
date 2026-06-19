"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { EventView } from "@/lib/events";
import { Badge } from "@/components/ui/primitives";
import { formatCurrency, formatEventDate } from "@/lib/utils";

export function FeaturedCarousel({ events }: { events: EventView[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = events.length;

  // Auto-advance unless the user is hovering/interacting.
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearInterval(id);
  }, [paused, count]);

  if (count === 0) return null;
  const e = events[index];
  const go = (n: number) => setIndex((n + count) % count);

  return (
    <div
      className="fade-up rounded-lg border border-border bg-card p-1.5 shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="rounded-md bg-muted/60 px-6 py-7">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Featured</span>
          <div className="flex items-center gap-1.5">
            <Badge>{e.category}</Badge>
            <button onClick={() => go(index - 1)} aria-label="Previous"
              className="grid h-7 w-7 place-items-center rounded-md border border-border transition hover:bg-card">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => go(index + 1)} aria-label="Next"
              className="grid h-7 w-7 place-items-center rounded-md border border-border transition hover:bg-card">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div key={e.slug} className="fade-up">
          <h2 className="mt-4 font-display text-3xl leading-tight">{e.title}</h2>
          <p className="mt-2 line-clamp-2 text-[14px] text-muted-foreground">{e.tagline}</p>
          <div className="mt-5 space-y-2 text-[13px] text-muted-foreground">
            <p className="inline-flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} /> {formatEventDate(e.date)}
            </p>
            <p className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> {e.venue}, {e.city}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <span className="font-display text-xl">
            {e.minPrice === 0 ? "Free" : formatCurrency(e.minPrice)}
          </span>
          <Link href={`/events/${e.slug}`} data-track={`featured-view-${e.slug}`}
            className="inline-flex items-center gap-1 text-[13px] text-accent transition hover:gap-2">
            View event <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* dots */}
        <div className="mt-5 flex justify-center gap-1.5">
          {events.map((ev, i) => (
            <button key={ev.slug} onClick={() => go(i)} aria-label={`Go to ${ev.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-foreground" : "w-1.5 bg-border hover:bg-muted-foreground"
              }`} />
          ))}
        </div>
      </div>
    </div>
  );
}
