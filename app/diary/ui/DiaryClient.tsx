"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  Mail,
  Brain,
  Clock,
  Shield,
  CheckCircle2,
  Sparkles,
  Volume2,
  Square,
  Loader2,
} from "lucide-react";
import type { Note } from "./types";
import { createEmptyNote, loadNotes, saveNotes } from "./storage";
import { getMoodInsight } from "./mood";

function formatDay(ts: number) {
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

function isSameLocalDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DiaryClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [savingPulse, setSavingPulse] = useState<"idle" | "saved">("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loaded = loadNotes();
    setNotes(loaded);
    setActiveId(loaded[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveNotes(notes);
      setSavingPulse("saved");
      window.setTimeout(() => setSavingPulse("idle"), 900);
    }, 250);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [notes]);

  const active = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId]
  );

  const insight = useMemo(
    () => getMoodInsight(active?.content ?? ""),
    [active?.content]
  );

  const hasWrittenToday = useMemo(() => {
    const now = new Date();
    return notes.some((n) => isSameLocalDate(new Date(n.updatedAt), now));
  }, [notes]);

  function createNote() {
    const n = createEmptyNote();
    const next = [n, ...notes];
    setNotes(next);
    setActiveId(n.id);
  }

  function deleteNote(noteId: string) {
    const next = notes.filter((n) => n.id !== noteId);
    setNotes(next);
    setActiveId((prev) => {
      if (prev !== noteId) return prev;
      return next[0]?.id ?? null;
    });
  }

  function updateActive(partial: Partial<Pick<Note, "title" | "content">>) {
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.id === activeId);
      if (idx === -1) return prev;
      const now = Date.now();
      const updated: Note = {
        ...prev[idx],
        ...partial,
        updatedAt: now,
      };
      const copy = [...prev];
      copy[idx] = updated;
      copy.sort((a, b) => b.updatedAt - a.updatedAt);
      return copy;
    });
  }

  async function handleTextToSpeech() {
    if (!active?.content?.trim()) return;

    if (isSpeaking) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    try {
      setTtsLoading(true);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: active.content })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('TTS error:', data.error);
        alert(data.error || 'Failed to generate speech');
        return;
      }

      // Convert base64 to audio and play
      const audioData = `data:audio/wav;base64,${data.audioContent}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioData);
      audioRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        alert('Failed to play audio');
      };

      await audio.play();
      setIsSpeaking(true);
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech');
    } finally {
      setTtsLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-zinc-50/70 backdrop-blur dark:border-white/10 dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white/60 text-zinc-900 shadow-sm transition-all duration-300 hover:scale-110 hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
              title="Back to home"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 hover:-translate-x-0.5" />
            </Link>

            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white/60 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <img src="/brand.svg" alt="MyAIDiary" className="h-full w-full" />
              </span>
              <span className="hidden leading-tight lg:block">
                <span className="block text-base font-semibold tracking-tight">
                  MyAIDiary
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Private daily notes + AI personalization
                </span>
              </span>
              <span className="text-base font-semibold tracking-tight lg:hidden">
                MyAIDiary
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex ${
                savingPulse === "saved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-zinc-200 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              {savingPulse === "saved" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3" />
                  Local-only demo
                </>
              )}
            </span>

            <button
              onClick={createNote}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="hidden sm:inline">New note</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-12rem] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-indigo-300/35 blur-3xl dark:bg-indigo-500/10 myaidiary-float" />
          <div className="absolute left-[7%] top-[55%] h-[22rem] w-[22rem] rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10 myaidiary-float" />
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 py-8 lg:grid-cols-12 lg:gap-6">
          <section className="relative lg:col-span-4">
            {!hasWrittenToday && (
              <div className="mb-4 rounded-2xl border border-zinc-200 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10 p-4 text-sm shadow-sm shadow-black/5 backdrop-blur transition-all duration-500 hover:scale-[1.01] hover:shadow-md dark:border-white/10 myaidiary-shimmer">
                <p className="font-semibold">Gentle reminder</p>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                  You haven’t written today. One sentence is enough.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Your notes</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {notes.length} total
                </p>
              </div>

              <div className="mt-3 grid gap-2">
                {notes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                    No notes yet. Create your first note.
                  </div>
                ) : (
                  notes.map((n) => {
                    const selected = n.id === activeId;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setActiveId(n.id)}
                        className={`group w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                          selected
                            ? "scale-[1.02] border-zinc-950 bg-zinc-950 text-white shadow-lg dark:border-white dark:bg-white dark:text-black"
                            : "border-zinc-200 bg-white/60 hover:scale-[1.01] hover:border-zinc-300 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold line-clamp-1">
                              {n.title?.trim() ? n.title : "Untitled"}
                            </p>
                            <p
                              className={`mt-1 text-xs ${
                                selected
                                  ? "text-white/80 dark:text-black/70"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            >
                              {formatDay(n.updatedAt)}
                            </p>
                          </div>

                          <span
                            className={`mt-0.5 inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                              selected
                                ? "bg-white/15 text-white dark:bg-black/10 dark:text-black"
                                : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200"
                            }`}
                          >
                            {n.content.trim().length ? "Draft" : "Empty"}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <p
                            className={`text-xs line-clamp-1 ${
                              selected
                                ? "text-white/75 dark:text-black/60"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {n.content.trim() ? n.content.trim() : "Start writing…"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-zinc-200 bg-white/70 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <p className="text-sm font-semibold">Email access (roadmap)</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Connect Gmail/Outlook via OAuth to save confirmations, receipts, and important context into your diary — then let AI summarize what matters.
              </p>
              <div className="mt-3 grid gap-2">
                {[
                  { text: "Auto-save important emails as diary context", icon: Mail },
                  { text: "Turn scattered updates into a timeline", icon: Clock },
                  { text: "Follow-up reminders based on what you receive", icon: CheckCircle2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="flex items-start gap-2 rounded-2xl border border-zinc-200 bg-white/60 p-3 text-xs text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
              <button
                disabled
                className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 text-sm font-semibold text-zinc-400 dark:border-white/10 dark:bg-white/5"
              >
                <Mail className="h-4 w-4" />
                Connect email (coming soon)
              </button>
            </div>
          </section>

          <section className="relative lg:col-span-8">
            <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Editor</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {active ? `Last updated: ${formatDay(active.updatedAt)}` : "Create a note to start"}
                  </p>
                </div>

                {active && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleTextToSpeech}
                      disabled={!active.content?.trim() || ttsLoading}
                      className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-5 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:scale-105 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                    >
                      {ttsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Loading...</span>
                        </>
                      ) : isSpeaking ? (
                        <>
                          <Square className="h-4 w-4" />
                          <span className="hidden sm:inline">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                          <span className="hidden sm:inline">Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteNote(active.id)}
                      className="group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-5 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:scale-105 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  value={active?.title ?? ""}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Title (optional)"
                  disabled={!active}
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 text-sm outline-none transition-all duration-300 focus:scale-[1.01] focus:border-indigo-400 focus:shadow-md dark:border-white/10 dark:bg-white/5 dark:focus:border-indigo-500/50"
                />

                <textarea
                  value={active?.content ?? ""}
                  onChange={(e) => updateActive({ content: e.target.value })}
                  placeholder="Write your day…"
                  disabled={!active}
                  rows={12}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm leading-6 outline-none transition-all duration-300 focus:scale-[1.01] focus:border-indigo-400 focus:shadow-lg dark:border-white/10 dark:bg-white/5 dark:focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Mood insight (demo)</p>
                  <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                    {insight.label} · {insight.confidence}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Based on your text, here are lightweight signals and suggested reflection prompts.
                </p>

                <div className="mt-4 grid gap-2">
                  {insight.signals.map((s) => (
                    <div
                      key={s}
                      className="rounded-2xl border border-zinc-200 bg-white/70 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                    >
                      {s}
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2">
                  {insight.suggestions.map((s) => (
                    <div
                      key={s}
                      className="rounded-2xl border border-zinc-200 bg-white/70 p-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    >
                      {s}
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                  {insight.disclaimer}
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <p className="text-sm font-semibold">AI personalization (roadmap)</p>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  For your startup version, this is where a real LLM can generate daily summaries, weekly recaps, and time-management nudges.
                </p>

                <div className="mt-4 grid gap-2">
                  {[
                    {
                      k: "Models",
                      v: "Planned: provider-agnostic (Vertex AI / OpenAI-compatible / others)",
                      icon: Brain,
                    },
                    { k: "Platform", v: "Next.js + Vercel today; GCP-ready roadmap", icon: Sparkles },
                    {
                      k: "Privacy",
                      v: "Opt-in AI, clear data controls, and audit-friendly logs",
                      icon: Shield,
                    },
                    {
                      k: "Time",
                      v: "Turns notes into priorities, reminders, and next steps",
                      icon: Clock,
                    },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <div
                        key={row.k}
                        className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
                      >
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            {row.k}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            {row.v}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  disabled
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 text-sm font-semibold text-zinc-400 dark:border-white/10 dark:bg-white/5"
                >
                  <Sparkles className="h-4 w-4" />
                  Enable AI (coming soon)
                </button>

                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  This demo does not send your notes to any server.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
