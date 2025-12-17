import type { Note } from "./types";

const STORAGE_KEY = "myaidiary:v1:notes";

export function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const notes: Note[] = parsed
      .map((n) => {
        if (!n || typeof n !== "object") return null;
        const obj = n as Record<string, unknown>;
        const id = typeof obj.id === "string" ? obj.id : "";
        const title = typeof obj.title === "string" ? obj.title : "";
        const content = typeof obj.content === "string" ? obj.content : "";
        const createdAt = typeof obj.createdAt === "number" ? obj.createdAt : 0;
        const updatedAt = typeof obj.updatedAt === "number" ? obj.updatedAt : 0;
        if (!id || !createdAt || !updatedAt) return null;
        return { id, title, content, createdAt, updatedAt } satisfies Note;
      })
      .filter((x): x is Note => Boolean(x));

    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function createEmptyNote(now = Date.now()): Note {
  return {
    id: cryptoSafeId(),
    title: "",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function cryptoSafeId(): string {
  // Uses Web Crypto when available; falls back to Math.random.
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  }
}
