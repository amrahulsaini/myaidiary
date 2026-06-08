import Link from "next/link";
import { getInsights, MOOD_EMOJI, moodColor } from "@/lib/insights";

export const metadata = { title: "Insights" };

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card card-pad">
      <div className="display" style={{ fontSize: "2.4rem" }}>{value}</div>
      <div className="muted" style={{ fontSize: ".82rem", textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".2rem" }}>{label}</div>
    </div>
  );
}

export default async function InsightsPage() {
  const ins = await getInsights();

  if (ins.total === 0) {
    return (
      <div className="container section" style={{ maxWidth: 760 }}>
        <span className="eyebrow">Insights</span>
        <div className="card card-pad" style={{ marginTop: "1.2rem", textAlign: "center", paddingBlock: "3rem" }}>
          <div className="display" style={{ fontSize: "1.8rem", color: "var(--stone)" }}>Nothing to chart yet</div>
          <p className="muted" style={{ marginTop: ".5rem" }}>Write a few entries with a mood and your trends will appear here.</p>
          <div style={{ marginTop: "1.2rem" }}><Link href="/journal/new" className="btn btn-sand">Write an entry</Link></div>
        </div>
      </div>
    );
  }

  const maxDist = Math.max(1, ...ins.distribution.slice(1));

  return (
    <div className="container section">
      <span className="eyebrow">Insights</span>
      <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: "1rem" }}>How you&apos;ve been.</h1>

      {/* stats */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginTop: "1.8rem" }}>
        <Stat label="Entries" value={ins.total} />
        <Stat label="Words" value={ins.words} />
        <Stat label="Current streak" value={`${ins.currentStreak}d`} />
        <Stat label="Longest streak" value={`${ins.longestStreak}d`} />
        <Stat label="Avg mood" value={ins.avgMood ? `${MOOD_EMOJI[Math.round(ins.avgMood)]} ${ins.avgMood}` : "—"} />
      </div>

      {/* 90-day mood heatmap */}
      <div className="card card-pad" style={{ marginTop: "1.6rem" }}>
        <h2 className="section-title" style={{ fontSize: "1.4rem" }}>Mood · last 90 days</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(30, 1fr)", gap: 4, marginTop: "1rem" }}>
          {ins.recent.map((d) => (
            <div
              key={d.date}
              title={`${d.date}${d.mood ? " · " + MOOD_EMOJI[d.mood] : d.mood === 0 ? " · entry" : ""}`}
              style={{ aspectRatio: "1", border: "1px solid var(--ink)", background: moodColor(d.mood) }}
            />
          ))}
        </div>
        <div className="flex items-center muted" style={{ gap: ".8rem", marginTop: "1rem", fontSize: ".8rem" }}>
          {[1, 2, 3, 4, 5].map((m) => (
            <span key={m} className="inline-flex items-center" style={{ gap: ".3rem" }}>
              <span style={{ width: 14, height: 14, border: "1px solid var(--ink)", background: moodColor(m), display: "inline-block" }} /> {MOOD_EMOJI[m]}
            </span>
          ))}
        </div>
      </div>

      {/* distribution */}
      <div className="card card-pad" style={{ marginTop: "1.2rem" }}>
        <h2 className="section-title" style={{ fontSize: "1.4rem" }}>How often each mood</h2>
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
          {[5, 4, 3, 2, 1].map((m) => (
            <div key={m} className="flex items-center" style={{ gap: ".7rem" }}>
              <span style={{ width: 28, fontSize: "1.2rem" }}>{MOOD_EMOJI[m]}</span>
              <div style={{ flex: 1, border: "1px solid var(--ink)", height: 24, background: "var(--paper)" }}>
                <div style={{ width: `${(ins.distribution[m] / maxDist) * 100}%`, height: "100%", background: moodColor(m) }} />
              </div>
              <span className="muted" style={{ width: 28, textAlign: "right" }}>{ins.distribution[m]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
