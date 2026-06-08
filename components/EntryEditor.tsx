"use client";

import { useState } from "react";

const MOODS: ReadonlyArray<readonly [number, string]> = [
  [1, "😞"], [2, "😕"], [3, "😐"], [4, "🙂"], [5, "😄"],
];

type EntryInit = { entryDate: string; title: string | null; body: string; mood: number | null };

export default function EntryEditor({
  action,
  entry,
  onDelete,
}: {
  action: (fd: FormData) => Promise<void>;
  entry?: EntryInit;
  onDelete?: (fd: FormData) => Promise<void>;
}) {
  const [mood, setMood] = useState<number>(entry?.mood ?? 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col" style={{ gap: "1.1rem" }}>
      <div className="flex flex-wrap" style={{ gap: "1.5rem" }}>
        <div>
          <label className="label">Date</label>
          <input className="field" type="date" name="entryDate" defaultValue={entry?.entryDate ?? today} style={{ width: 180 }} />
        </div>
        <div>
          <label className="label">Mood</label>
          <input type="hidden" name="mood" value={mood} />
          <div className="flex" style={{ gap: ".4rem" }}>
            {MOODS.map(([v, e]) => (
              <button
                key={v}
                type="button"
                onClick={() => setMood(mood === v ? 0 : v)}
                aria-pressed={mood === v}
                className="btn btn-outline"
                style={{ height: 46, width: 46, padding: 0, fontSize: "1.4rem", boxShadow: mood === v ? "var(--shadow)" : "var(--shadow-sm)", background: mood === v ? "var(--sand)" : "var(--cream)" }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="label">Title (optional)</label>
        <input className="field" name="title" defaultValue={entry?.title ?? ""} placeholder="A line for the day…" />
      </div>

      <div>
        <label className="label">Your entry</label>
        <textarea className="field" name="body" defaultValue={entry?.body ?? ""} required rows={14} placeholder="What happened today? How did it feel?" />
      </div>

      <div className="flex items-center" style={{ gap: ".6rem" }}>
        <button type="submit" className="btn">Save entry</button>
        {onDelete && (
          <button formAction={onDelete} formNoValidate className="btn btn-outline">Delete</button>
        )}
      </div>
    </form>
  );
}
