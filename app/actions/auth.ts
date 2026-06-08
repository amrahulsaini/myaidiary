"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { signIn, signOut } from "@/auth";

export type AuthState = { error?: string };

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  try {
    await signIn("credentials", { email, password, redirectTo: "/journal" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Invalid email or password." };
    throw e; // redirect
  }
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !/.+@.+\..+/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "An account with this email already exists. Try signing in." };

  const passwordHash = await bcrypt.hash(password, 10);
  const [u] = await db.insert(users).values({ email, name: name || null, passwordHash }).returning();
  await db.insert(profiles).values({ userId: u.id, displayName: name || null }).onConflictDoNothing();

  try {
    await signIn("credentials", { email, password, redirectTo: "/journal" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) return { error: "Account created — please sign in." };
    throw e; // redirect
  }
}

export async function authenticate(prev: AuthState, formData: FormData): Promise<AuthState> {
  return String(formData.get("mode")) === "signup" ? signup(prev, formData) : login(prev, formData);
}

export async function googleLogin() {
  await signIn("google", { redirectTo: "/journal" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
