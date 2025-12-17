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
                Private daily notes + AI personalization
              </span>
            </div>
            <span className="text-base font-semibold tracking-tight lg:hidden">
              MyAIDiary
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 dark:text-zinc-300 md:flex">
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#features">
              Features
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#ai">
              AI
            </a>
            <a className="transition hover:text-zinc-950 dark:hover:text-white" href="#how">
              How it works
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
              href="/diary"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Open Diary</span>
              <span className="sm:hidden">Diary</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative">
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

            <h1 className="mt-7 text-balance text-5xl font-semibold tracking-tight sm:text-7xl myaidiary-fade-up">
              The diary that helps you{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-fuchsia-300 dark:to-emerald-300">
                understand your days
              </span>
              .
            </h1>

            <p className="mt-6 text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-400 sm:text-xl sm:leading-9 myaidiary-fade-up">
              MyAIDiary is built for daily writing, quick capture, and reflection. Save notes, spot patterns, and (as you opt in) connect email + AI to transform scattered updates into a clean, personalized timeline.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row myaidiary-fade-up">
              <Link
                href="/diary"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200 sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Start writing
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10 sm:w-auto"
              >
                See what it does
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
              Demo build: notes stored locally in your browser. Email + AI features are shown as roadmap (coming soon).
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-3">
            {["Write daily", "Organize instantly", "Reflect calmly"].map(
              (label, idx) => (
                <div
                  key={label}
                  className="myaidiary-fade-up rounded-2xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:bg-white/10"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Clean writing UI with quick actions and lightweight insights — built to keep you in flow.
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="FEATURES"
            title="Daily notes, reminders, and a smarter memory"
            subtitle="A professional foundation for a Google-startup-ready product: privacy-first writing today, and powerful email + AI integrations as you scale."
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
                eyebrow="AI"
                title="Personalization without losing control"
                subtitle="The product story: build trust first (privacy, UX, reliability), then add AI for insights, time management, and reminders as an opt-in upgrade."
              />
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <p className="text-sm font-semibold">AI stack (present + planned)</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Today (demo)
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    On-device lightweight insights (no server required).
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Next (roadmap)
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Server-side LLM integration for summaries, prompts, weekly recaps, and time management suggestions.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    Platforms
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Next.js, React, Tailwind; deployable to Vercel; roadmap-friendly for Google Cloud (OAuth, GCP logging, and optional Vertex AI).
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                Note: this page avoids claiming any model is already integrated.
              </p>
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
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <SectionTitle
            eyebrow="HOW IT WORKS"
            title="Your journey: from writing to personalized AI insights"
            subtitle="A clear path from daily notes to intelligent summaries, email context, and time management—all powered by AI when you're ready."
          />

          <div className="mx-auto mt-12 max-w-6xl">
            <div className="relative">
              {/* Connecting line - vertical on mobile, horizontal on desktop */}
              <div className="absolute left-8 top-16 h-[calc(100%-8rem)] w-0.5 bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-emerald-500 opacity-30 dark:opacity-20 lg:left-0 lg:top-10 lg:h-0.5 lg:w-full" />

              <div className="grid gap-8 lg:grid-cols-5 lg:gap-6">
                {[
                  {
                    step: "01",
                    title: "Write your thoughts",
                    desc: "Daily notes, quick captures, whatever comes to mind. No pressure, no rules.",
                    icon: BookOpen,
                    color: "from-indigo-500/20 to-indigo-500/10",
                  },
                  {
                    step: "02",
                    title: "AI analyzes & summarizes",
                    desc: "Advanced AI reads your entries and creates concise summaries of your week.",
                    icon: Brain,
                    color: "from-fuchsia-500/20 to-fuchsia-500/10",
                  },
                  {
                    step: "03",
                    title: "Connect email",
                    desc: "Link Gmail/Outlook to auto-save important receipts, confirmations, and updates.",
                    icon: Mail,
                    color: "from-purple-500/20 to-purple-500/10",
                  },
                  {
                    step: "04",
                    title: "Get personalized insights",
                    desc: "AI spots patterns, suggests reflection prompts, and highlights what matters.",
                    icon: Sparkles,
                    color: "from-pink-500/20 to-pink-500/10",
                  },
                  {
                    step: "05",
                    title: "Manage your time",
                    desc: "Turn notes into priorities, reminders, and actionable next steps automatically.",
                    icon: Clock,
                    color: "from-emerald-500/20 to-emerald-500/10",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className="myaidiary-fade-up relative flex flex-col items-start gap-4 lg:items-center lg:text-center"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="relative z-10 flex items-center gap-4 lg:flex-col lg:gap-3">
                        <div
                          className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg transition-all duration-300 hover:scale-110 lg:h-20 lg:w-20`}
                        >
                          <Icon className="h-7 w-7 text-indigo-600 transition-transform duration-300 hover:rotate-12 dark:text-indigo-400 lg:h-8 lg:w-8" />
                        </div>

                        <div className="flex-1 lg:flex-none">
                          <div className="mb-1 inline-flex items-center gap-2">
                            <span className="text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400">
                              STEP {item.step}
                            </span>
                            {idx < 4 && (
                              <ArrowRight className="hidden h-3 w-3 text-zinc-400 dark:text-zinc-500 lg:inline" />
                            )}
                          </div>
                          <h3 className="text-base font-semibold leading-tight tracking-tight">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {idx < 4 && (
                        <ArrowRight className="absolute left-8 -bottom-3 h-4 w-4 rotate-90 text-zinc-300 dark:text-zinc-600 lg:hidden" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 rounded-3xl border border-zinc-200 bg-gradient-to-r from-indigo-500/5 via-fuchsia-500/5 to-emerald-500/5 p-6 shadow-lg backdrop-blur dark:border-white/10">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Roadmap transparency</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Steps 2-5 represent our product vision. The current demo (Step 1) works locally without any server. Email + AI features will roll out as opt-in upgrades with clear privacy controls.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none sm:flex-row">
            <div>
              <p className="text-sm font-semibold">Ready to try it?</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Open the diary and create your first entry.
              </p>
            </div>
            <Link
              href="/diary"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <BookOpen className="h-4 w-4" />
              Go to Diary
            </Link>
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
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#ai">
              AI
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#how">
              How it works
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#tech">
              Technology
            </a>
            <a className="hover:text-zinc-950 dark:hover:text-white" href="#contact">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
