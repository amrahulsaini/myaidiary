const crypto = require('crypto');
const fs = require('fs');
const Database = require('better-sqlite3');
const env = fs.readFileSync('.env', 'utf8');
const mk = ((env.match(/^MASTER_KEY=(.*)$/m) || [])[1] || '').trim();
const MASTER = crypto.createHash('sha256').update(mk).digest();
const tkey = (id) => crypto.createHmac('sha256', MASTER).update('tenant:' + id).digest();
const dec = (b, k) => { if (!b || !b.startsWith('v1:')) return b; try { const raw = Buffer.from(b.slice(3), 'base64'); const d = crypto.createDecipheriv('aes-256-gcm', k, raw.subarray(0, 12)); d.setAuthTag(raw.subarray(12, 28)); return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString('utf8'); } catch { return '<fail>'; } };
const pdb = Database('data/platform.db');
const t = pdb.prepare("SELECT id FROM tenants WHERE email='rahul@loopwar.dev'").get();
const k = tkey(t.id);
const db = Database('data/tenants/' + t.id + '.db');
console.log('=== contacts matching harshit/lambu ===');
for (const c of db.prepare('SELECT jid,name,saved_name,is_group,pn FROM contacts').all()) {
  const nm = ((c.saved_name ? dec(c.saved_name, k) : '') + ' ' + (c.name ? dec(c.name, k) : '')).toLowerCase();
  if (nm.includes('harshit') || nm.includes('lambu')) {
    const msgs = db.prepare('SELECT COUNT(*) n FROM messages WHERE jid=?').get(c.jid).n;
    console.log(c.jid, '| saved:', c.saved_name ? dec(c.saved_name, k) : null, '| push:', c.name ? dec(c.name, k) : null, '| group:', c.is_group, '| pn:', c.pn, '| msgs:', msgs);
  }
}
console.log('=== 6 most recent messages overall ===');
for (const m of db.prepare('SELECT id,jid,direction,body,created_at FROM messages ORDER BY id DESC LIMIT 6').all()) {
  console.log(m.id, m.direction, new Date(m.created_at).toLocaleTimeString(), m.jid.split('@')[0], ':', dec(m.body, k).slice(0, 40));
}
