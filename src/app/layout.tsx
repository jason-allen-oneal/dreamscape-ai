
import "./globals.css";
import { ReactNode } from "react";
import Providers from "@/components/Providers";
import Navbar from "@/components/nav/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Providers>
        <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#060312] via-[#0a0621] to-[#0d0838] text-gray-100 selection:bg-fuchsia-600/30 selection:text-fuchsia-100">
          {/* ✨ Animated atmospheric layers */}
          <div className="absolute inset-0 -z-20">
            {/* Nebular gradients */}
            <div className="absolute w-[120vw] h-[120vw] top-[-10vw] left-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700/30 via-fuchsia-800/20 to-transparent blur-[160px] animate-pulse-slowest" />
            <div className="absolute w-[100vw] h-[100vw] bottom-[-20vw] right-1/2 translate-x-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-blue-700/10 to-transparent blur-[200px] animate-pulse-slower" />
          </div>

          {/* 🫧 Floating dream motes */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-fuchsia-500/10 blur-md animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${12 + Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          {/* 🌫️ Translucent navigation */}
          <Navbar />

          {/* ✍️ Main page content */}
          <main className="relative z-10">{children}</main>

          {/* 🌒 Ambient texture */}
          <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-overlay pointer-events-none -z-10" />
        </body>
      </Providers>
    </html>
  );
}
