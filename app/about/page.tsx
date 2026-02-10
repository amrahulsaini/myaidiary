import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about MyAIDiary — a privacy-first diary app with AI-powered voice and insights.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            ← Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Open App
          </Link>
        </div>

        <h1 className="mt-10 text-balance text-4xl font-semibold tracking-tight">
          About MyAIDiary
        </h1>
        <p className="mt-4 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          MyAIDiary is a privacy-first diary app designed to help people capture daily notes and
          reflect on patterns over time. The product is being built with AI at its core, including
          voice input (speech-to-text), listening (text-to-speech), and insights (pattern summaries).
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold">What you can do today</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <li>Create and manage diary notes</li>
            <li>Use the app as a personal journaling workspace (demo experience)</li>
            <li>Explore UI for planned AI features (shown as roadmap where applicable)</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold">Roadmap (in progress)</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <li>AI personalization and prompts</li>
            <li>Email-based context and reminders (opt-in)</li>
            <li>Cloud sync and multi-device access (privacy controls)</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            For partnerships, pilots, or investment conversations, email:
          </p>
          <a
            href="mailto:founder@Myaidiary.me"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            founder@Myaidiary.me
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="hover:text-zinc-950 dark:hover:text-white" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-zinc-950 dark:hover:text-white" href="/terms">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
