# Zoop — Technical Documentation

> A multi-tenant AI assistant that runs a user's WhatsApp for them: auto-replies in the
> owner's voice, understands photos & voice notes, sends human-sounding AI voice notes, and
> takes natural-language commands — all from a web dashboard.

This document describes the architecture, every module, the data model, the message
lifecycle, the AI pipeline, billing, security, and how Zoop is deployed in production.

---

## 1. What Zoop is

Zoop links to a user's WhatsApp account as a companion device (via the WhatsApp multi-device
protocol) and acts as that user's personal AI assistant inside WhatsApp. It:

- **Auto-replies** to incoming chats in a configurable persona (tone, language, even Hinglish).
- **Understands media** — "sees" incoming images and "hears"/transcribes voice notes via Gemini multimodal.
- **Sends AI voice notes** — generates natural, emotional voice replies through a `Gemini TTS → ffmpeg → Opus` pipeline.
- **Keeps per-chat memory** — maintains a rolling summary of each conversation and supports per-contact custom instructions ("tune").
- **Handles groups** — configurable group reply behaviour (off / only-when-mentioned / smart) with witty clap-back defense of the owner.
- **Flags important messages** — alerts the owner's own number on urgent matters (money, emergencies).
- **Takes owner commands** — a natural-language console: *"send Alex a voice note saying I'm running late"*, *"what did Sam say today?"*.
- **Follows up proactively** — optionally nudges quiet/incomplete chats.

It is a **multi-tenant SaaS**: each tenant signs up with email/password, links their own
WhatsApp, and is fully isolated in their own encrypted SQLite database with a credit wallet.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Language | TypeScript (ESM), run directly via `tsx` — **no build step** |
| Runtime | Node.js |
| Web server | Express 4 + `express-session` (cookie sessions) |
| AI | Google Gemini via `@google/genai` — text, vision, audio understanding, TTS |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) multi-device client |
| Storage | `better-sqlite3` — one platform DB + one DB per tenant |
| Encryption | Node `crypto` — AES-256-GCM at rest, per-tenant keys |
| Passwords | `bcryptjs` |
| Audio | `ffmpeg` (raw PCM → OGG/Opus voice notes) |
| QR | `qrcode` (renders the WhatsApp link QR as a data URL) |
| Logging | `pino` (platform console) + per-tenant encrypted DB log table |
| Frontend | Vanilla JS + CSS single-page dashboard (served as static files) |
| Infra | Cloud VM, containerised under Coolify; fronted by the MyAIDiary Next.js app |

Dependencies (from `package.json`): `@google/genai`, `@whiskeysockets/baileys`, `bcryptjs`,
`better-sqlite3`, `dotenv`, `express`, `express-session`, `pino`, `qrcode`. Dev: `tsx`,
`typescript`, and `@types/*`.

---

## 3. High-level architecture

```
                 ┌─────────────────────── Zoop process (Node, tsx) ───────────────────────┐
WhatsApp  ──ws──►│  TenantSession (Baileys socket)                                          │
  servers        │     │  decrypt (Signal) + decode (protobuf)                              │
                 │     ▼                                                                     │
                 │  handleIncoming → store (encrypted) → debounce → doReply                 │
                 │     │                         │                                           │
                 │     │                         ├──► ai.ts → Gemini (reply / vision / TTS)  │
                 │     │                         │                  │                        │
                 │  TenantDB (per-tenant         │            ffmpeg (PCM→Opus voice note)   │
                 │  SQLite, AES-256 at rest)     ▼                  │                        │
                 │     ▲                    billing.ts (charge wallet)                       │
                 │     │                                                                     │
                 │  Express API + static dashboard  ◄── HTTP ──┐                             │
                 └─────────────────────────────────────────────┼─────────────────────────-─┘
                                                                │
   Browser ──► MyAIDiary (Next.js) /api/zoop/* ──proxy────────►┘  (Express on :3001)
```

- A single Node process hosts **all tenants**. `Manager` keeps one `TenantSession` (live
  WhatsApp connection) and one `TenantDB` per tenant in memory.
- The Express server serves the dashboard and a JSON API; the browser reaches it through the
  MyAIDiary Next.js app, which proxies `/api/zoop/*` to Zoop's `/api/*`.

---

## 4. Source layout

