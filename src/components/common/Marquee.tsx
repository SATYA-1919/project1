/** A continuously scrolling bar. Items are duplicated for a seamless loop. */
export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <div className="marquee border-y border-border bg-muted/40 py-3.5">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center whitespace-nowrap text-[13px] text-muted-foreground">
            <span className="px-6">{item}</span>
            <span className="text-accent" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
