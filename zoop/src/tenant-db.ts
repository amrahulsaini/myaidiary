import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { encrypt, decrypt, encryptBuffer, decryptBuffer, tenantKey } from './crypto.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS contacts (
  jid TEXT PRIMARY KEY, name TEXT, auto_reply INTEGER NOT NULL DEFAULT 1,
  is_group INTEGER NOT NULL DEFAULT 0, msg_count_since_summary INTEGER NOT NULL DEFAULT 0,
  last_message_at INTEGER, created_at INTEGER NOT NULL,
  saved_name TEXT, pfp_url TEXT, pfp_checked_at INTEGER, pn TEXT, blocked INTEGER NOT NULL DEFAULT 0,
  last_followup_at INTEGER
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, jid TEXT NOT NULL, direction TEXT NOT NULL,
  body TEXT NOT NULL, ai_generated INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, wa_id TEXT,
  media_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_jid ON messages(jid, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_wa ON messages(jid, wa_id) WHERE wa_id IS NOT NULL;
-- actual photo/voice/video bytes (AES-encrypted), so the dashboard can preview them.
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS summaries (jid TEXT PRIMARY KEY, summary TEXT NOT NULL, updated_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, level TEXT NOT NULL, scope TEXT NOT NULL,
  message TEXT NOT NULL, meta TEXT, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_logs_id ON logs(id);
CREATE TABLE IF NOT EXISTS pending (
  id INTEGER PRIMARY KEY AUTOINCREMENT, jid TEXT NOT NULL, draft TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

// Each tenant's data lives in its own SQLite file, with sensitive fields AES-encrypted at rest.
export class TenantDB {
  readonly db: Database.Database;
  private key: Buffer;
  private enc = (s: string | null | undefined) => encrypt(s, this.key);
  private dec = (s: string | null | undefined) => decrypt(s, this.key);

  constructor(public tenantId: string, dbPath?: string) {
    this.key = tenantKey(tenantId);
    const file = dbPath || path.join(config.paths.tenantsDir, `${tenantId}.db`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new Database(file);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
    // migrate older tenant DBs
    const cols = this.db.prepare('PRAGMA table_info(contacts)').all() as any[];
    if (!cols.find((c) => c.name === 'last_followup_at')) {
      this.db.exec('ALTER TABLE contacts ADD COLUMN last_followup_at INTEGER');
    }
    const mcols = this.db.prepare('PRAGMA table_info(messages)').all() as any[];
    if (!mcols.find((c) => c.name === 'media_id')) {
      this.db.exec('ALTER TABLE messages ADD COLUMN media_id TEXT');
    }
    if (!cols.find((c) => c.name === 'tune')) {
      this.db.exec('ALTER TABLE contacts ADD COLUMN tune TEXT');
    }
    if (!cols.find((c) => c.name === 'voice_mode')) {
      this.db.exec('ALTER TABLE contacts ADD COLUMN voice_mode TEXT');
    }
    if (!cols.find((c) => c.name === 'voice_prob')) {
      this.db.exec('ALTER TABLE contacts ADD COLUMN voice_prob INTEGER');
    }
  }

  // ---- per-chat voice mode override (default = inherit global; text = never; voice = always; mixed = prob) ----
  getContactVoice(jid: string): { mode: string; prob: number | null } {
    const row = this.db.prepare('SELECT voice_mode, voice_prob FROM contacts WHERE jid = ?').get(jid) as any;
    return { mode: row?.voice_mode || 'default', prob: row?.voice_prob ?? null };
  }
  setContactVoice(jid: string, mode: string, prob: number | null): void {
    const m = ['default', 'text', 'voice', 'mixed'].includes(mode) ? mode : 'default';
    const p = prob == null ? null : Math.max(0, Math.min(100, Math.round(prob)));
    this.db.prepare('UPDATE contacts SET voice_mode = ?, voice_prob = ? WHERE jid = ?').run(m, p, jid);
  }

  // ---- per-chat tune (owner's custom instruction for one contact/group, encrypted) ----
  getTune(jid: string): string {
    const row = this.db.prepare('SELECT tune FROM contacts WHERE jid = ?').get(jid) as any;
    return row?.tune ? this.dec(row.tune) : '';
  }
  setTune(jid: string, text: string): void {
    this.db.prepare('UPDATE contacts SET tune = ? WHERE jid = ?').run(text ? this.enc(text) : null, jid);
  }

  // ---- media (encrypted photo/voice/video bytes for dashboard preview) ----
  saveMedia(id: string, kind: string, mime: string, buf: Buffer): void {
    this.db
      .prepare('INSERT OR REPLACE INTO media(id, kind, mime, data, created_at) VALUES(?, ?, ?, ?, ?)')
      .run(id, kind, mime, encryptBuffer(buf, this.key), Date.now());
  }
  getMedia(id: string): { kind: string; mime: string; data: Buffer } | null {
    const row = this.db.prepare('SELECT kind, mime, data FROM media WHERE id = ?').get(id) as any;
    if (!row) return null;
    try {
      return { kind: row.kind, mime: row.mime, data: decryptBuffer(row.data as Buffer, this.key) };
    } catch {
      return null;
    }
  }

  // ---- settings (encrypted values) ----
  getSetting(key: string, fallback = ''): string {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return row ? this.dec(row.value) : fallback;
  }
  setSetting(key: string, value: string): void {
    this.db
      .prepare('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, this.enc(value));
  }

  // ---- contacts ----
  upsertContact(jid: string, name: string | undefined, isGroup: boolean): void {
    this.touchContact(jid, name, isGroup, Date.now());
  }
  touchContact(jid: string, name: string | undefined, isGroup: boolean, ts: number): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO contacts(jid, name, is_group, last_message_at, created_at) VALUES(?, ?, ?, ?, ?)
         ON CONFLICT(jid) DO UPDATE SET
           name = COALESCE(excluded.name, contacts.name),
           last_message_at = MAX(COALESCE(contacts.last_message_at, 0), excluded.last_message_at)`
      )
      .run(jid, name ? this.enc(name) : null, isGroup ? 1 : 0, ts || now, now);
  }
  setSavedName(jid: string, name: string): void {
    this.db.prepare('UPDATE contacts SET saved_name = ? WHERE jid = ?').run(this.enc(name), jid);
  }
  // manual rename from the dashboard (empty clears it back to their pushName)
  renameContact(jid: string, name: string): void {
    const v = name && name.trim() ? this.enc(name.trim()) : null;
    this.db.prepare('UPDATE contacts SET saved_name = ? WHERE jid = ?').run(v, jid);
  }
  setContactPn(jid: string, pn: string): void {
    this.db.prepare('UPDATE contacts SET pn = ? WHERE jid = ?').run(pn, jid);
  }
  applySavedNameByPn(pn: string, name: string): number {
    return this.db.prepare('UPDATE contacts SET saved_name = ? WHERE pn = ?').run(this.enc(name), pn).changes;
  }
  setPfp(jid: string, url: string | null): void {
    this.db.prepare('UPDATE contacts SET pfp_url = ?, pfp_checked_at = ? WHERE jid = ?').run(url, Date.now(), jid);
  }
  getContactPfpInfo(jid: string): { pfp_url: string | null; pfp_checked_at: number | null } | undefined {
    return this.db.prepare('SELECT pfp_url, pfp_checked_at FROM contacts WHERE jid = ?').get(jid) as any;
  }
  getContact(jid: string): any {
    const c = this.db.prepare('SELECT * FROM contacts WHERE jid = ?').get(jid) as any;
    if (!c) return c;
    c.name = c.name ? this.dec(c.name) : c.name;
    c.saved_name = c.saved_name ? this.dec(c.saved_name) : c.saved_name;
    return c;
  }
  setAutoReply(jid: string, enabled: boolean): void {
    this.db.prepare('UPDATE contacts SET auto_reply = ? WHERE jid = ?').run(enabled ? 1 : 0, jid);
  }
  setBlocked(jid: string, blocked: boolean): void {
    this.db.prepare('UPDATE contacts SET blocked = ? WHERE jid = ?').run(blocked ? 1 : 0, jid);
  }
  upsertAddressBookContact(jid: string, savedName: string | undefined, pn: string | null): void {
    this.db
      .prepare(
        `INSERT INTO contacts(jid, saved_name, pn, is_group, created_at) VALUES(?, ?, ?, 0, ?)
         ON CONFLICT(jid) DO UPDATE SET
           saved_name = COALESCE(excluded.saved_name, contacts.saved_name),
           pn = COALESCE(contacts.pn, excluded.pn)`
      )
      .run(jid, savedName ? this.enc(savedName) : null, pn ?? null, Date.now());
  }
  isBlockedForIncoming(jid: string, pn: string): boolean {
    const s = ' ';
    return !!this.db
      .prepare('SELECT 1 FROM contacts WHERE blocked = 1 AND (jid = ? OR jid = ? OR pn = ?) LIMIT 1')
      .get(jid, pn || s, pn || s);
  }
  mergePnDuplicate(lidJid: string, pn: string): void {
    if (!pn || pn === lidJid) return;
    const dup = this.db.prepare('SELECT blocked, saved_name FROM contacts WHERE jid = ?').get(pn) as any;
    if (!dup) return;
    this.db
      .prepare('UPDATE contacts SET blocked = MAX(blocked, ?), saved_name = COALESCE(saved_name, ?) WHERE jid = ?')
      .run(dup.blocked || 0, dup.saved_name ?? null, lidJid);
    this.db.prepare('DELETE FROM contacts WHERE jid = ?').run(pn);
  }
  contactsAwaitingReply(withinMs = 12 * 3600 * 1000, limit = 25): { jid: string; name: string }[] {
    const cutoff = Date.now() - withinMs;
    const rows = this.db
      .prepare(
        `SELECT c.jid AS jid, COALESCE(c.saved_name, c.name) AS name FROM contacts c
         WHERE c.auto_reply = 1 AND c.blocked = 0 AND c.is_group = 0 AND c.last_message_at >= ?
           AND (SELECT m.direction FROM messages m WHERE m.jid = c.jid ORDER BY m.id DESC LIMIT 1) = 'in'
         ORDER BY c.last_message_at DESC LIMIT ?`
      )
      .all(cutoff, limit) as any[];
    return rows.map((r) => ({ jid: r.jid, name: r.name ? this.dec(r.name) : r.jid.split('@')[0] }));
  }
  // DMs that have gone quiet ("incomplete") and weren't followed up recently — for proactive nudges
  staleChats(idleMs = 6 * 3600 * 1000, maxAgeMs = 7 * 24 * 3600 * 1000, cooldownMs = 3 * 24 * 3600 * 1000, limit = 15): any[] {
    const now = Date.now();
    const rows = this.db
      .prepare(
        `SELECT c.jid AS jid, COALESCE(c.saved_name, c.name) AS name, c.last_message_at,
          (SELECT direction FROM messages m WHERE m.jid = c.jid ORDER BY m.id DESC LIMIT 1) AS last_dir
         FROM contacts c
         WHERE c.is_group = 0 AND c.auto_reply = 1 AND c.blocked = 0
           AND c.last_message_at <= ? AND c.last_message_at >= ?
           AND (c.last_followup_at IS NULL OR c.last_followup_at < ?)
         ORDER BY c.last_message_at DESC LIMIT ?`
      )
      .all(now - idleMs, now - maxAgeMs, now - cooldownMs, limit) as any[];
    return rows.map((r) => ({ ...r, name: r.name ? this.dec(r.name) : r.jid.split('@')[0] }));
  }
  setLastFollowup(jid: string): void {
    this.db.prepare('UPDATE contacts SET last_followup_at = ? WHERE jid = ?').run(Date.now(), jid);
  }
  // ensure a group row exists with its subject (does NOT bump last_message_at)
  ensureGroup(jid: string, subject?: string): void {
    this.db
      .prepare(
        `INSERT INTO contacts(jid, saved_name, is_group, created_at) VALUES(?, ?, 1, ?)
         ON CONFLICT(jid) DO UPDATE SET saved_name = COALESCE(excluded.saved_name, contacts.saved_name)`
      )
      .run(jid, subject ? this.enc(subject) : null, Date.now());
  }

  // bulk-import contacts (from the user's phonebook) — saves names + numbers, applies names to
  // any existing @lid chat that shares the number.
  importContacts(list: { name: string; number: string }[]): number {
    let n = 0;
    const tx = this.db.transaction((items: { name: string; number: string }[]) => {
      for (const it of items) {
        let d = String(it.number || '').replace(/\D/g, '');
        if (d.length === 10) d = '91' + d; // assume India for 10-digit
        if (d.length < 11 || d.length > 15) continue;
        const jid = `${d}@s.whatsapp.net`;
        const nameEnc = it.name && it.name.trim() ? this.enc(it.name.trim()) : null;
        this.db
          .prepare(
            `INSERT INTO contacts(jid, saved_name, pn, is_group, created_at) VALUES(?, ?, ?, 0, ?)
             ON CONFLICT(jid) DO UPDATE SET saved_name = COALESCE(excluded.saved_name, contacts.saved_name), pn = COALESCE(contacts.pn, excluded.pn)`
          )
          .run(jid, nameEnc, jid, Date.now());
        // apply to any existing @lid chat that already maps to this number
        if (nameEnc) this.db.prepare('UPDATE contacts SET saved_name = ? WHERE pn = ? AND jid != ?').run(nameEnc, jid, jid);
        n++;
      }
    });
    tx(list);
    return n;
  }

  // Resolve a name the owner typed (e.g. "rishi") against saved name, their own name, and number.
  resolveContactByQuery(query: string): { jid: string; name: string } | null {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return null;
    const rows = this.db.prepare('SELECT jid, name, saved_name, pn FROM contacts').all() as any[];
    let partial: { jid: string; name: string } | null = null;
    for (const r of rows) {
      const saved = r.saved_name ? this.dec(r.saved_name) : '';
      const push = r.name ? this.dec(r.name) : '';
      const num = (r.pn || r.jid).split('@')[0];
      const display = saved || push || r.jid.split('@')[0];
      const fields = [saved, push, num].map((s) => String(s || '').toLowerCase());
      if (fields.some((f) => f && f === q)) return { jid: r.jid, name: display };
      if (!partial && fields.some((f) => f.length > 2 && (f.includes(q) || (q.length > 2 && q.includes(f))))) {
        partial = { jid: r.jid, name: display };
      }
    }
    if (partial) return partial;
    // not an existing contact — if it's a phone number, target it directly (message any number)
    let digits = String(query || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits; // assume India for 10-digit
    if (digits.length >= 11 && digits.length <= 15) {
      return { jid: `${digits}@s.whatsapp.net`, name: '+' + digits };
    }
    return null;
  }
  contactsNeedingPfp(maxAgeMs = 24 * 3600 * 1000): string[] {
    const cutoff = Date.now() - maxAgeMs;
    return (
      this.db
        .prepare('SELECT jid FROM contacts WHERE is_group = 0 AND (pfp_checked_at IS NULL OR pfp_checked_at < ?)')
        .all(cutoff) as any[]
    ).map((r) => r.jid);
  }
  listContacts(): any[] {
    const rows = this.db
      .prepare(
        `SELECT c.jid, COALESCE(c.saved_name, c.name) AS name, c.auto_reply, c.is_group, c.pfp_url,
                c.last_message_at, c.blocked, c.pn,
          (SELECT body FROM messages m WHERE m.jid = c.jid ORDER BY m.created_at DESC, m.id DESC LIMIT 1) AS last_body,
          (SELECT MAX(created_at) FROM messages m WHERE m.jid = c.jid) AS last_at,
          (SELECT COUNT(*) FROM messages m WHERE m.jid = c.jid) AS msgs
         FROM contacts c
         -- sort by the REAL latest message time (history-imported rows never updated last_message_at),
         -- chats with no messages sink to the bottom — exactly like WhatsApp's chat list.
         ORDER BY (last_at IS NULL) ASC, last_at DESC, c.last_message_at DESC`
      )
      .all() as any[];
    const out: any[] = [];
    for (const r of rows) {
      const name = r.name ? this.dec(r.name) : '';
      r.last_body = r.last_body ? this.dec(r.last_body) : '';
      if (name) r.name = name;
      else if (r.is_group) r.name = null; // group w/o subject — keep, UI shows id
      else if (r.pn) r.name = '+' + r.pn.split('@')[0]; // no name → show their phone number
      else if (r.msgs > 0) r.name = r.jid.split('@')[0]; // messaged but anonymous @lid
      else continue; // nameless, no number, never messaged → ghost contact, hide it
      out.push(r);
    }
    return out;
  }

  // ---- messages ----
  // returns true if the message was newly inserted (false = duplicate / already seen)
  addMessage(jid: string, direction: 'in' | 'out', body: string, aiGenerated = false, waId: string | null = null, mediaId: string | null = null): boolean {
    const info = this.db
      .prepare('INSERT OR IGNORE INTO messages(jid, direction, body, ai_generated, wa_id, created_at, media_id) VALUES(?, ?, ?, ?, ?, ?, ?)')
      .run(jid, direction, this.enc(body), aiGenerated ? 1 : 0, waId, Date.now(), mediaId);
    if (direction === 'in' && info.changes > 0) {
      this.db.prepare('UPDATE contacts SET msg_count_since_summary = msg_count_since_summary + 1 WHERE jid = ?').run(jid);
    }
    return info.changes > 0;
  }
  // has this exact WhatsApp message already been processed? (guards against redelivery on reconnect)
  messageExists(jid: string, waId: string): boolean {
    return !!this.db.prepare('SELECT 1 FROM messages WHERE jid = ? AND wa_id = ? LIMIT 1').get(jid, waId);
  }
  importMessage(jid: string, direction: 'in' | 'out', body: string, waId: string | null, ts: number): void {
    this.db
      .prepare('INSERT OR IGNORE INTO messages(jid, direction, body, ai_generated, wa_id, created_at) VALUES(?, ?, ?, 0, ?, ?)')
      .run(jid, direction, this.enc(body), waId, ts || Date.now());
  }
  recentMessages(jid: string, limit = 20): any[] {
    // sort by real message time (history-imported rows have scrambled ids vs time)
    const rows = this.db
      .prepare(
        `SELECT m.*, (SELECT kind FROM media WHERE media.id = m.media_id) AS media_kind
         FROM messages m WHERE m.jid = ? ORDER BY m.created_at DESC, m.id DESC LIMIT ?`
      )
      .all(jid, limit) as any[];
    rows.reverse(); // → chronological: oldest first, newest last (WhatsApp order)
    for (const r of rows) r.body = this.dec(r.body);
    return rows;
  }
  // only messages newer (by real TIME) than the cursor. Using created_at — not id — means
  // history-imported old messages (which get fresh, high ids during a sync) are NOT appended
  // to the bottom of an open chat. Only genuinely new live messages flow in.
  messagesAfter(jid: string, afterMs: number): any[] {
    const rows = this.db
      .prepare(
        `SELECT m.*, (SELECT kind FROM media WHERE media.id = m.media_id) AS media_kind
         FROM messages m WHERE m.jid = ? AND m.created_at > ? ORDER BY m.created_at ASC, m.id ASC`
      )
      .all(jid, afterMs) as any[];
    for (const r of rows) r.body = this.dec(r.body);
    return rows;
  }

  // ---- summaries ----
  getSummary(jid: string): string {
    const row = this.db.prepare('SELECT summary FROM summaries WHERE jid = ?').get(jid) as any;
    return row ? this.dec(row.summary) : '';
  }
  setSummary(jid: string, summary: string): void {
    this.db
      .prepare(
        `INSERT INTO summaries(jid, summary, updated_at) VALUES(?, ?, ?)
         ON CONFLICT(jid) DO UPDATE SET summary = excluded.summary, updated_at = excluded.updated_at`
      )
      .run(jid, this.enc(summary), Date.now());
    this.db.prepare('UPDATE contacts SET msg_count_since_summary = 0 WHERE jid = ?').run(jid);
  }

  // ---- pending (approval) ----
  addPending(jid: string, draft: string): number {
    const info = this.db.prepare('INSERT INTO pending(jid, draft, status, created_at) VALUES(?, ?, ?, ?)').run(jid, this.enc(draft), 'pending', Date.now());
    return Number(info.lastInsertRowid);
  }
  listPending(): any[] {
    const rows = this.db.prepare("SELECT * FROM pending WHERE status = 'pending' ORDER BY id DESC").all() as any[];
    for (const r of rows) r.draft = this.dec(r.draft);
    return rows;
  }
  getPending(id: number): any {
    const r = this.db.prepare('SELECT * FROM pending WHERE id = ?').get(id) as any;
    if (r) r.draft = this.dec(r.draft);
    return r;
  }
  setPendingStatus(id: number, status: string): void {
    this.db.prepare('UPDATE pending SET status = ? WHERE id = ?').run(status, id);
  }

  // ---- logs (encrypted; may contain message text) ----
  log(level: string, scope: string, message: string, meta?: unknown): void {
    try {
      this.db
        .prepare('INSERT INTO logs(level, scope, message, meta, created_at) VALUES(?, ?, ?, ?, ?)')
        .run(level, scope, this.enc(message), meta === undefined ? null : this.enc(JSON.stringify(meta)), Date.now());
    } catch {
      /* never let logging crash the engine */
    }
  }
  recentLogs(limit = 300, afterId = 0): any[] {
    const rows = this.db.prepare('SELECT * FROM logs WHERE id > ? ORDER BY id DESC LIMIT ?').all(afterId, limit) as any[];
    for (const r of rows) {
      r.message = this.dec(r.message);
      r.meta = r.meta ? this.dec(r.meta) : null;
    }
    return rows;
  }

  initSettings(defaults: Record<string, string>): void {
    for (const [k, v] of Object.entries(defaults)) {
      const exists = this.db.prepare('SELECT 1 FROM settings WHERE key = ?').get(k);
      if (!exists) this.setSetting(k, v);
    }
  }

  close(): void {
    try {
      this.db.close();
    } catch {
      /* ignore */
    }
  }
}