```
zoop/
├── nixpacks.toml          # build recipe — adds ffmpeg to the runtime image
├── package.json           # deps + scripts (start = tsx src/index.ts)
├── .env.example           # all config knobs
└── src/
    ├── index.ts           # entrypoint: legacy migration, start server, boot all tenants
    ├── config.ts          # env → typed config object (+ Gemini key rotation list)
    ├── logger.ts          # pino console logger (clog)
    ├── crypto.ts          # AES-256-GCM helpers + per-tenant key derivation
    ├── platform-db.ts     # global tenants table (auth records)
    ├── tenant-db.ts       # per-tenant encrypted SQLite (the bulk of the data model)
    ├── manager.ts         # owns/creates/deletes TenantSession + TenantDB instances
    ├── session.ts         # THE ENGINE: Baileys socket + message lifecycle + sending
    ├── ai.ts              # all Gemini calls (reply, summary, media, command, TTS)
    ├── billing.ts         # token-based credit wallet + ledger
    ├── server/
    │   ├── app.ts         # Express routes (auth, settings, contacts, wallet, command…)
    │   └── public/        # dashboard SPA (index.html, app.js, style.css)
    ├── db.ts / whatsapp.ts # legacy stubs (replaced by tenant-db.ts / session.ts)
    └── types.d.ts         # minimal bcryptjs typings
```

---

## 5. Configuration (`config.ts` / `.env`)

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Primary Gemini key. Operator pays for all tenants. |
| `GEMINI_API_KEYS`, `GEMINI_API_KEY_2/3/4` | — | Extra keys, **rotated on 429 quota errors** (mainly for TTS, which has a low daily cap). |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Default model for replies/summaries. |
| `PORT` / `HOST` | `3001` / `0.0.0.0` | Dashboard server bind. |
| `SESSION_SECRET` | insecure dev value | Express session signing secret. |
| `MASTER_KEY` | falls back to `SESSION_SECRET` | **Master encryption key. Must be set and stable forever** — changing it makes all encrypted data unreadable. |
| `REPLY_MODE` | `auto` | `auto` \| `approval` \| `off` (per-tenant overridable in settings). |
| `DM_ONLY` | `true` | Reply only to 1:1 DMs vs. also groups. |
| `MIN/MAX_REPLY_DELAY_MS` | `400` / `1500` | Human-like typing delay window (anti-ban). |
| `BURST_DEBOUNCE_MS` | `1200` | Wait after the last incoming msg so a flurry gets **one** reply. |
| `MAX_REPLIES_PER_MINUTE` | `30` | Global send rate cap. |
| `MIN_GAP_PER_CONTACT_MS` | `1500` | Minimum gap between sends to one contact. |
| `SUMMARIZE_EVERY_N_MESSAGES` | `10` (code default `4`) | Rebuild a chat's summary after N new incoming messages. |
| `ZOOP_ADMIN_TOKEN` | — | Guards the admin credit-grant endpoint. |
| `LEGACY_EMAIL` / `LEGACY_PASSWORD` | — | Credentials for the one-time single-tenant → tenant-1 migration. |

Paths are fixed: `data/platform.db`, `data/tenants/<id>.db`, `auth/<id>/` (Baileys
multi-file auth state per tenant).

---

## 6. Data model

### 6.1 Platform DB (`platform-db.ts`) — `data/platform.db`

One table, holding only auth records (no message content):

```sql
tenants(id TEXT PK, email TEXT UNIQUE, pass_hash TEXT, created_at INTEGER)
```

Passwords are bcrypt-hashed (cost 10). IDs are random url-safe tokens (`randomId`).

### 6.2 Tenant DB (`tenant-db.ts`) — `data/tenants/<id>.db`

Each tenant gets a private SQLite file. Sensitive text/blob columns are AES-256-GCM
encrypted at rest with the tenant's derived key. Tables:

