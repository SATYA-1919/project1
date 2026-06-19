"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back");
      router.push(params.get("redirect") || "/dashboard");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Login failed");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6">
      <p className="eyebrow mb-3">Welcome back</p>
      <h1 className="font-display text-4xl mb-8">Log in</h1>
      <Card className="p-6">
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Input type="email" placeholder="Email" value={email} required
            onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} required
            onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-[13px] text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
