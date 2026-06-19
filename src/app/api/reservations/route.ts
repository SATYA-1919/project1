import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getEvent } from "@/lib/events";
import { createReservation, listReservations } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const reservations = await listReservations(user.id);
    return NextResponse.json({ reservations });
  } catch (err) {
    console.error("[reservations GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const schema = z.object({ slug: z.string().min(1), tier: z.string().min(1) });

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Please log in to reserve" }, { status: 401 });
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { slug, tier } = parsed.data;
    const event = await getEvent(slug);
    if (!event || !event.tiers.some((t) => t.name === tier)) {
      return NextResponse.json({ error: "Event or pass not found" }, { status: 404 });
    }
    await createReservation(user.id, slug, tier);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[reservations POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
