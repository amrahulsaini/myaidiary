import Link from "next/link";
import { PenLine } from "lucide-react";
import { auth } from "@/auth";
import { listEntries, onThisDay, journalStats, MOOD_EMOJI } from "@/lib/entries";

export const metadata = { title: "Journal" };

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function snippet(e: { summary: string | null; body: string }) {
  const s = (e.summary || e.body).replace(/\s+/g, " ").trim();
  return s.length > 160 ? s.slice(0, 160) + "…" : s;
}

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [session, items, otd, stats] = await Promise.all([auth(), listEntries(q), onThisDay(), journalStats()]);
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="container section">
      <div className="flex flex-wrap items-end justify-between" style={{ gap: "1rem" }}>
        <div>
          <span className="eyebrow">Your journal</span>
          <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3.2rem)", marginTop: "1rem" }}>Hi {name}.</h1>
          <p className="muted" style={{ marginTop: ".4rem" }}>
            {stats.count} {stats.count === 1 ? "entry" : "entries"} · {stats.words} words written
          </p>
        </div>
        <Link href="/journal/new" className="btn"><PenLine size={18} /> New entry</Link>
      </div>

      {/* search */}
      <form className="flex" style={{ gap: ".6rem", marginTop: "1.8rem", maxWidth: 460 }}>
        <input className="field" name="q" defaultValue={q ?? ""} placeholder="Search your entries…" />
        <button className="btn btn-outline" type="submit">Search</button>
      </form>

      {/* on this day */}
      {otd.length > 0 && !q && (
        <div style={{ marginTop: "2rem" }}>
          <span className="chip">On this day</span>
          <div className="grid md:grid-cols-2" style={{ gap: "1rem", marginTop: ".8rem" }}>
            {otd.map((e) => (
              <Link key={e.id} href={`/journal/${e.id}`} className="card card-pad hover-lift">
                <div className="muted" style={{ fontSize: ".82rem" }}>{fmtDate(e.entryDate)} {e.mood ? "· " + MOOD_EMOJI[e.mood] : ""}</div>
                <div style={{ fontWeight: 600, marginTop: ".2rem" }}>{e.title || snippet(e)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* entries */}
      <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", paddingBlock: "3rem" }}>
            <div className="display" style={{ fontSize: "1.8rem", color: "var(--stone)" }}>{q ? "No matches" : "No entries yet"}</div>
            <p className="muted" style={{ marginTop: ".5rem" }}>{q ? "Try a different search." : "Write your first entry to begin."}</p>
            {!q && <div style={{ marginTop: "1.2rem" }}><Link href="/journal/new" className="btn btn-sand">Write your first entry</Link></div>}
          </div>
        ) : (
          items.map((e) => (
            <Link key={e.id} href={`/journal/${e.id}`} className="card card-pad hover-lift">
              <div className="flex items-center justify-between" style={{ gap: "1rem" }}>
                <div className="muted" style={{ fontSize: ".85rem", letterSpacing: ".04em", textTransform: "uppercase" }}>{fmtDate(e.entryDate)}</div>
                <div style={{ fontSize: "1.3rem" }}>{e.mood ? MOOD_EMOJI[e.mood] : ""}</div>
              </div>
              {e.title && <h3 style={{ fontSize: "1.3rem", marginTop: ".4rem", textTransform: "none" }}>{e.title}</h3>}
              <p className="muted" style={{ marginTop: ".4rem" }}>{snippet(e)}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
