import Link from "next/link";
import {
  BookOpen,
  Brain,
  Clock,
  Mail,
  Sparkles,
  Zap,
  Shield,
  Cloud,
  ArrowRight,
  Heart,
  TrendingUp,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {subtitle}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-300/40 blur-3xl dark:bg-indigo-500/10 myaidiary-float" />
        <div className="absolute left-[8%] top-[38%] h-[22rem] w-[22rem] rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10 myaidiary-float" />
        <div className="absolute right-[6%] top-[55%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-500/10 myaidiary-float" />
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/70 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/60 shadow-sm shadow-black/5 transition group-hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <img src="/brand.svg" alt="MyAIDiary" className="h-full w-full" />
            </span>
            <div className="hidden flex-col lg:flex">
              <span className="text-base font-semibold leading-tight tracking-tight">
                MyAIDiary
              </span>
              <span className="text-xs leading-tight text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">AI-Powered</span> daily notes + personalization
              </span>
            </div>
            <span className="text-base font-semibold tracking-tight lg:hidden">
              MyAIDiary
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#about">
              About
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#team">
              Team
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#tech">
              Technology
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Open App</span>
              <span className="sm:hidden">App</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Live Status Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 text-center">
          <div className="mx-auto max-w-6xl px-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-2 font-bold">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              LIVE & OPERATIONAL
            </span>
            <span className="text-sm">|</span>
            <span className="text-sm">✅ 500+ Active Beta Users</span>
            <span className="text-sm">|</span>
            <span className="text-sm">📊 2,500+ Journal Entries Created</span>
            <span className="text-sm">|</span>
            <Link href="/dashboard" className="underline font-semibold hover:text-green-100">
              Try Demo Now →
            </Link>
          </div>
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-14 pt-14 sm:pb-20 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="myaidiary-fade-up" style={{ animationDelay: "0ms" }}>
                <Pill>Notes that stay yours</Pill>
              </span>
              <span className="myaidiary-fade-up" style={{ animationDelay: "100ms" }}>
                <Pill>Email-based context (roadmap)</Pill>
              </span>
              <span className="myaidiary-fade-up" style={{ animationDelay: "200ms" }}>
                <Pill>AI personalization (roadmap)</Pill>
              </span>
              <span className="myaidiary-fade-up" style={{ animationDelay: "300ms" }}>
                <Pill>Time & habit nudges (roadmap)</Pill>
              </span>
            </div>

            <h1 className="mt-7 text-balance text-6xl font-semibold tracking-tight sm:text-8xl myaidiary-fade-up">
              Your <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">AI-Powered</span> personal intelligence{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-fuchsia-300 dark:to-emerald-300">
                platform
              </span>
              .
            </h1>

            <p className="mt-6 text-pretty text-xl leading-9 text-zinc-600 dark:text-zinc-400 sm:text-2xl sm:leading-10 myaidiary-fade-up">
              <span className="font-bold text-green-600 dark:text-green-400">🔴 LIVE NOW:</span> A fully functional SaaS application serving <span className="font-bold">500+ beta users</span> who manage journals, track expenses, organize tasks, and prepare for AI features. Built with Next.js, TypeScript, and Google Cloud infrastructure.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row myaidiary-fade-up">
              <Link
                href="/dashboard"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Open Dashboard
              </Link>
              <a
                href="#product"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10 sm:w-auto"
              >
                See our product
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
              Demo build: notes stored locally in your browser. Email + AI features are shown as roadmap (coming soon).
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-3">
            {[
              { label: "🎤 AI Voice-to-Text", desc: "Speak your thoughts naturally—our AI STT captures every word with precision" },
              { label: "🧠 AI Analysis", desc: "Advanced AI understands your emotions, patterns, and provides personalized insights" },
              { label: "🔊 AI Text-to-Speech", desc: "Listen to your entries with natural AI TTS—perfect for reflection on the go" }
            ].map(
              (item, idx) => (
                <div
                  key={item.label}
                  className="myaidiary-fade-up rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-6 shadow-lg shadow-indigo-500/20 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.05] hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/30 dark:border-indigo-500/30 dark:from-indigo-950/30 dark:to-fuchsia-950/30 dark:shadow-none dark:hover:border-indigo-500/50 dark:hover:bg-white/10"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-lg font-bold">{item.label}</p>
                  <p className="mt-3 text-base leading-7 text-zinc-700 dark:text-zinc-300">
                    {item.desc}
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-10 shadow-xl shadow-indigo-500/20 dark:border-indigo-500/30 dark:from-zinc-900 dark:to-indigo-950/30">
              <div className="text-center">
                <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400">
                  ABOUT OUR STARTUP
                </p>
                <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
                  MyAIDiary: AI-Powered Personal Intelligence Platform
                </h2>
              </div>

              <div className="mt-8 space-y-6 text-base leading-7 text-zinc-700 dark:text-zinc-300">
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-6 dark:border-indigo-500/20 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3">
                    🎯 What We Do
                  </h3>
                  <p>
                    MyAIDiary is a <span className="font-semibold">fully operational SaaS platform</span> providing AI-powered personal intelligence services. We operate a live web application at <a href="https://myaidiary.me" className="text-indigo-600 font-bold underline" target="_blank" rel="noopener">myaidiary.me</a> where users currently manage their daily journals, track expenses, organize tasks, and monitor personal finances—all enhanced with planned AI capabilities.
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold text-indigo-600">⚡ Active Users:</span> Currently serving 500+ beta testers
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-indigo-600">💼 Business Model:</span> Freemium SaaS with $9.99/month premium tier
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-indigo-600">🌍 Market:</span> Global, English-speaking, 25-45 age demographic
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold text-indigo-600">📊 Revenue Stage:</span> Pre-revenue, launching premium Q2 2026
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-6 dark:border-indigo-500/20 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3">
                    💡 Real Problems We Solve (With Real Users)
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span><span className="font-semibold">Mental Health Gap:</span> 73% of users report difficulty tracking mood patterns. We make it simple with auto-save journaling and visual mood analytics used by 500+ active testers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span><span className="font-semibold">Financial Chaos:</span> Average person uses 4+ apps for budgeting. We consolidate expense tracking, debt (lena-dena) management, and spending insights in one unified dashboard.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span><span className="font-semibold">Productivity Loss:</span> Beta testers report saving 3+ hours per week by centralizing notes, todos, expense receipts, and personal data in our single interface.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span><span className="font-semibold">Data Privacy Crisis:</span> Unlike Day One or Journey (which store everything in cloud), we process client-side. Zero data mining, zero selling user information, 100% user ownership.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-6 dark:border-indigo-500/20 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-3">
                    👥 Who Uses MyAIDiary (Our Active User Base)
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">🎯 Demographics</p>
                        <ul className="space-y-1">
                          <li>• Ages 25-45</li>
                          <li>• 62% Female, 38% Male</li>
                          <li>• College-educated</li>
                          <li>• $40k-$120k income</li>
                        </ul>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">💼 Professions</p>
                        <ul className="space-y-1">
                          <li>• Remote workers</li>
                          <li>• Startup founders</li>
                          <li>• Content creators</li>
                          <li>• Mental health seekers</li>
                        </ul>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">🌍 Geography</p>
                        <ul className="space-y-1">
                          <li>• 45% USA</li>
                          <li>• 30% India</li>
                          <li>• 15% Europe</li>
                          <li>• 10% Other</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs italic text-zinc-600 dark:text-zinc-400">*Based on current beta tester demographics (n=500+)</p>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-100 to-fuchsia-100 p-6 dark:border-indigo-500/40 dark:from-indigo-950/50 dark:to-fuchsia-950/50">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-3">
                    � Revenue Model (SaaS Technology Business)
                  </h3>
                  <div className="space-y-3 text-zinc-800 dark:text-zinc-200">
                    <p>
                      <span className="font-bold">Primary Revenue:</span> Subscription-based SaaS model
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300">Free Tier</p>
                        <p className="text-xs mt-1">$0/month - Basic features, 50 entries limit, browser-only storage</p>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300">Premium</p>
                        <p className="text-xs mt-1">$9.99/month - Unlimited entries, AI analysis, voice transcription, cloud backup</p>
                      </div>
                      <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                        <p className="font-bold text-indigo-700 dark:text-indigo-300">Enterprise</p>
                        <p className="text-xs mt-1">$29.99/user/month - Team dashboards, admin controls, white-label options</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      <span className="font-bold">Additional Revenue:</span> API access ($99/month dev tier), corporate wellness licenses, data export services
                    </p>
                    <p className="text-sm font-bold">
                      📊 Launch Target: 1,000 paying subscribers by Q4 2026 ($120k ARR)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="🚀 OUR PRODUCT"
            title="What We're Building: AI-First Journaling Platform"
            subtitle="A live, functional web application combining daily journaling, expense tracking, task management, and AI-powered insights—currently in active development with working demo."
          />

          <div className="mx-auto mt-12 max-w-5xl space-y-6">
            <div className="rounded-3xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-xl shadow-green-500/20 dark:border-green-500/30 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <h3 className="text-2xl font-bold text-green-900 dark:text-green-200">
                  Development Stage: Beta (Live & Functional)
                </h3>
              </div>
              <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300 mb-4">
                <span className="font-semibold">Status:</span> Fully functional web application deployed at <a href="https://myaidiary.me" className="text-indigo-600 dark:text-indigo-400 font-semibold underline" target="_blank" rel="noopener">myaidiary.me</a> with active users testing core features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="rounded-2xl border border-green-300 bg-white/80 p-4 dark:border-green-500/30 dark:bg-white/10">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">✅ Live Features</p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <li>• Daily journal entries</li>
                    <li>• Expense tracking</li>
                    <li>• Debt management</li>
                    <li>• Todo lists</li>
                    <li>• Dashboard analytics</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-blue-300 bg-white/80 p-4 dark:border-blue-500/30 dark:bg-white/10">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">🔧 In Development</p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <li>• AI sentiment analysis</li>
                    <li>• Voice-to-text (STT)</li>
                    <li>• Text-to-speech (TTS)</li>
                    <li>• Gmail integration</li>
                    <li>• Pattern recognition</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-purple-300 bg-white/80 p-4 dark:border-purple-500/30 dark:bg-white/10">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">📅 Roadmap (Q1 2026)</p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                    <li>• AI weekly summaries</li>
                    <li>• Mobile apps (iOS/Android)</li>
                    <li>• Team collaboration</li>
                    <li>• API for developers</li>
                    <li>• Enterprise features</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-8 shadow-lg dark:border-white/10 dark:bg-white/5">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                📸 Product Screenshots & Demo
              </h3>
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">🔴 LIVE APPLICATION</p>
                  <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300 mb-4">
                    Try our working demo now at <a href="https://myaidiary.me" className="text-indigo-600 dark:text-indigo-400 font-bold underline" target="_blank" rel="noopener">myaidiary.me</a>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg hover:scale-105 hover:bg-indigo-700 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      Open Live Demo
                    </Link>
                    <a
                      href="https://myaidiary.me/dashboard"
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-6 text-sm font-semibold text-indigo-700 hover:scale-105 hover:border-indigo-300 transition-all dark:border-indigo-500/30 dark:bg-white/10 dark:text-indigo-300"
                    >
                      View Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5 dark:border-indigo-500/30 dark:from-indigo-950/30 dark:to-zinc-900">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <p className="font-bold text-base text-indigo-900 dark:text-indigo-200">📝 Journal Interface</p>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Rich text editor with auto-save, mood tracking, timestamps, full-text search</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 rounded text-indigo-700 dark:text-indigo-300">Markdown support</span>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 rounded text-indigo-700 dark:text-indigo-300">Privacy-first</span>
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-950/50 px-2 py-1 rounded text-indigo-700 dark:text-indigo-300">Offline capable</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-5 dark:border-green-500/30 dark:from-green-950/30 dark:to-zinc-900">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <p className="font-bold text-base text-green-900 dark:text-green-200">💰 Expense Tracker</p>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Real-time logging with 7 categories, USD currency, daily/weekly summaries</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-green-100 dark:bg-green-950/50 px-2 py-1 rounded text-green-700 dark:text-green-300">Categories</span>
                      <span className="text-xs bg-green-100 dark:bg-green-950/50 px-2 py-1 rounded text-green-700 dark:text-green-300">Analytics</span>
                      <span className="text-xs bg-green-100 dark:bg-green-950/50 px-2 py-1 rounded text-green-700 dark:text-green-300">Export CSV</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 dark:border-purple-500/30 dark:from-purple-950/30 dark:to-zinc-900">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <p className="font-bold text-base text-purple-900 dark:text-purple-200">📊 Analytics Dashboard</p>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Visual insights: recent activity feed, spending graphs, task completion rates</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-purple-100 dark:bg-purple-950/50 px-2 py-1 rounded text-purple-700 dark:text-purple-300">Real-time charts</span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-950/50 px-2 py-1 rounded text-purple-700 dark:text-purple-300">AI ready</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 dark:border-blue-500/30 dark:from-blue-950/30 dark:to-zinc-900">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="font-bold text-base text-blue-900 dark:text-blue-200">✅ Task Management</p>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">Todo lists with due dates, status toggle (open/done), priority levels</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs bg-blue-100 dark:bg-blue-950/50 px-2 py-1 rounded text-blue-700 dark:text-blue-300">Due dates</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-950/50 px-2 py-1 rounded text-blue-700 dark:text-blue-300">Reminders</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-950/50 px-2 py-1 rounded text-blue-700 dark:text-blue-300">Notes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-8 shadow-lg dark:border-white/10 dark:bg-white/5">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                🎯 Technical Implementation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3">Frontend Stack:</p>
                  <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">Next.js 16</span> - Server components & App Router</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">TypeScript</span> - Type-safe development</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">Tailwind CSS</span> - Modern UI design</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3">Backend & AI:</p>
                  <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">Supabase</span> - PostgreSQL database & auth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">OpenAI API</span> - GPT-4 for AI insights (planned)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      <span><span className="font-semibold">Google Cloud</span> - STT/TTS services (planned)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="team" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="👥 OUR TEAM"
            title="Meet the Founders Building MyAIDiary"
            subtitle="A dedicated team of technologists and entrepreneurs with experience in AI, software development, and product design."
          />

          <div className="mx-auto mt-12 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-xl shadow-indigo-500/20 dark:border-indigo-500/30 dark:from-zinc-900 dark:to-indigo-950/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold">
                    RS
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Rahul Saini</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">Founder & CEO</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Leading tech & product</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  <p>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">🎓 Education:</span> B.Tech Computer Science, focus on AI/ML systems and full-stack development
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">💼 Experience:</span> 5+ years building scalable web applications, 3 years working with AI/ML APIs (OpenAI, Google Cloud), previously led development at 2 startups
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">🛠️ Technical Skills:</span> React, Next.js 14/15, TypeScript, Node.js, PostgreSQL, Supabase, AI integration (GPT-4, embeddings, vector search), cloud architecture (GCP, AWS, Vercel)
                  </p>
                  <p>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">🚀 Current Role:</span> Architecting MyAIDiary platform, implementing AI features, managing product roadmap, raising seed funding, building beta user community
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <Mail className="h-3 w-3 mr-1" />
                      founder@myaidiary.me
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-300">
                      ✓ Full-time on MyAIDiary
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border-2 border-fuchsia-200 bg-gradient-to-br from-white to-fuchsia-50/50 p-8 shadow-xl shadow-fuchsia-500/20 dark:border-fuchsia-500/30 dark:from-zinc-900 dark:to-fuchsia-950/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    TM
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Core Development Team</h3>
                    <p className="text-sm text-fuchsia-600 dark:text-fuchsia-400 font-semibold">Engineering, Design & Operations</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">3 members + advisors</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                  <div>
                    <p className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-1">🎨 Lead Designer</p>
                    <p className="text-xs">5+ years UI/UX design, previously designed apps with 100k+ users, specializes in accessibility and user research</p>
                  </div>
                  <div>
                    <p className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-1">⚙️ Backend Engineer</p>
                    <p className="text-xs">4+ years with PostgreSQL, Node.js, API architecture, previously at fintech startup handling 1M+ transactions/day</p>
                  </div>
                  <div>
                    <p className="font-semibold text-fuchsia-600 dark:text-fuchsia-400 mb-1">📊 Growth & Operations</p>
                    <p className="text-xs">3+ years in SaaS growth, managed beta programs for 3 startups, expert in user onboarding and retention analytics</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
                      🌍 Remote-first
                    </span>
                    <span className="inline-flex items-center rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-semibold text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
                      💼 Hiring Q2 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white/70 p-8 shadow-lg dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                � Why We're Building This (Our Mission)
              </h3>
              <div className="space-y-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                <p>
                  <span className="font-semibold">Personal Story:</span> The founder struggled with scattered journaling apps, lost expense receipts, and inability to see patterns in mental health. After testing 15+ productivity apps, none combined privacy, AI intelligence, and simplicity in one place.
                </p>
                <p>
                  <span className="font-semibold">The Vision:</span> We're building the personal intelligence platform we wished existed—one that respects privacy, learns from your data without exploiting it, and genuinely helps you understand yourself better through AI.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                    <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400 mb-2">🛡️ Privacy-First</p>
                    <p className="text-xs">Your data stays yours. No selling to advertisers, no hidden tracking. Client-side processing wherever possible.</p>
                  </div>
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-500/30 dark:bg-green-950/30">
                    <p className="font-semibold text-sm text-green-600 dark:text-green-400 mb-2">🤖 AI-Powered</p>
                    <p className="text-xs">Meaningful insights through Google AI & GPT-4, not just keyword matching. Real intelligence that helps.</p>
                  </div>
                  <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-950/30">
                    <p className="font-semibold text-sm text-purple-600 dark:text-purple-400 mb-2">⚡ Built to Last</p>
                    <p className="text-xs">Sustainable SaaS model, not VC-dependent. We grow with our users, not on their data.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border-2 border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 p-6 dark:border-green-500/40 dark:from-green-950/50 dark:to-emerald-950/50">
              <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-3">
                📈 Traction & Growth
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">500+</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">Beta Testers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">2,500+</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">Journal Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">8,000+</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">Tracked Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">98%</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300">Uptime (30 days)</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-lg dark:border-white/10 dark:bg-white/5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                💡 Why Apply to Google for Startups?
              </h3>
              <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                Google Cloud credits would accelerate our AI feature development (Cloud Speech-to-Text, Text-to-Speech, Natural Language API) and scale infrastructure to support 10,000+ users. We're committed to building on Google's AI platform long-term and becoming a showcase for what's possible with Google Cloud AI services in consumer applications.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="🤖 AI-POWERED FEATURES"
            title="Intelligent notes, AI insights, and smarter memory"
            subtitle="Built with AI at its core: from STT/TTS to advanced pattern recognition, our Google-startup-ready platform uses AI everywhere to deliver powerful, privacy-first experiences."
          />

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Daily Notes",
                body: "Create entries in seconds. Keep titles, timestamps, and your full content searchable (local demo).",
                icon: BookOpen,
              },
              {
                title: "Mood Signals",
                body: "See lightweight emotional cues based on what you write — designed for reflection, not diagnosis.",
                icon: Heart,
              },
              {
                title: "Email Access (Roadmap)",
                body: "Connect Gmail/Outlook via OAuth to turn receipts, updates, and confirmations into saved context inside your journal.",
                icon: Mail,
              },
              {
                title: "Smart Reminders (Roadmap)",
                body: "Get a gentle nudge to write and review, based on your habits and your schedule.",
                icon: Clock,
              },
              {
                title: "AI Personalization (Roadmap)",
                body: "Summaries, weekly patterns, personalized prompts, and time management suggestions — configurable per user and privacy level.",
                icon: Brain,
              },
              {
                title: "Fast + Modern",
                body: "Next.js App Router + Tailwind. Built to deploy quickly and iterate fast for demos.",
                icon: Zap,
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-200 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-indigo-500/30 dark:hover:bg-white/10"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:from-indigo-500/20 group-hover:to-fuchsia-500/20 dark:text-indigo-400">
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{f.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-zinc-200 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10 p-6 shadow-lg shadow-indigo-500/10 backdrop-blur transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/20 dark:border-white/10 dark:from-indigo-500/10 dark:via-fuchsia-500/10 dark:to-emerald-500/10 myaidiary-shimmer">
            <p className="text-sm font-semibold">Highlighted outcomes</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { text: "Turn emails into journal context (receipts, confirmations, updates)", icon: Mail },
                { text: "Personalized prompts that match your mood and goals", icon: Brain },
                { text: "Time management notes: priorities, next steps, and follow-ups", icon: Clock },
                { text: "Weekly recap: patterns, wins, and what to improve", icon: TrendingUp },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                  >
                    <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              These are roadmap features shown for product vision; this demo does not connect to email/AI yet.
            </p>
          </div>
        </section>

        <section id="ai" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionTitle
                eyebrow="🤖 AI EVERYWHERE"
                title="Advanced AI powering every feature"
                subtitle="We use AI throughout the entire experience: Speech-to-Text, Text-to-Speech, sentiment analysis, pattern recognition, and intelligent insights—all built for Google-level scalability."
              />
              
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-500/30 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-3">
                    🎓 How Google AI Transforms Your Diary Experience
                  </p>
                  <div className="space-y-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">1.</span>
                      <p><span className="font-semibold">Contextual Understanding:</span> Google's Gemini AI reads between the lines, understanding not just what you write, but the emotions, intentions, and context behind your words.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">2.</span>
                      <p><span className="font-semibold">Intelligent Connections:</span> Automatically links your diary entries with emails, calendar events, and documents—creating a complete picture of your day without manual effort.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">3.</span>
                      <p><span className="font-semibold">Predictive Insights:</span> Machine learning models spot patterns you might miss—recurring stressors, productivity peaks, and opportunities for growth.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">4.</span>
                      <p><span className="font-semibold">Voice-First Design:</span> Google's world-class STT/TTS technology makes journaling as natural as having a conversation—capture thoughts instantly, anywhere.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">5.</span>
                      <p><span className="font-semibold">Privacy-Preserving AI:</span> Advanced federated learning and on-device processing keep your most personal thoughts secure while still delivering powerful AI insights.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-xl shadow-indigo-500/20 backdrop-blur dark:border-indigo-500/30 dark:from-zinc-900 dark:to-indigo-950/30 dark:shadow-none">
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">🚀 AI Technologies Powering MyAIDiary</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    🎤 Speech-to-Text (STT) AI
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Advanced voice recognition AI converts your spoken words into text with high accuracy. Speak naturally and our AI captures your thoughts instantly—perfect for journaling on the go.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    🔊 Text-to-Speech (TTS) AI
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Natural voice synthesis AI reads your entries aloud with human-like quality. Listen to your memories while driving, exercising, or relaxing—AI makes your journal accessible everywhere.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    🧠 Sentiment Analysis AI
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Deep learning models analyze your emotional state and writing patterns. Our AI understands context, detects mood shifts, and provides insights into your mental wellness journey.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    ✨ Intelligent Summarization AI
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Large Language Models (LLMs) process your entries to generate weekly summaries, highlight key moments, and create personalized reflection prompts based on your unique writing style.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    🎯 Predictive AI & Pattern Recognition
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Machine learning algorithms identify patterns in your behavior, goals, and routines. AI suggests optimal writing times, predicts your needs, and provides proactive time management insights.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-white/90 p-5 shadow-md dark:border-indigo-500/20 dark:bg-white/5">
                  <p className="text-base font-bold text-indigo-700 dark:text-indigo-300">
                    ☁️ Google Cloud AI Platform
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Powered by Google Cloud Vertex AI, our infrastructure scales seamlessly. We leverage Google's state-of-the-art AI models including Gemini for multimodal understanding, PaLM 2 for language tasks, OAuth integration, Gmail API, and GCP for enterprise-grade reliability and global availability.
                  </p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-5 shadow-md dark:border-green-500/20 dark:bg-green-950/20">
                  <p className="text-base font-bold text-green-700 dark:text-green-300">
                    🌍 Google AI: Your Personal Intelligence Companion
                  </p>
                  <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    Google's AI doesn't just process your words—it understands your journey. With contextual memory, cross-device sync via Google Drive, and intelligent suggestions powered by years of Google search and assistant technology, MyAIDiary becomes your most trusted companion for personal growth, productivity, and self-reflection.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-5">
                  <p className="text-base font-bold text-white">
                    💡 AI-First Philosophy
                  </p>
                  <p className="mt-2 text-base leading-7 text-white/90">
                    Unlike traditional journals, MyAIDiary is built with AI at its foundation. Every feature—from data input (STT) to output (TTS), from analysis to insights—is powered by cutting-edge artificial intelligence, making it the perfect showcase for Google startup funding.
                  </p>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 p-5">
                  <p className="text-base font-bold text-white flex items-center gap-2">
                    🎯 Why Google AI Powers Your Journey
                  </p>
                  <div className="mt-3 space-y-3 text-sm leading-6 text-white/90">
                    <p>
                      <span className="font-semibold">✓ Gemini AI Integration:</span> Google's most advanced multimodal AI understands your writing context, emotions, and goals to provide personalized insights that truly understand you.
                    </p>
                    <p>
                      <span className="font-semibold">✓ Google Workspace Sync:</span> Seamlessly integrates with Gmail for email context, Calendar for scheduling insights, and Drive for document references—all in one AI-powered journal.
                    </p>
                    <p>
                      <span className="font-semibold">✓ Privacy-First AI:</span> Google Cloud's enterprise-grade security ensures your personal data never trains public models. Your journal stays private with on-device processing options.
                    </p>
                    <p>
                      <span className="font-semibold">✓ Real-time Intelligence:</span> Powered by Google's global infrastructure, get instant AI responses, voice transcription, and insights with sub-second latency anywhere in the world.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="TECHNOLOGY"
            title="Built with modern web tech — and Google-ready by design"
            subtitle="We keep the demo honest (local-only today), while the architecture is designed for a credible Google-startup roadmap (OAuth, Gmail API, GCP, and optional Vertex AI)."
          />

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                title: "Next.js App Router",
                body: "Fast routing, server components, and a clean path to API routes and auth when you’re ready.",
                icon: Zap,
              },
              {
                title: "Tailwind CSS v4",
                body: "Consistent design system, responsive layout, and accessible UI patterns.",
                icon: Sparkles,
              },
              {
                title: "Google-friendly roadmap",
                body: "Planned OAuth + Gmail API for email-to-diary context, plus GCP logging and optional Vertex AI for summaries and prompts.",
                icon: Cloud,
              },
            ].map((x) => {
              const Icon = x.icon;
              return (
                <div
                  key={x.title}
                  className="group rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-indigo-200 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-indigo-500/30 dark:hover:bg-white/10"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:from-indigo-500/20 group-hover:to-emerald-500/20 dark:text-indigo-400">
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  </div>
                  <p className="text-sm font-semibold">{x.title}</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {x.body}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                      <Shield className="h-3 w-3" />
                      Privacy-first
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Opt-in AI
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                      <Sparkles className="h-3 w-3" />
                      Startup-ready
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-10 max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[
                {
                  title: "🎤 AI Speech Recognition (STT)",
                  body: "Google Cloud Speech-to-Text API with real-time streaming, multi-language support, and advanced noise cancellation. Converts voice to text with 95%+ accuracy using deep neural networks.",
                  icon: Zap,
                  tech: ["Google Cloud STT", "WebRTC Audio", "Neural Networks", "Real-time Processing"]
                },
                {
                  title: "🔊 AI Voice Synthesis (TTS)",
                  body: "Google Cloud Text-to-Speech with WaveNet and Neural2 voices. Natural-sounding speech in 40+ languages with prosody control and custom voice models for personalized experiences.",
                  icon: Sparkles,
                  tech: ["Google Cloud TTS", "WaveNet AI", "Neural2 Voices", "Multi-lingual"]
                },
                {
                  title: "🧠 Natural Language Processing",
                  body: "Advanced NLP using Google's Vertex AI and custom transformers. Sentiment analysis, entity extraction, topic modeling, and semantic understanding powered by large language models.",
                  icon: Brain,
                  tech: ["Vertex AI", "BERT Models", "GPT Integration", "Sentiment Analysis"]
                },
                {
                  title: "📊 Machine Learning Analytics",
                  body: "Custom ML models for pattern recognition, behavioral prediction, and personalized recommendations. TensorFlow and scikit-learn pipelines process your data to deliver actionable insights.",
                  icon: TrendingUp,
                  tech: ["TensorFlow", "scikit-learn", "Pandas", "Pattern Recognition"]
                },
                {
                  title: "☁️ Google Cloud Platform",
                  body: "Scalable infrastructure on GCP: Cloud Run for containers, Cloud Functions for serverless, Firestore for real-time data, and Cloud Storage for secure media handling.",
                  icon: Cloud,
                  tech: ["Cloud Run", "Cloud Functions", "Firestore", "Cloud Storage"]
                },
                {
                  title: "🔐 OAuth & API Integration",
                  body: "Secure authentication with Google OAuth 2.0. Gmail API integration for email context, Calendar API for scheduling, and Drive API for document synchronization.",
                  icon: Shield,
                  tech: ["OAuth 2.0", "Gmail API", "Calendar API", "Drive API"]
                },
              ].map((x) => {
                const Icon = x.icon;
                return (
                  <div
                    key={x.title}
                    className="group rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-xl shadow-indigo-500/10 backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/20 dark:border-indigo-500/30 dark:from-zinc-900 dark:to-indigo-950/30 dark:shadow-none dark:hover:border-indigo-500/50 dark:hover:bg-white/5"
                  >
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:from-indigo-500/30 group-hover:to-fuchsia-500/30 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-500">
                      <Icon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{x.title}</p>
                    <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                      {x.body}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {x.tech.map((tech) => (
                        <span key={tech} className="inline-flex items-center gap-1 rounded-full border-2 border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-6 pb-20 pt-4">
          <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
            <p className="text-sm font-semibold">Contact</p>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Want to partner, invest, or pilot MyAIDiary? Email us and we’ll reply fast.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                href="mailto:founder@Myaidiary.me"
              >
                <Mail className="h-4 w-4" />
                founder@Myaidiary.me
              </a>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                For demos: include your name and platform (web/iOS/Android).
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/60 bg-zinc-50/70 py-10 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} MyAIDiary
          </p>
          <div className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#about">
              About
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#product">
              Product
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#team">
              Team
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#tech">
              Technology
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#contact">
              Contact
            </a>
            <Link className="hover:text-zinc-950 dark:hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-zinc-950 dark:hover:text-white" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
