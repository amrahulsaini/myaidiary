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
          <h2 className="text-lg font-semibold">Our Team</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Meet the team building MyAIDiary:
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Aishwarya Nayak</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Developer</p>
              </div>
              <a
                href="https://www.linkedin.com/in/aishwarya-nayak-7869b932b/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
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
