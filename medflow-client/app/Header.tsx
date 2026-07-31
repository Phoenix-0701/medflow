// app/Header.tsx
"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-none md:bg-white/80 md:backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 md:dark:bg-black/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-500">
          BKMed AI
        </Link>


        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-white px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 min-h-[40px] flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
