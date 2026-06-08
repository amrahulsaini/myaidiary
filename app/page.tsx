import Link from "next/link";
import { BookOpen, Sparkles, LineChart, MessageCircleHeart, Lock, Mic } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  { icon: Sparkles, title: "AI summary & title", body: "Write freely — AI distils each entry into a tidy summary and a title." },
  { icon: LineChart, title: "Mood timeline", body: "Every entry is read for emotion, charted so you can see how you've been." },
  { icon: BookOpen, title: "Daily prompts", body: "Never face a blank page — gentle, personalised questions to get you going." },
  { icon: MessageCircleHeart, title: "Chat with your journal", body: "Ask anything about your past — answers grounded in your own entries." },
  { icon: Mic, title: "Voice journaling", body: "Speak your day; we transcribe and tidy it up. (coming soon)" },
  { icon: Lock, title: "Private by design", body: "Your words are yours. Strong isolation, export anytime, delete anytime." },
];

const steps = [
  ["Write", "Jot the day in plain words, or answer the daily prompt. Add a mood."],
  ["Reflect", "AI summarises, tags the feeling, and surfaces gentle insights."],
  ["Look back", "Browse your mood timeline and chat with your journal whenever."],
];

export default function Home() {
  return (
    <div>
      {/* Hero — full logo as background, content centred over it */}
      <section className="hero-bg">
        <h1 className="sr-only">MyAIDiary — your private, AI-powered journal.</h1>

        {/* Full logo fills the hero as background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/myaidiary-fulllogo.png" alt="" aria-hidden="true" className="hero-bg-logo" />

        {/* Light overlay so text stays readable */}
        <div className="hero-bg-overlay" />

        <div className="hero-body">
          <p className="hero-sub">Write your day. Let AI summarise, track your mood, and chat with your past self.</p>
          <div className="hero-cta-row">
            <Link href="/auth?mode=signup" className="btn">Start journaling</Link>
            <Link href="/auth" className="btn btn-outline">I have an account</Link>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section" style={{ borderTop: "1px solid var(--ink)", background: "var(--sand)" }}>
        <div className="container">
          <ScrollReveal>
            <span className="eyebrow" style={{ background: "var(--cream)" }}>What it does</span>
            <h2 className="section-title" style={{ marginTop: "1rem" }}>A journal that thinks with you.</h2>
          </ScrollReveal>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
            {features.map(({ icon: Icon, title, body }, i) => (
              <ScrollReveal key={title} delay={i * 60}>
                <div className="card card-pad hover-lift" style={{ background: "var(--cream)", height: "100%" }}>
                  <span className="inline-flex" style={{ width: 46, height: 46, border: "1px solid var(--ink)", background: "var(--paper)", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 style={{ fontSize: "1.3rem", marginTop: "1rem" }}>{title}</h3>
                  <p className="muted" style={{ marginTop: ".5rem" }}>{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container section">
        <ScrollReveal>
          <span className="eyebrow">How it works</span>
          <h2 className="section-title" style={{ marginTop: "1rem" }}>Three calm steps.</h2>
        </ScrollReveal>
        <div className="grid md:grid-cols-3" style={{ gap: "1.25rem", marginTop: "2rem" }}>
          {steps.map(([t, b], i) => (
            <ScrollReveal key={t} delay={i * 100}>
              <div className="card card-pad" style={{ height: "100%" }}>
                <div className="display" style={{ fontSize: "3rem", color: "var(--stone)" }}>{String(i + 1).padStart(2, "0")}</div>
                <h3 style={{ fontSize: "1.4rem", marginTop: ".5rem" }}>{t}</h3>
                <p className="muted" style={{ marginTop: ".4rem" }}>{b}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingBottom: "clamp(3rem,6vw,5rem)" }}>
        <ScrollReveal>
          <div className="card card-pad" style={{ background: "var(--ink)", textAlign: "center", padding: "clamp(2.5rem,5vw,4rem)" }}>
            <h2 className="section-title" style={{ color: "var(--cream)" }}>Start your journal today.</h2>
            <p style={{ color: "var(--stone)", marginTop: ".6rem" }}>Free to begin. Your story, with a little AI by your side.</p>
            <div style={{ marginTop: "1.6rem" }}>
              <Link href="/auth?mode=signup" className="btn btn-sand">Create your journal</Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
