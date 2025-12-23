import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for MyAIDiary.",
};

export default function PrivacyPage() {
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
            href="/about"
            className="text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            About
          </Link>
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Effective date: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
          <p>
            MyAIDiary is built to be privacy-first. This page describes, at a high level, how we
            handle information when you use the website and the app.
          </p>

          <h2>Information we process</h2>
          <ul>
            <li>
              <strong>Account information</strong> (if you sign in): email address and authentication
              identifiers required to provide access.
            </li>
            <li>
              <strong>Diary content</strong>: notes you create inside the app. Some demo experiences
              may store notes locally in your browser.
            </li>
            <li>
              <strong>Usage data</strong>: basic logs needed to operate and secure the service.
            </li>
          </ul>

          <h2>How we use information</h2>
          <ul>
            <li>Provide the diary experience and core features</li>
            <li>Secure the service and prevent abuse</li>
            <li>Improve product quality and reliability</li>
          </ul>

          <h2>AI features</h2>
          <p>
            AI features (such as summaries, voice, or insights) may process your text/voice inputs
            to generate outputs. Where AI features are labeled as roadmap, they may not be active in
            the current build.
          </p>

          <h2>Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with service
            providers that help us run the product (for example: hosting, authentication, database),
            only as needed to provide the service.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions about privacy, contact: <a href="mailto:founder@Myaidiary.me">founder@Myaidiary.me</a>
          </p>
        </div>
      </div>
    </div>
  );
}
