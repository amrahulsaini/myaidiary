<div align="center">

# ⚡ Zoop

### A multi-tenant AI assistant that runs your WhatsApp for you.

Auto-replies to your chats in *your* voice, understands photos & voice notes, sends **human-sounding AI voice notes**, and takes commands in plain English — all from a clean web dashboard.

`TypeScript` · `Node.js` · `Google Gemini` · `Baileys` · `SQLite` · `Express` · `GCP`

</div>

---

## What it does

- 🤖 **AI auto-reply** — answers your WhatsApp chats in a persona you define (tone, language, even Hinglish).
- 🎙️ **AI voice notes** — replies with natural, emotional voice notes via a **Gemini TTS → ffmpeg → Opus** pipeline (with laughs and emotion), not robotic text-to-speech.
- 👁️ **Media understanding** — "sees" incoming photos and "hears" voice notes (Gemini multimodal) and replies in context.
- 🧠 **Per-chat memory & tuning** — builds a running summary of every conversation, and lets you set custom instructions per contact ("be flirty here", "only Hindi", "roast him").
- 💬 **Agent command channel** — talk to your assistant in natural language: *"send Rishi a voice note saying I'm running late"*, *"what did Rajat say today?"*
- 👥 **Group handling** — configurable group replies (off / only-when-mentioned / active) with witty clap-back defense.
- 🔔 **Important-message alerts** — flags urgent messages (money, emergencies) to your own number.
- 📊 **Dashboard** — WhatsApp-style chat UI, approvals queue, live logs, persona editor, contact import.

## Architecture highlights

Built like a real product, not a script:

- **Multi-tenant SaaS** — email/password auth, each tenant fully isolated in their own SQLite database.
- **Encryption at rest** — every tenant's messages, contacts and settings are **AES-256-GCM encrypted**, with a **per-tenant key derived (HMAC-SHA256) from a server master key** — so a leaked DB file is useless without the master key.
- **Real-time messaging integration** — connects to WhatsApp's multi-device protocol (Noise + Signal + protobuf over WebSocket) via Baileys, with **automatic reconnection, conflict handling, and Signal-session failure recovery** (retry-receipt cache to recover messages that fail to decrypt).
- **LLM done right** — structured JSON output with response schemas, safety-tuned generation, multimodal media understanding, and a text-to-speech voice pipeline.
- **Production deployment** — runs on a cloud VM under **systemd** (auto-restart / self-healing) behind an **nginx** reverse proxy.

## Tech stack

| Layer | Tech |
|---|---|
| Language | TypeScript (run via `tsx`, no build step) |
| Backend | Node.js, Express, express-session |
| AI | Google Gemini (`@google/genai`) — text, vision, audio, TTS |
| WhatsApp | Baileys (`@whiskeysockets/baileys`) multi-device |
| Storage | better-sqlite3 (per-tenant), AES-256-GCM at rest |
| Audio | ffmpeg (PCM → OGG/Opus voice notes) |
| Frontend | Vanilla JS + modern CSS (Inter, glassmorphism, responsive) |
| Infra | Cloud VM, systemd, nginx |

## How it works

```
WhatsApp  ──websocket──►  Baileys (linked device)
                              │  decrypt (Signal) + decode (protobuf)
                              ▼
                       TenantSession  ──►  Gemini  (reply / vision / TTS)
                              │                        │
                       per-tenant DB             ffmpeg (voice note)
                       (AES-256 at rest)               │
                              ▼                         ▼
                          Dashboard  ◄───  Express API  ──►  send to WhatsApp
```

1. A message arrives → Baileys decrypts it (Signal protocol) and decodes the protobuf.
2. The tenant's session stores it (encrypted), updates the running summary, and builds the AI context (persona + about + summary + per-chat tune + recent history).
3. Gemini generates a structured reply; media is understood with Gemini vision/audio.
4. The reply goes out as text — or, by a configurable probability, as an **AI voice note** (Gemini TTS → ffmpeg → Opus).
5. Everything is visible and controllable from the web dashboard.

## A note on scope & ethics

Zoop uses Baileys (an unofficial WhatsApp client), so it carries WhatsApp's automation/ban risk and is intended as a **personal-use project and engineering demonstration**, not a commercial service. Encryption is **at rest** (operator-controlled) — it is honestly *not* end-to-end; the AI provider necessarily processes message content to generate replies. The codebase is structured so the AI core is platform-agnostic and could be moved onto official APIs.

---

<div align="center">

Built solo, end to end — from Signal-protocol debugging to the encryption design to deployment.

**Open to AI / full-stack engineering roles & freelance.**

</div>
