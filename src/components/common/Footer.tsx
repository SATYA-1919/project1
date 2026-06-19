import Link from "next/link";

function FooterCol({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-28 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="space-y-5 md:col-span-5">
            <p className="font-display text-3xl">Convene</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A curated home for tech festivals, hackathons and workshops — the
              events worth showing up for, and an easy way to reserve your spot.
            </p>
          </div>

          <FooterCol
            className="md:col-span-2"
            title="Discover"
            links={[
              { label: "All events", href: "/events" },
              { label: "Hackathons", href: "/events?category=Hackathon" },
              { label: "Conferences", href: "/events?category=Conference" },
              { label: "Workshops", href: "/events?category=Workshop" },
            ]}
          />
          <FooterCol
            className="md:col-span-2"
            title="Account"
            links={[
              { label: "Log in", href: "/login" },
              { label: "Sign up", href: "/register" },
              { label: "My tickets", href: "/my-tickets" },
            ]}
          />
          <FooterCol
            className="md:col-span-3"
            title="Organisers"
            links={[
              { label: "Host an event", href: "/register" },
              { label: "Analytics dashboard", href: "/dashboard" },
              { label: "Click heatmap", href: "/dashboard/analytics/heatmap" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {year} Convene. An independent demo platform.</span>
          <span className="font-mono tracking-tight">Made for the love of live events.</span>
        </div>
      </div>
    </footer>
  );
}
