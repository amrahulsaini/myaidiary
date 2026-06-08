import {
  pgTable, text, timestamp, integer, boolean, primaryKey, jsonb, date, vector,
} from "drizzle-orm/pg-core";

const uid = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());

/* ---------------- Auth.js tables ---------------- */
export const users = pgTable("users", {
  id: uid(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"), // for email/password sign-in
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

/* ---------------- App tables ---------------- */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").default("Asia/Kolkata"),
  theme: text("theme").default("system"),
  reminderTime: text("reminder_time"),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const entries = pgTable("entries", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date").notNull(),
  title: text("title"),
  aiTitle: text("ai_title"),
  body: text("body").notNull().default(""),
  summary: text("summary"),
  mood: integer("mood"),        // 1..5
  energy: integer("energy"),    // 1..5
  emotion: text("emotion"),     // AI label
  isFavorite: boolean("is_favorite").default(false).notNull(),
  wordCount: integer("word_count").default(0).notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const entryTags = pgTable(
  "entry_tags",
  {
    entryId: text("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.tagId] })]
);

export const attachments = pgTable("attachments", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entryId: text("entry_id").references(() => entries.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  kind: text("kind").default("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promptsCache = pgTable("prompts_cache", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  forDate: date("for_date").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reflections = pgTable("reflections", {
  id: uid(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // 'week' | 'month'
  periodStart: date("period_start").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
