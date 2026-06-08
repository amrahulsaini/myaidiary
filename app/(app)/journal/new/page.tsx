import Link from "next/link";
import EntryEditor from "@/components/EntryEditor";
import { createEntry } from "@/app/actions/entries";

export const metadata = { title: "New entry" };

export default function NewEntryPage() {
  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <Link href="/journal" className="nav-link">← Journal</Link>
      <h1 className="display" style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: ".6rem" }}>New entry</h1>
      <div className="card card-pad" style={{ marginTop: "1.2rem" }}>
        <EntryEditor action={createEntry} />
      </div>
    </div>
  );
}
