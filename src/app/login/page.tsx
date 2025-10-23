"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { SpectralBackdrop } from "@/components/layout/SpectralBackdrop";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (response?.error) {
      setError("The veil rejects these credentials.");
    } else {
      router.replace("/dashboard");
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
            Dreamscape access
          </p>
          <h1 className="text-3xl font-semibold text-white/90">Enter the Field</h1>
          <p className="text-xs text-white/60">
            Authenticate to unlock your private atlas of visions.
          </p>
        </header>

        {error && (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <Input
          label="Dreamer alias"
          placeholder="Your chosen handle"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <Input
          label="Passphrase"
          placeholder="Encrypted memory key"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <div className="flex flex-col gap-4 pt-2">
          <Button type="submit" size="lg" disabled={!username || !password}>
            Log In
          </Button>
          <p className="text-center text-xs text-white/45">
            Need an account?{" "}
            <Link href="/register" className="text-white/80 hover:text-white">
              Become a dreamer
            </Link>
          </p>
        </div>
      </motion.form>
    </main>
  );
}
