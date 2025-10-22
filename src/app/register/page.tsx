// src/app/register/page.tsx

"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [motes, setMotes] = useState<
    { top: string; left: string; w: number; h: number }[]
  >([]);

  useEffect(() => {
    setMounted(true);
    const newMotes = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      w: Math.random() * 8 + 2,
      h: Math.random() * 8 + 2,
    }));
    setMotes(newMotes);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white relative overflow-hidden">
      {/* Background glow layers */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute w-[90vw] h-[90vw] top-[-10vw] left-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-600/30 via-indigo-800/20 to-transparent blur-[160px] animate-pulse-slowest" />
        <div className="absolute w-[70vw] h-[70vw] bottom-[-20vw] right-1/2 translate-x-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700/20 via-violet-800/10 to-transparent blur-[200px] animate-pulse-slower" />
      </div>

      {/* Floating motes */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {motes.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-fuchsia-400/10 blur-md"
            style={{
              top: m.top,
              left: m.left,
              width: `${m.w}px`,
              height: `${m.h}px`,
            }}
          />
        ))}
      </div>

      {/* Form container with entrance motion */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="bg-slate-900/50 p-10 rounded-2xl border border-slate-700 shadow-lg backdrop-blur-xl w-[400px] relative z-10"
      >
        <h1 className="text-3xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-violet-400">
          Create Your Dreamer
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 150 }}
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 focus:ring-2 focus:ring-fuchsia-500 outline-none"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 150 }}
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 focus:ring-2 focus:ring-fuchsia-500 outline-none"
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400 text-center font-medium"
            >
              {error}
            </motion.p>
          )}
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(147,51,234,0.5)" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 rounded-lg font-semibold transition-all shadow-[0_0_10px_rgba(147,51,234,0.4)] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Register"}
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Already dreaming?{" "}
          <a href="/login" className="text-fuchsia-400 hover:underline">
            Log in
          </a>
        </p>
      </motion.div>
    </main>
  );
}
