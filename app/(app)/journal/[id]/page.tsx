import Link from "next/link";
import { notFound } from "next/navigation";
import EntryEditor from "@/components/EntryEditor";
import { getEntry } from "@/lib/entries";
import { updateEntry, deleteEntry } from "@/app/actions/entries";

export const metadata = { title: "Entry" };

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <Link href="/journal" className="nav-link">← Journal</Link>
      <h1 className="display" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", marginTop: ".6rem", textTransform: "none" }}>
        {entry.title || "Entry"}
      </h1>
      <div className="card card-pad" style={{ marginTop: "1.2rem" }}>
        <EntryEditor
          action={updateEntry.bind(null, entry.id)}
          onDelete={deleteEntry.bind(null, entry.id)}
          entry={{ entryDate: entry.entryDate, title: entry.title, body: entry.body, mood: entry.mood }}
        />
      </div>
    </div>
  );
}
