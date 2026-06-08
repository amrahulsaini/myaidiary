import Link from "next/link";
import { PenLine } from "lucide-react";
import { auth } from "@/auth";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="container section">
      <div className="flex flex-wrap items-end justify-between" style={{ gap: "1rem" }}>
        <div>
          <span className="eyebrow">Your journal</span>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", marginTop: "1rem" }}>Hi {name}.</h1>
          <p className="lead" style={{ marginTop: ".6rem" }}>This is your private space. Let&apos;s capture today.</p>
        </div>
        <Link href="/journal/new" className="btn"><PenLine size={18} /> New entry</Link>
      </div>

      <div className="card card-pad" style={{ marginTop: "2rem", textAlign: "center", paddingBlock: "3.5rem" }}>
        <div className="display" style={{ fontSize: "2rem", color: "var(--stone)" }}>No entries yet</div>
        <p className="muted" style={{ marginTop: ".6rem", maxWidth: "40ch", marginInline: "auto" }}>
          Your entries, mood timeline and AI reflections will live here. Write your first one to begin.
        </p>
        <div style={{ marginTop: "1.4rem" }}>
          <Link href="/journal/new" className="btn btn-sand">Write your first entry</Link>
        </div>
      </div>
    </div>
  );
}
