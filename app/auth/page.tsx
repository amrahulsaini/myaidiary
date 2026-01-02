"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function AuthPage() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Demo mode - just redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-500/10 myaidiary-float" />
        <div className="absolute left-[8%] top-[50%] h-[22rem] w-[22rem] rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10 myaidiary-float" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/60 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <img src="/brand.svg" alt="MyAIDiary" className="h-full w-full" />
          </span>
          <span className="text-base font-semibold tracking-tight">MyAIDiary</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-16 pt-6 lg:grid-cols-2 lg:items-center">
        <section className="myaidiary-fade-up">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to continue
          </h1>
          <p className="mt-4 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Demo mode: Just click any button to access the dashboard. No authentication required.
          </p>
        </section>

        <section className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <div className="grid gap-4">
            <form onSubmit={handleSubmit} className="grid gap-3">
              <p className="text-sm font-semibold">Sign in (Demo)</p>
              <input
                name="email"
                type="email"
                placeholder="Email (demo@myaidiary.me)"
                defaultValue="demo@myaidiary.me"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />
              <input
                name="password"
                type="password"
                placeholder="Password (any text)"
                defaultValue="demo123"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-[1.02] hover:bg-zinc-800 dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200">
                Continue to Dashboard
              </button>
            </form>

            <div className="h-px bg-zinc-200/70 dark:bg-white/10" />

            <form onSubmit={handleSubmit} className="grid gap-3">
              <p className="text-sm font-semibold">Create account (Demo)</p>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="h-11 rounded-2xl border border-zinc-200 bg-white/80 px-4 text-sm outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-black/30 dark:focus:border-white"
              />
              <button type="submit" className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white/70 px-4 text-sm font-semibold text-zinc-950 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10">
                Create (Demo)
              </button>
            </form>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Demo mode active - no real authentication configured. All features are accessible without login.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
