# MyAIDiary — Product & Feature Spec

**What it is:** a privacy-first, AI-powered personal **journal**. Write (or speak) your day, and AI helps you reflect — summaries, mood tracking, gentle prompts, and the ability to *chat with your own journal*.

**Stack:** Next.js 16 (App Router, TS) · **PostgreSQL + pgvector** (self-hosted in Coolify) · **Drizzle ORM** · **Auth.js (NextAuth)** · Google Gemini (text, embeddings, TTS) · Tailwind v4 · hosted on Coolify (loopwar VM) at `myaidiary.me`.

**Principle:** focused journal — no expenses/debts/todos. Calm, beautiful, fast, private.

---

## Design system (theme)
Warm, editorial, neo‑brutalist. Logos: `public/myaidiary-fulllogo.png` (wordmark) + `public/myaidiary-faviconandshortlogo-penonly.png` (pen mark / favicon).

| Token | Value |
|---|---|
| Page background | `#F8ECE4` (warm cream) |
| Card background | `#F8ECE4` |
| Primary accent / text / headings / body / links / buttons | `#151617` (near‑black) |
| Secondary accent 1 | `#F2DED0` |
| Secondary accent 2 | `#BAB6AA` |
| Heading font | **Montserrat**, weight **Black (900)** |
| Body font | **Inconsolata**, Regular |

**Element rules:** corners **square** (radius 0) · **hard** drop shadow (offset, no blur, color `#151617`) · **thin** borders (1px, `#151617`) · card transparency none · accent image shape = **wiggle** (hand-drawn wiggly border/mask on imagery).

---

## 1. Core journaling
- [ ] Create / edit / delete entries (markdown body: headings, lists, checkboxes, quotes)
- [ ] Autosave drafts + "saved" indicator; recover unsaved draft
- [ ] One or many entries per day; each has an **entry date** + timestamps
- [ ] **Mood** (1–5 / emoji) and **energy** check-in per entry
- [ ] Title (manual or AI-generated)
- [ ] Tags, favorite/pin, word count
- [ ] Photo attachments per entry (Supabase Storage)
- [ ] Calendar view + list view; jump to any date
- [ ] **"On this day"** — resurface entries from past months/years

## 2. AI features (v1 — the differentiators)
- [ ] **Auto-summary + auto-title** of each entry (Gemini) — one tap or on save
- [ ] **Sentiment / emotion detection** per entry → stored mood score + label
- [ ] **Mood timeline** — chart of mood/emotion over days/weeks/months
- [ ] **Daily smart prompts** — tailored reflection question(s) based on recent entries/mood, to beat the blank page
- [ ] **Chat with your journal** — ask questions across all entries; answers grounded in your data via **embeddings + pgvector** (RAG)

## 3. AI features (later phases)
- [ ] **Voice journaling** — record → transcribe → AI tidy-up (Gemini)
- [ ] **Read-back (TTS)** of entries & summaries
- [ ] **Weekly / monthly AI reflection** — themes, wins, recurring worries, a kind note
- [ ] AI-extracted **people / places / topics** tracking
- [ ] Writing assist inline (continue, expand, rephrase, grammar)

## 4. Capture & retention
- [ ] Global quick-add ("+") and keyboard shortcut
- [ ] **Streaks** + daily reminder (web push / email)
- [ ] PWA (installable, offline draft capture)
- [ ] Full-text **search** + semantic search (v2)

## 5. Insights
- [ ] Mood calendar (color-coded by emotion)
- [ ] Stats: entries, current/longest streak, words written, top tags
- [ ] Gratitude counter + most-mentioned people/topics (v2)

## 6. Privacy & security (core selling point)
- [ ] Supabase **Row-Level Security** — users only ever see their own rows
- [ ] App lock (PIN/passcode) + session timeout
- [ ] **Export** all data (Markdown / JSON / PDF)
- [ ] Delete account + wipe data
- [ ] (v3) optional **end-to-end encryption** of entry bodies

## 7. Account & settings
- [ ] Auth: **email + password** (hashed) and **Google sign-in** via Auth.js
- [ ] Profile (name, avatar, timezone)
- [ ] Theme: light / dark / system; accent
- [ ] Reminder time, AI toggles, data controls

## 8. Polish
- [ ] Beautiful empty states, streak celebrations, smooth transitions
- [ ] Responsive + mobile-first; PWA install prompt
- [ ] SEO for public pages (landing/about/privacy/terms), sitemap/robots

---

## Pages / routes
| Route | Purpose | Access |
|---|---|---|
| `/` | Landing / marketing | public |
| `/about` `/privacy` `/terms` `/contact` | Info pages | public |
| `/auth` | Sign in / sign up | public |
| `/journal` | Entries: calendar + list, "on this day" | auth |
| `/journal/new`, `/journal/[id]` | Write / view / edit entry | auth |
| `/insights` | Mood timeline + stats | auth |
| `/chat` | Chat with your journal | auth |
| `/settings` | Profile, theme, app-lock, export, delete | auth |

## Data model (PostgreSQL via Drizzle; every row scoped by `user_id` in queries)
- **Auth.js tables** — users, accounts, sessions, verification_tokens
- **profiles** — id(user), display_name, avatar_url, timezone, settings(jsonb), created_at
- **entries** — id, user_id, entry_date, title, ai_title, body, summary, mood(int), energy(int), emotion(text), is_favorite, word_count, created_at, updated_at, **embedding** vector(768)
- **tags** — id, user_id, name · **entry_tags** — entry_id, tag_id
- **attachments** — id, user_id, entry_id, storage_path, kind
- **chat_messages** — id, user_id, role, content, created_at
- **reflections** (v2) — id, user_id, period, period_start, content, created_at
- **prompts_cache** — id, user_id, date, prompt (daily prompt of the day)

## AI/API routes (server, Gemini key stays server-side)
- `POST /api/ai/summarize` → { summary, title } for an entry
- `POST /api/ai/sentiment` → { mood, emotion } for an entry
- `POST /api/ai/prompt` → today's tailored prompt
- `POST /api/ai/embed` → store entry embedding (on save)
- `POST /api/ai/chat` → RAG: embed question → pgvector match user's entries → Gemini answer
- (v2) `POST /api/ai/transcribe`, `/api/tts`, `/api/ai/reflection`

## Env vars
`DATABASE_URL` (Coolify Postgres), `AUTH_SECRET` (Auth.js), `GEMINI_API_KEY`, `NEXT_PUBLIC_SITE_URL=https://myaidiary.me` (+ `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` if Google login is enabled).

---

## Build roadmap (batches)
1. **Foundation** — design system + theme, layout, landing page, Postgres (Coolify) + Drizzle schema + migrations, Auth.js, profiles.
2. **Journaling core** — entries CRUD, editor, mood check-in, calendar + list, search, "on this day".
3. **AI #1** — summary + title + sentiment on save; mood timeline on `/insights`.
4. **AI #2** — daily smart prompts; chat-with-journal (embeddings + pgvector RAG).
5. **Retention & privacy** — streaks, reminders, PWA, app-lock, export, delete.
6. **Phase 2** — voice journaling, TTS, weekly reflections, semantic search.

## Definition of "v1 done"
Auth → write/edit/delete entries with mood → calendar + list → AI summary/title/sentiment → mood timeline → daily prompt → chat with journal → search → dark mode → export → privacy (RLS + app lock), deployed at `myaidiary.me`.
