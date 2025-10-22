
// src/app/login/page.tsx

"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [motes, setMotes] = useState<{ top: string; left: string; w: number; h: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Generate motes client-side only
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
    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-[#050218] via-[#0a0522] to-[#0e0a3a] text-white">
      {/* Nebula gradient backdrop */}
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
              animate={{ opacity: [0.1, 0.5, 0.1] }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
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

      {/* Login form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 50 }}
        animate={mounted ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative bg-slate-900/50 p-10 rounded-2xl border border-slate-700 shadow-[0_0_30px_rgba(147,51,234,0.2)] backdrop-blur-xl w-full max-w-md"
      >
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-indigo-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(180,100,255,0.3)]">
          Enter Dreamscape
        </h1>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-600/20 border border-red-500 rounded p-2 mb-4 text-red-300 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <label className="block mb-2 text-sm text-gray-300">Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 focus:ring-2 focus:ring-fuchsia-500 outline-none"
        />

        <label className="block mb-2 text-sm text-gray-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}

          className="w-full mb-6 p-3 rounded-lg bg-slate-800 text-gray-200 border border-slate-700 focus:ring-2 focus:ring-fuchsia-500 outline-none"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(147,51,234,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 font-semibold transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)]"
        >
          Log In
        </motion.button>

        <p className="text-xs text-center mt-6 text-gray-400">
          By continuing, you agree to the{" "}
          <span className="text-fuchsia-400">Dreamscape Terms of Use</span>.
        </p>
      </motion.form>

      {/* Ambient glow */}
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-br from-fuchsia-500/10 to-indigo-400/5 blur-[120px] rounded-full mix-blend-screen -z-10"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 20, -20, 0],
          opacity: [0.4, 0.7, 0.5, 0.4],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </main>
  );
}
