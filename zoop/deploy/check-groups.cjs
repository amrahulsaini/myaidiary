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
  } catch { return '<fail>'; }
}
const pdb = Database('data/platform.db');
for (const t of pdb.prepare('SELECT id,email FROM tenants').all()) {
  const key = tkey(t.id);
  let db;
  try { db = Database('data/tenants/' + t.id + '.db'); } catch { continue; }
  const rg = db.prepare("SELECT value FROM settings WHERE key='reply_groups'").get();
  const md = db.prepare("SELECT value FROM settings WHERE key='mode'").get();
  console.log('TENANT', t.email, '| reply_groups=', rg ? dec(rg.value, key) : '(unset→off)', '| mode=', md ? dec(md.value, key) : '(unset)');
  for (const g of db.prepare('SELECT jid,saved_name,name,auto_reply,blocked FROM contacts WHERE is_group=1').all()) {
    console.log('   GROUP:', (dec(g.saved_name, key) || dec(g.name, key) || g.jid.split('@')[0]), '| auto_reply=', g.auto_reply, '| blocked=', g.blocked);
  }
}
