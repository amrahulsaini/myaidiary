"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Volume2, Sparkles, Lock } from "lucide-react";
import { storage, initDemoData } from "@/app/lib/storage";

type NoteRow = {
  id: string;
  title: string;
  content: string;
  theme?: string;
  font?: string;
  created_at: string;
  updated_at: string;
};

function formatDay(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotesClientSimple() {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    initDemoData();
    loadNotes();
  }, []);

  function loadNotes() {
    const allNotes = storage.get<NoteRow[]>('notes', []);
    setNotes(allNotes.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ));
  }

  function handleSelectNote(note: NoteRow) {
    setActiveId(note.id);
    setDraftTitle(note.title);
    setDraftContent(note.content);
  }

  function handleSave() {
    if (!draftTitle.trim() && !draftContent.trim()) return;

    const allNotes = storage.get<NoteRow[]>('notes', []);
    
    if (activeId) {
      // Update existing
      const updated = allNotes.map(n => 
        n.id === activeId 
          ? { ...n, title: draftTitle, content: draftContent, updated_at: new Date().toISOString() }
          : n
      );
      storage.set('notes', updated);
    } else {
      // Create new
      const newNote: NoteRow = {
        id: Date.now().toString(),
        title: draftTitle,
        content: draftContent,
        theme: 'default',
        font: 'sans',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      storage.set('notes', [newNote, ...allNotes]);
    }

    loadNotes();
  }

  function handleNew() {
    setActiveId(null);
    setDraftTitle("");
    setDraftContent("");
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    
    const allNotes = storage.get<NoteRow[]>('notes', []);
    storage.set('notes', allNotes.filter(n => n.id !== id));
    
    if (activeId === id) {
      handleNew();
    }
    loadNotes();
  }

  const active = notes.find(n => n.id === activeId);

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* AI Features Banner */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-fuchsia-50 p-6 shadow-lg dark:border-indigo-500/30 dark:from-indigo-950/30 dark:to-fuchsia-950/30">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-200">
              🤖 AI-Powered Intelligence (Coming Soon)
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              Our AI analyzes your journal entries to provide personalized insights, emotional patterns, and productivity trends. Features include:
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Volume2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span><strong>Google TTS:</strong> Listen to your entries</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                <span><strong>AI Analysis:</strong> Emotional insights & patterns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Your Notes</p>
          <button
            onClick={handleNew}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleSelectNote(note)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                activeId === note.id
                  ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-950/30'
                  : 'border-zinc-200 bg-white/60 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
              }`}
            >
              <p className="text-sm font-semibold line-clamp-1">
                {note.title || "Untitled"}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {note.content || "Empty note"}
              </p>
              <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                {formatDay(note.updated_at)}
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold">
            {activeId ? 'Edit Note' : 'New Note'}
          </p>
          <div className="flex gap-2">
            {/* Listen to Note - Disabled */}
            <button
              disabled
              className="group relative inline-flex h-9 items-center gap-2 rounded-full border-2 border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-400 opacity-50 cursor-not-allowed dark:border-indigo-500/30 dark:bg-indigo-950/30"
              title="Google TTS unavailable in demo mode"
            >
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Listen</span>
              <Lock className="h-3 w-3" />
              <span className="absolute -top-8 right-0 hidden group-hover:block rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                Premium feature - Demo mode
              </span>
            </button>

            {/* AI Analysis - Disabled */}
            <button
              disabled
              className="group relative inline-flex h-9 items-center gap-2 rounded-full border-2 border-fuchsia-200 bg-fuchsia-50 px-4 text-sm font-semibold text-fuchsia-400 opacity-50 cursor-not-allowed dark:border-fuchsia-500/30 dark:bg-fuchsia-950/30"
              title="AI Analysis unavailable in demo mode"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
              <Lock className="h-3 w-3" />
              <span className="absolute -top-8 right-0 hidden group-hover:block rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                Premium feature - Demo mode
              </span>
            </button>

            <button
              onClick={handleSave}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            {activeId && (
              <button
                onClick={() => handleDelete(activeId)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <input
          type="text"
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-lg font-semibold outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
        />

        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          placeholder="Start writing..."
          className="mt-4 min-h-[400px] w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 outline-none transition focus:border-indigo-300 dark:border-white/10 dark:bg-black/30 dark:focus:border-indigo-500"
        />
      </main>
      </div>
    </div>
  );
}