| Table | Key columns | Notes |
|---|---|---|
| `contacts` | `jid` PK, `name`, `saved_name`, `pn`, `auto_reply`, `is_group`, `blocked`, `pfp_url`, `last_message_at`, `msg_count_since_summary`, `tune`, `voice_mode`, `voice_prob`, `last_followup_at` | One row per chat/contact/group. Names & `tune` encrypted. Schema self-migrates (adds new columns if missing). |
| `messages` | `id`, `jid`, `direction` (`in`/`out`), `body` (encrypted), `ai_generated`, `wa_id`, `media_id`, `created_at` | Unique index on `(jid, wa_id)` dedupes redelivery. Sorted by `created_at` so synced history doesn't jump to the bottom of live chats. |
| `media` | `id` PK, `kind`, `mime`, `data` BLOB (encrypted bytes), `created_at` | Stored photo/voice/video so the dashboard can preview them. |
| `summaries` | `jid` PK, `summary` (encrypted), `updated_at` | Rolling per-chat memory. |
| `pending` | `id`, `jid`, `draft` (encrypted), `status` | Approval-mode drafts awaiting the owner. |
| `settings` | `key` PK, `value` (encrypted) | Per-tenant config: mode, model, persona, about_owner, alert_number, voice settings, wallet balance, owner_name. |
| `logs` | `id`, `level`, `scope`, `message` (encrypted), `meta` (encrypted), `created_at` | Per-tenant activity log shown in the dashboard. |
| `ledger` | `id`, `kind`, `model`, `tokens_in/out`, `amount_inr` (signed), `balance_after`, `note`, `created_at` | Credit charges / grants / recharges. |

JIDs: `@s.whatsapp.net` (phone DMs), `@lid` (privacy-masked DMs), `@g.us` (groups). The code
reconciles `@lid` chats with phonebook numbers (`pn`) so saved names/photos attach correctly.

---

## 7. Encryption & security (`crypto.ts`)

- A **server master key** is hashed to 32 bytes: `MASTER = SHA-256(MASTER_KEY)`. It lives only
  in the process env — never written to any tenant DB.
- Each tenant gets a distinct key: `tenantKey(id) = HMAC-SHA256(MASTER, "tenant:" + id)`.
  So one tenant's leaked row can't be decrypted in another tenant's context, and a leaked DB
  file is useless without the master key.
- **Text** is encrypted as `"v1:" + base64(iv | tag | ciphertext)` (AES-256-GCM, 12-byte IV,
  16-byte auth tag). Legacy plaintext without the `v1:` prefix passes through transparently,
  so migration is seamless.
- **Binary media** uses a separate raw-buffer variant (`iv | tag | ciphertext`) to avoid
  base64-bloating large blobs.
- Decryption **fails closed**: a wrong key / corrupt blob returns `''` rather than leaking
  garbage.
- Other security properties: bcrypt password hashing; httpOnly session cookies (30-day
  maxAge); account deletion is password-confirmed and wipes DB + auth files; the bulk
  follow-up action is also password-gated; admin grant endpoint is token-guarded.

> **Honest scope note (from the README):** encryption is **at rest** (operator-controlled),
> *not* end-to-end — the AI provider necessarily processes message content to generate
> replies. Baileys is an unofficial WhatsApp client, so Zoop carries WhatsApp's automation/ban
> risk and is intended as a personal-use project / engineering demo, not a commercial service.

---

## 8. Process lifecycle (`index.ts` → `manager.ts`)

1. **Boot** (`main` in `index.ts`): validate config, run `migrateLegacy()`, build & start the
   Express server, then `manager.bootAll()`.
2. **Legacy migration**: if there are zero tenants but an old single-tenant install exists
   (`data/zoop.db` + `auth/`), it's converted into tenant #1 — moving Baileys auth into
   `auth/<id>/` and the DB into `data/tenants/<id>.db` so no WhatsApp relink is needed.
3. **`bootAll`**: starts a `TenantSession` per tenant, staggered by 1.5s each, so the server
   doesn't hammer WhatsApp with many simultaneous connections on startup.
4. **`Manager`** caches `TenantSession` and `TenantDB` per tenant id and exposes
   `startTenant`, `get`, `getDb`, `deleteTenant` (stops the session, unlinks WhatsApp, closes
   and deletes the DB + auth files).

---

## 9. The engine — `TenantSession` (`session.ts`)

This is the core. One instance per tenant owns the live WhatsApp socket and the full message
lifecycle.

### 9.1 Connection management (`start` / `reconnect` / `relink`)

- Creates a Baileys socket with `useMultiFileAuthState(auth/<id>)`, the latest WA protocol
  version, `syncFullHistory: true`, and `markOnlineOnConnect: false`.
- **Decryption recovery:** supplies `msgRetryCounterCache` (an in-memory cache) so Baileys can
  issue retry receipts — when a message fails to decrypt ("Bad MAC"), the sender re-encrypts
  with a fresh Signal session instead of the message being silently lost. `getMessage` returns
  our own recently-sent protos so peers who couldn't decrypt our messages get a resend.
