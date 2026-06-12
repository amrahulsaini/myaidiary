const crypto = require('crypto');
const fs = require('fs');
const Database = require('better-sqlite3');
const env = fs.readFileSync('.env', 'utf8');
const mk = ((env.match(/^MASTER_KEY=(.*)$/m) || [])[1] || (env.match(/^SESSION_SECRET=(.*)$/m) || [])[1] || '').trim();
const MASTER = crypto.createHash('sha256').update(mk).digest();
const tkey = (id) => crypto.createHmac('sha256', MASTER).update('tenant:' + id).digest();
function dec(blob, key) {
  if (!blob || typeof blob !== 'string' || !blob.startsWith('v1:')) return blob;
  try {
    const raw = Buffer.from(blob.slice(3), 'base64');
    const d = crypto.createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8');
  } catch { return '<decrypt-fail>'; }
}
const pdb = Database('data/platform.db');
for (const t of pdb.prepare('SELECT id,email FROM tenants').all()) {
  const key = tkey(t.id);
  const db = Database('data/tenants/' + t.id + '.db');
  const p = db.prepare("SELECT value FROM settings WHERE key='persona'").get();
  const persona = p ? dec(p.value, key) : null;
  console.log('=== TENANT', t.email, '===');
  console.log('  persona SET?', !!persona, '| length:', persona ? persona.length : 0);
  console.log('  persona starts:', persona ? JSON.stringify(persona.slice(0, 180)) : '(unset → uses default)');
  console.log('');
}
