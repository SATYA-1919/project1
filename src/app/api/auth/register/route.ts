import { NextResponse } from "next/server";
import { z } from "zod";
import { getUsers } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/password";
import { signSession, SESSION_COOKIE } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(160),
  password: z.string().min(6).max(200),
  role: z.enum(["attendee", "organiser"]).optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid details" }, { status: 400 });
    }
    const { name, email, password, role } = parsed.data;
    const users = await getUsers();

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const insert = await users.insertOne({
      email: email.toLowerCase(),
      name,
      passwordHash: hashPassword(password),
      role: role ?? "attendee",
      createdAt: new Date(),
    });

    const token = await signSession({
      id: insert.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      role: role ?? "attendee",
    });

    const res = NextResponse.json({
      user: { name, email: email.toLowerCase(), role: role ?? "attendee" },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
