"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      router.replace("/login");
    } else {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Registration failed.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-white">
      <SpectralBackdrop className="opacity-80" />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md space-y-6 rounded-[32px] border border-white/12 bg-white/6 px-8 py-10 backdrop-blur"
      >
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            Become a dreamer
          </p>
          <h1 className="text-3xl font-semibold text-white/90">
            Create Your Sigil
          </h1>
          <p className="text-xs text-white/60">
            Choose a handle and passphrase to anchor your dreams in the atlas.
          </p>
        </header>

        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <Input
          label="Dreamer alias"
          placeholder="Unique identifier"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <Input
          label="Passphrase"
          placeholder="Secret key"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-col gap-4 pt-2">
          <Button type="submit" size="lg" disabled={loading || !username || !password}>
            {loading ? "Creating..." : "Register"}
          </Button>
          <p className="text-center text-xs text-white/45">
            Already mapped a dream?{" "}
            <Link href="/login" className="text-white/80 hover:text-white">
              Log in
            </Link>
          </p>
        </div>
      </motion.form>
    </main>
  );
}
