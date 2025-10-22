"use client";
import { motion } from "framer-motion";
import DreamForm from "@/components/dream/DreamForm";

export default function NewDreamPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#060318] via-[#0a0626] to-[#0e0a3a] text-white px-6 py-10 relative overflow-hidden">
      {/* Optional floating motes or background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[90vw] h-[90vw] top-[-10vw] left-1/2 -translate-x-1/2 
          bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
          from-fuchsia-600/30 via-indigo-800/20 to-transparent blur-[160px] animate-pulse-slowest" />
        <div className="absolute w-[70vw] h-[70vw] bottom-[-20vw] right-1/2 translate-x-1/3 
          bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] 
          from-indigo-700/20 via-violet-800/10 to-transparent blur-[200px] animate-pulse-slower" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="bg-slate-900/60 p-10 rounded-2xl border border-slate-800 backdrop-blur-xl w-full max-w-lg shadow-[0_0_40px_rgba(147,51,234,0.2)]"
      >
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-violet-400 text-center">
          Record a Dream
        </h1>
        <DreamForm />
      </motion.div>
    </main>
  );
}
