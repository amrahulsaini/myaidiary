import * as Baileys from '@whiskeysockets/baileys';
const makeWASocket = (Baileys as any).default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers, downloadMediaMessage, jidNormalizedUser } =
  Baileys as any;
import type { WASocket } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './config.js';
import { TenantDB } from './tenant-db.js';
import { generateReply, summarize, understandMedia, interpretCommand, answerAboutChat, composeMessage, followUpDecision, synthesizeSpeech, ttsQuotaBlockedUntil, DEFAULT_PERSONA } from './ai.js';
import { clog } from './logger.js';
import * as billing from './billing.js';
import { spawn } from 'node:child_process';

const waLogger = pino({ level: 'silent' });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rand = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timeout`)), ms))]);
}
function truncate(s: string, n = 80): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}
// Convert Gemini TTS PCM (s16le, 24kHz, mono) → OGG/Opus, the format WhatsApp voice notes use.
function pcmToOpus(pcm: Buffer): Promise<Buffer | null> {
  return new Promise((resolve) => {
    const ff = spawn('ffmpeg', ['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', 'pipe:0',
      '-c:a', 'libopus', '-b:a', '32k', '-application', 'voip', '-f', 'ogg', 'pipe:1']);
    const out: Buffer[] = [];
    ff.stdout.on('data', (d) => out.push(d));
    ff.on('error', () => resolve(null));
    ff.on('close', (code) => resolve(code === 0 && out.length ? Buffer.concat(out) : null));
    ff.stdin.on('error', () => {});
    ff.stdin.write(pcm);
    ff.stdin.end();
  });
}
// strip emojis/pictographs so the TTS voice doesn't try to read them aloud.
function stripEmoji(s: string): string {
  return s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️]/gu, '').replace(/\s{2,}/g, ' ').trim();
}
// Split text into ~maxLen pieces at sentence boundaries so each TTS request stays fast (no timeout).
function chunkForTTS(text: string, maxLen = 600): string[] {
  const sentences = text.match(/[^.!?…\n]+[.!?…]*\s*|\n+/g) || [text];
  const out: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && (cur + s).length > maxLen) { out.push(cur); cur = ''; }
    cur += s;
    while (cur.length > maxLen) { out.push(cur.slice(0, maxLen)); cur = cur.slice(maxLen); } // hard-split a huge sentence
  }
  if (cur.trim()) out.push(cur);
  return out.filter((p) => p.trim());
}
// Minimal in-memory CacheStore for Baileys. The retry-counter cache is REQUIRED for the
// retry-receipt flow that recovers messages which fail to decrypt (Bad MAC) — without it those
// messages are dropped forever and the Signal session never self-heals.
function makeCache() {
  const store = new Map<string, any>();
  return {
    get: <T>(k: string): T | undefined => store.get(k),
    set: (k: string, v: any) => { store.set(k, v); },
    del: (k: string) => { store.delete(k); },
    flushAll: () => store.clear(),
  };
}

export class TenantSession {
  private sock: WASocket | null = null;
  private currentQR = '';
  private connectionState = 'connecting';
  private meJid = '';
  private ownerJid = '';
  private caughtUp = false;
  private reconnectAttempts = 0;
  private resyncTimer: NodeJS.Timeout | null = null;
  private followupTimer: NodeJS.Timeout | null = null;
  private groupsSynced = false;
  private everConnected = false; // has this session ever linked/opened?
  private historySyncing = false; // suppress replies while history is streaming in
  private histTimer: NodeJS.Timeout | null = null;
  private stopped = false;
  private savedNameByPn = new Map<string, string>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private replyInFlight = new Set<string>();
  private sendTimestamps: number[] = [];
  private lastSentPerContact = new Map<string, number>();
  private lastOwnerNotify = new Map<string, number>(); // cooldown for important alerts
  private lastOutOfCreditsNotify = 0; // cooldown for the "you're out of credits" owner alert
  private lastInbound = new Map<string, any>(); // last raw msg per chat (for quote/swipe-reply)
  private agentLog: { role: 'owner' | 'agent'; text: string }[] = []; // agent console memory
  private chain: Promise<void> = Promise.resolve();
  private msgRetryCache = makeCache(); // Baileys retry-receipt counter — recovers failed decryptions
  private sentMsgCache = makeCache(); // our recently-sent message protos, for getMessage() resends

  constructor(public readonly tenantId: string, public readonly db: TenantDB) {
    db.initSettings({ mode: config.reply.mode, model: config.gemini.model });
  }

  private log(level: 'info' | 'warn' | 'error', scope: string, message: string, meta?: unknown) {
    this.db.log(level, scope, message, meta);
    clog(level, `${this.tenantId}:${scope}`, message);
  }
  private model(): string {
    return this.db.getSetting('model', config.gemini.model);
  }
  private getPersona(): string {
    const custom = this.db.getSetting('persona', '');
    if (custom) return custom;
    return DEFAULT_PERSONA.split('{OWNER}').join(this.db.getSetting('owner_name', 'the owner'));
  }

  getStatus() {
    return {
      connection: this.connectionState,
      qr: this.connectionState === 'open' ? '' : this.currentQR,
      me: this.meJid,
      mode: this.db.getSetting('mode', config.reply.mode),
      model: this.model(),
    };
  }

  // ===== Owner command channel (you control your own assistant from the dashboard) =====
  async ownerCommand(text: string): Promise<string> {
    const history = [...this.agentLog]; // prior turns (memory) — lets it resolve "make it rhyming" etc.
    let reply: string;
    try {
      reply = await this.runCommand(text, history);
    } catch (e: any) {
      reply = 'Error: ' + String(e?.message || e);
    }
    this.agentLog.push({ role: 'owner', text }, { role: 'agent', text: reply });
    if (this.agentLog.length > 16) this.agentLog = this.agentLog.slice(-16);
    return reply;
  }

  private async runCommand(text: string, history: { role: 'owner' | 'agent'; text: string }[]): Promise<string> {
    if (!this.sock || this.connectionState !== 'open') return '⚠️ WhatsApp not connected.';
    const contacts = this.db.listContacts();
    const names = contacts.map((c: any) => c.name || c.jid.split('@')[0]);
    const cmd = await interpretCommand(this.model(), text, names, history, billing.charger(this.db, 'agent'));

    if (cmd.intent === 'send' && cmd.text) {
      const c = this.db.resolveContactByQuery(cmd.contact);
      if (!c) return `❌ Couldn't find a contact matching "${cmd.contact}". Try the exact saved name.`;
      await this.sendManual(c.jid, cmd.text, false, !!cmd.voice);
      const how = cmd.voice ? '🎤 voice note to' : 'to';
      return `✅ Sent ${how} *${c.name || c.jid.split('@')[0]}*:\n"${cmd.text}"`;
    }
    if (cmd.intent === 'compose') {
      const c = this.db.resolveContactByQuery(cmd.contact);
      if (!c) return `❌ Couldn't find a chat/group matching "${cmd.contact}". Try the exact saved name.`;
      const isGroup = c.jid.endsWith('@g.us');
      const transcript = this.db
        .recentMessages(c.jid, 30)
        .map((m: any) => (m.direction === 'in' ? m.body : `Me/Zoop: ${m.body}`))
        .join('\n');
      const tune = this.db.getTune(c.jid);
      const brief = (tune ? `[Special instructions for this chat — follow these: ${tune}]\n` : '') + (cmd.text || text);
      const composed = await composeMessage(
        this.model(), this.getPersona(), this.db.getSetting('about_owner', ''),
        c.name || c.jid.split('@')[0], brief, transcript, isGroup, billing.charger(this.db, 'agent')
      );
      if (!composed) return `❌ Couldn't compose that. Try rephrasing.`;
      await this.sendManual(c.jid, composed, false, !!cmd.voice);
      const how = cmd.voice ? '🎤 voice note to' : 'to';
      return `✅ Sent ${how} *${c.name || c.jid.split('@')[0]}*:\n"${composed}"`;
    }
    if (cmd.intent === 'ask') {
      const c = this.db.resolveContactByQuery(cmd.contact);
      if (!c) return `❌ Which contact? I couldn't match "${cmd.contact}".`;
      const hist = this.db.recentMessages(c.jid, 30).map((m: any) => ({ direction: m.direction, body: m.body }));
      return await answerAboutChat(this.model(), text, hist, c.name || c.jid.split('@')[0], billing.charger(this.db, 'agent'));
    }
    return "I can *send* a message (e.g. \"text Aditi: running 10 min late\") or tell you *what someone said* (e.g. \"what did Harshit say today?\"). What do you need?";
  }

  private resolveContact(contacts: any[], name: string): any {
    if (!name) return null;
    const n = name.toLowerCase().trim();
    return (
      contacts.find((c) => (c.name || '').toLowerCase() === n) ||
      contacts.find((c) => (c.name || '').toLowerCase().includes(n)) ||
      contacts.find((c) => n.length > 2 && n.includes((c.name || '').toLowerCase()) && (c.name || '').length > 2) ||
      null
    );
  }

  // send a message exactly as given (owner-directed, no AI flavour / quoting). asVoice → voice note.
  private async sendManual(jid: string, text: string, ai = false, asVoice = false): Promise<void> {
    if (!this.sock) return;
    if (asVoice) {
      const ogg = await this.makeVoiceOgg(text);
      if (ogg) {
        const sent = await withTimeout(
          this.sock.sendMessage(jid, { audio: ogg, mimetype: 'audio/ogg; codecs=opus', ptt: true }, {}), 30000, 'sendManualVoice');
        const waId = sent?.key?.id || null;
        if (sent?.key?.id && sent.message) this.sentMsgCache.set(sent.key.id, sent.message);
        if (waId) this.db.saveMedia(waId, 'audio', 'audio/ogg', ogg);
        this.db.addMessage(jid, 'out', text, ai, waId, waId);
        this.log('info', 'msg', `OUT 🎤 (command) ${jid.split('@')[0]}: ${truncate(text)}`);
        return;
      }
      this.log('warn', 'reply', 'command voice note failed — sending as text');
    }
    const sent = await withTimeout(this.sock.sendMessage(jid, { text }), 20000, 'sendManual');
    this.db.addMessage(jid, 'out', text, ai, sent?.key?.id || null);
    this.log('info', 'msg', `OUT (${ai ? 'follow-up' : 'command'}) ${jid.split('@')[0]}: ${truncate(text)}`);
  }

  // ===== Proactive follow-ups on "incomplete" chats (manual or auto) =====
  async followUpScan(): Promise<{ checked: number; sent: number }> {
    if (!this.sock || this.connectionState !== 'open') return { checked: 0, sent: 0 };
    if (this.db.getSetting('mode', config.reply.mode) === 'off') return { checked: 0, sent: 0 };
    const chats = this.db.staleChats();
    let sent = 0;
    for (const c of chats) {
      if (sent >= 6) break; // hard cap per scan (anti-ban)
      this.db.setLastFollowup(c.jid); // mark checked either way → respects cooldown, won't re-nag
      const idleH = Math.round((Date.now() - c.last_message_at) / 3600000);
      const transcript = this.db
        .recentMessages(c.jid, 20)
        .map((m: any) => (m.direction === 'in' ? `Them: ${m.body}` : `Me/Zoop: ${m.body}`))
        .join('\n');
      const d = await followUpDecision(this.model(), this.getPersona(), this.db.getSetting('about_owner', ''), c.name, transcript, idleH, billing.charger(this.db, 'followup'));
      if (d.followUp && d.message) {
        await this.rateLimitGate(c.jid);
        await this.sendManual(c.jid, d.message, true);
        this.log('info', 'reply', `📨 Follow-up sent to ${c.name}`);
        sent++;
        await sleep(rand(8000, 22000)); // space them out, human-like
      }
    }
    this.log('info', 'reply', `Follow-up scan: ${chats.length} checked, ${sent} sent`);
    return { checked: chats.length, sent };
  }

  // force a fresh connection attempt + QR (used when the owner is ready to (re)link)
  async reconnect(): Promise<void> {
    this.reconnectAttempts = 0;
    this.stopped = false;
    try {
      (this.sock as any)?.end?.(undefined);
    } catch {
      /* ignore */
    }
    this.sock = null;
    this.connectionState = 'connecting';
    await this.start();
  }

  // FULL relink: wipe the stored WhatsApp session (auth folder) and reconnect so a fresh QR is
  // generated with clean Signal keys. This is the cure for a corrupted session (persistent "Bad MAC"
  // decryption failures that silently drop incoming messages). Chats/contacts in the DB are untouched.
  async relink(): Promise<void> {
    this.reconnectAttempts = 0;
    this.everConnected = false;
    this.stopped = false;
    this.groupsSynced = false;
    try {
      this.sock?.ev.removeAllListeners('connection.update');
      (this.sock as any)?.end?.(undefined);
    } catch {
      /* ignore */
    }
    this.sock = null;
    this.msgRetryCache.flushAll();
    this.sentMsgCache.flushAll();
    const authPath = path.join(config.paths.authDir, this.tenantId);
    try {
      fs.rmSync(authPath, { recursive: true, force: true });
      this.log('warn', 'wa', 'Session wiped for relink — scan the fresh QR');
    } catch (e: any) {
      this.log('error', 'wa', 'failed to wipe auth: ' + String(e?.message || e));
    }
    this.connectionState = 'connecting';
    this.currentQR = '';
    await this.start();
  }

  // fetch ALL groups the user is in (so they all show in the Groups tab, even quiet ones)
  async syncGroups(): Promise<number> {
    if (!this.sock || this.connectionState !== 'open') return 0;
    try {
      const groups = await withTimeout(this.sock.groupFetchAllParticipating(), 20000, 'groupFetch');
      let n = 0;
      for (const jid of Object.keys(groups || {})) {
        this.db.ensureGroup(jid, (groups as any)[jid]?.subject);
        n++;
      }
      if (n) this.log('info', 'wa', `Synced ${n} group(s)`);
      return n;
    } catch (e: any) {
      this.log('warn', 'wa', 'group sync failed: ' + String(e?.message || e));
      return 0;
    }
  }

  // manually re-pull the address book (saved contact names) on demand
  async syncContacts(): Promise<boolean> {
    if (!this.sock || this.connectionState !== 'open') return false;
    try {
      await this.sock.resyncAppState(['critical_unblock_low', 'regular_high', 'regular_low', 'regular'], false);
      this.log('info', 'wa', 'Manual contact sync triggered');
      return true;
    } catch (e: any) {
      this.log('warn', 'wa', 'manual sync failed: ' + String(e?.message || e));
      return false;
    }
  }

  async start(): Promise<void> {
    // Tear down any previous socket FIRST so we never have two live connections for the same
    // device — two connections = WhatsApp "code 440" conflict loop. Also detach its listeners so
    // its close event can't trigger yet another reconnect.
    if (this.sock) {
      try {
        this.sock.ev.removeAllListeners('connection.update');
      } catch {
        /* ignore */
      }
      try {
        (this.sock as any).end?.(undefined);
      } catch {
        /* ignore */
      }
      this.sock = null;
    }
    const authPath = path.join(config.paths.authDir, this.tenantId);
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const s: WASocket = makeWASocket({
      version, auth: state, logger: waLogger,
      browser: Browsers.appropriate('Chrome'), markOnlineOnConnect: false, syncFullHistory: true,
      // REQUIRED to recover messages that fail to decrypt: lets Baileys answer/issue retry receipts
      // so the sender re-encrypts with a fresh session instead of the message being lost (Bad MAC).
      msgRetryCounterCache: this.msgRetryCache as any,
      // when a peer couldn't decrypt one of OUR messages, hand back the original so Baileys resends it.
      getMessage: async (key: any) => {
        const cached = this.sentMsgCache.get<any>(key?.id || '');
        return cached || undefined;
      },
    });
    this.sock = s;
    s.ev.on('creds.update', saveCreds);

    s.ev.on('connection.update', async (u: any) => {
      const { connection, lastDisconnect, qr } = u;
      if (qr) {
        this.currentQR = await QRCode.toDataURL(qr);
        this.connectionState = 'qr';
        this.log('info', 'wa', 'New QR generated — scan from dashboard');
      }
      if (connection === 'open') {
        this.connectionState = 'open';
        this.currentQR = '';
        this.reconnectAttempts = 0;
        this.everConnected = true;
        this.meJid = this.sock?.user?.id || '';
        this.ownerJid = this.meJid ? jidNormalizedUser(this.meJid) : '';
        this.log('info', 'wa', `WhatsApp connected as ${this.meJid}`);
        // Let a fresh link SETTLE before any heavy activity. A new device that instantly fetches
        // all groups + every profile pic + full address book + sends catch-up messages looks like
        // a bot and WhatsApp kicks it. So wait, then do it gently — and only if still connected.
        setTimeout(() => {
          if (this.connectionState !== 'open' || !this.sock) return;
          this.sock
            .resyncAppState(['critical_unblock_low', 'regular_high', 'regular_low', 'regular'], false)
            .then(() => this.log('info', 'wa', 'Requested address-book sync'))
            .catch((e: any) => this.log('warn', 'wa', 'resync failed: ' + String(e?.message || e)));
          if (!this.groupsSynced) {
            this.groupsSynced = true;
            this.syncGroups().catch(() => {});
          }
          this.backfillPfps().catch(() => {});
        }, 45000);
        // NOTE: auto catch-up disabled — it was replying to month-old history messages on link.
        // Live new messages are still answered normally; we just don't mass-reply on connect.
      }
      if (connection === 'close') {
        this.connectionState = 'close';
        if (this.stopped) return; // account deleted / shutting down — don't reconnect
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        if (code !== DisconnectReason.loggedOut) {
          this.reconnectAttempts++;
          // Never linked + cycling QRs/408s forever → stop hammering WhatsApp (which throttles the
          // whole server IP and makes OTHER tenants drop messages). Wait for a manual relink.
          if (!this.everConnected && this.reconnectAttempts > 4) {
            this.connectionState = 'qr';
            this.log('warn', 'wa', `Unlinked after ${this.reconnectAttempts} attempts — pausing reconnects (scan QR or restart to retry)`);
            return;
          }
          const delay = Math.min(60000, 3000 * 2 ** Math.min(this.reconnectAttempts - 1, 5));
          this.log('warn', 'wa', `Closed (code ${code}) — reconnect #${this.reconnectAttempts} in ${Math.round(delay / 1000)}s`);
          setTimeout(() => this.start().catch((e) => this.log('error', 'wa', 'reconnect failed: ' + String(e))), delay);
        } else {
          this.log('error', 'wa', 'Logged out — relink needed (delete auth and re-scan)');
        }
      }
    });

    s.ev.on('messages.upsert', async (m: any) => {
      // 'notify' = a fresh live message (we may reply). 'append' = messages added to a chat from
      // offline/multi-device sync — we STORE them so nothing goes missing, but never auto-reply.
      if (m.type !== 'notify' && m.type !== 'append') return;
      const live = m.type === 'notify';
      for (const msg of m.messages) {
        try {
          await this.handleIncoming(msg, live);
        } catch (err: any) {
          this.log('error', 'wa', 'handleIncoming error: ' + String(err?.message || err));
        }
      }
    });

    s.ev.on('messaging-history.set', (h: any) => {
      // While history is streaming in, suppress all replies (so we don't answer old messages
      // mid-sync). Cleared when the final batch arrives, with a safety timeout.
      this.historySyncing = !h?.isLatest;
      if (this.histTimer) clearTimeout(this.histTimer);
      this.histTimer = setTimeout(() => { this.historySyncing = false; }, 180000);
      if (h?.isLatest) this.log('info', 'wa', 'History sync complete');
      try {
        this.importHistory(h);
      } catch (err: any) {
        this.log('error', 'wa', 'history import error: ' + String(err?.message || err));
      }
    });

    const onContacts = (cs: any[]) => {
      let lid = 0, phone = 0;
      for (const c of cs || []) {
        const id: string = c?.id || '';
        if (!id || (!id.endsWith('@lid') && !id.endsWith('@s.whatsapp.net'))) continue;
        const saved: string = c?.name || c?.verifiedName || '';
        const isLid = id.endsWith('@lid');
        // only create a row for contacts that actually have a saved name — skip nameless ghosts
        if (saved) this.db.upsertAddressBookContact(id, saved, isLid ? null : id);
        if (saved) {
          if (isLid) this.db.setSavedName(id, saved);
          else {
            this.savedNameByPn.set(id, saved);
            this.db.applySavedNameByPn(id, saved);
          }
        }
        if (c?.lid && saved) this.db.setSavedName(c.lid, saved);
        if (isLid) lid++; else phone++;
      }
      // only log meaningful batches — single-contact updates fire in storms and flood the log.
      if (cs?.length > 2) this.log('info', 'wa', `Address-book sync: ${cs.length} contacts (${lid} lid, ${phone} phone)`);
    };
    s.ev.on('contacts.upsert', onContacts);
    s.ev.on('contacts.update', onContacts);

    if (!this.resyncTimer) {
      this.resyncTimer = setInterval(() => {
        if (this.sock && this.connectionState === 'open') {
          this.sock.resyncAppState(['critical_unblock_low', 'regular_high', 'regular_low', 'regular'], false).catch(() => {});
        }
      }, 20 * 60 * 1000);
    }
    // auto follow-up scan (only if the tenant enabled it) — every 3h
    if (!this.followupTimer) {
      this.followupTimer = setInterval(() => {
        if (this.sock && this.connectionState === 'open' && this.db.getSetting('auto_followup', 'off') === 'on') {
          this.followUpScan().catch(() => {});
        }
      }, 3 * 60 * 60 * 1000);
    }
  }

  private async refreshPfp(jid: string): Promise<void> {
    if (!this.sock || this.connectionState !== 'open') return;
    try {
      const url = await withTimeout(this.sock.profilePictureUrl(jid, 'image'), 8000, 'pfp');
      this.db.setPfp(jid, url || null);
    } catch {
      this.db.setPfp(jid, null);
    }
  }
  private maybeRefreshPfp(jid: string): void {
    const info = this.db.getContactPfpInfo(jid);
    const stale = !info?.pfp_checked_at || Date.now() - info.pfp_checked_at > 24 * 3600 * 1000;
    if (stale) this.refreshPfp(jid).catch(() => {});
  }
  private async backfillPfps(): Promise<void> {
    for (const jid of this.db.contactsNeedingPfp()) {
      if (this.connectionState !== 'open') return;
      await this.refreshPfp(jid);
      await sleep(800);
    }
  }
  private async catchUpOnStartup(): Promise<void> {
    if (this.db.getSetting('mode', config.reply.mode) !== 'auto') return;
    const list = this.db.contactsAwaitingReply();
    if (!list.length) return;
    this.log('info', 'reply', `Catch-up: replying to ${list.length} unanswered chat(s)`);
    for (const c of list) {
      if (this.connectionState !== 'open') break;
      this.enqueueReply(c.jid, c.name).catch(() => {});
    }
  }

  private tsToMs(t: any): number {
    if (!t) return Date.now();
    if (typeof t === 'number') return t * 1000;
    if (typeof t.toNumber === 'function') return t.toNumber() * 1000;
    return Number(t) * 1000 || Date.now();
  }
  private importHistory(h: any): void {
    const { chats = [], contacts = [], messages = [] } = h || {};
    const names = new Map<string, string>();
    for (const c of contacts) {
      const nm = c?.name || c?.notify || c?.verifiedName;
      if (c?.id && nm) names.set(c.id, nm);
      if (c?.id && c?.name && !String(c.id).endsWith('@lid')) {
        this.savedNameByPn.set(c.id, c.name);
        this.db.applySavedNameByPn(c.id, c.name);
      }
      if (c?.lid && c?.name) this.db.setSavedName(c.lid, c.name);
    }
    let chatN = 0, msgN = 0;
    for (const chat of chats) {
      const jid: string = chat?.id || '';
      if (!jid || jid === 'status@broadcast' || jid.endsWith('@newsletter')) continue;
      const isGroup = jid.endsWith('@g.us');
      // import all history incl. groups (visibility); reply-gating happens live, not here
      this.db.touchContact(jid, chat?.name || names.get(jid), isGroup, this.tsToMs(chat?.conversationTimestamp));
      chatN++;
    }
    for (const msg of messages) {
      const jid: string = msg?.key?.remoteJid || '';
      if (!jid || jid === 'status@broadcast' || jid.endsWith('@newsletter')) continue;
      const isGroup = jid.endsWith('@g.us');
      // import all history incl. groups (visibility); reply-gating happens live, not here
      const text = this.extractText(msg);
      if (!text) continue;
      const ts = this.tsToMs(msg?.messageTimestamp);
      this.db.importMessage(jid, msg.key.fromMe ? 'out' : 'in', text, msg.key.id || null, ts);
      this.db.touchContact(jid, names.get(jid) || msg?.pushName, isGroup, ts);
      msgN++;
    }
    if (chatN || msgN) this.log('info', 'wa', `History synced: ${chatN} chats, ${msgN} messages`);
  }

  private extractText(msg: any): string {
    const m = msg.message;
    if (!m) return '';
    return (m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption ||
      m.buttonsResponseMessage?.selectedDisplayText || m.listResponseMessage?.title || '').trim();
  }
  // lightweight label for media (no download) — used for the owner's own outgoing messages
  private mediaLabel(msg: any): string {
    const m = msg.message || {};
    if (m.imageMessage) return m.imageMessage.caption ? `📷 ${m.imageMessage.caption}` : '📷 Photo';
    if (m.videoMessage) return m.videoMessage.caption ? `🎬 ${m.videoMessage.caption}` : '🎬 Video';
    if (m.audioMessage) return '🎤 Voice note';
    if (m.documentMessage) return '📄 ' + (m.documentMessage.fileName || 'Document');
    if (m.stickerMessage) return '🩷 Sticker';
    return '';
  }
  private mediaInfo(msg: any): { kind: 'image' | 'audio' | 'video'; mime: string } | null {
    const m = msg.message;
    if (!m) return null;
    if (m.imageMessage) return { kind: 'image', mime: m.imageMessage.mimetype || 'image/jpeg' };
    if (m.audioMessage) return { kind: 'audio', mime: m.audioMessage.mimetype || 'audio/ogg' };
    if (m.videoMessage) return { kind: 'video', mime: m.videoMessage.mimetype || 'video/mp4' };
    return null;
  }
  // Download media bytes, store them ENCRYPTED (keyed by waId) so the dashboard can preview the
  // actual photo/voice, and — when asked — run Gemini understanding so the AI "sees" it. Returns the
  // text to store as the message body plus the mediaId (= waId) to link the stored bytes.
  private async grabMedia(msg: any, waId: string, understand: boolean): Promise<{ text: string; mediaId: string | null }> {
    const info = this.mediaInfo(msg);
    if (!info) return { text: '', mediaId: null };
    let mediaId: string | null = null;
    let buf: Buffer | null = null;
    try {
      buf = await withTimeout(
        downloadMediaMessage(msg, 'buffer', {}, { reuploadRequest: this.sock!.updateMediaMessage }), 30000, 'downloadMedia');
      if (buf && waId) {
        this.db.saveMedia(waId, info.kind, info.mime, buf);
        mediaId = waId;
      }
    } catch (err: any) {
      this.log('warn', 'wa', `media download failed (${info.kind})`);
    }
    const caption = this.extractText(msg);
    if (understand && buf) {
      const understood = await understandMedia(buf, info.mime, info.kind, this.model(), billing.charger(this.db, 'media'));
      const label = info.kind === 'audio' ? '🎤' : info.kind === 'image' ? '📷' : '🎬';
      if (info.kind === 'audio') return { text: understood ? `${label} ${understood}` : '🎤 (voice message)', mediaId };
      const parts = [`${label} ${understood || `(${info.kind})`}`];
      if (caption) parts.push(`"${caption}"`);
      return { text: parts.join(' '), mediaId };
    }
    return { text: this.mediaLabel(msg) || `${info.kind} received`, mediaId };
  }

  private displayName(contact: any, pushName?: string, jid?: string): string {
    return contact?.saved_name || contact?.name || pushName || (jid ? jid.split('@')[0] : 'unknown');
  }

  private groupMode(): 'off' | 'mention' | 'smart' {
    return (this.db.getSetting('reply_groups', 'off') as any) || 'off';
  }
  private groupsEnabled(): boolean {
    return this.groupMode() !== 'off';
  }
  private isAddressedToMe(msg: any): boolean {
    if (!msg) return false;
    const ctx = this.contextInfo(msg);
    const mentioned = (ctx?.mentionedJid || []).some((j: string) => this.isMe(j));
    const repliedToMe = ctx?.participant ? this.isMe(ctx.participant) : false;
    return mentioned || repliedToMe;
  }
  // is this jid me (the bot)? best-effort match by phone number
  private isMe(jid: string): boolean {
    if (!jid) return false;
    const num = jid.split('@')[0].split(':')[0];
    const myNum = (this.ownerJid || this.meJid).split('@')[0].split(':')[0];
    return jid === this.meJid || jid === this.ownerJid || (!!myNum && num === myNum);
  }
  private contextInfo(msg: any): any {
    const m = msg.message || {};
    return (
      m.extendedTextMessage?.contextInfo || m.imageMessage?.contextInfo || m.videoMessage?.contextInfo ||
      m.audioMessage?.contextInfo || m.documentMessage?.contextInfo || null
    );
  }
  // fetch + store the group's subject as its display name (once)
  private async ensureGroupName(jid: string): Promise<void> {
    const c = this.db.getContact(jid);
    if (c && (c.saved_name || c.name)) return;
    try {
      const meta = await withTimeout(this.sock!.groupMetadata(jid), 8000, 'groupMeta');
      if (meta?.subject) this.db.setSavedName(jid, meta.subject);
    } catch {
      /* ignore */
    }
  }

  private async handleIncoming(msg: any, live = true): Promise<void> {
    const jid: string = msg.key.remoteJid || '';
    if (!jid || jid === 'status@broadcast' || jid.endsWith('@newsletter')) return;
    const isGroup = jid.endsWith('@g.us');

    const waId: string = msg.key?.id || '';
    if (waId && this.db.messageExists(jid, waId)) return; // already processed (Zoop's own send / redelivery)

    // A message that arrived with no decryptable payload = a failed decryption (Bad MAC). Baileys'
    // retry-receipt flow (msgRetryCounterCache) will ask the sender to resend; that copy arrives
    // later and gets stored then. Log it so silent drops are visible instead of a mystery.
    if (!msg.message && !msg.key?.fromMe) {
      this.log('warn', 'wa', `Undecryptable msg from ${jid.split('@')[0]} (awaiting resend)`);
      return;
    }

    // Messages YOU sent (typed on your phone, or sent by Zoop). Store as outgoing so the dashboard
    // shows the full conversation — your side too. Zoop's own sends are already stored (dedup above).
    if (msg.key.fromMe) {
      let own = this.extractText(msg);
      let ownMediaId: string | null = null;
      // save your own sent photos/voice (DMs) so they preview in the dashboard — no AI understanding needed
      if (this.mediaInfo(msg) && !isGroup && live) {
        const got = await this.grabMedia(msg, waId, false);
        ownMediaId = got.mediaId;
        if (!own) own = got.text;
      } else if (!own) own = this.mediaLabel(msg);
      if (!own) return;
      this.db.upsertContact(jid, undefined, isGroup);
      if (isGroup) this.ensureGroupName(jid).catch(() => {});
      this.db.addMessage(jid, 'out', own, false, waId || null, ownMediaId);
      this.log('info', 'msg', `OUT (you) ${jid.split('@')[0]}: ${truncate(own)}`);
      return; // never reply to our own messages
    }

    let text = this.extractText(msg);
    let mediaId: string | null = null;
    // Understand media (transcribe voice / describe images via Gemini) so the AI can actually respond
    // to it. DMs always; groups only when group replies are enabled (so a quiet group doesn't burn
    // Gemini on every clip). Non-live (synced) messages use a cheap label to avoid mass-cost on sync.
    const understandHere = !isGroup || this.groupsEnabled();
    if (this.mediaInfo(msg) && live && understandHere) {
      const got = await this.grabMedia(msg, waId, !text);
      mediaId = got.mediaId;
      if (!text) text = got.text;
    } else if (!text) {
      text = this.mediaLabel(msg);
    }
    if (!text) return;

    const name = msg.pushName as string | undefined;
    if (isGroup) {
      this.db.upsertContact(jid, undefined, true);
      this.ensureGroupName(jid).catch(() => {});
    } else {
      this.db.upsertContact(jid, name, false);
    }
    // in groups, prefix the sender's name so the AI knows who said what
    const storedBody = isGroup && name ? `${name}: ${text}` : text;
    this.db.addMessage(jid, 'in', storedBody, false, waId || null, mediaId);
    this.lastInbound.set(jid, msg);

    const pn: string = isGroup ? '' : (msg.key?.senderPn || (jid.endsWith('@s.whatsapp.net') ? jid : ''));
    if (pn) {
      this.db.setContactPn(jid, pn);
      this.db.mergePnDuplicate(jid, pn);
      const saved = this.savedNameByPn.get(pn);
      if (saved) this.db.setSavedName(jid, saved);
    }
    this.maybeRefreshPfp(jid);
    this.log('info', 'msg', `IN ${live ? '' : '(sync) '}${isGroup ? '[grp] ' : ''}${name || jid}: ${truncate(text)}`);

    if (!live) return; // synced/offline backfill — stored above, but never auto-reply to it
    if (this.db.getSetting('mode', config.reply.mode) === 'off') return;
    const contact = this.db.getContact(jid);
    if (this.db.isBlockedForIncoming(jid, pn)) {
      this.log('info', 'reply', `Blocked — ignoring ${this.displayName(contact, name, jid)}`);
      return;
    }
    if (contact && contact.auto_reply === 0) {
      this.log('info', 'reply', `Skipped (AI paused for ${this.displayName(contact, name, jid)})`);
      return;
    }
    // Group messages are always STORED (so they show in the Groups tab); replying is gated:
    // 'off' = never reply, 'mention' = only when @mentioned/replied, 'smart' = reply to all.
    if (isGroup) {
      const gm = this.groupMode();
      if (gm === 'off') return;
      if (gm === 'mention' && !this.isAddressedToMe(msg)) {
        this.log('info', 'reply', `(group msg not addressed to me — ignored)`);
        return;
      }
    }
    const replyName = isGroup ? this.displayName(contact, undefined, jid) : this.displayName(contact, name, jid);
    this.scheduleReply(jid, replyName);
  }

  private scheduleReply(jid: string, name: string): void {
    if (this.historySyncing) return; // don't reply while history is still loading
    if (this.replyInFlight.has(jid)) return;
    const existing = this.debounceTimers.get(jid);
    if (existing) clearTimeout(existing);
    const t = setTimeout(() => {
      this.debounceTimers.delete(jid);
      this.replyInFlight.add(jid);
      this.enqueueReply(jid, name).finally(() => this.replyInFlight.delete(jid));
    }, config.reply.burstDebounceMs);
    this.debounceTimers.set(jid, t);
  }

  private async rateLimitGate(jid: string): Promise<void> {
    const last = this.lastSentPerContact.get(jid) || 0;
    const gap = Date.now() - last;
    if (gap < config.reply.minGapPerContactMs) await sleep(config.reply.minGapPerContactMs - gap);
    while (true) {
      const cutoff = Date.now() - 60_000;
      while (this.sendTimestamps.length && this.sendTimestamps[0] < cutoff) this.sendTimestamps.shift();
      if (this.sendTimestamps.length < config.reply.maxPerMinute) break;
      await sleep(2000);
    }
  }

  private async enqueueReply(jid: string, name: string): Promise<void> {
    this.chain = this.chain
      .then(() => withTimeout(this.doReply(jid, name), 180000, 'doReply'))
      .catch((e) => this.log('error', 'reply', 'doReply error: ' + String(e?.message || e)));
    return this.chain;
  }

  private replyCtx(jid: string, name: string, histLimit: number, group = false) {
    return {
      model: this.model(),
      persona: this.getPersona(),
      about: this.db.getSetting('about_owner', ''),
      summary: this.db.getSummary(jid),
      contactName: name,
      group,
      tune: this.db.getTune(jid),
      history: this.db.recentMessages(jid, histLimit).map((m: any) => ({ direction: m.direction, body: m.body })),
    };
  }

  private async doReply(jid: string, name: string): Promise<void> {
    if (!this.sock || this.connectionState !== 'open') return;
    const isGroup = jid.endsWith('@g.us');
    const mode = this.db.getSetting('mode', config.reply.mode);

    // Credit gate: no balance → AI is paused (users can only use the service with credits).
    if (!billing.canSpend(this.db)) {
      this.notifyOutOfCredits();
      this.log('warn', 'billing', `Out of credits — skipped reply to ${name}`);
      return;
    }

    if (mode === 'approval') {
      const r = await generateReply(this.replyCtx(jid, name, 24, isGroup), billing.charger(this.db, 'reply'));
      if (!r.ok || !r.text) return;
      if (r.important) await this.notifyOwner(jid, name, r.reason);
      this.db.addPending(jid, r.text);
      this.log('info', 'reply', `Draft queued → ${name}: ${truncate(r.text)}`);
      return;
    }

    await this.pace(jid);
    const r = await generateReply(this.replyCtx(jid, name, 24, isGroup), billing.charger(this.db, 'reply'));
    if (!r.ok || !r.text) {
      this.log('warn', 'reply', `No reply generated for ${name}`);
      return;
    }
    if (r.important) await this.notifyOwner(jid, name, r.reason);
    await this.rawSend(jid, r.text, name);
    await this.maybeSummarize(jid);
  }

  private async notifyOwner(jid: string, name: string, reason: string): Promise<void> {
    const custom = this.db.getSetting('alert_number', '').replace(/\D/g, '');
    const target = custom ? `${custom}@s.whatsapp.net` : this.ownerJid;
    if (!this.sock || !target || jid === target) return;
    // cooldown: at most one important alert per contact per 15 min (avoid spamming the owner)
    const now = Date.now();
    if (now - (this.lastOwnerNotify.get(jid) || 0) < 15 * 60 * 1000) {
      this.log('info', 'reply', `(important alert suppressed — cooldown for ${name})`);
      return;
    }
    this.lastOwnerNotify.set(jid, now);
    try {
      const last = this.db.recentMessages(jid, 1)[0];
      const body = last?.body ? `“${truncate(last.body, 280)}”` : '';
      const alert = `🔔 *Important message — Zoop*\nFrom: *${name}*\n` + (reason ? `Why: ${reason}\n` : '') + (body ? `\n${body}` : '');
      await withTimeout(this.sock.sendMessage(target, { text: alert }), 20000, 'notifyOwner');
      this.log('info', 'reply', `🔔 Flagged important msg from ${name} to owner`);
    } catch (err: any) {
      this.log('warn', 'reply', 'notifyOwner failed: ' + String(err?.message || err));
    }
  }

  // Tell the owner once (max once per 6h) that their credits ran out, so they know why Zoop went quiet.
  private notifyOutOfCredits(): void {
    const now = Date.now();
    if (now - this.lastOutOfCreditsNotify < 6 * 3600 * 1000) return;
    this.lastOutOfCreditsNotify = now;
    const target = this.ownerJid;
    if (!this.sock || !target) return;
    const msg = `💳 *Zoop — out of credits*\nYour balance hit ₹0, so I've paused replying. Top up your credits in the Zoop dashboard to switch me back on.`;
    withTimeout(this.sock.sendMessage(target, { text: msg }), 20000, 'notifyOutOfCredits').catch(() => {});
  }

  private async pace(jid: string): Promise<void> {
    if (!this.sock) return;
    await this.rateLimitGate(jid);
    try {
      await withTimeout(this.sock.presenceSubscribe(jid), 5000, 'presence');
      await withTimeout(this.sock.sendPresenceUpdate('composing', jid), 5000, 'presence');
    } catch {
      /* ignore */
    }
    await sleep(rand(config.reply.minDelayMs, config.reply.maxDelayMs));
  }
  // Did the person explicitly ask to be replied to in a voice note / audio? (DM or group message)
  private wantsVoiceReply(jid: string): boolean {
    const msg = this.lastInbound.get(jid);
    const t = (msg ? this.extractText(msg) : '').toLowerCase();
    if (!t) return false;
    return /(voice note|voice message|voice me|voice mein|in voice|audio me|audio mein|in audio|bol ?ke|bol ?kar|awaa?z|sunaa?o|talk.*(audio|voice)|(audio|voice).*(bhej|send|karo|kar do))/.test(t);
  }
  // Decide whether THIS reply goes out as a voice note. Per-chat override (Tune → Voice) wins; otherwise
  // inherit the global setting (always voice long replies + a random % of shorter ones). `force` = the
  // person explicitly asked for audio → always voice. Applies in DMs AND groups (groups quote-reply).
  private shouldVoice(text: string, jid: string, force = false): boolean {
    const clean = stripEmoji(text);
    if (clean.length < 2) return false;
    // daily TTS quota exhausted → don't even attempt; send text instantly until it resets.
    if (ttsQuotaBlockedUntil() > Date.now()) return false;
    const { mode, prob } = this.db.getContactVoice(jid);
    // Explicit intent (asked for audio / chat set to Voice-only) wins — NO length cap at all, every
    // reply goes out as a voice note no matter how long.
    if (force) return true;
    if (mode === 'text') return false; // this chat: text only
    if (mode === 'voice') return true; // this chat: ALWAYS voice, no limit
    // mixed / default are "unsolicited" → cap very long replies to control TTS cost.
    if (clean.length > 900) return false;
    if (mode === 'mixed') {
      if (clean.length >= 160) return true;
      const p = prob != null ? prob : Math.max(0, Math.min(100, Number(this.db.getSetting('voice_prob', '25')) || 0));
      return Math.random() * 100 < p;
    }
    // mode === 'default' → inherit the global voice setting
    if (this.db.getSetting('voice_enabled', 'off') !== 'on') return false;
    if (clean.length >= 160) return true;
    const gprob = Math.max(0, Math.min(100, Number(this.db.getSetting('voice_prob', '25')) || 0));
    return Math.random() * 100 < gprob;
  }
  // Generate a WhatsApp-ready voice note (OGG/Opus) from text, or null on failure. Long text is split
  // into chunks synthesised in parallel and stitched together — so length never causes a TTS timeout.
  private async makeVoiceOgg(text: string): Promise<Buffer | null> {
    const spoken = stripEmoji(text);
    if (!spoken) return null;
    const voice = this.db.getSetting('voice_name', 'Puck') || 'Puck';
    const model = this.db.getSetting('voice_model', 'gemini-2.5-flash-preview-tts');
    // Bigger chunks → fewer TTS API requests (the TTS model has a strict daily request quota).
    // Only long replies split; normal-length ones stay a single request.
    const chunks = chunkForTTS(spoken, 1200);
    const onUsage = billing.charger(this.db, 'voice');
    const pcms = await Promise.all(chunks.map((c) => synthesizeSpeech(c, voice, '', model, onUsage)));
    const good = pcms.filter((p): p is Buffer => !!p && p.length > 0); // keep order, drop any failed chunk
    if (!good.length) return null;
    const pcm = good.length === 1 ? good[0] : Buffer.concat(good); // raw PCM concatenates cleanly (same format)
    return await pcmToOpus(pcm);
  }
  // Generate + send a voice note. Returns true if it actually sent (caller falls back to text on false).
  private async sendVoiceNote(jid: string, text: string, name: string, quoted: any): Promise<boolean> {
    if (!this.sock) return false;
    const ogg = await this.makeVoiceOgg(text);
    if (!ogg) {
      this.log('warn', 'reply', 'voice note: synthesis/conversion failed — sending text');
      return false;
    }
    try {
      const sent = await withTimeout(
        this.sock.sendMessage(jid, { audio: ogg, mimetype: 'audio/ogg; codecs=opus', ptt: true }, quoted ? { quoted } : {}),
        30000,
        'sendVoice'
      );
      const waId = sent?.key?.id || null;
      if (sent?.key?.id && sent.message) this.sentMsgCache.set(sent.key.id, sent.message);
      if (waId) this.db.saveMedia(waId, 'audio', 'audio/ogg', ogg); // so the dashboard plays it back
      this.db.addMessage(jid, 'out', text, true, waId, waId); // body = transcript, media = the voice note
      this.sendTimestamps.push(Date.now());
      this.lastSentPerContact.set(jid, Date.now());
      this.log('info', 'msg', `OUT 🎤 ${name}: ${truncate(text)}`);
      return true;
    } catch (err: any) {
      this.log('warn', 'reply', 'voice note send failed: ' + String(err?.message || err));
      return false;
    }
  }
  private async rawSend(jid: string, text: string, name: string): Promise<void> {
    if (!this.sock) return;
    const trigger = this.lastInbound.get(jid);
    const isGroup = jid.endsWith('@g.us');
    // maybe send as a voice note instead. On any failure, fall through to normal text.
    if (this.shouldVoice(text, jid, this.wantsVoiceReply(jid))) {
      if (await this.sendVoiceNote(jid, text, name, trigger)) return;
    }
    let content: any = { text };
    const options: any = {};
    if (trigger) options.quoted = trigger; // swipe-reply: quote the message we're answering
    if (isGroup && trigger?.key?.participant) {
      const p = trigger.key.participant;
      const num = p.split('@')[0].split(':')[0];
      content = { text: `@${num} ${text}`, mentions: [p] }; // tag the person in the group
    }
    const sent = await withTimeout(this.sock.sendMessage(jid, content, options), 20000, 'sendMessage');
    if (sent?.key?.id && sent.message) this.sentMsgCache.set(sent.key.id, sent.message); // for retry/resend
    try {
      await withTimeout(this.sock.sendPresenceUpdate('paused', jid), 5000, 'presence');
    } catch {
      /* ignore */
    }
    this.db.addMessage(jid, 'out', text, true, sent?.key?.id || null);
    this.sendTimestamps.push(Date.now());
    this.lastSentPerContact.set(jid, Date.now());
    this.log('info', 'msg', `OUT ${name}: ${truncate(text)}`);
  }
  private async sendThrottled(jid: string, text: string, name: string): Promise<void> {
    await this.pace(jid);
    await this.rawSend(jid, text, name);
  }
  private async maybeSummarize(jid: string): Promise<void> {
    const c = this.db.getContact(jid);
    if (c && c.msg_count_since_summary >= config.summarizeEveryN) {
      const history = this.db.recentMessages(jid, 40).map((m: any) => ({ direction: m.direction, body: m.body }));
      const s = await summarize({ model: this.model(), prev: this.db.getSummary(jid), history }, billing.charger(this.db, 'summary'));
      if (s) {
        this.db.setSummary(jid, s);
        this.log('info', 'summary', `Updated summary for ${c.name || jid}`);
      }
    }
  }

  async sendApproved(id: number, overrideText?: string): Promise<boolean> {
    const p = this.db.getPending(id);
    if (!p || p.status !== 'pending') return false;
    const text = overrideText && overrideText.trim() ? overrideText.trim() : p.draft;
    const name = this.db.getContact(p.jid)?.name || p.jid;
    await this.sendThrottled(p.jid, text, name);
    this.db.setPendingStatus(id, 'sent');
    await this.maybeSummarize(p.jid);
    return true;
  }
  rejectPending(id: number): boolean {
    const p = this.db.getPending(id);
    if (!p || p.status !== 'pending') return false;
    this.db.setPendingStatus(id, 'rejected');
    return true;
  }

  // stop the engine (and optionally unlink the WhatsApp device) — used on account deletion
  async stop(logout = false): Promise<void> {
    this.stopped = true;
    if (this.resyncTimer) {
      clearInterval(this.resyncTimer);
      this.resyncTimer = null;
    }
    if (this.followupTimer) {
      clearInterval(this.followupTimer);
      this.followupTimer = null;
    }
    try {
      if (this.sock) {
        if (logout) {
          try {
            await withTimeout(this.sock.logout(), 8000, 'logout');
          } catch {
            /* ignore */
          }
        }
        try {
          this.sock.end(undefined as any);
        } catch {
          /* ignore */
        }
      }
    } finally {
      this.sock = null;
      this.connectionState = 'close';
    }
  }
}
