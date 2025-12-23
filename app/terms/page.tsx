import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for MyAIDiary.",
};

export default function TermsPage() {
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

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Effective date: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
          <p>
            These Terms govern your use of MyAIDiary. By accessing or using the website and app,
            you agree to these Terms.
          </p>

          <h2>Use of the service</h2>
          <ul>
            <li>You must use the service lawfully and responsibly.</li>
            <li>You are responsible for the content you submit and store.</li>
            <li>Do not attempt to disrupt, reverse engineer, or abuse the service.</li>
          </ul>

          <h2>Accounts</h2>
          <p>
            If you create an account, you are responsible for maintaining access to your account.
            We may suspend accounts for abuse or security reasons.
          </p>

          <h2>AI and generated outputs</h2>
          <p>
            Some features may use AI to generate summaries or insights. Outputs are provided for
            informational purposes and may be inaccurate. They are not medical, legal, or financial
            advice.
          </p>

          <h2>Availability</h2>
          <p>
            The product may change over time, and some features may be experimental or labeled as
            roadmap. We do not guarantee uninterrupted availability.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms: <a href="mailto:founder@Myaidiary.me">founder@Myaidiary.me</a>
          </p>
        </div>
      </div>
    </div>
  );
}
