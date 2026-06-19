"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function TicketButton({ tier, slug }: { tier: string; slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reserve() {
    setLoading(true);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, tier }),
    });
    setLoading(false);

    if (res.status === 401) {
      toast.info("Log in to reserve a pass");
      router.push(`/login?redirect=/events/${slug}`);
      return;
    }
    if (res.ok) {
      toast.success(`Reserved a ${tier} pass`);
      router.push("/my-tickets");
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Could not reserve");
    }
  }

  return (
    <Button size="sm" data-track={`reserve-${slug}-${tier}`} onClick={reserve} disabled={loading}>
      {loading ? "Reserving…" : "Reserve"}
    </Button>
  );
}
