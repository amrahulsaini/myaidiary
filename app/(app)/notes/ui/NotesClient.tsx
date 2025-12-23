"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  CheckCircle2,
  Heading1,
  Heading2,
  Italic,
  List,
  Plus,
  Shield,
  Type,
  Trash2,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/app/lib/supabase/browser";
import { getMoodInsight } from "@/app/diary/ui/mood";

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  theme?: string;
  font?: string;
  created_at: string;
  updated_at: string;
};

type NoteTheme = "default" | "calm" | "sunset" | "forest";
type NoteFont = "sans" | "mono";

type AttachmentRow = {
  id: string;
  user_id: string;
  note_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

function themeToClasses(theme: NoteTheme): string {
  switch (theme) {
    case "calm":
      return "bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10";
    case "sunset":
      return "bg-gradient-to-br from-fuchsia-500/10 via-transparent to-indigo-500/10";
    case "forest":
      return "bg-gradient-to-br from-emerald-500/10 via-transparent to-zinc-500/10";
    default:
      return "bg-white/70 dark:bg-white/5";
  }
}

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

export default function NotesClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTheme, setDraftTheme] = useState<NoteTheme>("default");
  const [draftFont, setDraftFont] = useState<NoteFont>("sans");
  const [dirty, setDirty] = useState(false);
  const [savingPulse, setSavingPulse] = useState<"idle" | "saved">("idle");
  const saveTimer = useRef<number | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const [attachmentsEnabled, setAttachmentsEnabled] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<AttachmentRow[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const activeIdRef = useRef<string | null>(null);
  const draftTitleRef = useRef("");
  const draftContentRef = useRef("");
  const dirtyRef = useRef(false);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    draftTitleRef.current = draftTitle;
  }, [draftTitle]);

  useEffect(() => {
    draftContentRef.current = draftContent;
  }, [draftContent]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (ignore) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);

      // Probe: attachments table exists?
      const probe = await supabase
        .from("note_attachments")
        .select("id")
        .limit(1);
      if (!ignore) {
        setAttachmentsEnabled(!probe.error);
      }
      const { data: rows } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (rows) {
        setNotes(rows as NoteRow[]);
        setActiveId((rows as NoteRow[])[0]?.id ?? null);
      }
    }

    void load();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!attachmentsEnabled) return;
    if (!userId) return;

    const channel = supabase
      .channel(`note-attachments-realtime-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "note_attachments",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          if (activeIdRef.current) void loadAttachments(activeIdRef.current);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId, attachmentsEnabled]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notes-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `user_id=eq.${userId}` },
        async () => {
          const { data: rows } = await supabase
            .from("notes")
            .select("*")
            .order("updated_at", { ascending: false });
          if (!rows) return;

          const next = rows as NoteRow[];
          const currentActiveId = activeIdRef.current;
          if (dirtyRef.current && currentActiveId) {
            setNotes(
              next.map((r) =>
                r.id === currentActiveId
                  ? {
                      ...r,
                      title: draftTitleRef.current,
                      content: draftContentRef.current,
                    }
                  : r
              )
            );
          } else {
            setNotes(next);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  const active = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId]
  );

  useEffect(() => {
    if (!activeId) {
      setDraftTitle("");
      setDraftContent("");
      setDraftTheme("default");
      setDraftFont("sans");
      setDirty(false);
      return;
    }

    const n = notes.find((x) => x.id === activeId);
    if (!n) return;

    setDraftTitle(n.title ?? "");
    setDraftContent(n.content ?? "");
    setDraftTheme(((n.theme as NoteTheme) || "default") satisfies NoteTheme);
    setDraftFont(((n.font as NoteFont) || "sans") satisfies NoteFont);
    setDirty(false);
  }, [activeId, notes]);

  useEffect(() => {
    if (!attachmentsEnabled) return;
    if (!activeId) {
      setAttachments([]);
      setAttachmentUrls({});
      setAttachmentError(null);
      return;
    }
    void loadAttachments(activeId);
  }, [activeId, attachmentsEnabled]);

  const insight = useMemo(() => getMoodInsight(draftContent ?? ""), [draftContent]);

  async function loadAttachments(noteId: string) {
    if (!attachmentsEnabled) return;
    if (!userId) return;
    setAttachmentError(null);

    const { data, error } = await supabase
      .from("note_attachments")
      .select(
        "id,user_id,note_id,file_path,file_name,mime_type,size_bytes,created_at"
      )
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });

    if (error) {
      setAttachmentError(error.message);
      return;
    }

    const rows = (data ?? []) as AttachmentRow[];
    setAttachments(rows);

    // Signed URLs for previews/downloads
    const nextUrls: Record<string, string> = {};
    for (const a of rows.slice(0, 10)) {
      const signed = await supabase
        .storage
        .from("note-attachments")
        .createSignedUrl(a.file_path, 60 * 30);
      if (signed.data?.signedUrl) nextUrls[a.id] = signed.data.signedUrl;
    }
    setAttachmentUrls(nextUrls);
  }

  async function uploadAttachment(file: File) {
    if (!attachmentsEnabled) return;
    if (!userId) return;
    if (!activeId) return;

    setAttachmentError(null);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const key = `${userId}/${activeId}/${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;

    const up = await supabase.storage
      .from("note-attachments")
      .upload(key, file, { contentType: file.type || "application/octet-stream" });

    if (up.error) {
      setAttachmentError(up.error.message);
      return;
    }

    const ins = await supabase.from("note_attachments").insert({
      user_id: userId,
      note_id: activeId,
      file_path: key,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    });

    if (ins.error) {
      setAttachmentError(ins.error.message);
      return;
    }

    await loadAttachments(activeId);
  }

  async function deleteAttachment(a: AttachmentRow) {
    if (!attachmentsEnabled) return;
    await supabase.storage.from("note-attachments").remove([a.file_path]);
    await supabase.from("note_attachments").delete().eq("id", a.id);
    if (activeId) await loadAttachments(activeId);
  }

  async function createNote() {
    if (!userId) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: userId, title: "", content: "" })
      .select("*")
      .single();

    if (error || !data) return;

    setNotes((prev) => [data as NoteRow, ...prev]);
    setActiveId((data as NoteRow).id);
    setDraftTitle("");
    setDraftContent("");
    setDirty(false);
  }

  async function deleteNote(noteId: string) {
    await supabase.from("notes").delete().eq("id", noteId);
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== noteId);
      setActiveId((current) => {
        if (current !== noteId) return current;
        return next[0]?.id ?? null;
      });
      return next;
    });
  }

  useEffect(() => {
    if (!activeId) return;
    if (!notes.some((n) => n.id === activeId)) return;
    if (!dirty) return;

    const current = notes.find((n) => n.id === activeId);
    const canPersistStyle = Boolean(current && ("theme" in current || "font" in current));

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const updatePayload: Record<string, unknown> = {
        title: draftTitle,
        content: draftContent,
      };

      if (canPersistStyle) {
        updatePayload.theme = draftTheme;
        updatePayload.font = draftFont;
      }

      const { error } = await supabase
        .from("notes")
        .update(updatePayload)
        .eq("id", activeId);

      if (!error) {
        setSavingPulse("saved");
        setDirty(false);
        window.setTimeout(() => setSavingPulse("idle"), 900);
      }
    }, 350);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [supabase, notes, activeId, draftTitle, draftContent, draftTheme, draftFont, dirty]);

  function applyInlineWrap(prefix: string, suffix: string) {
    const el = editorRef.current;
    const current = draftContent;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = current.slice(start, end);
    const next = current.slice(0, start) + prefix + selected + suffix + current.slice(end);

    setDraftContent(next);
    setDirty(true);
    setSavingPulse("idle");

    const nextPos = start + prefix.length + selected.length + suffix.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextPos, nextPos);
    });
  }

  function applyLinePrefix(prefix: string) {
    const el = editorRef.current;
    const current = draftContent;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;

    const lineStart = current.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = current.indexOf("\n", end);
    const safeLineEnd = lineEnd === -1 ? current.length : lineEnd;
    const line = current.slice(lineStart, safeLineEnd);

    const already = line.startsWith(prefix);
    const nextLine = already ? line.slice(prefix.length) : prefix + line;
    const next = current.slice(0, lineStart) + nextLine + current.slice(safeLineEnd);

    setDraftContent(next);
    setDirty(true);
    setSavingPulse("idle");

    const delta = nextLine.length - line.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + delta, end + delta);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="myaidiary-fade-up rounded-3xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-zinc-600 dark:text-zinc-400">
              NOTES
            </p>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Write freely.
            </h1>
            <p className="mt-2 text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Autosaves to Supabase in realtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ${
                savingPulse === "saved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "border-zinc-200 bg-white/60 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              {savingPulse === "saved" ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Saved
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3" /> Realtime sync
                </>
              )}
            </span>

            <button
              onClick={createNote}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white shadow-md shadow-zinc-950/20 transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-black dark:shadow-white/20 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-4">
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
                  const title = selected ? draftTitle : n.title;
                  const content = selected ? draftContent : n.content;
                  const displayUpdatedAt = selected ? new Date().toISOString() : n.updated_at;
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
                            {title?.trim() ? title : "Untitled"}
                          </p>
                          <p
                            className={`mt-1 text-xs ${
                              selected
                                ? "text-white/80 dark:text-black/70"
                                : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          >
                            {formatDay(displayUpdatedAt)}
                          </p>
                        </div>

                        <button
                          type="button"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            void deleteNote(n.id);
                          }}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-300 ${
                            selected
                              ? "text-white/80 hover:bg-white/10 dark:text-black/70 dark:hover:bg-black/10"
                              : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p
                        className={`mt-3 text-xs line-clamp-1 ${
                          selected
                            ? "text-white/75 dark:text-black/60"
                            : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {content.trim() ? content.trim() : "Start writing…"}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          {active ? (
            <div className="grid gap-4">
              <div
                className={`rounded-3xl border border-zinc-200 p-5 shadow-sm shadow-black/5 backdrop-blur transition-all duration-300 dark:border-white/10 dark:shadow-none ${themeToClasses(
                  draftTheme
                )}`}
              >
                <input
                  value={draftTitle}
                  onChange={(e) => {
                    setDraftTitle(e.target.value);
                    setDirty(true);
                    setSavingPulse("idle");
                  }}
                  placeholder="Title"
                  className="w-full bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-zinc-400"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ToolbarButton
                      label="H1"
                      onClick={() => applyLinePrefix("# ")}
                      icon={<Heading1 className="h-4 w-4" />}
                    />
                    <ToolbarButton
                      label="H2"
                      onClick={() => applyLinePrefix("## ")}
                      icon={<Heading2 className="h-4 w-4" />}
                    />
                    <ToolbarButton
                      label="Bullets"
                      onClick={() => applyLinePrefix("- ")}
                      icon={<List className="h-4 w-4" />}
                    />
                    <ToolbarButton
                      label="Bold"
                      onClick={() => applyInlineWrap("**", "**")}
                      icon={<Bold className="h-4 w-4" />}
                    />
                    <ToolbarButton
                      label="Italic"
                      onClick={() => applyInlineWrap("_", "_")}
                      icon={<Italic className="h-4 w-4" />}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 py-2 text-xs font-semibold text-zinc-900 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <Type className="h-4 w-4" />
                      <select
                        value={draftFont}
                        onChange={(e) => {
                          setDraftFont(e.target.value as NoteFont);
                          setDirty(true);
                          setSavingPulse("idle");
                        }}
                        className="bg-transparent outline-none"
                      >
                        <option value="sans">Sans</option>
                        <option value="mono">Mono</option>
                      </select>
                    </label>

                    <label className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 py-2 text-xs font-semibold text-zinc-900 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white">
                      Theme
                      <select
                        value={draftTheme}
                        onChange={(e) => {
                          setDraftTheme(e.target.value as NoteTheme);
                          setDirty(true);
                          setSavingPulse("idle");
                        }}
                        className="bg-transparent outline-none"
                      >
                        <option value="default">Default</option>
                        <option value="calm">Calm</option>
                        <option value="sunset">Sunset</option>
                        <option value="forest">Forest</option>
                      </select>
                    </label>
                  </div>
                </div>

                <textarea
                  ref={editorRef}
                  value={draftContent}
                  onChange={(e) => {
                    setDraftContent(e.target.value);
                    setDirty(true);
                    setSavingPulse("idle");
                  }}
                  placeholder="Start writing…"
                  className={`mt-3 min-h-[320px] w-full resize-none bg-transparent text-base leading-7 outline-none placeholder:text-zinc-400 ${
                    draftFont === "mono" ? "font-mono" : "font-sans"
                  }`}
                />

                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Formatting uses Markdown-style shortcuts (H1/H2, bullets, bold, italic).
                </p>
              </div>

              {attachmentsEnabled ? (
                <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 text-sm shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold">Attachments</p>

                    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/60 px-4 text-xs font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10">
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadAttachment(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {attachmentError ? (
                    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                      {attachmentError}
                    </div>
                  ) : null}

                  <div className="mt-3 grid gap-2">
                    {attachments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-xs text-zinc-600 dark:border-white/10 dark:text-zinc-400">
                        No attachments yet.
                      </div>
                    ) : (
                      attachments.map((a) => {
                        const url = attachmentUrls[a.id];
                        const isImage = a.mime_type.startsWith("image/");
                        return (
                          <div
                            key={a.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/60 p-3 transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{a.file_name}</p>
                              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                                {(a.size_bytes / 1024).toFixed(1)} KB
                              </p>
                              {url && isImage ? (
                                <img
                                  src={url}
                                  alt={a.file_name}
                                  className="mt-2 max-h-36 rounded-xl border border-zinc-200 dark:border-white/10"
                                />
                              ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-9 items-center justify-center rounded-2xl border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-900 transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                >
                                  Open
                                </a>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => void deleteAttachment(a)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-zinc-500 transition-all duration-300 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    Attachments are stored privately in Supabase Storage.
                  </p>
                </div>
              ) : null}

              <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 text-sm shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Mood signal (lightweight)</p>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                    {insight.label} · {insight.confidence}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-zinc-600 dark:text-zinc-300">
                  <p>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-50">Signals:</span> {insight.signals.join(", ")}
                  </p>
                  <p>
                    <span className="font-semibold text-zinc-950 dark:text-zinc-50">Suggestions:</span> {insight.suggestions.join(" · ")}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {insight.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/50 p-10 text-center text-sm text-zinc-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              Select a note to start editing.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-3 text-xs font-semibold text-zinc-900 backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:hover:bg-white/10"
      title={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
