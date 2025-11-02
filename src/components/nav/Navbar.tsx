"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav data-site-navbar="" className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 backdrop-blur-2xl border-b border-white/10 bg-black/20">
      <Link
        href="/"
        className="text-lg font-semibold uppercase tracking-[0.45em] text-white/70 transition hover:text-white"
      >
        <h1
  className="title-reflection text-3xl sm:text-4xl font-extrabold tracking-wide select-none"
  data-text="Dreamscape AI"
>
  Dreamscape AI
</h1>

      </Link>
      <div className="flex gap-6 text-xs uppercase tracking-[0.35em] text-white/50">
        <Link href="/dreams" className="transition hover:text-white/80">
          Dreams
        </Link>
        <Link href="/world" className="transition hover:text-white/80">
          World
        </Link>
        {session ? (
          <>
            <Link href="/dashboard" className="transition hover:text-white/80">
              Dashboard
            </Link>
            <button
              onClick={() => signOut()}
              className="text-white/60 transition hover:text-white/80"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="transition hover:text-white/80">
              Login
            </Link>
            <Link href="/register" className="transition hover:text-white/80">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
