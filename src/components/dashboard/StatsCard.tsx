import type { ReactNode } from "react";
import { Card } from "@/components/ui/primitives";

export function StatsCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="mt-4 font-display text-4xl leading-none">{value}</p>
      {delta && (
        <p className="mt-3 truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {delta}
        </p>
      )}
    </Card>
  );
}
