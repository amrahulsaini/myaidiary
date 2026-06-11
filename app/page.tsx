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
      {/* Hero — fullscreen video, buttons at the bottom */}
      <section className="hero-bg">
        <h1 className="sr-only">MyAIDiary — your private, AI-powered journal.</h1>
        {/* Desktop: video */}
        <video className="hero-video hero-desktop-only" autoPlay muted loop playsInline preload="auto">
          <source src="/myaidiary-vid.mp4" type="video/mp4" />
        </video>
        {/* Mobile: logo edge to edge */}
        <img
          src="/myaidiary-fulllogo-withoutbg.png"
          alt="MyAIDiary"
          className="hero-mobile-logo"
        />
        <div className="hero-video-overlay" />
        <div className="hero-cta-bottom">
          <Link href="/auth?mode=signup" className="btn btn-light">Start journaling</Link>
          <Link href="/auth" className="btn btn-ghost-light">I have an account</Link>
        </div>
      </section>

      {/* Features — vertical rows, big heading, no eyebrow chip */}
      <section id="features" className="features-section">
        <div className="container">
          <ScrollReveal>
            <h2 className="features-heading">What does it do?</h2>
          </ScrollReveal>
        </div>
        <div className="container">
          <div className="features-grid">
            {features.map(({ icon: Icon, title, body }, i) => (
              <ScrollReveal key={title} delay={i * 70}>
                <div className="feature-card">
                  <span className="feature-icon-wrap">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="feature-title">{title}</h3>
                  <p className="feature-body">{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — vertical rows, big heading */}
      <section id="how" className="how-section">
        <div className="container">
          <ScrollReveal>
            <h2 className="features-heading">How does it work?</h2>
          </ScrollReveal>
          <div className="how-list">
            {steps.map(([t, b], i) => (
              <ScrollReveal key={t} delay={i * 90} className="how-row">
                <div className="how-item">
                  <span className="how-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="how-text">
                    <h3 className="how-title">{t}</h3>
                    <p className="how-body">{b}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — full edge to edge, no container */}
      <section className="cta-fullbleed">
        <ScrollReveal>
          <h2 className="cta-heading">Start your journal today.</h2>
          <p className="cta-sub">Free to begin. Your story, with a little AI by your side.</p>
          <Link href="/auth?mode=signup" className="btn btn-sand" style={{ marginTop: "2rem" }}>
            Create your journal
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
