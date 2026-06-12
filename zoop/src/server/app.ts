import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import {
  createTenant,
  getTenant,
  getTenantByEmail,
  verifyPassword,
  deleteTenant,
} from '../platform-db.js';
import { manager } from '../manager.js';
import { DEFAULT_PERSONA } from '../ai.js';
import type { TenantDB } from '../tenant-db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

declare module 'express-session' {
  interface SessionData {
    tenantId?: string;
    email?: string;
  }
}

export function buildServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));
  app.use(
    session({
      name: 'zoop.sid',
      secret: config.server.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 30 },
    })
  );

  // resolve the logged-in tenant's DB; 401 if not authed
  function tenantDb(req: express.Request, res: express.Response): TenantDB | null {
    const id = req.session.tenantId;
    if (!id || !getTenant(id)) {
      res.status(401).json({ error: 'unauthorized' });
      return null;
    }
    return manager.getDb(id);
  }
  const resolvedDefaultPersona = (db: TenantDB) =>
    DEFAULT_PERSONA.split('{OWNER}').join(db.getSetting('owner_name', 'the owner'));

  // ---------- auth ----------
  app.post('/api/signup', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'invalid email' });
    if (password.length < 6) return res.status(400).json({ error: 'password must be 6+ chars' });
    if (getTenantByEmail(email)) return res.status(409).json({ error: 'email already registered' });
    const t = createTenant(email, password);
    await manager.startTenant(t.id);
    req.session.tenantId = t.id;
    req.session.email = t.email;
    res.json({ ok: true });
  });

  app.post('/api/login', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const t = getTenantByEmail(email);
    if (!t || !verifyPassword(t, password)) return res.status(401).json({ error: 'wrong email or password' });
    manager.startTenant(t.id); // ensure their session is running
    req.session.tenantId = t.id;
    req.session.email = t.email;
    res.json({ ok: true });
  });

  app.post('/api/logout', (req, res) => req.session.destroy(() => res.json({ ok: true })));

  // permanently delete the logged-in tenant (password-confirmed): unlinks WhatsApp + wipes data
  app.post('/api/delete-account', async (req, res) => {
    const id = req.session.tenantId;
    const t = id ? getTenant(id) : undefined;
    if (!t) return res.status(401).json({ error: 'unauthorized' });
    if (!verifyPassword(t, String(req.body?.password || ''))) {
      return res.status(403).json({ error: 'wrong password' });
    }
    await manager.deleteTenant(id!);
    deleteTenant(id!);
    req.session.destroy(() => {});
    res.json({ ok: true });
  });
  app.get('/api/me', (req, res) =>
    res.json({ authed: !!req.session.tenantId, email: req.session.email || '' })
  );

  // ---------- status / settings ----------
  app.get('/api/status', (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    res.json(s ? s.getStatus() : { connection: 'connecting', qr: '', me: '', mode: 'auto', model: config.gemini.model });
  });

  // force a fresh connection + QR (when the owner is ready to re-link)
  app.post('/api/reconnect', async (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    if (s) s.reconnect().catch(() => {});
    res.json({ ok: !!s });
  });

  // FULL relink: wipe the WhatsApp session (fixes corrupted-session "Bad MAC" message drops) and
  // generate a fresh QR. Chats/contacts are kept; the user just re-scans.
  app.post('/api/relink', async (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    if (s) s.relink().catch(() => {});
    res.json({ ok: !!s });
  });

  app.get('/api/settings', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json({
      mode: db.getSetting('mode', config.reply.mode),
      model: db.getSetting('model', config.gemini.model),
      alertNumber: db.getSetting('alert_number', ''),
      groupMode: db.getSetting('reply_groups', 'off'),
      autoFollowup: db.getSetting('auto_followup', 'off') === 'on',
      voiceEnabled: db.getSetting('voice_enabled', 'off') === 'on',
      voiceProb: Number(db.getSetting('voice_prob', '25')) || 0,
      voiceName: db.getSetting('voice_name', 'Puck'),
    });
  });
  app.post('/api/settings', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const { mode, model, alertNumber, groupMode, autoFollowup, voiceEnabled, voiceProb, voiceName } = req.body || {};
    if (mode && ['auto', 'approval', 'off'].includes(mode)) db.setSetting('mode', mode);
    if (model) db.setSetting('model', String(model));
    if (alertNumber !== undefined) db.setSetting('alert_number', String(alertNumber).replace(/\D/g, ''));
    if (groupMode && ['off', 'mention', 'smart'].includes(groupMode)) db.setSetting('reply_groups', groupMode);
    if (autoFollowup !== undefined) db.setSetting('auto_followup', autoFollowup ? 'on' : 'off');
    if (voiceEnabled !== undefined) db.setSetting('voice_enabled', voiceEnabled ? 'on' : 'off');
    if (voiceProb !== undefined) db.setSetting('voice_prob', String(Math.max(0, Math.min(100, Number(voiceProb) || 0))));
    if (voiceName !== undefined) db.setSetting('voice_name', String(voiceName));
    res.json({ ok: true });
  });

  // ---------- persona / about ----------
  app.get('/api/persona', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const custom = db.getSetting('persona', '');
    res.json({
      persona: custom || resolvedDefaultPersona(db),
      default: resolvedDefaultPersona(db),
      about: db.getSetting('about_owner', ''),
    });
  });
  app.post('/api/persona', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const { persona, about } = req.body || {};
    if (typeof persona === 'string') db.setSetting('persona', persona);
    if (typeof about === 'string') db.setSetting('about_owner', about);
    res.json({ ok: true });
  });

  // ---------- contacts ----------
  app.get('/api/contacts', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json(db.listContacts());
  });
  app.get('/api/contacts/:jid/messages', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const jid = req.params.jid;
    const after = Number(req.query.after || 0);
    if (after > 0) return res.json({ messages: db.messagesAfter(jid, after) });
    res.json({ messages: db.recentMessages(jid, 200), summary: db.getSummary(jid) });
  });
  // serve a stored media blob (decrypted on the fly) so the dashboard can preview photos/voice.
  app.get('/api/media/:id', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const m = db.getMedia(req.params.id);
    if (!m) return res.status(404).end();
    res.setHeader('Content-Type', m.mime || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.send(m.data);
  });
  app.post('/api/contacts/:jid/auto', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    db.setAutoReply(req.params.jid, !!req.body?.enabled);
    res.json({ ok: true });
  });
  app.post('/api/contacts/:jid/block', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    db.setBlocked(req.params.jid, !!req.body?.blocked);
    res.json({ ok: true });
  });
  app.post('/api/contacts/:jid/name', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    db.renameContact(req.params.jid, String(req.body?.name || ''));
    res.json({ ok: true });
  });
  // per-chat tune: owner's custom instruction the AI follows for THIS contact/group.
  app.get('/api/contacts/:jid/tune', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json({ tune: db.getTune(req.params.jid) });
  });
  app.post('/api/contacts/:jid/tune', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    db.setTune(req.params.jid, String(req.body?.tune || ''));
    res.json({ ok: true });
  });
  // per-chat voice mode: default | text | voice | mixed (+ optional probability for mixed)
  app.get('/api/contacts/:jid/voice', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json(db.getContactVoice(req.params.jid));
  });
  app.post('/api/contacts/:jid/voice', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const prob = req.body?.prob === null || req.body?.prob === undefined ? null : Number(req.body.prob);
    db.setContactVoice(req.params.jid, String(req.body?.mode || 'default'), prob);
    res.json({ ok: true });
  });
  app.post('/api/sync', async (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    res.json({ ok: s ? await s.syncContacts() : false });
  });

  // proactively follow up on incomplete/quiet chats (owner-triggered). This sends real messages to
  // many people at once → password-confirmed, like a danger-zone action.
  app.post('/api/followup', async (req, res) => {
    const id = req.session.tenantId;
    const t = id ? getTenant(id) : undefined;
    if (!t || !getTenant(id!)) return res.status(401).json({ error: 'unauthorized' });
    if (!verifyPassword(t, String(req.body?.password || ''))) {
      return res.status(403).json({ error: 'wrong password' });
    }
    const s = manager.get(id!);
    try {
      res.json(s ? await s.followUpScan() : { checked: 0, sent: 0 });
    } catch (e: any) {
      res.json({ checked: 0, sent: 0, error: String(e?.message || e) });
    }
  });

  // owner command channel — talk to your agent, ask things, tell it who to message
  app.post('/api/command', async (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    const text = String(req.body?.text || '').trim();
    if (!text) return res.json({ reply: '' });
    try {
      res.json({ reply: s ? await s.ownerCommand(text) : '⚠️ Engine not running.' });
    } catch (e: any) {
      res.json({ reply: 'Error: ' + String(e?.message || e) });
    }
  });
  // import contacts pasted/uploaded by the user (vCard .vcf OR "Name, +number" lines)
  app.post('/api/import-contacts', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    const data = String(req.body?.data || '');
    const list = parseContacts(data);
    const imported = list.length ? db.importContacts(list) : 0;
    res.json({ ok: true, found: list.length, imported });
  });

  app.post('/api/block-number', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    let digits = String(req.body?.number || '').replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    if (digits.length < 10) return res.status(400).json({ error: 'invalid number' });
    const jid = `${digits}@s.whatsapp.net`;
    db.upsertAddressBookContact(jid, req.body?.name ? String(req.body.name) : undefined, jid);
    db.setBlocked(jid, true);
    res.json({ ok: true, jid });
  });

  // ---------- logs ----------
  app.get('/api/logs', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json(db.recentLogs(300, Number(req.query.after || 0)));
  });

  // ---------- approvals ----------
  app.get('/api/pending', (req, res) => {
    const db = tenantDb(req, res);
    if (!db) return;
    res.json(db.listPending());
  });
  app.post('/api/pending/:id/approve', async (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    res.json({ ok: s ? await s.sendApproved(Number(req.params.id), req.body?.text) : false });
  });
  app.post('/api/pending/:id/reject', (req, res) => {
    if (!tenantDb(req, res)) return;
    const s = manager.get(req.session.tenantId!);
    res.json({ ok: s ? s.rejectPending(Number(req.params.id)) : false });
  });

  app.use(express.static(path.join(__dirname, 'public')));
  return app;
}