- **`connection.update`** handles QR generation (rendered to a data URL for the dashboard),
  `open` (records `meJid`/`ownerJid`, then — after a 45s settle delay — gently syncs the
  address book, groups, and profile pictures so a fresh link doesn't look like a bot), and
  `close` (exponential-backoff reconnect, capped; gives up after >4 failed attempts if never
  linked so it doesn't throttle the whole server IP; stops permanently on logout).
- **`reconnect`** forces a fresh QR; **`relink`** wipes the auth folder entirely (the cure for
  a corrupted Signal session causing persistent Bad-MAC drops) while keeping chat data.

### 9.2 Event handlers

- **`messages.upsert`** — `notify` = live message (may reply); `append` = offline/multi-device
  sync (stored, never auto-replied). Each routes to `handleIncoming`.
- **`messaging-history.set`** — imports historical chats/messages (`importHistory`) and
  **suppresses replies while history streams in** (with a 180s safety timeout) so Zoop never
  answers month-old messages on link.
- **`contacts.upsert` / `contacts.update`** — ingests the address book, mapping saved names
  onto both phone JIDs and their `@lid` equivalents.
- Two timers: address-book resync every 20 min; auto follow-up scan every 3 h (only if the
  tenant enabled it).

### 9.3 Incoming message handling (`handleIncoming`)

1. Skip status broadcasts/newsletters; dedupe by `(jid, wa_id)`.
2. If the payload didn't decrypt, log it and bail (the retry-receipt flow recovers it later).
3. **Own messages** (`fromMe`, typed on the phone or sent by Zoop) are stored as outgoing so
   the dashboard shows both sides — but never trigger a reply.
4. Extract text; for media, **download → store encrypted bytes** and (for live DMs, or groups
   when group replies are on) run Gemini understanding so the AI gets a textual description /
   transcription. Synced (non-live) media uses a cheap label to avoid mass cost.
5. Upsert the contact, store the inbound message (group messages are prefixed with the
   sender's name so the AI knows who said what), reconcile `pn`/`@lid` duplicates and saved
   names, refresh the profile picture if stale.
6. **Reply gating:** bail if not live, if mode is `off`, if the contact is blocked or has
   auto-reply paused. Groups are always *stored* but replying depends on group mode
   (`off` / `mention` / `smart`). If allowed → `scheduleReply`.

### 9.4 Debounce, rate limiting, queue

- **`scheduleReply`** debounces per chat by `BURST_DEBOUNCE_MS` (so a burst of texts → one
  reply) and ensures only one reply per chat is in flight.
- **`rateLimitGate`** enforces `MIN_GAP_PER_CONTACT_MS` and a sliding-window
  `MAX_REPLIES_PER_MINUTE` cap.
- **`enqueueReply`** chains replies through a single promise so generation/sending is
  serialized, each with a 180s watchdog timeout.
- **`pace`** adds a presence "composing" indicator + a randomized human-like delay before
  sending.

### 9.5 Reply generation (`doReply`)

1. **Credit gate** — if the wallet is empty, skip and notify the owner once (6h cooldown).
2. **Approval mode** — generate a draft, queue it in `pending`, flag importance, don't send.
3. **Auto mode** — pace, call `generateReply`, flag important messages to the owner, send via
   `rawSend`, then maybe update the summary.

### 9.6 Sending (`rawSend` / voice notes)

- Decides whether to send a **voice note** (`shouldVoice` — see §10.3); if so, synthesizes and
  sends OGG/Opus PTT audio, falling back to text on any failure.
- Text replies **quote** the triggering message (swipe-reply) and, in groups, **@-mention**
  the sender. Sent protos are cached for resend; presence is set to "paused" after sending;
  the outgoing message is stored.

### 9.7 Owner command channel (`ownerCommand` / `runCommand`)

Natural-language console with short-term memory (last 16 turns). `interpretCommand` classifies
intent into `send` (verbatim), `compose` (Zoop writes it from a brief/scenario), `ask` (answer
about a chat), or `none`, plus a target contact and a `voice` flag. It resolves the contact
(by saved name, push name, number, or raw phone number), composes if needed, and sends.

### 9.8 Proactive follow-ups (`followUpScan`)

Finds "stale" DMs (quiet for a while, last message inbound, not recently nudged), asks the AI
whether a follow-up genuinely helps (`followUpDecision`), and sends a short natural nudge —
capped at 6 per scan with human-like spacing, respecting a per-contact cooldown.

### 9.9 Summaries (`maybeSummarize` / `buildSummary`)

After every `summarizeEveryN` inbound messages (or on owner request), the recent transcript +
prior summary are condensed by Gemini into an ~80-word rolling summary stored per chat. This
summary feeds back into the reply context as "what you know about this person."

---

## 10. AI pipeline (`ai.ts`)

All Gemini calls go through here. Every call accepts an optional `onUsage` callback that
`session.ts` wires to `billing.charger(...)` so token usage is metered.

### 10.1 Reliability features

- **Model self-heal** (`genContent`): if a tenant's chosen model is retired/unavailable (404),
  it falls back to the default model so replies never silently die.
- **Safety thresholds** set to `BLOCK_NONE` across categories — personal WhatsApp banter is
  crude/profane, and the default filters were causing empty "no reply generated" outputs.
- **Timeouts** on every call via `withTimeout`.
- **JSON salvage** (`extractReplyField`): if a long structured reply is truncated at the token
  cap, the `reply` string is recovered so a raw `{...}` blob is never sent to a contact.

### 10.2 Functions

| Function | Purpose |
|---|---|
| `generateReply` | Main reply. Builds a system instruction from persona + owner facts + chat summary + per-chat tune + date/time, sends chat history, returns structured JSON `{reply, important, reason, shouldReply}`. Groups must opt in via `shouldReply`; the model clap-backs (wittily, no slurs) when the owner is disrespected. |
| `summarize` | Condenses a transcript into the ~80-word rolling summary. |
| `understandMedia` | Transcribes audio / describes images & video (multimodal). |
| `interpretCommand` | Parses an owner console instruction into `{intent, contact, text, voice}`, carefully separating *meta-instructions* ("make it rhyming", "voice note", "send it again") from message content. |
| `composeMessage` | Ghost-writes a message/voice-note script from a brief or role-play scenario, with progressively cleaner retries for spicy/roast requests. |
| `answerAboutChat` | Answers the owner's questions about a chat ("what did Sam say?") factually, in clean wording. |
| `followUpDecision` | Decides whether a quiet chat deserves a nudge and writes it. |
| `synthesizeSpeech` | **TTS.** Gemini TTS → raw PCM (24kHz, 16-bit, mono). Rotates across all configured API keys on 429 quota errors; when all are exhausted, trips a ~6h circuit breaker so callers send text instantly instead of failing each message. |

### 10.3 Voice note pipeline

1. `shouldVoice` decides per reply. Precedence: explicit request ("send a voice note") or a
   per-chat `voice` mode → always voice; per-chat `text` → never; per-chat `mixed` or global
   `default` → voice for long replies (≥160 chars) and a random `voice_prob`% of shorter ones,
   capped at 900 chars; skipped entirely if the TTS quota circuit breaker is open.
2. `makeVoiceOgg`: strip emojis, chunk long text at sentence boundaries (so each TTS request
   stays fast), synthesize chunks **in parallel**, concatenate the raw PCM.
3. `pcmToOpus`: pipe PCM through `ffmpeg` → OGG/Opus (`libopus`, 32k, voip) — the exact format
   WhatsApp voice notes (PTT) require.
4. Send as `{ audio, mimetype: 'audio/ogg; codecs=opus', ptt: true }`; store the bytes so the
   dashboard can replay it, with the transcript as the message body.

---

## 11. Billing (`billing.ts`)

Token-based prepaid credit wallet, priced in **INR**.

- **Rates:** Google's published per-million-token rates per model (input/output), e.g.
  `gemini-2.5-flash` = $0.30 in / $2.50 out; TTS models priced separately.
- **Pricing:** `cost = tokens × rate × MARKUP(2×) × USD_TO_INR(86)`.
- **Wallet:** balance stored (encrypted) in tenant `settings`; every AI call records a signed
  `ledger` row (charge/grant) with token counts and resulting balance.
- **Free trial:** new accounts get a `SIGNUP_GRANT_INR` (₹50) bonus.
- **Gate:** `canSpend` (balance > 0) gates all AI activity; running out pauses replies and
  notifies the owner.
- **Top-ups:** the public recharge endpoint returns "coming soon" (payment gateway disabled);
  admins can grant credits by email via the token-guarded `/api/admin/grant`.
- `charger(db, kind)` returns the `onUsage` closure passed into every `ai.ts` call; billing
  failures are swallowed so they can never crash the engine.

---

## 12. HTTP API & dashboard (`server/app.ts`, `server/public/`)

Express app (`12mb` JSON limit, cookie sessions named `zoop.sid`). `tenantDb(req,res)`
resolves the logged-in tenant or returns 401.

| Group | Endpoints |
|---|---|
| **Auth** | `POST /api/signup` (creates tenant, starts session, grants trial credits), `POST /api/login`, `POST /api/logout`, `POST /api/delete-account` (password-confirmed wipe), `GET /api/me` |
| **Wallet** | `GET /api/wallet` (balance + ledger), `POST /api/recharge` (503 "coming soon"), `POST /api/admin/grant` (token-guarded) |
| **Status/link** | `GET /api/status` (connection + QR), `POST /api/reconnect`, `POST /api/relink` |
| **Settings** | `GET/POST /api/settings` (mode, model, alert number, group mode, auto-followup, voice options) |
| **Persona** | `GET/POST /api/persona` (persona text + "about owner" facts) |
| **Contacts** | `GET /api/contacts`, `GET /api/contacts/:jid/messages` (+`?after=` for polling), `POST .../summarize`, `.../auto`, `.../block`, `.../name`, `GET/POST .../tune`, `GET/POST .../voice` |
| **Media** | `GET /api/media/:id` (decrypts & streams a stored blob) |
| **Actions** | `POST /api/sync` (address book), `POST /api/followup` (password-gated bulk nudge), `POST /api/command` (owner console), `POST /api/import-contacts` (vCard or "Name, +number"), `POST /api/block-number` |
| **Logs** | `GET /api/logs` (+`?after=` id cursor) |
| **Approvals** | `GET /api/pending`, `POST /api/pending/:id/approve`, `POST /api/pending/:id/reject` |

The dashboard (`public/index.html`, `app.js`, `style.css`) is a vanilla-JS SPA: WhatsApp-style
chat UI, QR link screen, approvals queue, live logs, persona editor, contact import, wallet,
and the agent command console.

---

## 13. Production deployment

- **Build:** `nixpacks.toml` adds **`ffmpeg`** to the runtime image (required for the voice-note
  PCM→Opus step); `"..."` preserves nixpacks' auto-detected Node toolchain (which `better-sqlite3`
  compiles against). Start command: `tsx src/index.ts` (no compile step).
- **Hosting:** Zoop runs as a containerised app under **Coolify** (Traefik proxy, GCP VM
  `loopwar`, zone `asia-south2-b`). The Zoop service listens on **port 3001**.
- **Front door:** the MyAIDiary Next.js app exposes a catch-all proxy at
  [app/api/zoop/[...path]/route.ts](../app/api/zoop/%5B...path%5D/route.ts) that forwards
  `/api/zoop/*` → `ZOOP_URL` (`http://localhost:3001`) `/api/*`, passing through cookies and
  content-type (so the session cookie and dashboard work seamlessly behind the main site).
  If Zoop is down it returns `503 {"error":"Zoop service unavailable"}`.
- **Persistence:** SQLite files under `data/` and Baileys auth under `auth/` must be on a
  persistent volume. **`MASTER_KEY` must remain constant** across deploys or all encrypted
  data becomes unreadable.

> The README also describes a simpler standalone deployment (systemd + nginx on a VM); the
> current production setup uses Coolify + the Next.js proxy instead.

---

## 14. Key design decisions (why it's built this way)

- **No build step** (`tsx`) — fast iteration, fewer moving parts in deploy.
- **One DB per tenant + per-tenant keys** — strong isolation; a single leaked file is useless.
- **Encryption at rest, fail-closed decryption** — honest about not being E2E, but protects
  data on disk.
- **Retry-receipt cache** — turns WhatsApp's lossy "Bad MAC" decryption failures into
  recoverable resends instead of silent message loss.
- **Debounce + rate limits + settle delays + human-like pacing** — anti-ban behaviour, so an
  AI-driven device doesn't look like an obvious bot.
- **Structured JSON replies with salvage** — reliable parsing; never leaks raw JSON to a contact.
- **Gemini key rotation + TTS circuit breaker** — keeps the service responsive under the low
  daily TTS quota by rotating keys and degrading gracefully to text.
- **Token-metered prepaid wallet** — every AI call is individually priced and ledgered.
```
