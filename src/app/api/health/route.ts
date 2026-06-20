import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Diagnostic endpoint. Open /api/health in the browser to check whether the
// deployment can reach MongoDB. It reports which env vars are present (without
// leaking their values) and the real connection error if there is one — handy
// for debugging "Internal server error" on a host like Vercel.
export async function GET() {
  const env = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    MONGODB_DB: Boolean(process.env.MONGODB_DB),
    AUTH_SECRET: Boolean(process.env.AUTH_SECRET),
  };

  if (!env.MONGODB_URI) {
    return NextResponse.json(
      {
        ok: false,
        env,
        error: "MONGODB_URI is not set in this environment.",
        hint: "Add it in Vercel → Settings → Environment Variables, then redeploy.",
      },
      { status: 500 },
    );
  }

  try {
    const db = await getDb();
    const users = await db.collection("users").countDocuments();
    return NextResponse.json({ ok: true, env, users });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        env,
        error: message,
        hint: /server selection|ETIMEDOUT|ENOTFOUND|querySrv/i.test(message)
          ? "Database unreachable. In MongoDB Atlas → Network Access, allow 0.0.0.0/0 so the host can connect."
          : "Check the MONGODB_URI value (user, password, cluster host).",
      },
      { status: 500 },
    );
  }
}
