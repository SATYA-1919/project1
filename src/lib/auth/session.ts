import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from "./jwt";

/** Read the current session from the cookie (server components / route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireOrganiser(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || user.role !== "organiser") return null;
  return user;
}
