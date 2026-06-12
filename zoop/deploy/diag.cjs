const db = require('better-sqlite3')('data/zoop.db');
console.log('=== last 22 messages ===');
for (const m of db.prepare('SELECT id,jid,direction,ai_generated,substr(body,1,46) body,created_at,wa_id FROM messages ORDER BY id DESC LIMIT 22').all().reverse()) {
  console.log(m.id, m.direction, m.ai_generated ? 'AI' : '  ', new Date(m.created_at).toLocaleTimeString(), '|', JSON.stringify(m.body), '| wa', m.wa_id ? m.wa_id.slice(0, 10) : null, '|', m.jid.split('@')[0]);
}
console.log('=== duplicate OUT (same jid+body, count>1) ===');
for (const r of db.prepare("SELECT jid,body,COUNT(*) c FROM messages WHERE direction='out' GROUP BY jid,body HAVING c>1 ORDER BY c DESC LIMIT 12").all()) {
  console.log(r.c + 'x', r.jid.split('@')[0], JSON.stringify(r.body.slice(0, 55)));
}
console.log('=== contacts (name vs saved_name) ===');
for (const c of db.prepare('SELECT jid,name,saved_name,pn FROM contacts').all()) {
  console.log(c.jid.split('@')[0], '| name:', JSON.stringify(c.name), '| saved:', JSON.stringify(c.saved_name), '| pn:', c.pn ? c.pn.split('@')[0] : null);
}
