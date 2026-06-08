import "server-only";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { entries } from "@/lib/db/schema";
import { auth } from "@/auth";

export async function currentUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export type Entry = typeof entries.$inferSelect;

export async function listEntries(query?: string): Promise<Entry[]> {
  const userId = await currentUserId();
  const base = eq(entries.userId, userId);
  const where = query && query.trim()
    ? and(base, or(ilike(entries.body, `%${query}%`), ilike(entries.title, `%${query}%`)))
    : base;
  return db.select().from(entries).where(where).orderBy(desc(entries.entryDate), desc(entries.createdAt));
}

export async function getEntry(id: string): Promise<Entry | undefined> {
  const userId = await currentUserId();
  const [e] = await db.select().from(entries).where(and(eq(entries.id, id), eq(entries.userId, userId))).limit(1);
  return e;
}

export async function onThisDay(): Promise<Entry[]> {
  const userId = await currentUserId();
  return db
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.userId, userId),
        sql`to_char(${entries.entryDate}, 'MM-DD') = to_char(now(), 'MM-DD')`,
        sql`extract(year from ${entries.entryDate}) <> extract(year from now())`
      )
    )
    .orderBy(desc(entries.entryDate));
}

export async function journalStats() {
  const userId = await currentUserId();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int`, words: sql<number>`coalesce(sum(${entries.wordCount}),0)::int` })
    .from(entries)
    .where(eq(entries.userId, userId));
  return row ?? { count: 0, words: 0 };
}

export const MOOD_EMOJI: Record<number, string> = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
export function wordCount(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
