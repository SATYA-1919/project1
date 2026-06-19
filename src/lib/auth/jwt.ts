import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session token helpers (jose only — no node:crypto). */

export const SESSION_COOKIE = "convene_session";

export type Role = "attendee" | "organiser";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

function secret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "convene-dev-secret",
  );
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: payload.role === "organiser" ? "organiser" : "attendee",
    };
  } catch {
    return null;
  }
}
