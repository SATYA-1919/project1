import { notFound } from "next/navigation";
import { MapPin, Calendar, Clock, Users } from "lucide-react";
import { getEvent } from "@/lib/events";
import { Card, Badge } from "@/components/ui/primitives";
import { TicketButton } from "@/components/events/TicketButton";
import { formatCurrency, formatEventDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const meta = [
    { icon: Calendar, text: formatEventDate(event.date) },
    { icon: MapPin, text: `${event.venue}, ${event.city}` },
    { icon: Clock, text: `${event.durationMins} min` },
    { icon: Users, text: `${event.capacity} seats` },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <Badge>{event.category}</Badge>
      <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
        {event.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">{event.tagline}</p>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
        {meta.map((m, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <m.icon className="h-4 w-4" strokeWidth={1.5} /> {m.text}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <article className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">
          {event.description}
          <p className="mt-8 text-[13px] text-muted-foreground">
            Hosted by {event.organiserName}
          </p>
        </article>

        <aside>
          <Card className="p-5">
            <h2 className="font-display text-lg mb-4">Passes</h2>
            <ul className="flex flex-col gap-4">
              {event.tiers.map((t) => (
                <li key={t.name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-medium">{t.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {t.price === 0 ? "Free" : formatCurrency(t.price)}
                    </p>
                  </div>
                  <TicketButton tier={t.name} slug={event.slug} />
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  );
}