// Parse a vCard (.vcf) or simple "Name, +number" / "Name <tab> number" lines into {name, number}.
function parseContacts(data: string): { name: string; number: string }[] {
  const out: { name: string; number: string }[] = [];
  if (/BEGIN:VCARD/i.test(data)) {
    for (const card of data.split(/END:VCARD/i)) {
      if (!/BEGIN:VCARD/i.test(card)) continue;
      const fn = (card.match(/(?:^|\n)\s*FN[^:\n]*:\s*([^\n\r]+)/i) || [])[1] || '';
      const tels = [...card.matchAll(/(?:^|\n)\s*TEL[^:\n]*:\s*([^\n\r]+)/gi)].map((m) => m[1].trim());
      if (tels.length) out.push({ name: fn.trim(), number: tels[0] });
    }
  } else {
    for (const raw of data.split(/\r?\n/)) {
      const l = raw.trim();
      if (!l) continue;
      const m = l.match(/^(.*?)[,\t;]+\s*([+\d][\d\s\-()]{6,})\s*$/) || l.match(/^(.*?)\s+([+\d][\d\s\-()]{8,})\s*$/);
      if (m) out.push({ name: m[1].replace(/[,;]+$/, '').trim(), number: m[2].trim() });
      else if (l.replace(/\D/g, '').length >= 10) out.push({ name: '', number: l });
    }
  }
  return out;
}
