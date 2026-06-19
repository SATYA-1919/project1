import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { LogoutButton } from "./LogoutButton";

export async function Navbar() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="font-display text-xl tracking-tight">
          Convene
        </Link>
        <nav className="hidden gap-5 text-sm text-muted-foreground sm:flex">
          <Link href="/events" className="hover:text-foreground">
            Events
          </Link>
          {user && (
            <Link href="/my-tickets" className="hover:text-foreground">
              My tickets
            </Link>
          )}
          {user?.role === "organiser" && (
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-[13px] text-muted-foreground sm:inline">
                {user.name}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-md px-3 text-[13px] font-medium hover:bg-muted"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
