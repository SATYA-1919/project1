"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organiser, setOrganiser] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: organiser ? "organiser" : "attendee",
      }),
    });
    setLoading(false);
    if (res.ok) {
      toast.success("Account created");
      router.push(organiser ? "/dashboard" : "/events");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Could not create account");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-6">
      <p className="eyebrow mb-3">Join Convene</p>
      <h1 className="font-display text-4xl mb-8">Create account</h1>
      <Card className="p-6">
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Input placeholder="Full name" value={name} required
            onChange={(e) => setName(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} required
            onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password (min 6 chars)" value={password}
            required minLength={6} onChange={(e) => setPassword(e.target.value)} />
          <label className="flex items-center gap-2 text-[13px] text-muted-foreground select-none">
            <input type="checkbox" checked={organiser}
              onChange={(e) => setOrganiser(e.target.checked)} />
            Register as an organiser (access the analytics dashboard)
          </label>
          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
