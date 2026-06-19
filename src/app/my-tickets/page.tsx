import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Calendar, Ticket } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listReservations } from "@/lib/reservations";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";
import { formatCurrency, formatEventDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My tickets" };

export default async function MyTicketsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/my-tickets");

  const reservations = await listReservations(user.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <p className="eyebrow mb-3">{user.name}</p>
      <h1 className="font-display text-4xl mb-2">My tickets</h1>
      <p className="mb-10 text-[13px] text-muted-foreground">
        {reservations.length} reservation{reservations.length === 1 ? "" : "s"}
      </p>

      {reservations.length === 0 ? (
        <EmptyState
          title="No reservations yet"
          description="Reserve a pass from any event and it'll show up here."
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {reservations.map((r, i) => (
            <li key={i}>
              <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {r.event && <Badge>{r.event.category}</Badge>}
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <Ticket className="h-3 w-3" strokeWidth={1.5} /> {r.tier}
                    </span>
                  </div>
                  {r.event ? (
                    <Link href={`/events/${r.event.slug}`}
                      className="mt-2 block font-display text-2xl hover:underline">
                      {r.event.title}
                    </Link>
                  ) : (
                    <p className="mt-2 font-display text-2xl text-muted-foreground">
                      Event no longer available
                    </p>
                  )}
                  {r.event && (
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {formatEventDate(r.event.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {r.event.venue}, {r.event.city}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-lg">
                    {r.event
                      ? r.event.tiers.find((t) => t.name === r.tier)?.price === 0
                        ? "Free"
                        : formatCurrency(
                            r.event.tiers.find((t) => t.name === r.tier)?.price ?? 0,
                          )
                      : "—"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Reserved {relativeTime(r.createdAt)}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
