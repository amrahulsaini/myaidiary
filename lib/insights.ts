import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { entries } from "@/lib/db/schema";
import { currentUserId } from "@/lib/entries";

const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export type Insights = {
  total: number;
  words: number;
  avgMood: number | null;
  currentStreak: number;
  longestStreak: number;
  distribution: number[]; // index 1..5
  recent: { date: string; mood: number | null }[]; // last 90 days, oldest→newest
};

export async function getInsights(): Promise<Insights> {
  const userId = await currentUserId();
  const rows = await db
    .select({ entryDate: entries.entryDate, mood: entries.mood, wordCount: entries.wordCount })
    .from(entries)
    .where(eq(entries.userId, userId))
    .orderBy(desc(entries.entryDate));

  const total = rows.length;
  const words = rows.reduce((s, r) => s + (r.wordCount ?? 0), 0);
  const moods = rows.map((r) => r.mood).filter((m): m is number => !!m);
  const avgMood = moods.length ? Math.round((moods.reduce((a, b) => a + b, 0) / moods.length) * 10) / 10 : null;

  const distribution = [0, 0, 0, 0, 0, 0];
  for (const m of moods) if (m >= 1 && m <= 5) distribution[m]++;

  // mood per date (avg) for heatmap + streaks
  const byDate = new Map<string, number[]>();
  for (const r of rows) {
    if (!byDate.has(r.entryDate)) byDate.set(r.entryDate, []);
    if (r.mood) byDate.get(r.entryDate)!.push(r.mood);
  }
  const dayMood = (d: string): number | null => {
    const arr = byDate.get(d);
    if (!arr || !arr.length) return byDate.has(d) ? 0 : null; // 0 = entry but no mood
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  };

  // streaks over distinct days
  const days = [...byDate.keys()].sort();
  let longestStreak = 0, run = 0;
  for (let i = 0; i < days.length; i++) {
    if (i > 0 && (new Date(days[i] + "T00:00:00Z").getTime() - new Date(days[i - 1] + "T00:00:00Z").getTime()) === DAY) run++;
    else run = 1;
    longestStreak = Math.max(longestStreak, run);
  }
  // current streak: consecutive days ending today or yesterday
  let currentStreak = 0;
  const set = new Set(days);
  const cursor = new Date(iso(new Date()) + "T00:00:00Z");
  if (!set.has(iso(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1); // allow yesterday
  while (set.has(iso(cursor))) { currentStreak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }

  // last 90 days series
  const recent: { date: string; mood: number | null }[] = [];
  const start = new Date(iso(new Date()) + "T00:00:00Z");
  start.setUTCDate(start.getUTCDate() - 89);
  for (let i = 0; i < 90; i++) {
    const d = new Date(start.getTime() + i * DAY);
    const k = iso(d);
    recent.push({ date: k, mood: dayMood(k) });
  }

  return { total, words, avgMood, currentStreak, longestStreak, distribution, recent };
}

export const MOOD_EMOJI: Record<number, string> = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };
export function moodColor(mood: number | null): string {
  switch (mood) {
    case 1: return "#b9462f";
    case 2: return "#cc7a3f";
    case 3: return "#bab6aa";
    case 4: return "#7fa07a";
    case 5: return "#4f8a52";
    case 0: return "#e7d8c9"; // entry, no mood
    default: return "transparent"; // no entry
  }
}
