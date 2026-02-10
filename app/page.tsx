import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/70 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/60 shadow-sm shadow-black/5 transition group-hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <img src="/brand.svg" alt="MyAIDiary" className="h-full w-full" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              MyAIDiary
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Demo
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <BookOpen className="h-4 w-4" />
              Open App
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-4xl px-6 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
              Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                AI-Powered
              </span>{" "}
              personal diary
            </h1>

            <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl">
              Capture your thoughts, track expenses, manage tasks, and get AI-powered insights—all in one place.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Get Started Free
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
              >
                Request Demo
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="font-semibold mb-2">Voice to Text</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Speak naturally and let AI transcribe your thoughts
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold mb-2">AI Insights</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Discover patterns and get personalized recommendations
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Privacy First</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your data stays yours, stored securely and privately
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-200 bg-white py-16 dark:border-white/10 dark:bg-zinc-950">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need in one app
            </h2>
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 text-left sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/5 dark:bg-white/5">
                <h3 className="font-semibold">📝 Daily Journaling</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Write and organize your thoughts with rich text editing
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/5 dark:bg-white/5">
                <h3 className="font-semibold">💰 Expense Tracking</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Monitor spending and manage your budget effectively
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/5 dark:bg-white/5">
                <h3 className="font-semibold">✅ Task Management</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Keep track of todos and stay organized
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-white/5 dark:bg-white/5">
                <h3 className="font-semibold">📊 Analytics Dashboard</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Visualize your progress and patterns over time
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to get started?
            </h2>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
              Join hundreds of users already using MyAIDiary
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-8 text-sm font-semibold text-white shadow-lg transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:w-auto"
              >
                Open Dashboard
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-zinc-50 py-10 dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              © 2026 MyAIDiary. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/about" className="hover:text-zinc-950 dark:hover:text-white">
                About
              </Link>
              <Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-zinc-950 dark:hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
