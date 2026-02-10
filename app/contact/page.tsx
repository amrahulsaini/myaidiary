import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Demo",
  description: "Request a demo of MyAIDiary.",
};

export default function ContactPage() {
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

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">Demo Request</h1>
        <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Experience MyAIDiary's powerful features.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold">Features</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            <li>AI-powered voice input (speech-to-text)</li>
            <li>Text-to-speech listening</li>
            <li>Smart pattern insights</li>
            <li>Privacy-first design</li>
            <li>Multi-device sync</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <h2 className="text-lg font-semibold mb-4">Request a Demo</h2>
          <a
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="mailto:founder@Myaidiary.me"
          >
            <Mail className="h-4 w-4" />
            founder@Myaidiary.me
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="hover:text-zinc-950 dark:hover:text-white" href="/about">
            About
          </Link>
          <Link className="hover:text-zinc-950 dark:hover:text-white" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-zinc-950 dark:hover:text-white" href="/terms">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
