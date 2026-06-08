"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { entries } from "@/lib/db/schema";
import { currentUserId, wordCount, todayISO } from "@/lib/entries";

export async function createEntry(formData: FormData) {
  const userId = await currentUserId();
  const body = String(formData.get("body") ?? "");
  const [e] = await db
    .insert(entries)
    .values({
      userId,
      entryDate: String(formData.get("entryDate") || todayISO()),
      title: String(formData.get("title") ?? "").trim() || null,
      body,
      mood: Number(formData.get("mood")) || null,
      wordCount: wordCount(body),
    })
    .returning();
  revalidatePath("/journal");
  redirect(`/journal/${e.id}`);
}

export async function updateEntry(id: string, formData: FormData) {
  const userId = await currentUserId();
  const body = String(formData.get("body") ?? "");
  await db
    .update(entries)
    .set({
      entryDate: String(formData.get("entryDate") || todayISO()),
      title: String(formData.get("title") ?? "").trim() || null,
      body,
      mood: Number(formData.get("mood")) || null,
      wordCount: wordCount(body),
      updatedAt: new Date(),
    })
    .where(and(eq(entries.id, id), eq(entries.userId, userId)));
  revalidatePath("/journal");
  revalidatePath(`/journal/${id}`);
  redirect("/journal");
}

export async function deleteEntry(id: string, _formData?: FormData) {
  const userId = await currentUserId();
  await db.delete(entries).where(and(eq(entries.id, id), eq(entries.userId, userId)));
  revalidatePath("/journal");
  redirect("/journal");
}
