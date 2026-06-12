const crypto = require('crypto');
const fs = require('fs');
const Database = require('better-sqlite3');
const env = fs.readFileSync('.env', 'utf8');
const mk = ((env.match(/^MASTER_KEY=(.*)$/m) || [])[1] || (env.match(/^SESSION_SECRET=(.*)$/m) || [])[1] || '').trim();
const MASTER = crypto.createHash('sha256').update(mk).digest();
const tkey = (id) => crypto.createHmac('sha256', MASTER).update('tenant:' + id).digest();
function enc(p, key) { const iv = crypto.randomBytes(12); const c = crypto.createCipheriv('aes-256-gcm', key, iv); const e = Buffer.concat([c.update(p, 'utf8'), c.final()]); return 'v1:' + Buffer.concat([iv, c.getAuthTag(), e]).toString('base64'); }
function dec(b, key) { if (!b || !b.startsWith('v1:')) return b; try { const raw = Buffer.from(b.slice(3), 'base64'); const d = crypto.createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12)); d.setAuthTag(raw.subarray(12, 28)); return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8'); } catch { return ''; } }
const GOOD = 'gemini-2.5-flash';
const RETIRED = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
const pdb = Database('data/platform.db');
for (const t of pdb.prepare('SELECT id,email FROM tenants').all()) {
  const key = tkey(t.id);
  const db = Database('data/tenants/' + t.id + '.db');
  db.pragma('busy_timeout = 5000');
  const row = db.prepare("SELECT value FROM settings WHERE key='model'").get();
  const cur = row ? dec(row.value, key) : '(unset)';
  if (cur !== GOOD && (RETIRED.includes(cur) || cur === '(unset)' || !cur)) {
    db.prepare("INSERT INTO settings(key,value) VALUES('model',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(enc(GOOD, key));
    console.log('FIXED', t.email, ':', cur, '->', GOOD);
  } else {
    console.log('kept', t.email, ':', cur);
  }
  db.close();
}
