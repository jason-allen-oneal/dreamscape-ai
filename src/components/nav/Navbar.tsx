"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between px-10 py-5 backdrop-blur-xl bg-slate-900/30 border-b border-slate-800/40 shadow-[0_0_20px_rgba(255,0,255,0.05)] sticky top-0 z-30">
      <Link
        href="/"
        className="font-extrabold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-400 to-violet-400 drop-shadow-[0_0_10px_rgba(180,100,255,0.3)] hover:brightness-125 transition"
      >
        Dreamscape AI
      </Link>
      <div className="flex gap-8 text-sm font-medium text-gray-300">
        <Link href="/dreams" className="hover:text-indigo-400 transition-colors">
          Dreams
        </Link>
        <Link href="/world" className="hover:text-fuchsia-400 transition-colors">
          World
        </Link>
        {session ? (
          <>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="text-red-400 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
              Login
            </Link>
            <Link href="/register" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
