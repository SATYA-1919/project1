import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listEvents, EVENT_CATEGORIES } from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import { Marquee } from "@/components/common/Marquee";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";

export const dynamic = "force-dynamic";

const VALUE_PROPS = [
  { n: "01", title: "Curated, not crowded", body: "A tight line-up worth your evening — no endless scroll, no noise." },
  { n: "02", title: "Reserve in one tap", body: "Grab a pass the moment you decide; your reservations live in your account." },
  { n: "03", title: "Built for builders", body: "Hackathons, talks and workshops for the people who make things." },
];

export default async function HomePage() {
  const events = await listEvents();
  const carousel = events.slice(0, 5);
  const featured = events.slice(0, 6);
  const marqueeItems = events.map((e) => `${e.title} · ${e.city}`);

  return (
    <main>
      {/* Hero — asymmetric, with interactive featured carousel */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-20 pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28">
        <div className="fade-up">
          <p className="eyebrow mb-5">Tech festivals · hackathons · talks</p>
          <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl lg:text-[5rem]">
            Where tech
            <br />
            communities gather.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-muted-foreground">
            Convene is a curated home for the events worth showing up for. Find your
            next hackathon, conference or workshop — and reserve your spot in seconds.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/events" data-track="hero-browse"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              Browse events <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/register" data-track="hero-signup"
              className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium transition hover:bg-muted">
              Create account
            </Link>
          </div>
        </div>

        <FeaturedCarousel events={carousel} />
      </section>

      {/* Moving marquee bar */}
      <Marquee items={marqueeItems} />

      {/* Featured grid */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-3xl">Happening soon</h2>
          <Link href="/events" className="inline-flex items-center gap-1 text-[13px] text-accent hover:gap-2">
            All events <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((c) => (
            <Link key={c} href={`/events?category=${c}`} data-track={`home-cat-${c}`}
              className="rounded-full border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition hover:border-foreground hover:text-foreground">
              {c}
            </Link>
          ))}
        </div>
        {featured.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No events yet. Run <code className="font-mono">npm run seed</code> to add the line-up.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* Editorial statement */}
      <section className="mx-auto max-w-6xl px-6 pt-24">
        <p className="max-w-3xl text-balance font-display text-3xl leading-snug sm:text-4xl">
          The best events feel less like a transaction and more like an invitation.
          Convene keeps the line-up small, the details sharp, and the reserving instant.
        </p>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-6 pt-16">
        <div className="grid gap-10 border-t border-border pt-12 sm:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <div key={v.n}>
              <p className="font-mono text-[11px] tracking-[0.25em] text-muted-foreground">{v.n}</p>
              <h3 className="mt-3 font-display text-xl">{v.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-6 pt-24">
        <div className="rounded-lg bg-primary px-8 py-16 text-center text-primary-foreground">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Your next great event is one tap away.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] text-primary-foreground/70">
            Create a free account to reserve passes and keep your line-up in one place.
          </p>
          <Link href="/register" data-track="cta-signup"
            className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-background px-6 text-sm font-medium text-foreground transition hover:opacity-90">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
